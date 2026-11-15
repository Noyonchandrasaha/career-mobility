import { describe, expect, it } from "vitest"
import rawOpportunities from "@/data/opportunities.json"
import rawProfile from "@/data/sample-profile.json"
import { opportunityDatasetSchema } from "@/lib/validation/opportunity-schema"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { COUNTRIES } from "@/lib/constants/domain"

describe("Fictional seed dataset", () => {
  it("contains fifteen valid, stable identities with normalized countries and varied requirements", () => {
    const jobs = opportunityDatasetSchema.parse(rawOpportunities)
    expect(jobs.map((job) => job.id.slice(-2))).toEqual(
      Array.from({ length: 15 }, (_, index) =>
        String(index + 1).padStart(2, "0")
      )
    )
    expect(new Set(jobs.map((job) => job.country))).toEqual(new Set(COUNTRIES))
    expect(
      jobs.every(
        (job) => job.organization && job.responsibilities.length && job.isActive
      )
    ).toBe(true)
    expect(jobs.some((job) => job.minimumExperienceYears > 2)).toBe(true)
    expect(jobs.some((job) => job.minimumEducationLevel === "doctorate")).toBe(
      true
    )
  })
  it("preserves the required internship and German-language scenarios", () => {
    const jobs = opportunityDatasetSchema.parse(rawOpportunities)
    expect(jobs[8].employmentType).toBe("internship")
    expect(jobs[8].requiredSkills).toContain("excel")
    expect(jobs[8].eligibility).toMatchObject({
      requiresCurrentEnrollment: true,
      requiresLocalWorkAuthorization: true,
    })
    expect(jobs[9].country).toBe("Germany")
    expect(jobs[9].requiredLanguages).toContainEqual({
      language: "German",
      minimumProficiency: "professional",
      mandatory: true,
    })
    const profile = candidateProfileSchema.parse(rawProfile)
    expect(profile.studentStatus).toBe("unknown")
    expect(profile.languages.map((item) => item.language)).toEqual([
      "English",
      "Bengali",
    ])
  })
})
