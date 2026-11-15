import type { CandidateProfile } from "@/types/domain"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { normalizeSkill } from "@/features/matching/normalization"

export type ProfileDraft = {
  educationLevel: CandidateProfile["educationLevel"] | ""
  fieldOfStudy: string
  experienceYears: string
  experienceDescription: string
  skills: string[]
  languages: {
    rowId: string
    language: string
    proficiency: CandidateProfile["languages"][number]["proficiency"] | ""
  }[]
  preferredCountries: string[]
  careerInterests: string[]
  workAuthorizations: CandidateProfile["workAuthorizations"]
  studentStatus: CandidateProfile["studentStatus"]
}
export function emptyProfileDraft(): ProfileDraft {
  return {
    educationLevel: "",
    fieldOfStudy: "",
    experienceYears: "",
    experienceDescription: "",
    skills: [],
    languages: [{ rowId: "language-0", language: "", proficiency: "" }],
    preferredCountries: [],
    careerInterests: [],
    workAuthorizations: {},
    studentStatus: "unknown",
  }
}
export function profileToDraft(profile: CandidateProfile): ProfileDraft {
  return {
    ...structuredClone(profile),
    experienceYears: String(profile.experienceYears),
    languages: profile.languages.map((row, index) => ({
      ...row,
      rowId: "language-" + index,
    })),
  }
}
export function draftToInput(draft: ProfileDraft) {
  return {
    ...draft,
    experienceYears:
      draft.experienceYears.trim() === "" ? NaN : Number(draft.experienceYears),
    skills: [...new Set(draft.skills.map(normalizeSkill))],
    languages: draft.languages.map(({ language, proficiency }) => ({
      language,
      proficiency,
    })),
  }
}
export function validateProfileDraft(draft: ProfileDraft) {
  const result = candidateProfileSchema.safeParse(draftToInput(draft))
  if (result.success)
    return { profile: result.data, errors: {} as Record<string, string> }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".")
    errors[key] ??=
      issue.code === "invalid_value"
        ? "Choose an option."
        : issue.code === "invalid_type"
          ? "Enter a valid number."
          : issue.message
  }
  return { profile: null, errors }
}
export function hasProfileContent(draft: ProfileDraft) {
  return !!(
    draft.educationLevel ||
    draft.fieldOfStudy.trim() ||
    draft.experienceYears ||
    draft.experienceDescription.trim() ||
    draft.skills.length ||
    draft.preferredCountries.length ||
    draft.careerInterests.length ||
    draft.languages.some((row) => row.language || row.proficiency) ||
    draft.studentStatus !== "unknown" ||
    Object.values(draft.workAuthorizations).some(
      (status) => status !== "unknown"
    )
  )
}
export function draftFingerprint(draft: ProfileDraft) {
  const { languages, ...rest } = draft
  return JSON.stringify({
    ...rest,
    languages: languages.map(({ language, proficiency }) => ({
      language,
      proficiency,
    })),
  })
}
