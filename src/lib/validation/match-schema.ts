import { z } from "zod"
import { ELIGIBILITY_STATUSES } from "@/lib/constants/domain"

const ratio = z.number().finite().min(0).max(1)
export const matchResultSchema = z.object({
  opportunityId: z.uuid(),
  score: z.number().int().min(0).max(100),
  criterionScores: z.object({
    skills: ratio,
    experience: ratio,
    education: ratio,
    location: ratio,
    language: ratio,
  }),
  eligibilityStatus: z.enum(ELIGIBILITY_STATUSES),
  criterionExplanations: z
    .object({
      skills: z.string(),
      experience: z.string(),
      education: z.string(),
      location: z.string(),
      language: z.string(),
    })
    .optional(),
  eligibilityFindings: z.array(z.string()).optional(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  warnings: z.array(z.string()),
  explanation: z.string().trim().min(1),
})
