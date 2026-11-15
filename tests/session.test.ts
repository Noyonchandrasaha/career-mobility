import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import type { CookieMethodsServer } from "@supabase/ssr"

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInAnonymously: vi.fn(),
  createServerClient: vi.fn(),
}))
vi.mock("server-only", () => ({}))
vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}))
import { createRequestSupabase } from "@/lib/supabase/request"

const env = {
  mode: "supabase" as const,
  supabaseUrl: "https://example.supabase.co",
  supabasePublishableKey: "public-test-key",
}
const missing = {
  data: { user: null },
  error: { name: "AuthSessionMissingError", status: 400 },
}
describe("Per-request verified SSR sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createServerClient.mockReturnValue({
      auth: {
        getUser: mocks.getUser,
        signInAnonymously: mocks.signInAnonymously,
      },
    })
  })

  it("verifies existing identity once per request and never signs up again", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "verified-id" } },
      error: null,
    })
    const context = createRequestSupabase(
      new NextRequest("http://localhost/api/session"),
      env
    )
    expect(await context.userId()).toBe("verified-id")
    expect(await context.initializeSession()).toBe("verified-id")
    expect(mocks.getUser).toHaveBeenCalledTimes(1)
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
  })

  it("initializes a genuinely missing session and forwards all cookie chunks/cache headers", async () => {
    mocks.getUser.mockResolvedValue(missing)
    mocks.signInAnonymously.mockResolvedValue({
      data: { user: { id: "new-anonymous-id" } },
      error: null,
    })
    const request = new NextRequest("http://localhost/api/session")
    const context = createRequestSupabase(request, env)
    expect(await context.initializeSession()).toBe("new-anonymous-id")
    const cookies: CookieMethodsServer =
      mocks.createServerClient.mock.calls[0][2].cookies
    await cookies.setAll?.(
      [
        {
          name: "sb-test-auth-token.0",
          value: "chunk1",
          options: { path: "/", sameSite: "lax" },
        },
        {
          name: "sb-test-auth-token.1",
          value: "chunk2",
          options: { path: "/", sameSite: "lax" },
        },
      ],
      { "Cache-Control": "private, no-store", Pragma: "no-cache" }
    )
    const response = context.finish(
      NextResponse.json({ error: "test" }, { status: 401 })
    )
    expect(response.cookies.getAll()).toHaveLength(2)
    expect(request.cookies.get("sb-test-auth-token.1")?.value).toBe("chunk2")
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(response.status).toBe(401)
  })

  it("never silently replaces invalid stored identity", async () => {
    mocks.getUser.mockResolvedValue(missing)
    const context = createRequestSupabase(
      new NextRequest("http://localhost/api/session", {
        headers: { cookie: "sb-test-auth-token=broken" },
      }),
      env
    )
    await expect(context.initializeSession()).rejects.toMatchObject({
      status: 401,
    })
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
  })

  it("distinguishes remote service failure from rejected authentication", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError", status: 503 },
    })
    await expect(
      createRequestSupabase(
        new NextRequest("http://localhost/api/session"),
        env
      ).initializeSession()
    ).rejects.toMatchObject({ status: 503 })
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthApiError", status: 401 },
    })
    await expect(
      createRequestSupabase(
        new NextRequest("http://localhost/api/session"),
        env
      ).initializeSession()
    ).rejects.toMatchObject({ status: 401 })
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
  })
})
