import "server-only"
import { createClient } from "@supabase/supabase-js"
import { opportunities } from "@/data"
import { getAppEnvironment } from "@/lib/env"
import { opportunitySchema } from "@/lib/validation/opportunity-schema"
import { SupabaseCareerRepository } from "./supabase"
import { unavailable } from "@/lib/api/errors"
import type { Database } from "@/types/database"

export async function getPublicOpportunity(id: string) {
  const env = getAppEnvironment()
  if (env.mode === "mock")
    return opportunities.find((job) => job.id === id && job.isActive) ?? null
  // Only active public job data is read here. Personal data stays in verified API requests.
  const client = createClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  )
  const record = await new SupabaseCareerRepository(client).getOpportunity(id)
  if (!record) return null
  const parsed = opportunitySchema.safeParse(record)
  if (!parsed.success) throw unavailable()
  return parsed.data.isActive ? parsed.data : null
}
