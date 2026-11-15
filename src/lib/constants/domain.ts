export const EDUCATION_LEVELS = [
  "high_school",
  "diploma",
  "bachelors",
  "masters",
  "doctorate",
] as const
export const LANGUAGE_PROFICIENCIES = [
  "basic",
  "intermediate",
  "professional",
  "fluent",
  "native",
] as const
export const DECLARED_STATUSES = ["yes", "no", "unknown"] as const
export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "internship",
] as const
export const ELIGIBILITY_STATUSES = [
  "no_identified_blocker",
  "requires_verification",
  "blocked",
] as const
export const COUNTRIES = ["Canada", "Germany", "Singapore"] as const
export const ELIGIBILITY_LABELS = {
  no_identified_blocker: "No identified blocker",
  requires_verification: "Requires verification",
  blocked: "Blocked",
} as const
export const ELIGIBILITY_PRIORITY = {
  no_identified_blocker: 0,
  requires_verification: 1,
  blocked: 2,
} as const
export const MATCH_WEIGHTS = {
  skills: 35,
  experience: 20,
  education: 15,
  location: 15,
  language: 15,
} as const
