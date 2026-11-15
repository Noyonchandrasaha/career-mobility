import "server-only"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { getAppEnvironment } from "@/lib/env"
import type { Database } from "@/types/database"

// Read-only Server Component client. Workspace proxy persists refresh cookies.
// Mutations must use Route Handlers with createRequestSupabase instead.
export async function createServerSupabase() {
  const env = getAppEnvironment()
  if (env.mode !== "supabase") throw new Error("Supabase is not enabled.")
  const store = await cookies()
  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: { getAll: () => store.getAll() },
    }
  )
}
