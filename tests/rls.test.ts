import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"
import { opportunities, sampleProfile } from "@/data"
import { opportunityToRow, profileToRow } from "@/lib/repositories/mappers"

const A = "10000000-0000-4000-8000-000000000001"
const B = "10000000-0000-4000-8000-000000000002"
let db: PGlite
async function insert(
  table: string,
  row: Record<string, unknown>,
  upsert = false
) {
  const entries = Object.entries(row)
  return db.query(
    `insert into public.${table} (${entries.map(([key]) => key).join(",")}) values (${entries.map((_, index) => "$" + (index + 1)).join(",")}) ${upsert ? "on conflict (id) do update set title = excluded.title" : ""} returning *`,
    entries.map(([, value]) =>
      typeof value === "object" ? JSON.stringify(value) : value
    )
  )
}
async function asUser(id: string) {
  await db.exec("set role authenticated")
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id])
}
describe("Real migration and RLS in embedded PostgreSQL (Auth stubbed)", () => {
  beforeAll(async () => {
    db = new PGlite()
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users values ('${A}'), ('${B}');
    `)
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611150001_career_mobility.sql",
          import.meta.url
        ),
        "utf8"
      )
    )
    for (const job of opportunities)
      await insert("opportunities", opportunityToRow(job))
  }, 30000)
  beforeEach(async () => {
    await db.exec(
      "reset role; delete from public.saved_opportunities; delete from public.candidate_profiles; update public.opportunities set is_active = true;"
    )
  })
  afterAll(async () => {
    await db?.close()
  })

  it("allows own profile create/read/update and rejects another user's identity", async () => {
    await asUser(A)
    await insert("candidate_profiles", profileToRow(A, sampleProfile))
    await db.exec("update public.candidate_profiles set experience_years = 3")
    expect(
      (
        await db.query<{ id: string; experience_years: number }>(
          "select id, experience_years from public.candidate_profiles"
        )
      ).rows
    ).toEqual([{ id: A, experience_years: "3" }])
    await expect(
      insert("candidate_profiles", profileToRow(B, sampleProfile))
    ).rejects.toThrow()
    await expect(
      db.query("update public.candidate_profiles set id = $1", [B])
    ).rejects.toThrow()
    await asUser(B)
    expect(
      (await db.query("select * from public.candidate_profiles")).rows
    ).toEqual([])
    expect(
      (
        await db.query(
          "update public.candidate_profiles set experience_years = 9 returning id"
        )
      ).rows
    ).toEqual([])
  })

  it("restricts public opportunities to active reads and forbids user writes", async () => {
    await db.query(
      "update public.opportunities set is_active = false where id = $1",
      [opportunities[0].id]
    )
    await db.exec("set role anon")
    expect(
      (await db.query("select id from public.opportunities")).rows
    ).toHaveLength(14)
    await expect(
      db.query("select * from public.candidate_profiles")
    ).rejects.toThrow()
    await expect(
      db.query("select * from public.saved_opportunities")
    ).rejects.toThrow()
    await asUser(A)
    await expect(
      db.exec("update public.opportunities set is_active = false")
    ).rejects.toThrow()
    await expect(
      insert("opportunities", {
        ...opportunityToRow(opportunities[0]),
        id: crypto.randomUUID(),
        slug: "unauthorized",
      })
    ).rejects.toThrow()
    await expect(db.exec("delete from public.opportunities")).rejects.toThrow()
  })

  it("isolates shortlist reads/removals and enforces owner, active item and unique pair", async () => {
    await asUser(A)
    const saved = (
      await insert("saved_opportunities", {
        candidate_id: A,
        opportunity_id: opportunities[0].id,
      })
    ).rows[0] as { id: string }
    await expect(
      insert("saved_opportunities", {
        candidate_id: A,
        opportunity_id: opportunities[0].id,
      })
    ).rejects.toThrow()
    await expect(
      insert("saved_opportunities", {
        candidate_id: B,
        opportunity_id: opportunities[1].id,
      })
    ).rejects.toThrow()
    await asUser(B)
    expect(
      (await db.query("select * from public.saved_opportunities")).rows
    ).toEqual([])
    expect(
      (
        await db.query(
          "delete from public.saved_opportunities where id = $1 returning id",
          [saved.id]
        )
      ).rows
    ).toEqual([])
    await asUser(A)
    expect(
      (await db.query("select id from public.saved_opportunities")).rows
    ).toHaveLength(1)
    await db.exec("reset role")
    await db.query(
      "update public.opportunities set is_active = false where id = $1",
      [opportunities[0].id]
    )
    await asUser(A)
    expect(
      (await db.query("select id from public.saved_opportunities")).rows
    ).toHaveLength(1)
    await asUser(B)
    await expect(
      insert("saved_opportunities", {
        candidate_id: B,
        opportunity_id: opportunities[0].id,
      })
    ).rejects.toThrow()
    await asUser(A)
    expect(
      (
        await db.query(
          "delete from public.saved_opportunities where id = $1 returning id",
          [saved.id]
        )
      ).rows
    ).toHaveLength(1)
  })

  it("validates database constraints and updates the profile timestamp", async () => {
    await asUser(A)
    await expect(
      insert("candidate_profiles", {
        ...profileToRow(A, sampleProfile),
        experience_years: -1,
      })
    ).rejects.toThrow()
    await expect(
      insert("candidate_profiles", {
        ...profileToRow(A, sampleProfile),
        skills: [],
      })
    ).rejects.toThrow()
    const initial = (
      await insert("candidate_profiles", profileToRow(A, sampleProfile))
    ).rows[0] as { updated_at: Date }
    const updated = (
      await db.query<{ updated_at: Date }>(
        "update public.candidate_profiles set updated_at = '2000-01-01' returning updated_at"
      )
    ).rows[0]
    expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
      new Date(initial.updated_at).getTime()
    )
  })

  it("supports repeatable stable-ID seeding without duplicate opportunities", async () => {
    for (const job of opportunities)
      await insert("opportunities", opportunityToRow(job), true)
    expect(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from public.opportunities"
        )
      ).rows[0].count
    ).toBe(15)
  })
})
