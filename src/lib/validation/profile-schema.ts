import { z } from "zod"
import {
  DECLARED_STATUSES,
  EDUCATION_LEVELS,
  LANGUAGE_PROFICIENCIES,
} from "@/lib/constants/domain"

const text = z.string().trim().min(1, "This field is required.")
const distinctValues = z
  .array(text)
  .min(1, "Select at least one item.")
  .refine(
    (values) =>
      new Set(values.map((value) => value.toLowerCase())).size ===
      values.length,
    "Remove duplicate items."
  )
export const languageSchema = z.object({
  language: text,
  proficiency: z.enum(LANGUAGE_PROFICIENCIES),
})

// User identity is obtained separately from a verified session, never form input.
export const candidateProfileSchema = z
  .object({
    educationLevel: z.enum(EDUCATION_LEVELS),
    fieldOfStudy: text,
    experienceYears: z
      .number()
      .finite()
      .min(0, "Experience cannot be negative."),
    experienceDescription: text,
    skills: distinctValues,
    languages: z
      .array(languageSchema)
      .min(1, "Add at least one language.")
      .refine(
        (values) =>
          new Set(values.map(({ language }) => language.toLowerCase())).size ===
          values.length,
        "Each language may only be listed once."
      ),
    preferredCountries: distinctValues,
    careerInterests: distinctValues,
    workAuthorizations: z.record(text, z.enum(DECLARED_STATUSES)).default({}),
    studentStatus: z.enum(DECLARED_STATUSES).default("unknown"),
  })
  .strict()
