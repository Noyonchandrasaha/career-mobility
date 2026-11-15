import { api } from "@/lib/api"
export const dynamic = "force-dynamic"
import type { NextRequest } from "next/server"
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return api.remove(request, (await context.params).id)
}
