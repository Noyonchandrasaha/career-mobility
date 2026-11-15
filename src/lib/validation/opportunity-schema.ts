import { z } from "zod"
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  LANGUAGE_PROFICIENCIES,
} from "@/lib/constants/domain"

const text = z.string().trim().min(1)
export const opportunitySchema = z
  .object({
    id: z.uuid(),
    slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: text,
    organization: text,
    country: text,
    city: text,
    employmentType: z.enum(EMPLOYMENT_TYPES),
    description: text,
    responsibilities: z.array(text).default([]),
    // Empty skills are valid; the engine assigns a neutral 0.5 with a warning.
    requiredSkills: z.array(text),
    minimumExperienceYears: z.number().finite().nonnegative(),
    minimumEducationLevel: z.enum(EDUCATION_LEVELS),
    // Empty means any field is accepted.
    acceptedEducationFields: z.array(text),
    requiredLanguages: z.array(
      z.object({
        language: text,
        minimumProficiency: z.enum(LANGUAGE_PROFICIENCIES),
        mandatory: z.boolean(),
      })
    ),
    careerCategories: z.array(text).min(1),
    eligibility: z.object({
      requiresCurrentEnrollment: z.boolean(),
      requiresLocalWorkAuthorization: z.boolean(),
      additionalConditions: z.array(text),
    }),
    isActive: z.boolean(),
  })
  .strict()

export const opportunityDatasetSchema = z
  .array(opportunitySchema)
  .length(15)
  .superRefine((items, ctx) => {
    for (const field of ["id", "slug"] as const) {
      const seen = new Set<string>()
      items.forEach((item, index) => {
        if (seen.has(item[field]))
          ctx.addIssue({
            code: "custom",
            path: [index, field],
            message: `Duplicate ${field}.`,
          })
        seen.add(item[field])
      })
    }
  })
