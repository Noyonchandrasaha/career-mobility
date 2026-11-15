import nextEnv from "@next/env"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { opportunities } from "../src/data"
import { opportunityToRow } from "../src/lib/repositories/mappers"
import type { Database } from "../src/types/database"

nextEnv.loadEnvConfig(process.cwd())
async function main() {
  if (process.argv.includes("--validate-only")) {
    opportunities.forEach(opportunityToRow)
    console.log(
      "Validated 15 fictional opportunities and database mappings. No database writes performed."
    )
    return
  }
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      SUPABASE_SECRET_KEY: z.string().trim().min(1),
    })
    .safeParse(process.env)
  if (!env.success)
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and the seed-only SUPABASE_SECRET_KEY in .env.local."
    )
  const client = createClient<Database>(
    env.data.NEXT_PUBLIC_SUPABASE_URL,
    env.data.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
  const { data, error } = await client
    .from("opportunities")
    .upsert(opportunities.map(opportunityToRow), { onConflict: "id" })
    .select("id")
  if (error || data?.length !== 15)
    throw new Error(
      "Seed failed. Check migration, project URL and seed-key permissions."
    )
  console.log(
    "Seed complete: 15 fictional opportunities upserted with stable IDs. No candidate records changed."
  )
}
main().catch((error) => {
  console.error(
    error instanceof Error && error.message.startsWith("Set ")
      ? error.message
      : "Seed failed. Check configuration and database access."
  )
  process.exitCode = 1
})
