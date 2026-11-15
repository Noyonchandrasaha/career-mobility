import type {
  CandidateProfile,
  CandidateProfileInput,
  MatchResult,
  Opportunity,
  SavedOpportunity,
} from "./domain"
export type MatchResponse = { total: number; results: MatchResult[] }
export type SavedItem = SavedOpportunity & {
  opportunity: Opportunity | null
  match: MatchResult | null
  unavailable: boolean
}
export type SessionInfo = { mode: "mock" | "supabase"; userId: string | null }
export interface CareerClient {
  mode: "mock" | "supabase"
  initializeSession(): Promise<SessionInfo>
  getProfile(): Promise<CandidateProfile | null>
  saveProfile(profile: CandidateProfileInput): Promise<CandidateProfile>
  listOpportunities(): Promise<Opportunity[]>
  getOpportunity(
    id: string
  ): Promise<{ opportunity: Opportunity; match: MatchResult | null }>
  getMatches(): Promise<MatchResponse>
  getSaved(): Promise<SavedItem[]>
  saveOpportunity(opportunityId: string): Promise<SavedOpportunity>
  removeSaved(savedId: string): Promise<void>
}
