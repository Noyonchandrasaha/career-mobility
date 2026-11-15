import { api } from "@/lib/api"
export const dynamic = "force-dynamic"
import type { NextRequest } from "next/server"
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return api.opportunity(request, (await context.params).id)
}
