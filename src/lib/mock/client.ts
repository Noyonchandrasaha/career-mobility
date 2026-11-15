import { z } from "zod"
import { opportunities } from "@/data"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import type { CareerClient, MatchResponse } from "@/types/career-client"
import { CareerClientError } from "@/lib/client/errors"
import { createDemoStore, type DemoStorage } from "./storage"

export function createMockCareerClient(
  storage: DemoStorage,
  match: (profile: unknown) => Promise<MatchResponse>
): CareerClient {
  const store = createDemoStore(storage)
  const find = (id: string) => {
    z.uuid().parse(id)
    const opportunity = opportunities.find(
      (item) => item.id === id && item.isActive
    )
    if (!opportunity)
      throw new CareerClientError(404, "NOT_FOUND", "Opportunity not found.")
    return structuredClone(opportunity)
  }
  const getMatches = async () => {
    const profile = store.read().profile
    if (!profile)
      throw new CareerClientError(
        404,
        "NOT_FOUND",
        "Create your career profile to continue."
      )
    return match(profile)
  }
  return {
    mode: "mock",
    async initializeSession() {
      return { mode: "mock", userId: store.read().candidateId }
    },
    async getProfile() {
      return store.read().profile
    },
    async saveProfile(input) {
      const profile = candidateProfileSchema.parse(input)
      const state = store.read()
      store.write({ ...state, profile })
      return profile
    },
    async listOpportunities() {
      return structuredClone(opportunities.filter((item) => item.isActive))
    },
    async getOpportunity(id) {
      const opportunity = find(id)
      const matchResult = store.read().profile
        ? ((await getMatches()).results.find(
            (item) => item.opportunityId === id
          ) ?? null)
        : null
      return { opportunity, match: matchResult }
    },
    getMatches,
    async getSaved() {
      const state = store.read()
      const results =
        state.profile && state.saved.length
          ? (await match(state.profile)).results
          : []
      return [...state.saved]
        .sort(
          (a, b) =>
            b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
        )
        .map((item) => {
          const opportunity =
            opportunities.find(
              (job) => job.id === item.opportunityId && job.isActive
            ) ?? null
          return {
            ...item,
            opportunity: opportunity ? structuredClone(opportunity) : null,
            unavailable: !opportunity,
            match:
              results.find(
                (result) => result.opportunityId === item.opportunityId
              ) ?? null,
          }
        })
    },
    async saveOpportunity(opportunityId) {
      find(opportunityId)
      const state = store.read()
      const existing = state.saved.find(
        (item) => item.opportunityId === opportunityId
      )
      if (existing) return existing
      const item = {
        id: crypto.randomUUID(),
        candidateId: state.candidateId,
        opportunityId,
        createdAt: new Date().toISOString(),
      }
      store.write({ ...state, saved: [item, ...state.saved] })
      return item
    },
    async removeSaved(id) {
      z.uuid().parse(id)
      const state = store.read()
      if (!state.saved.some((item) => item.id === id))
        throw new CareerClientError(
          404,
          "NOT_FOUND",
          "Saved opportunity not found."
        )
      store.write({
        ...state,
        saved: state.saved.filter((item) => item.id !== id),
      })
    },
  }
}
