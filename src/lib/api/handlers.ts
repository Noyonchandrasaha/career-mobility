import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import type { CareerRepository } from "@/lib/repositories/contracts"
import type { CandidateProfile, Opportunity } from "@/types/domain"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { opportunitySchema } from "@/lib/validation/opportunity-schema"
import { evaluateOpportunities, evaluateOpportunity } from "@/features/matching"
import { ApiError, notFound, unauthorized, unavailable } from "./errors"
import {
  assertSameOrigin,
  errorResponse,
  privateResponse,
  readJson,
} from "./http"

export type ApiContext = {
  mode: "mock" | "supabase"
  repository: CareerRepository
  userId(): Promise<string | null>
  initializeSession(): Promise<string | null>
  finish?(response: NextResponse): NextResponse
}
type Dependencies = { context(request: NextRequest): Promise<ApiContext> }
const uuid = z.uuid()
const saveInput = z.object({ opportunityId: uuid }).strict()
const mockMatchInput = z.object({ profile: candidateProfileSchema }).strict()
function allowDatabase(context: ApiContext) {
  if (context.mode === "mock")
    throw new ApiError(
      409,
      "MODE_LOCAL_ONLY",
      "Demo profiles and bookmarks use browser storage. Use the career client adapter."
    )
}
async function requireUser(context: ApiContext) {
  const id = await context.userId()
  if (!id) throw unauthorized()
  return id
}
function validOpportunities(records: unknown[]): Opportunity[] {
  return records.flatMap((record, index) => {
    const parsed = opportunitySchema.safeParse(record)
    if (parsed.success && parsed.data.isActive) return [parsed.data]
    if (!parsed.success)
      console.error("Invalid opportunity record excluded.", { index })
    return []
  })
}
async function activeOpportunity(context: ApiContext, id: string) {
  const record = await context.repository.getOpportunity(id)
  if (!record) throw notFound("Opportunity not found.")
  const parsed = opportunitySchema.safeParse(record)
  if (!parsed.success) throw unavailable()
  if (!parsed.data.isActive) throw notFound("Opportunity not found.")
  return parsed.data
}
export function createApiHandlers(deps: Dependencies) {
  async function run(
    request: NextRequest,
    action: (context: ApiContext) => Promise<unknown>
  ) {
    let context: ApiContext | undefined
    let response: NextResponse
    try {
      assertSameOrigin(request)
      context = await deps.context(request)
      response = NextResponse.json(await action(context))
    } catch (error) {
      response = errorResponse(error)
    }
    return privateResponse(
      context?.finish ? context.finish(response) : response
    )
  }
  return {
    session: (request: NextRequest) =>
      run(request, async (context) => ({
        mode: context.mode,
        userId: await context.initializeSession(),
      })),
    getProfile: (request: NextRequest) =>
      run(request, async (context) => {
        allowDatabase(context)
        const profile = await context.repository.getProfile(
          await requireUser(context)
        )
        if (!profile) throw notFound("Create your career profile to continue.")
        return { profile }
      }),
    putProfile: (request: NextRequest) =>
      run(request, async (context) => {
        allowDatabase(context)
        const userId = await requireUser(context)
        const input = candidateProfileSchema.parse(await readJson(request))
        return { profile: await context.repository.putProfile(userId, input) }
      }),
    opportunities: (request: NextRequest) =>
      run(request, async (context) => ({
        opportunities: validOpportunities(
          await context.repository.listOpportunities()
        ),
      })),
    opportunity: (request: NextRequest, id: string) =>
      run(request, async (context) => {
        if (!uuid.safeParse(id).success)
          throw notFound("Opportunity not found.")
        const opportunity = await activeOpportunity(context, id)
        const userId =
          context.mode === "supabase" ? await context.userId() : null
        const profile = userId
          ? await context.repository.getProfile(userId)
          : null
        return {
          opportunity,
          match: profile ? evaluateOpportunity(profile, opportunity) : null,
        }
      }),
    match: (request: NextRequest) =>
      run(request, async (context) => {
        let profile: CandidateProfile
        if (context.mode === "mock") {
          profile = mockMatchInput.parse(await readJson(request)).profile
        } else {
          const userId = await requireUser(context)
          // Supabase mode never trusts browser-provided profile/identity for evaluation.
          if (request.body)
            z.object({})
              .strict()
              .parse(await readJson(request))
          const stored = await context.repository.getProfile(userId)
          if (!stored) throw notFound("Create your career profile to continue.")
          profile = stored
        }
        const evaluation = evaluateOpportunities(
          profile,
          await context.repository.listOpportunities(),
          (issue) => console.error("Invalid opportunity excluded.", issue)
        )
        return { total: evaluation.total, results: evaluation.results }
      }),
    saved: (request: NextRequest) =>
      run(request, async (context) => {
        allowDatabase(context)
        const userId = await requireUser(context)
        const [saved, profile, records] = await Promise.all([
          context.repository.listSaved(userId),
          context.repository.getProfile(userId),
          context.repository.listOpportunities(),
        ])
        const opportunities = new Map(
          validOpportunities(records).map((item) => [item.id, item])
        )
        return {
          saved: saved.map((item) => {
            const opportunity = opportunities.get(item.opportunityId) ?? null
            return {
              ...item,
              opportunity,
              unavailable: !opportunity,
              match:
                profile && opportunity
                  ? evaluateOpportunity(profile, opportunity)
                  : null,
            }
          }),
        }
      }),
    save: (request: NextRequest) =>
      run(request, async (context) => {
        allowDatabase(context)
        const userId = await requireUser(context)
        const { opportunityId } = saveInput.parse(await readJson(request))
        await activeOpportunity(context, opportunityId)
        return { saved: await context.repository.save(userId, opportunityId) }
      }),
    remove: (request: NextRequest, id: string) =>
      run(request, async (context) => {
        allowDatabase(context)
        const userId = await requireUser(context)
        uuid.parse(id)
        if (!(await context.repository.remove(userId, id)))
          throw notFound("Saved opportunity not found.")
        return { removed: true }
      }),
  }
}
