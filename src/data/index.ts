import rawOpportunities from "./opportunities.json"
import rawSampleProfile from "./sample-profile.json"
import { opportunityDatasetSchema } from "@/lib/validation/opportunity-schema"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"

export const opportunities = opportunityDatasetSchema.parse(rawOpportunities)
// Illustrative fixture, not an independently verified copy of the missing assessment profile.
export const sampleProfile = candidateProfileSchema.parse(rawSampleProfile)
