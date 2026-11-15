import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { matchResultSchema } from "@/lib/validation/match-schema"
import { z } from "zod"
import type {
  CareerClient,
  MatchResponse,
  SessionInfo,
} from "@/types/career-client"
import { createMockCareerClient } from "@/lib/mock/client"
import type { DemoStorage } from "@/lib/mock/storage"
import { CareerClientError } from "./errors"

type Options = { mode?: string; storage?: DemoStorage; fetcher?: typeof fetch }
const matchesSchema = z.object({
  total: z.number().int().nonnegative(),
  results: z.array(matchResultSchema),
})
export function createCareerClient(options: Options = {}): CareerClient {
  const mode = options.mode ?? process.env.NEXT_PUBLIC_DATA_MODE
  if (mode !== "mock" && mode !== "supabase")
    throw new CareerClientError(
      503,
      "CONFIGURATION_ERROR",
      "Select mock or supabase mode explicitly."
    )
  const fetcher = options.fetcher ?? fetch
  let session: Promise<SessionInfo> | undefined
  async function request<T>(
    path: string,
    method = "GET",
    input?: unknown
  ): Promise<T> {
    let response: Response
    try {
      response = await fetcher(path, {
        method,
        cache: "no-store",
        credentials: "same-origin",
        ...(input !== undefined
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            }
          : {}),
      })
    } catch {
      throw new CareerClientError(
        503,
        "SERVICE_UNAVAILABLE",
        "Could not reach the application. Please retry."
      )
    }
    let body
    try {
      body = await response.json()
    } catch {
      throw new CareerClientError(
        503,
        "SERVICE_UNAVAILABLE",
        "The application returned an invalid response. Please retry."
      )
    }
    if (!response.ok) {
      if (response.status === 401) session = undefined
      throw new CareerClientError(
        response.status,
        body?.error?.code ?? "INTERNAL_ERROR",
        body?.error?.message ?? "Request failed.",
        body?.error?.details
      )
    }
    return body as T
  }
  if (mode === "mock") {
    // Call in a mounted client component; no localStorage access during SSR.
    let storage = options.storage
    if (!storage) {
      try {
        storage = window.localStorage
      } catch {
        throw new CareerClientError(
          503,
          "STORAGE_UNAVAILABLE",
          "Browser storage is unavailable."
        )
      }
    }
    return createMockCareerClient(storage, async (profile) => {
      const result = await request<unknown>("/api/match", "POST", { profile })
      return matchesSchema.parse(result)
    })
  }
  const initializeSession = () => {
    if (!session) {
      session = request<SessionInfo>("/api/session", "POST").catch((error) => {
        session = undefined
        throw error
      })
    }
    return session
  }
  async function privateRequest<T>(
    path: string,
    method = "GET",
    input?: unknown
  ): Promise<T> {
    await initializeSession()
    return request<T>(path, method, input)
  }
  return {
    mode,
    initializeSession,
    async getProfile() {
      try {
        return (
          await privateRequest<{
            profile: ReturnType<typeof candidateProfileSchema.parse>
          }>("/api/profile")
        ).profile
      } catch (error) {
        if (error instanceof CareerClientError && error.status === 404)
          return null
        throw error
      }
    },
    async saveProfile(input) {
      return (
        await privateRequest<{
          profile: ReturnType<typeof candidateProfileSchema.parse>
        }>("/api/profile", "PUT", candidateProfileSchema.parse(input))
      ).profile
    },
    async listOpportunities() {
      return (
        await request<{
          opportunities: Awaited<ReturnType<CareerClient["listOpportunities"]>>
        }>("/api/opportunities")
      ).opportunities
    },
    getOpportunity: (id) =>
      request("/api/opportunities/" + encodeURIComponent(z.uuid().parse(id))),
    async getMatches() {
      return matchesSchema.parse(
        await privateRequest<MatchResponse>("/api/match", "POST")
      )
    },
    async getSaved() {
      return (
        await privateRequest<{
          saved: Awaited<ReturnType<CareerClient["getSaved"]>>
        }>("/api/saved")
      ).saved
    },
    async saveOpportunity(opportunityId) {
      return (
        await privateRequest<{
          saved: Awaited<ReturnType<CareerClient["saveOpportunity"]>>
        }>("/api/saved", "POST", {
          opportunityId: z.uuid().parse(opportunityId),
        })
      ).saved
    },
    async removeSaved(savedId) {
      await privateRequest(
        "/api/saved/" + encodeURIComponent(z.uuid().parse(savedId)),
        "DELETE"
      )
    },
  }
}
