import "server-only"
import type { NextRequest } from "next/server"
import { getAppEnvironment } from "@/lib/env"
import { opportunities } from "@/data"
import { SupabaseCareerRepository } from "@/lib/repositories/supabase"
import { createRequestSupabase } from "@/lib/supabase/request"
import type { ApiContext } from "./handlers"
import { unavailable } from "./errors"

export async function createApiContext(
  request: NextRequest
): Promise<ApiContext> {
  let env
  try {
    env = getAppEnvironment()
  } catch {
    throw unavailable()
  }
  if (env.mode === "mock") {
    const unsupported = async (): Promise<never> => {
      throw new Error("Mock private persistence is browser-only.")
    }
    return {
      mode: "mock",
      userId: async () => null,
      initializeSession: async () => null,
      repository: {
        getProfile: unsupported,
        putProfile: unsupported,
        listSaved: unsupported,
        save: unsupported,
        remove: unsupported,
        listOpportunities: async () => opportunities,
        getOpportunity: async (id) =>
          opportunities.find((item) => item.id === id && item.isActive) ?? null,
      },
    }
  }
  const context = createRequestSupabase(request, env)
  return {
    mode: "supabase",
    repository: new SupabaseCareerRepository(context.client),
    userId: context.userId,
    initializeSession: context.initializeSession,
    finish: context.finish,
  }
}
