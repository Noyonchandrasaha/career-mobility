import type { MatchResponse } from "@/types/career-client"
import type { EligibilityStatus, Opportunity } from "@/types/domain"

export function joinRecommendations(
  matches: MatchResponse,
  jobs: Opportunity[]
) {
  const byId = new Map(
    jobs.filter((job) => job.isActive).map((job) => [job.id, job])
  )
  if (
    matches.total !== matches.results.length ||
    new Set(matches.results.map((item) => item.opportunityId)).size !==
      matches.total
  ) {
    throw new Error("The evaluation results are inconsistent. Please retry.")
  }
  // Preserve the server's exact order; the UI never creates its own ranking.
  return matches.results.map((match) => {
    const opportunity = byId.get(match.opportunityId)
    if (!opportunity)
      throw new Error("Opportunities changed while loading. Please retry.")
    return { opportunity, match }
  })
}
export function summarizeMatches(matches: MatchResponse) {
  const counts: Record<EligibilityStatus, number> = {
    no_identified_blocker: 0,
    requires_verification: 0,
    blocked: 0,
  }
  matches.results.forEach((result) => counts[result.eligibilityStatus]++)
  return counts
}
export const EMPLOYMENT_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
} as const
export const EDUCATION_LABELS = {
  high_school: "High school",
  diploma: "Diploma",
  bachelors: "Bachelor’s degree",
  masters: "Master’s degree",
  doctorate: "Doctorate",
} as const
