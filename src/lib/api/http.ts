import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { ApiError } from "./errors"
import type { ApiErrorResponse } from "@/types/api"

export function assertSameOrigin(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return
  const origin = request.headers.get("origin")
  // Next's internal URL can normalize loopback hosts to localhost. The browser
  // Origin must match the actual incoming Host, not the server's bind hostname.
  const expected = new URL(request.nextUrl.origin)
  expected.host = request.headers.get("host") ?? expected.host
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== expected.origin)
  ) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Cross-origin mutations are not permitted."
    )
  }
}
export async function readJson(request: NextRequest): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Send an application/json request body."
    )
  }
  const limit = 64 * 1024
  if (Number(request.headers.get("content-length")) > limit)
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.")
  if (!request.body)
    throw new ApiError(400, "VALIDATION_ERROR", "A JSON body is required.")
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) {
        await reader.cancel()
        throw new ApiError(
          413,
          "PAYLOAD_TOO_LARGE",
          "Request body is too large."
        )
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    chunks.forEach((chunk) => {
      bytes.set(chunk, offset)
      offset += chunk.length
    })
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, "VALIDATION_ERROR", "Malformed JSON body.")
  } finally {
    reader.releaseLock()
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input.",
          details: { fields: z.flattenError(error).fieldErrors },
        },
      } satisfies ApiErrorResponse,
      { status: 400 }
    )
  }
  const failure =
    error instanceof ApiError
      ? error
      : new ApiError(
          500,
          "INTERNAL_ERROR",
          "An unexpected error occurred. Please retry."
        )
  if (!(error instanceof ApiError))
    console.error("Unexpected career API error.") // No raw payloads/keys.
  return NextResponse.json(
    {
      error: {
        code: failure.code,
        message: failure.message,
        ...(failure.details ? { details: failure.details } : {}),
      },
    } satisfies ApiErrorResponse,
    { status: failure.status }
  )
}
export function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")
  response.headers.set("Vary", "Cookie")
  return response
}
