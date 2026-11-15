import { describe, expect, it } from "vitest"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { appEnvironmentSchema } from "@/lib/validation/env-schema"
import {
  opportunityDatasetSchema,
  opportunitySchema,
} from "@/lib/validation/opportunity-schema"

const profile = {
  educationLevel: "bachelors",
  fieldOfStudy: " Business Administration ",
  experienceYears: 0,
  experienceDescription: "Recent graduate",
  skills: [" Excel "],
  languages: [{ language: "English", proficiency: "professional" }],
  preferredCountries: ["Canada"],
  careerInterests: ["Operations"],
}
const opportunity = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "programme-assistant",
  title: "Programme Assistant",
  organization: "Fictional Organization",
  country: "Canada",
  city: "Toronto",
  employmentType: "full_time",
  description: "Fictional test opportunity",
  requiredSkills: [],
  minimumExperienceYears: 0,
  minimumEducationLevel: "bachelors",
  acceptedEducationFields: [],
  requiredLanguages: [],
  careerCategories: ["Operations"],
  eligibility: {
    requiresCurrentEnrollment: false,
    requiresLocalWorkAuthorization: false,
    additionalConditions: [],
  },
  isActive: true,
}

describe("Profile validation boundary", () => {
  it("accepts zero experience and preserves unknown eligibility", () => {
    const result = candidateProfileSchema.parse(profile)
    expect(result.fieldOfStudy).toBe("Business Administration")
    expect(result.skills).toEqual(["Excel"])
    expect(result.studentStatus).toBe("unknown")
    expect(result.workAuthorizations).toEqual({})
  })
  it.each([-1, NaN, Infinity, "2"])(
    "rejects invalid experience %s",
    (experienceYears) => {
      expect(
        candidateProfileSchema.safeParse({ ...profile, experienceYears })
          .success
      ).toBe(false)
    }
  )
  it.each(["skills", "languages", "preferredCountries", "careerInterests"])(
    "rejects empty %s",
    (field) => {
      expect(
        candidateProfileSchema.safeParse({ ...profile, [field]: [] }).success
      ).toBe(false)
    }
  )
  it("rejects blank content and duplicate trimmed/case-folded selections", () => {
    expect(
      candidateProfileSchema.safeParse({ ...profile, fieldOfStudy: "  " })
        .success
    ).toBe(false)
    expect(
      candidateProfileSchema.safeParse({
        ...profile,
        skills: ["Excel", " excel "],
      }).success
    ).toBe(false)
    expect(
      candidateProfileSchema.safeParse({
        ...profile,
        languages: [
          ...profile.languages,
          { language: " english ", proficiency: "native" },
        ],
      }).success
    ).toBe(false)
  })
  it("rejects supplied ownership and unrecognized authorization states", () => {
    expect(
      candidateProfileSchema.safeParse({ ...profile, id: "another-user" })
        .success
    ).toBe(false)
    expect(
      candidateProfileSchema.safeParse({
        ...profile,
        workAuthorizations: { Canada: "verified" },
      }).success
    ).toBe(false)
  })
})
describe("Opportunity validation boundary", () => {
  it("allows absent restrictions without inventing requirements", () => {
    expect(opportunitySchema.parse(opportunity).requiredSkills).toEqual([])
  })
  it("rejects missing mandatory language flags and negative requirements", () => {
    expect(
      opportunitySchema.safeParse({
        ...opportunity,
        requiredLanguages: [
          { language: "German", minimumProficiency: "professional" },
        ],
      }).success
    ).toBe(false)
    expect(
      opportunitySchema.safeParse({
        ...opportunity,
        minimumExperienceYears: -1,
      }).success
    ).toBe(false)
  })
  it("rejects duplicate seed identities even with fifteen records", () => {
    expect(
      opportunityDatasetSchema.safeParse(
        Array.from({ length: 15 }, () => opportunity)
      ).success
    ).toBe(false)
  })
})
describe("Explicit environment selection", () => {
  it("allows credential-free mock mode without silently defaulting to it", () => {
    expect(appEnvironmentSchema.safeParse({ mode: "mock" }).success).toBe(true)
    expect(appEnvironmentSchema.safeParse({}).success).toBe(false)
    expect(appEnvironmentSchema.safeParse({ mode: "supabase" }).success).toBe(
      false
    )
  })
})
