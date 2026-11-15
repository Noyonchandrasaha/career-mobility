import { describe, expect, it } from "vitest"
import { opportunities, sampleProfile } from "@/data"
import {
  evaluateOpportunity,
  evaluateOpportunities,
  rankMatches,
} from "@/features/matching"
import {
  evaluateExperience,
  evaluateSkills,
} from "@/features/matching/criteria"
import { matchResultSchema } from "@/lib/validation/match-schema"
import type { CandidateProfile, Opportunity } from "@/types/domain"

const job = (number: number): Opportunity =>
  structuredClone(opportunities[number - 1])
const candidate = (
  changes: Partial<CandidateProfile> = {}
): CandidateProfile => ({ ...structuredClone(sampleProfile), ...changes })

describe("Weighted criteria", () => {
  it("computes a complete match and reports every criterion", () => {
    const result = evaluateOpportunity(candidate(), job(1))
    expect(result.score).toBe(100)
    expect(result.criterionScores).toEqual({
      skills: 1,
      experience: 1,
      education: 1,
      location: 1,
      language: 1,
    })
    expect(result.eligibilityStatus).toBe("no_identified_blocker")
    for (const label of [
      "Skills:",
      "Experience:",
      "Education:",
      "Location:",
      "Language:",
    ])
      expect(result.explanation).toContain(label)
  })
  it("computes a partial match without rounding criterion points first", () => {
    const result = evaluateOpportunity(candidate(), job(5))
    expect(result.score).toBe(83)
    expect(result.criterionScores.skills).toBe(0.5)
    expect(result.missingSkills).toEqual(["sql", "data visualization"])
    expect(result.gaps.join(" ")).toContain("sql")
  })
  it("normalizes skill aliases, whitespace and duplicate requirements without inflating scores", () => {
    const result = evaluateSkills(
      [" MS Excel ", "Microsoft Excel", "EXCEL"],
      ["excel", " Excel ", "research"]
    )
    expect(result.score).toBe(0.5)
    expect(result.matched).toEqual(["excel"])
    expect(result.missing).toEqual(["research"])
    expect(evaluateSkills(["java"], ["javascript"]).score).toBe(0)
    expect(evaluateSkills(["constructor"], ["constructor"]).matched).toEqual([
      "constructor",
    ])
  })
  it("uses neutral skills and a warning for an empty configured skill list", () => {
    const result = evaluateOpportunity(candidate(), {
      ...job(1),
      requiredSkills: [],
    })
    expect(result.criterionScores.skills).toBe(0.5)
    expect(result.warnings.join(" ")).toContain("no required skills")
    expect(result.eligibilityStatus).toBe("no_identified_blocker")
  })
  it.each([
    [0, 0, 1],
    [0, 4, 0],
    [2, 4, 0.5],
    [8, 4, 1],
  ])("experience %s / %s gives %s", (years, required, expected) => {
    expect(evaluateExperience(years, required).score).toBe(expected)
  })
  it("requires both education level and field, without inventing specialized qualifications", () => {
    expect(
      evaluateOpportunity(candidate({ fieldOfStudy: " BBA " }), job(1))
        .criterionScores.education
    ).toBe(1)
    const medical = evaluateOpportunity(candidate(), job(14))
    expect(medical.criterionScores.education).toBe(0)
    expect(medical.gaps.join(" ")).toContain("field not accepted")
    expect(
      evaluateOpportunity(candidate(), {
        ...job(14),
        acceptedEducationFields: [],
      }).criterionScores.education
    ).toBe(0.5)
    expect(
      evaluateOpportunity(candidate({ educationLevel: "doctorate" }), job(14))
        .criterionScores.education
    ).toBe(0.5)
    // Education gaps reduce alignment, but are not an invented configured hard constraint.
    expect(medical.eligibilityStatus).toBe("no_identified_blocker")
  })
  it("matches normalized locations without treating preferences as authorization", () => {
    const result = evaluateOpportunity(
      candidate({ preferredCountries: [" canada "] }),
      job(9)
    )
    expect(result.criterionScores.location).toBe(1)
    expect(result.eligibilityStatus).toBe("requires_verification")
    expect(
      evaluateOpportunity(candidate({ preferredCountries: ["France"] }), job(1))
        .criterionScores.location
    ).toBe(0)
  })
  it("supports zero and full scores and never modifies inputs", () => {
    const profile = candidate({
      experienceYears: 0,
      educationLevel: "high_school",
      fieldOfStudy: "art",
      skills: ["painting"],
      preferredCountries: ["France"],
      languages: [{ language: "Bengali", proficiency: "native" }],
    })
    const opportunity = job(15)
    const before = structuredClone({ profile, opportunity })
    expect(evaluateOpportunity(profile, opportunity).score).toBe(0)
    expect({ profile, opportunity }).toEqual(before)
  })
  it("recomputes improvements instead of retaining stale scores", () => {
    const before = evaluateOpportunity(candidate(), job(5))
    const after = evaluateOpportunity(
      candidate({
        skills: [...sampleProfile.skills, "sql", "data visualization"],
      }),
      job(5)
    )
    expect(after.score).toBe(100)
    expect(after.score).toBeGreaterThan(before.score)
  })
})

