import type {
  CandidateProfile,
  EligibilityStatus,
  Opportunity,
} from "@/types/domain"
import type { LanguageFinding } from "./criteria"
import { normalize } from "./normalization"

export function evaluateEligibility(
  profile: CandidateProfile,
  job: Opportunity,
  languages: LanguageFinding[]
) {
  const gaps: string[] = []
  const warnings: string[] = []
  if (job.eligibility.requiresLocalWorkAuthorization) {
    const entries = Object.entries(profile.workAuthorizations).filter(
      ([country]) => normalize(country) === normalize(job.country)
    )
    // Conflicting aliases/casing are not sufficient evidence for an affirmative claim.
    const statuses = new Set(entries.map(([, status]) => status))
    const status = statuses.size === 1 ? entries[0]?.[1] : "unknown"
    if (status === "no")
      gaps.push(
        `Local work authorization for ${job.country} is explicitly not held.`
      )
    else if (status !== "yes")
      warnings.push(
        `Local work authorization for ${job.country} requires verification.`
      )
  }
  if (job.eligibility.requiresCurrentEnrollment) {
    if (profile.studentStatus === "no")
      gaps.push(
        "Current student enrollment is required but candidate is not enrolled."
      )
    else if (profile.studentStatus !== "yes")
      warnings.push("Current student enrollment requires verification.")
  }
  for (const language of languages.filter((item) => item.mandatory)) {
    if (language.unknown)
      warnings.push(
        `Mandatory ${language.language} proficiency requires verification.`
      )
    else if (!language.satisfied)
      gaps.push(
        `Mandatory ${language.language} proficiency requirement is not met.`
      )
  }
  for (const condition of job.eligibility.additionalConditions) {
    warnings.push(`Additional condition requires verification: ${condition}`)
  }
  const status: EligibilityStatus = gaps.length
    ? "blocked"
    : warnings.length
      ? "requires_verification"
      : "no_identified_blocker"
  return {
    status,
    gaps,
    warnings,
    observation:
      gaps.length || warnings.length
        ? [...gaps, ...warnings].join(" ")
        : "No identified configured blocker; this is not legal verification.",
  }
}
