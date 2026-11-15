import { NextResponse, type NextRequest } from "next/server"
import { getAppEnvironment } from "@/lib/env"
import { createRequestSupabase } from "@/lib/supabase/request"
import { privateResponse } from "@/lib/api/http"

// API routes refresh their own cookies. Only workspace SSR passes through here.
export async function proxy(request: NextRequest) {
  const originalHeaders = new Headers(request.headers)
  try {
    const env = getAppEnvironment()
    if (env.mode === "mock") return privateResponse(NextResponse.next())
    const context = createRequestSupabase(request, env)
    try {
      await context.userId()
      return privateResponse(context.finish(NextResponse.next({ request })))
    } catch {
      // Let the session retry UI render, preserving identity cookies on failure.
      // API handlers independently verify access and return the actual auth error.
      return privateResponse(
        NextResponse.next({ request: { headers: originalHeaders } })
      )
    }
  } catch {
    return privateResponse(
      NextResponse.next({ request: { headers: originalHeaders } })
    )
  }
}
export const config = {
  matcher: [
    "/profile/:path*",
    "/recommendations/:path*",
    "/opportunities/:path*",
    "/saved/:path*",
  ],
}
