import type { z } from "zod"
import type {
  candidateProfileSchema,
  languageSchema,
} from "@/lib/validation/profile-schema"
import type { opportunitySchema } from "@/lib/validation/opportunity-schema"
import type { matchResultSchema } from "@/lib/validation/match-schema"

export type CandidateProfileInput = z.input<typeof candidateProfileSchema>
export type CandidateProfile = z.output<typeof candidateProfileSchema>
export type CandidateLanguage = z.infer<typeof languageSchema>
export type Opportunity = z.infer<typeof opportunitySchema>
export type MatchResult = z.infer<typeof matchResultSchema>
export type EligibilityStatus = MatchResult["eligibilityStatus"]
export type SavedOpportunity = {
  id: string
  candidateId: string
  opportunityId: string
  createdAt: string
}
