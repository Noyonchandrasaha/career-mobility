import type { CandidateProfile, SavedOpportunity } from "@/types/domain"
export interface CareerRepository {
  getProfile(userId: string): Promise<CandidateProfile | null>
  putProfile(
    userId: string,
    profile: CandidateProfile
  ): Promise<CandidateProfile>
  listOpportunities(): Promise<unknown[]>
  getOpportunity(id: string): Promise<unknown | null>
  listSaved(userId: string): Promise<SavedOpportunity[]>
  save(userId: string, opportunityId: string): Promise<SavedOpportunity>
  remove(userId: string, savedId: string): Promise<boolean>
}
