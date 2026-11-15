import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { CandidateProfile } from "@/types/domain"
import type { CareerRepository } from "./contracts"
import {
  opportunityFromRow,
  profileFromRow,
  profileToRow,
  savedFromRow,
} from "./mappers"
import { ApiError, unavailable } from "@/lib/api/errors"

function readProfile(row: Record<string, unknown>) {
  try {
    return profileFromRow(row)
  } catch {
    throw unavailable()
  }
}

export class SupabaseCareerRepository implements CareerRepository {
  constructor(private client: SupabaseClient<Database>) {}
  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from("candidate_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
    if (error) throw unavailable()
    return data ? readProfile(data) : null
  }
  async putProfile(userId: string, profile: CandidateProfile) {
    const { data, error } = await this.client
      .from("candidate_profiles")
      .upsert(profileToRow(userId, profile), { onConflict: "id" })
      .select("*")
      .single()
    if (error || !data) throw unavailable()
    return readProfile(data)
  }
  async listOpportunities() {
    const { data, error } = await this.client
      .from("opportunities")
      .select("*")
      .eq("is_active", true)
      .order("id")
    if (error) throw unavailable()
    return (data ?? []).map(opportunityFromRow)
  }
  async getOpportunity(id: string) {
    const { data, error } = await this.client
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle()
    if (error) throw unavailable()
    return data ? opportunityFromRow(data) : null
  }
  async listSaved(userId: string) {
    const { data, error } = await this.client
      .from("saved_opportunities")
      .select("*")
      .eq("candidate_id", userId)
      .order("created_at", { ascending: false })
      .order("id")
    if (error) throw unavailable()
    return (data ?? []).map(savedFromRow)
  }
  async save(userId: string, opportunityId: string) {
    // DO NOTHING on conflict: repeated saves never modify the existing bookmark.
    const { error } = await this.client
      .from("saved_opportunities")
      .upsert(
        { candidate_id: userId, opportunity_id: opportunityId },
        { onConflict: "candidate_id,opportunity_id", ignoreDuplicates: true }
      )
    if (error?.code === "23503" || error?.code === "42501")
      throw new ApiError(
        409,
        "CONFLICT",
        "This opportunity is no longer available."
      )
    if (error) throw unavailable()
    const { data, error: readError } = await this.client
      .from("saved_opportunities")
      .select("*")
      .eq("candidate_id", userId)
      .eq("opportunity_id", opportunityId)
      .single()
    if (readError || !data) throw unavailable()
    return savedFromRow(data)
  }
  async remove(userId: string, savedId: string) {
    const { data, error } = await this.client
      .from("saved_opportunities")
      .delete()
      .eq("candidate_id", userId)
      .eq("id", savedId)
      .select("id")
    if (error) throw unavailable()
    return !!data?.length
  }
}
