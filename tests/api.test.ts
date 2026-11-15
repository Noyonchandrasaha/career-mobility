import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { createApiHandlers, type ApiContext } from "@/lib/api/handlers"
import { ApiError } from "@/lib/api/errors"
import type { CareerRepository } from "@/lib/repositories/contracts"
import type { CandidateProfile, SavedOpportunity } from "@/types/domain"
import { opportunities, sampleProfile } from "@/data"

const A = "10000000-0000-4000-8000-000000000001"
const B = "10000000-0000-4000-8000-000000000002"
function request(
  path: string,
  method = "GET",
  body?: unknown,
  headers: Record<string, string> = {}
) {
  return new NextRequest("http://localhost:3000/api/" + path, {
    method,
    ...(body === undefined
      ? {}
      : {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json", ...headers },
        }),
    ...(body === undefined ? { headers } : {}),
  })
}
function fixture(mode: ApiContext["mode"] = "supabase") {
  const profiles = new Map<string, CandidateProfile>()
  const bookmarks = new Map<string, SavedOpportunity>()
  const records = structuredClone(opportunities)
  let current: string | null = A
  const repository: CareerRepository = {
    getProfile: vi.fn(async (id) => profiles.get(id) ?? null),
    putProfile: vi.fn(async (id, profile) => {
      profiles.set(id, profile)
      return profile
    }),
    listOpportunities: vi.fn(async () =>
      records.filter((item) => item.isActive)
    ),
    getOpportunity: vi.fn(
      async (id) =>
        records.find((item) => item.id === id && item.isActive) ?? null
    ),
    listSaved: vi.fn(async (id) =>
      [...bookmarks.values()].filter((item) => item.candidateId === id)
    ),
    save: vi.fn(async (id, opportunityId) => {
      const existing = [...bookmarks.values()].find(
        (item) =>
          item.candidateId === id && item.opportunityId === opportunityId
      )
      if (existing) return existing
      const item = {
        id: crypto.randomUUID(),
        candidateId: id,
        opportunityId,
        createdAt: new Date().toISOString(),
      }
      bookmarks.set(item.id, item)
      return item
    }),
    remove: vi.fn(
      async (id, savedId) =>
        bookmarks.get(savedId)?.candidateId === id && bookmarks.delete(savedId)
    ),
  }
  const context: ApiContext = {
    mode,
    repository,
    userId: async () => current,
    initializeSession: async () => current,
    finish: (response) => {
      response.cookies.set("test-refreshed", "yes")
      return response
    },
  }
  return {
    api: createApiHandlers({ context: async () => context }),
    context,
    repository,
    profiles,
    bookmarks,
    records,
    setUser: (id: string | null) => {
      current = id
    },
  }
}
describe("Career API handlers", () => {
  let f: ReturnType<typeof fixture>
  beforeEach(() => {
    f = fixture()
  })

  it("persists a validated profile for the verified user and blocks identity injection", async () => {
    expect((await f.api.getProfile(request("profile"))).status).toBe(404)
    expect(
      (
        await f.api.putProfile(
          request("profile", "PUT", { ...sampleProfile, id: B })
        )
      ).status
    ).toBe(400)
    const saved = await f.api.putProfile(
      request("profile", "PUT", sampleProfile)
    )
    expect(saved.status).toBe(200)
    expect(f.repository.putProfile).toHaveBeenCalledWith(A, sampleProfile)
    const read = await f.api.getProfile(request("profile?userId=" + B))
    expect((await read.json()).profile).toEqual(sampleProfile)
    expect(read.headers.get("cache-control")).toContain("no-store")
    expect(read.cookies.get("test-refreshed")?.value).toBe("yes")
  })

  it("requires a session on all private operations", async () => {
    f.setUser(null)
    for (const response of [
      await f.api.getProfile(request("profile")),
      await f.api.putProfile(request("profile", "PUT", sampleProfile)),
      await f.api.match(request("match", "POST")),
      await f.api.saved(request("saved")),
      await f.api.save(
        request("saved", "POST", { opportunityId: opportunities[0].id })
      ),
      await f.api.remove(request("saved/id", "DELETE"), opportunities[0].id),
    ])
      expect(response.status).toBe(401)
    expect(f.repository.putProfile).not.toHaveBeenCalled()
  })

  it("recomputes matches from persisted profile and rejects browser profile override", async () => {
    f.profiles.set(A, sampleProfile)
    const response = await f.api.match(request("match", "POST"))
    const body = await response.json()
    expect(body.total).toBe(15)
    expect(
      body.results.find(
        (item: { opportunityId: string }) =>
          item.opportunityId === opportunities[4].id
      ).score
    ).toBe(83)
    expect(
      (
        await f.api.match(
          request("match", "POST", { profile: sampleProfile, userId: B })
        )
      ).status
    ).toBe(400)
    await f.api.putProfile(
      request("profile", "PUT", {
        ...sampleProfile,
        skills: [...sampleProfile.skills, "sql", "data visualization"],
      })
    )
    const updated = await (await f.api.match(request("match", "POST"))).json()
    expect(
      updated.results.find(
        (item: { opportunityId: string }) =>
          item.opportunityId === opportunities[4].id
      ).score
    ).toBe(100)
  })

  it("gives a clear missing-profile response", async () => {
    expect((await f.api.match(request("match", "POST"))).status).toBe(404)
  })

  it("allows public details without a profile and hides inactive/unknown records", async () => {
    f.setUser(null)
    const details = await (
      await f.api.opportunity(request("opportunities/id"), opportunities[0].id)
    ).json()
    expect(details.match).toBeNull()
    expect(details.opportunity.title).toBe(opportunities[0].title)
    f.records[0].isActive = false
    expect(
      (
        await f.api.opportunity(
          request("opportunities/id"),
          opportunities[0].id
        )
      ).status
    ).toBe(404)
    expect(
      (
        await f.api.opportunity(
          request("opportunities/id"),
          crypto.randomUUID()
        )
      ).status
    ).toBe(404)
    expect(
      (await (await f.api.opportunities(request("opportunities"))).json())
        .opportunities
    ).toHaveLength(14)
  })

  it("saves idempotently, preserves unavailable history, and isolates removal by verified user", async () => {
    const req = () =>
      request("saved", "POST", { opportunityId: opportunities[0].id })
    const first = await (await f.api.save(req())).json()
    const second = await (await f.api.save(req())).json()
    expect(first.saved.id).toBe(second.saved.id)
    expect(f.bookmarks.size).toBe(1)
    f.records[0].isActive = false
    const list = await (await f.api.saved(request("saved"))).json()
    expect(list.saved[0]).toMatchObject({
      unavailable: true,
      opportunity: null,
      match: null,
    })
    f.setUser(B)
    expect((await (await f.api.saved(request("saved"))).json()).saved).toEqual(
      []
    )
    expect(
      (await f.api.remove(request("saved/id", "DELETE"), first.saved.id)).status
    ).toBe(404)
    f.setUser(A)
    expect(
      (await f.api.remove(request("saved/id", "DELETE"), first.saved.id)).status
    ).toBe(200)
    expect(f.bookmarks.size).toBe(0)
  })

  it("rejects malformed bodies, oversized payloads and cross-origin mutations", async () => {
    const malformed = new NextRequest("http://localhost:3000/api/profile", {
      method: "PUT",
      body: "{oops",
      headers: { "content-type": "application/json" },
    })
    expect((await f.api.putProfile(malformed)).status).toBe(400)
    expect(
      (
        await f.api.putProfile(
          request("profile", "PUT", sampleProfile, {
            origin: "https://evil.example",
          })
        )
      ).status
    ).toBe(403)
    expect(
      (
        await f.api.putProfile(
          request("profile", "PUT", {
            ...sampleProfile,
            experienceDescription: "a".repeat(70000),
          })
        )
      ).status
    ).toBe(413)
    expect(
      (await f.api.save(request("saved", "POST", { opportunityId: "invalid" })))
        .status
    ).toBe(400)
  })

  it("never reports success or switches modes on a service failure, and retains error cookies", async () => {
    vi.mocked(f.repository.putProfile).mockRejectedValue(
      new ApiError(503, "SERVICE_UNAVAILABLE", "Service unavailable.")
    )
    const response = await f.api.putProfile(
      request("profile", "PUT", sampleProfile)
    )
    expect(response.status).toBe(503)
    expect((await response.json()).error.code).toBe("SERVICE_UNAVAILABLE")
    expect(response.cookies.get("test-refreshed")?.value).toBe("yes")
  })

  it("supports explicit mock server matching, without server-side demo profile persistence", async () => {
    f = fixture("mock")
    expect((await f.api.getProfile(request("profile"))).status).toBe(409)
    expect(
      (
        await f.api.save(
          request("saved", "POST", { opportunityId: opportunities[0].id })
        )
      ).status
    ).toBe(409)
    expect(
      (await f.api.match(request("match", "POST", { profile: sampleProfile })))
        .status
    ).toBe(200)
    expect(f.repository.getProfile).not.toHaveBeenCalled()
    expect(
      (
        await f.api.match(
          request("match", "POST", {
            profile: { ...sampleProfile, experienceYears: -1 },
          })
        )
      ).status
    ).toBe(400)
  })

  it("keeps internal failure details out of HTTP responses", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(f.repository.listOpportunities).mockRejectedValue(
      new Error("private database secret")
    )
    const response = await f.api.opportunities(request("opportunities"))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain("private database secret")
    log.mockRestore()
  })

  it("accepts the browser's actual loopback Host while still rejecting different origins", async () => {
    f = fixture("mock")
    const make = (origin: string) =>
      new NextRequest("http://localhost:3100/api/match", {
        method: "POST",
        headers: {
          host: "127.0.0.1:3100",
          origin,
          "content-type": "application/json",
        },
        body: JSON.stringify({ profile: sampleProfile }),
      })
    expect((await f.api.match(make("http://127.0.0.1:3100"))).status).toBe(200)
    expect((await f.api.match(make("http://evil.example"))).status).toBe(403)
  })
})
