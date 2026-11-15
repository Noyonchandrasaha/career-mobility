import { describe, expect, it, vi } from "vitest"
import { createCareerClient } from "@/lib/client/career-client"
import { CareerClientError } from "@/lib/client/errors"
import { DEMO_STORAGE_KEY } from "@/lib/mock/storage"
import { opportunities, sampleProfile } from "@/data"
import { createApiHandlers } from "@/lib/api/handlers"
import { NextRequest } from "next/server"
import type { CareerRepository } from "@/lib/repositories/contracts"

function storage() {
  const data = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    data,
  }
}
const unsupported = async (): Promise<never> => {
  throw new Error("Browser only.")
}
const repository: CareerRepository = {
  getProfile: unsupported,
  putProfile: unsupported,
  listSaved: unsupported,
  save: unsupported,
  remove: unsupported,
  listOpportunities: async () => opportunities,
  getOpportunity: async (id) =>
    opportunities.find((job) => job.id === id) ?? null,
}
const mockApi = createApiHandlers({
  context: async () => ({
    mode: "mock",
    repository,
    userId: async () => null,
    initializeSession: async () => null,
  }),
})
const matchFetch = vi.fn<typeof fetch>(async (path, options) =>
  mockApi.match(
    new NextRequest("http://localhost:3000" + path, {
      ...options,
      signal: options?.signal ?? undefined,
    })
  )
)
describe("Browser demo persistence with real matching handler", () => {
  it("persists profile, identity and shortlist across adapter recreation and recalculates current matches", async () => {
    const store = storage()
    const first = createCareerClient({
      mode: "mock",
      storage: store,
      fetcher: matchFetch,
    })
    const session = await first.initializeSession()
    expect(await first.getProfile()).toBeNull()
    await first.saveProfile(sampleProfile)
    const saved = await first.saveOpportunity(opportunities[4].id)
    expect((await first.saveOpportunity(opportunities[4].id)).id).toBe(saved.id)
    const second = createCareerClient({
      mode: "mock",
      storage: store,
      fetcher: matchFetch,
    })
    expect((await second.initializeSession()).userId).toBe(session.userId)
    expect(await second.getProfile()).toEqual(sampleProfile)
    expect((await second.getSaved())[0].match?.score).toBe(83)
    await second.saveProfile({
      ...sampleProfile,
      skills: [...sampleProfile.skills, "sql", "data visualization"],
    })
    expect((await second.getSaved())[0].match?.score).toBe(100)
    await second.removeSaved(saved.id)
    expect(await first.getSaved()).toEqual([])
    expect(matchFetch).toHaveBeenCalled()
  })

  it("does not claim successful mutation when storage fails or discard corrupt data", async () => {
    const store = storage()
    const client = createCareerClient({
      mode: "mock",
      storage: store,
      fetcher: matchFetch,
    })
    await client.initializeSession()
    store.setItem.mockImplementationOnce(() => {
      throw new Error("quota")
    })
    await expect(client.saveProfile(sampleProfile)).rejects.toMatchObject({
      code: "STORAGE_UNAVAILABLE",
    })
    expect(await client.getProfile()).toBeNull()
    store.data.set(DEMO_STORAGE_KEY, "{broken")
    await expect(client.getProfile()).rejects.toMatchObject({
      code: "CORRUPT_DEMO_DATA",
    })
    expect(store.data.get(DEMO_STORAGE_KEY)).toBe("{broken")
  })

  it("keeps independent demo browsers isolated and requires a profile before matching", async () => {
    const a = createCareerClient({
      mode: "mock",
      storage: storage(),
      fetcher: matchFetch,
    })
    const b = createCareerClient({
      mode: "mock",
      storage: storage(),
      fetcher: matchFetch,
    })
    expect((await a.initializeSession()).userId).not.toBe(
      (await b.initializeSession()).userId
    )
    await a.saveProfile(sampleProfile)
    expect(await b.getProfile()).toBeNull()
    await expect(b.getMatches()).rejects.toMatchObject({ status: 404 })
    expect((await a.getMatches()).total).toBe(15)
  })

  it("surfaces server failure without inventing results or switching to local matching", async () => {
    const client = createCareerClient({
      mode: "mock",
      storage: storage(),
      fetcher: vi.fn(async () =>
        Response.json(
          { error: { code: "SERVICE_UNAVAILABLE", message: "Retry" } },
          { status: 503 }
        )
      ),
    })
    await client.saveProfile(sampleProfile)
    await expect(client.getMatches()).rejects.toMatchObject({ status: 503 })
    expect(await client.getProfile()).toEqual(sampleProfile)
  })
})

describe("Supabase browser API adapter", () => {
  it("deduplicates concurrent session initialization and never sends browser identity in writes", async () => {
    const fetcher = vi.fn<typeof fetch>(async (path) => {
      if (path === "/api/session")
        return Response.json({ mode: "supabase", userId: "verified-user" })
      return Response.json({ profile: sampleProfile })
    })
    const client = createCareerClient({ mode: "supabase", fetcher })
    await Promise.all([client.initializeSession(), client.initializeSession()])
    expect(fetcher).toHaveBeenCalledTimes(1)
    await client.saveProfile(sampleProfile)
    const [path, init] = fetcher.mock.calls[1]
    expect(path).toBe("/api/profile")
    expect(init?.credentials).toBe("same-origin")
    expect(JSON.parse(init?.body as string)).toEqual(sampleProfile)
  })

  it("distinguishes missing profile from a failed session, invalidates stale session and permits retry", async () => {
    let available = false
    const fetcher = vi.fn<typeof fetch>(async (path) => {
      if (path === "/api/session")
        return Response.json({ mode: "supabase", userId: "verified-user" })
      return Response.json(
        {
          error: {
            code: available ? "NOT_FOUND" : "UNAUTHORIZED",
            message: "Retry",
          },
        },
        { status: available ? 404 : 401 }
      )
    })
    const client = createCareerClient({ mode: "supabase", fetcher })
    await expect(client.getProfile()).rejects.toBeInstanceOf(CareerClientError)
    available = true
    expect(await client.getProfile()).toBeNull()
    expect(
      fetcher.mock.calls.filter(([path]) => path === "/api/session")
    ).toHaveLength(2)
  })

  it("rejects an unspecified/invalid mode instead of silently creating a demo", () => {
    expect(() => createCareerClient({ mode: "invalid" })).toThrow(
      CareerClientError
    )
  })
})
