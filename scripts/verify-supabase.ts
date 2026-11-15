// Opt-in hosted verification: creates two anonymous users in your development project.
// Their profile/Auth rows remain; remove the test users from the dashboard afterward.
import nextEnv from "@next/env"
import { createClient } from "@supabase/supabase-js"
import { strict as assert } from "node:assert"
import { z } from "zod"
import { sampleProfile, opportunities } from "../src/data"
import { profileToRow } from "../src/lib/repositories/mappers"
import type { Database } from "../src/types/database"

nextEnv.loadEnvConfig(process.cwd())
async function main() {
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    })
    .safeParse(process.env)
  if (!env.success) throw new Error("Missing public Supabase configuration.")
  const make = () =>
    createClient<Database>(
      env.data.NEXT_PUBLIC_SUPABASE_URL,
      env.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )
  const a = make(),
    b = make()
  const authA = await a.auth.signInAnonymously(),
    authB = await b.auth.signInAnonymously()
  assert(
    !authA.error && authA.data.user && !authB.error && authB.data.user,
    "Anonymous sign-in failed."
  )
  const idA = authA.data.user.id,
    idB = authB.data.user.id
  assert.notEqual(idA, idB)
  console.log(
    "Created two test anonymous users. Remove them from the Auth dashboard after verification:",
    idA,
    idB
  )
  try {
    assert.equal(
      (await a.from("opportunities").select("id")).data?.length,
      15,
      "Seed the 15 opportunities first."
    )
    assert.equal(
      (
        await a
          .from("candidate_profiles")
          .upsert(profileToRow(idA, sampleProfile))
      ).error,
      null
    )
    assert.equal(
      (
        await b
          .from("candidate_profiles")
          .upsert(profileToRow(idB, sampleProfile))
      ).error,
      null
    )
    assert.deepEqual(
      (await b.from("candidate_profiles").select("*").eq("id", idA)).data,
      []
    )
    assert.deepEqual(
      (
        await b
          .from("candidate_profiles")
          .update({ experience_years: 99 })
          .eq("id", idA)
          .select("id")
      ).data,
      []
    )
    assert.equal(
      (
        await a
          .from("candidate_profiles")
          .select("experience_years")
          .eq("id", idA)
          .single()
      ).data?.experience_years,
      sampleProfile.experienceYears
    )
    assert(
      (
        await b
          .from("candidate_profiles")
          .upsert(profileToRow(idA, sampleProfile))
      ).error,
      "Foreign profile write was not rejected."
    )
    const bookmark = { candidate_id: idA, opportunity_id: opportunities[0].id }
    for (let n = 0; n < 2; n++)
      assert.equal(
        (
          await a.from("saved_opportunities").upsert(bookmark, {
            onConflict: "candidate_id,opportunity_id",
            ignoreDuplicates: true,
          })
        ).error,
        null
      )
    const saved = await a
      .from("saved_opportunities")
      .select("*")
      .eq("candidate_id", idA)
    assert.equal(saved.data?.length, 1, "Duplicate save detected.")
    assert.deepEqual(
      (await b.from("saved_opportunities").select("*").eq("candidate_id", idA))
        .data,
      []
    )
    assert.deepEqual(
      (
        await b
          .from("saved_opportunities")
          .delete()
          .eq("id", saved.data![0].id)
          .select("id")
      ).data,
      []
    )
    assert(
      (
        await a
          .from("opportunities")
          .update({ title: "Forbidden" })
          .eq("id", opportunities[0].id)
      ).error,
      "Opportunity write was not rejected."
    )
    assert.equal(
      (
        await a
          .from("saved_opportunities")
          .delete()
          .eq("id", saved.data![0].id)
          .select("id")
      ).data?.length,
      1
    )
    console.log(
      "PASS: hosted anonymous auth, profile persistence, RLS isolation, duplicate save and removal."
    )
  } finally {
    await a.from("saved_opportunities").delete().eq("candidate_id", idA)
    await b.from("saved_opportunities").delete().eq("candidate_id", idB)
    await a.auth.signOut()
    await b.auth.signOut()
  }
}
main().catch(() => {
  console.error(
    "Hosted verification failed. Check project configuration, migration, seed and Anonymous Auth settings. No keys have been logged."
  )
  process.exitCode = 1
})
