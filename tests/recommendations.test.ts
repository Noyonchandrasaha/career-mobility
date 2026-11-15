import { describe, expect, it } from "vitest"
import { opportunities, sampleProfile } from "@/data"
import { evaluateOpportunities, evaluateOpportunity } from "@/features/matching"
import {
  joinRecommendations,
  summarizeMatches,
} from "@/features/matching/presentation"

describe("Recommendation display contracts", () => {
  it("joins job data without reranking or hiding weak/blocked matches", () => {
    const evaluation = evaluateOpportunities(sampleProfile, opportunities)
    const rows = joinRecommendations(evaluation, [...opportunities].reverse())
    expect(rows.map((row) => row.opportunity.id)).toEqual(
      evaluation.results.map((result) => result.opportunityId)
    )
    expect(rows).toHaveLength(15)
    expect(rows.some((row) => row.match.eligibilityStatus === "blocked")).toBe(
      true
    )
    expect(rows.some((row) => row.match.score < 50)).toBe(true)
    const counts = summarizeMatches(evaluation)
    expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(
      15
    )
    expect(counts.requires_verification).toBe(1)
    expect(counts.blocked).toBe(1)
  })
  it("reports an empty dataset without inventing opportunities", () => {
    expect(
      joinRecommendations({ total: 0, results: [] }, opportunities)
    ).toEqual([])
    expect(summarizeMatches({ total: 0, results: [] })).toEqual({
      no_identified_blocker: 0,
      requires_verification: 0,
      blocked: 0,
    })
  })
  it("rejects missing/inactive opportunity joins and inconsistent totals", () => {
    const match = evaluateOpportunity(sampleProfile, opportunities[0])
    expect(() =>
      joinRecommendations({ total: 1, results: [match] }, [])
    ).toThrow("changed")
    expect(() =>
      joinRecommendations({ total: 1, results: [match] }, [
        { ...opportunities[0], isActive: false },
      ])
    ).toThrow("changed")
    expect(() =>
      joinRecommendations({ total: 2, results: [match] }, opportunities)
    ).toThrow("inconsistent")
    expect(() =>
      joinRecommendations({ total: 2, results: [match, match] }, opportunities)
    ).toThrow("inconsistent")
  })
  it("provides server-derived per-criterion explanation and exact eligibility reasons", () => {
    const result = evaluateOpportunity(sampleProfile, opportunities[9])
    expect(result.criterionExplanations?.language).toContain("German")
    expect(result.criterionExplanations?.experience).toContain(
      "2 years declared"
    )
    expect(result.eligibilityFindings).toContain(
      "Mandatory German proficiency requirement is not met."
    )
    const unknown = evaluateOpportunity(sampleProfile, opportunities[8])
    expect(unknown.eligibilityFindings).toContain(
      "Current student enrollment requires verification."
    )
    expect(unknown.eligibilityFindings).toContain(
      "Local work authorization for Canada requires verification."
    )
  })
})
