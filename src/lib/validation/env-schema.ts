import { z } from "zod"

export const appEnvironmentSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("mock") }),
  z.object({
    mode: z.literal("supabase"),
    supabaseUrl: z.url(),
    supabasePublishableKey: z.string().trim().min(1),
  }),
])
export type AppEnvironment = z.infer<typeof appEnvironmentSchema>
