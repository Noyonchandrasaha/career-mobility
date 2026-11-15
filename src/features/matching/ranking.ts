import { ELIGIBILITY_PRIORITY } from "@/lib/constants/domain"
import type { MatchResult } from "@/types/domain"

export function rankMatches<T extends MatchResult>(results: readonly T[]): T[] {
  return [...results].sort(
    (a, b) =>
      ELIGIBILITY_PRIORITY[a.eligibilityStatus] -
        ELIGIBILITY_PRIORITY[b.eligibilityStatus] ||
      b.score - a.score ||
      (a.opportunityId < b.opportunityId
        ? -1
        : a.opportunityId > b.opportunityId
          ? 1
          : 0)
  )
}