describe("Mandatory constraints and uncertainty", () => {
  it("keeps unknown internship enrollment and authorization as verification, not failure or success", () => {
    const result = evaluateOpportunity(candidate(), job(9))
    expect(result.score).toBe(88)
    expect(result.eligibilityStatus).toBe("requires_verification")
    expect(result.warnings.join(" ")).toContain(
      "enrollment requires verification"
    )
    expect(result.warnings.join(" ")).toContain(
      "authorization for Canada requires verification"
    )
  })
  it("confirmed failure overrides unknown constraints without changing the alignment score", () => {
    const unknown = evaluateOpportunity(candidate(), job(9))
    const blocked = evaluateOpportunity(
      candidate({ studentStatus: "no" }),
      job(9)
    )
    expect(blocked.eligibilityStatus).toBe("blocked")
    expect(blocked.score).toBe(unknown.score)
    expect(blocked.gaps.join(" ")).toContain("not enrolled")
    expect(blocked.warnings.length).toBeGreaterThan(0)
  })
  it("evaluates declared authorization per country, including absent and conflicting entries", () => {
    const opportunity = job(9)
    expect(
      evaluateOpportunity(
        candidate({
          studentStatus: "yes",
          workAuthorizations: { Canada: "yes" },
        }),
        opportunity
      ).eligibilityStatus
    ).toBe("no_identified_blocker")
    expect(
      evaluateOpportunity(
        candidate({
          studentStatus: "yes",
          workAuthorizations: { Germany: "yes" },
        }),
        opportunity
      ).eligibilityStatus
    ).toBe("requires_verification")
    expect(
      evaluateOpportunity(
        candidate({ workAuthorizations: { Canada: "no" } }),
        opportunity
      ).eligibilityStatus
    ).toBe("blocked")
    expect(
      evaluateOpportunity(
        candidate({
          studentStatus: "yes",
          workAuthorizations: { Canada: "yes", canada: "no" },
        }),
        opportunity
      ).eligibilityStatus
    ).toBe("requires_verification")
  })
  it("blocks missing or insufficient mandatory German and accepts the stated level", () => {
    const missing = evaluateOpportunity(candidate(), job(10))
    expect(missing.score).toBe(81)
    expect(missing.criterionScores.language).toBe(0.5)
    expect(missing.eligibilityStatus).toBe("blocked")
    expect(missing.gaps.join(" ")).toContain("Mandatory German")
    for (const [proficiency, expected] of [
      ["intermediate", "blocked"],
      ["professional", "no_identified_blocker"],
      ["native", "no_identified_blocker"],
    ] as const) {
      expect(
        evaluateOpportunity(
          candidate({
            languages: [
              ...sampleProfile.languages,
              { language: " german ", proficiency },
            ],
          }),
          job(10)
        ).eligibilityStatus
      ).toBe(expected)
    }
  })
  it("does not turn incomplete imported language information into a confirmed failure", () => {
    const result = evaluateOpportunity(candidate({ languages: [] }), job(10))
    expect(result.eligibilityStatus).toBe("requires_verification")
    expect(result.criterionScores.language).toBe(0)
  })
  it("distinguishes optional languages from mandatory ones, and no restrictions earns full language credit", () => {
    expect(
      evaluateOpportunity(candidate(), { ...job(1), requiredLanguages: [] })
        .criterionScores.language
    ).toBe(1)
    const optional = {
      ...job(10),
      requiredLanguages: job(10).requiredLanguages.map((item) => ({
        ...item,
        mandatory: false,
      })),
    }
    const result = evaluateOpportunity(candidate(), optional)
    expect(result.criterionScores.language).toBe(0.5)
    expect(result.eligibilityStatus).toBe("no_identified_blocker")
    expect(result.gaps.join(" ")).toContain("German")
  })
  it("does not silently certify free-text additional conditions", () => {
    const opportunity = job(1)
    opportunity.eligibility.additionalConditions = [
      "Professional license required",
    ]
    const result = evaluateOpportunity(candidate(), opportunity)
    expect(result.eligibilityStatus).toBe("requires_verification")
    expect(result.warnings.join(" ")).toContain("Professional license required")
  })
})

describe("Batch validation and deterministic ranking", () => {
  it("groups eligibility before score and uses stable IDs for ties without mutating results", () => {
    const base = evaluateOpportunity(candidate(), job(1))
    const records = [
      {
        ...base,
        opportunityId: job(4).id,
        score: 100,
        eligibilityStatus: "blocked" as const,
      },
      {
        ...base,
        opportunityId: job(3).id,
        score: 100,
        eligibilityStatus: "requires_verification" as const,
      },
      { ...base, opportunityId: job(2).id, score: 10 },
      { ...base, opportunityId: job(1).id, score: 10 },
    ]
    const snapshot = structuredClone(records)
    expect(rankMatches(records).map((item) => item.opportunityId)).toEqual(
      [1, 2, 3, 4].map((number) => job(number).id)
    )
    expect(records).toEqual(snapshot)
  })
  it("excludes invalid, duplicate and inactive records; exposes diagnostics for server logging", () => {
    const issues: unknown[] = []
    const result = evaluateOpportunities(
      candidate(),
      [
        job(1),
        { ...job(2), minimumExperienceYears: -1 },
        { ...job(3), isActive: false },
        job(1),
      ],
      (issue) => issues.push(issue)
    )
    expect(result.total).toBe(1)
    expect(result.invalidRecords).toHaveLength(2)
    expect(issues).toEqual(result.invalidRecords)
    expect(result.results[0].opportunityId).toBe(job(1).id)
    expect(evaluateOpportunities(candidate(), []).results).toEqual([])
  })
  it("evaluates fifteen schema-valid results repeatably, independent of dataset order", () => {
    const first = evaluateOpportunities(candidate(), opportunities)
    const second = evaluateOpportunities(
      candidate(),
      [...opportunities].reverse()
    )
    expect(first.total).toBe(15)
    expect(first.invalidRecords).toEqual([])
    expect(second.results).toEqual(first.results)
    first.results.forEach((result) =>
      expect(matchResultSchema.safeParse(result).success).toBe(true)
    )
    expect(first.results.some((result) => result.score < 50)).toBe(true)
  })
})
