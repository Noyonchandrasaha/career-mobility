import { describe, expect, it } from "vitest"
import { sampleProfile } from "@/data"
import {
  draftFingerprint,
  emptyProfileDraft,
  hasProfileContent,
  profileToDraft,
  validateProfileDraft,
} from "@/features/candidate/profile-draft"

describe("Profile draft validation boundary", () => {
  it("distinguishes a blank number from zero and accepts fractional experience", () => {
    const blank = emptyProfileDraft()
    expect(validateProfileDraft(blank).errors.experienceYears).toBeTruthy()
    expect(hasProfileContent(blank)).toBe(false)
    const draft = profileToDraft(sampleProfile)
    expect(
      validateProfileDraft({ ...draft, experienceYears: "0" }).profile
        ?.experienceYears
    ).toBe(0)
    expect(
      validateProfileDraft({ ...draft, experienceYears: "0.5" }).profile
        ?.experienceYears
    ).toBe(0.5)
    expect(
      validateProfileDraft({ ...draft, experienceYears: "-1" }).profile
    ).toBeNull()
  })
  it("excludes UI row identities, normalizes aliases and preserves unknown declarations", () => {
    const draft = profileToDraft(sampleProfile)
    const result = validateProfileDraft({
      ...draft,
      skills: ["MS Excel", "Microsoft Excel"],
      languages: draft.languages.map((row) => ({
        ...row,
        rowId: crypto.randomUUID(),
      })),
    })
    expect(result.profile?.skills).toEqual(["excel"])
    expect(result.profile?.languages[0]).not.toHaveProperty("rowId")
    expect(result.profile?.workAuthorizations.Canada).toBe("unknown")
    expect(draftFingerprint(draft)).toBe(
      draftFingerprint({
        ...draft,
        languages: draft.languages.map((row) => ({
          ...row,
          rowId: crypto.randomUUID(),
        })),
      })
    )
  })
  it("exposes indexed language errors and required multi-selection errors", () => {
    const result = validateProfileDraft({
      ...profileToDraft(sampleProfile),
      languages: [{ rowId: "a", language: "", proficiency: "" }],
      preferredCountries: [],
      skills: [],
    })
    expect(result.errors["languages.0.language"]).toBeTruthy()
    expect(result.errors["languages.0.proficiency"]).toBeTruthy()
    expect(result.errors.preferredCountries).toBeTruthy()
    expect(result.errors.skills).toBeTruthy()
  })
})
