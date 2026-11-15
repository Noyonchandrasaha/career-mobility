import "server-only"
import { appEnvironmentSchema } from "@/lib/validation/env-schema"

// Lazy validation allows static public pages to build before backend setup.
export function getAppEnvironment() {
  const result = appEnvironmentSchema.safeParse({
    mode: process.env.NEXT_PUBLIC_DATA_MODE,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
  if (!result.success) {
    throw new Error(
      "Invalid app configuration. Check .env.local against .env.example."
    )
  }
  return result.data
}
