import { MATCH_WEIGHTS } from "@/lib/constants/domain"
import { opportunitySchema } from "@/lib/validation/opportunity-schema"
import type { CandidateProfile, MatchResult, Opportunity } from "@/types/domain"
import {
  evaluateEducation,
  evaluateExperience,
  evaluateLanguages,
  evaluateLocation,
  evaluateSkills,
} from "./criteria"
import { evaluateEligibility } from "./eligibility"
import { rankMatches } from "./ranking"

// Callers validate candidate input once at their API/storage boundary.
// No React, storage, SDK, network, or ID-specific matching rules belong here.
export function evaluateOpportunity(
  profile: CandidateProfile,
  job: Opportunity
): MatchResult {
  const skills = evaluateSkills(profile.skills, job.requiredSkills)
  const experience = evaluateExperience(
    profile.experienceYears,
    job.minimumExperienceYears
  )
  const education = evaluateEducation(profile, job)
  const location = evaluateLocation(profile.preferredCountries, job.country)
  const language = evaluateLanguages(profile.languages, job.requiredLanguages)
  const eligibility = evaluateEligibility(profile, job, language.findings)
  const criterionScores = {
    skills: skills.score,
    experience: experience.score,
    education: education.score,
    location: location.score,
    language: language.score,
  }
  const score = Math.round(
    (Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]).reduce(
      (sum, key) => sum + criterionScores[key] * MATCH_WEIGHTS[key],
      0
    )
  )
  const strengths = skills.matched.length
    ? [`Listed required skills: ${skills.matched.join(", ")}.`]
    : []
  const gaps = skills.missing.length
    ? [`Missing required skills: ${skills.missing.join(", ")}.`]
    : []
  for (const finding of [
    experience,
    education,
    location,
    ...language.findings,
  ]) {
    if (finding.satisfied) strengths.push(finding.observation)
    else if (!("unknown" in finding && finding.unknown))
      gaps.push(finding.observation)
  }
  gaps.push(...eligibility.gaps)
  const warnings = [...skills.warnings, ...eligibility.warnings]
  for (const finding of language.findings) {
    if (finding.unknown && !finding.mandatory)
      warnings.push(finding.observation)
  }
  return {
    opportunityId: job.id,
    score,
    criterionScores,
    eligibilityStatus: eligibility.status,
    criterionExplanations: {
      skills: skills.observation,
      experience: experience.observation,
      education: education.observation,
      location: location.observation,
      language: language.observation,
    },
    eligibilityFindings: [...eligibility.gaps, ...eligibility.warnings],
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    strengths,
    gaps,
    warnings,
    explanation: [
      skills.observation,
      experience.observation,
      education.observation,
      location.observation,
      language.observation,
      eligibility.observation,
    ].join(" "),
  }
}

export type EvaluationIssue = { index: number; reason: string }
export function evaluateOpportunities(
  profile: CandidateProfile,
  records: readonly unknown[],
  onInvalid?: (issue: EvaluationIssue) => void
) {
  const results: MatchResult[] = []
  const invalidRecords: EvaluationIssue[] = []
  const ids = new Set<string>()
  const slugs = new Set<string>()
  records.forEach((record, index) => {
    const parsed = opportunitySchema.safeParse(record)
    const duplicate =
      parsed.success && (ids.has(parsed.data.id) || slugs.has(parsed.data.slug))
    if (!parsed.success || duplicate) {
      const issue = {
        index,
        reason: duplicate
          ? "Duplicate opportunity identity."
          : "Invalid opportunity record.",
      }
      invalidRecords.push(issue)
      onInvalid?.(issue)
      return
    }
    ids.add(parsed.data.id)
    slugs.add(parsed.data.slug)
    if (parsed.data.isActive)
      results.push(evaluateOpportunity(profile, parsed.data))
  })
  return {
    total: results.length,
    results: rankMatches(results),
    invalidRecords,
  }
}
