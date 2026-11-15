import "server-only"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/database"
import type { AppEnvironment } from "@/lib/validation/env-schema"
import { unauthorized, unavailable } from "@/lib/api/errors"

export function createRequestSupabase(
  request: NextRequest,
  env: Extract<AppEnvironment, { mode: "supabase" }>
) {
  const pending = new NextResponse()
  const client = createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          for (const { name, value, options } of values) {
            request.cookies.set(name, value)
            pending.cookies.set(name, value, options)
          }
          Object.entries(headers).forEach(([key, value]) =>
            pending.headers.set(key, value)
          )
        },
      },
    }
  )
  let verified: Promise<string | null> | undefined
  const userId = () =>
    (verified ??= (async () => {
      const { data, error } = await client.auth.getUser()
      if (error) {
        if (error.name === "AuthSessionMissingError") return null
        if (!error.status || error.status >= 500 || error.status === 429)
          throw unavailable()
        throw unauthorized()
      }
      return data.user?.id ?? null
    })())
  return {
    client,
    userId,
    async initializeSession() {
      const existing = await userId()
      if (existing) return existing
      // Invalid/expired cookie data must not silently create a new identity.
      if (
        request.cookies
          .getAll()
          .some(({ name }) => /^sb-.*-auth-token(?:\.\d+)?$/.test(name))
      )
        throw unauthorized()
      const { data, error } = await client.auth.signInAnonymously()
      if (error || !data.user) throw unavailable()
      return data.user.id
    },
    finish(response: NextResponse) {
      for (const cookie of pending.cookies.getAll())
        response.cookies.set(cookie)
      pending.headers.forEach((value, key) => {
        if (key !== "set-cookie") response.headers.set(key, value)
      })
      return response
    },
  }
}
