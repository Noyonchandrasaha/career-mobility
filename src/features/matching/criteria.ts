import {
  EDUCATION_LEVELS,
  LANGUAGE_PROFICIENCIES,
} from "@/lib/constants/domain"
import type { CandidateProfile, Opportunity } from "@/types/domain"
import { normalize, normalizeField, uniqueSkills } from "./normalization"

export type CriterionFinding = {
  score: number
  satisfied: boolean
  observation: string
}
export type LanguageFinding = CriterionFinding & {
  language: string
  mandatory: boolean
  unknown: boolean
}
export function evaluateSkills(candidate: string[], required: string[]) {
  const available = new Set(uniqueSkills(candidate))
  const requirements = uniqueSkills(required)
  const matched = requirements.filter((skill) => available.has(skill))
  const missing = requirements.filter((skill) => !available.has(skill))
  return {
    score: requirements.length ? matched.length / requirements.length : 0.5,
    matched,
    missing,
    observation: requirements.length
      ? `Skills: ${matched.length} of ${requirements.length} required skills listed.`
      : "No required skills configured; neutral skill score used.",
    warnings: requirements.length
      ? []
      : ["Data quality: no required skills configured."],
  }
}
export function evaluateExperience(
  years: number,
  required: number
): CriterionFinding {
  const satisfied = years >= required
  return {
    score: required === 0 ? 1 : Math.max(0, Math.min(1, years / required)),
    satisfied,
    observation: `Experience: ${years} years declared; ${required} years required. ${satisfied ? "Minimum met." : "Minimum not met."}`,
  }
}
export function evaluateEducation(
  profile: CandidateProfile,
  job: Opportunity
): CriterionFinding {
  const level =
    EDUCATION_LEVELS.indexOf(profile.educationLevel) >=
    EDUCATION_LEVELS.indexOf(job.minimumEducationLevel)
  const field =
    !job.acceptedEducationFields.length ||
    job.acceptedEducationFields.some(
      (value) => normalizeField(value) === normalizeField(profile.fieldOfStudy)
    )
  return {
    score: (Number(level) + Number(field)) / 2,
    satisfied: level && field,
    observation: `Education: ${level ? "qualification level met" : "qualification level below requirement"}; ${field ? "field accepted" : "field not accepted"}.`,
  }
}
export function evaluateLocation(
  countries: string[],
  country: string
): CriterionFinding {
  const satisfied = countries.some(
    (value) => normalize(value) === normalize(country)
  )
  return {
    score: Number(satisfied),
    satisfied,
    observation: `Location: ${country} ${satisfied ? "is" : "is not"} among preferred countries; preference does not establish work authorization.`,
  }
}
export function evaluateLanguages(
  languages: CandidateProfile["languages"],
  requirements: Opportunity["requiredLanguages"]
) {
  const findings: LanguageFinding[] = requirements.map((requirement) => {
    const declared = languages.filter(
      (item) => normalize(item.language) === normalize(requirement.language)
    )
    const levels = declared.map((item) =>
      LANGUAGE_PROFICIENCIES.indexOf(item.proficiency)
    )
    // A populated valid list without this language is an explicit declared gap.
    // An empty/incomplete list cannot establish a confirmed mandatory failure.
    const unknown =
      !languages.length ||
      (declared.length > 0 && levels.some((level) => level < 0))
    const satisfied =
      !unknown &&
      levels.some(
        (level) =>
          level >=
          LANGUAGE_PROFICIENCIES.indexOf(requirement.minimumProficiency)
      )
    return {
      language: requirement.language,
      mandatory: requirement.mandatory,
      unknown,
      satisfied,
      score: Number(satisfied),
      observation: `Language: ${requirement.language} (${requirement.minimumProficiency}) ${unknown ? "requires verification" : satisfied ? "requirement met" : "requirement not met"}.`,
    }
  })
  return {
    score: findings.length
      ? findings.reduce((sum, item) => sum + item.score, 0) / findings.length
      : 1,
    findings,
    observation: findings.length
      ? findings.map((item) => item.observation).join(" ")
      : "Language: no restriction configured.",
  }
}
