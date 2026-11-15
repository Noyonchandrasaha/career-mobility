import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import type {
  CandidateProfile,
  Opportunity,
  SavedOpportunity,
} from "@/types/domain"

export function profileToRow(id: string, p: CandidateProfile) {
  return {
    id,
    education_level: p.educationLevel,
    field_of_study: p.fieldOfStudy,
    experience_years: p.experienceYears,
    experience_description: p.experienceDescription,
    skills: p.skills,
    languages: p.languages,
    preferred_countries: p.preferredCountries,
    career_interests: p.careerInterests,
    work_authorizations: p.workAuthorizations,
    student_status: p.studentStatus,
  }
}
export function profileFromRow(r: Record<string, unknown>): CandidateProfile {
  return candidateProfileSchema.parse({
    educationLevel: r.education_level,
    fieldOfStudy: r.field_of_study,
    experienceYears: Number(r.experience_years),
    experienceDescription: r.experience_description,
    skills: r.skills,
    languages: r.languages,
    preferredCountries: r.preferred_countries,
    careerInterests: r.career_interests,
    workAuthorizations: r.work_authorizations,
    studentStatus: r.student_status,
  })
}
export function opportunityToRow(o: Opportunity) {
  return {
    id: o.id,
    slug: o.slug,
    title: o.title,
    organization: o.organization,
    country: o.country,
    city: o.city,
    employment_type: o.employmentType,
    description: o.description,
    responsibilities: o.responsibilities,
    required_skills: o.requiredSkills,
    minimum_experience_years: o.minimumExperienceYears,
    minimum_education_level: o.minimumEducationLevel,
    accepted_education_fields: o.acceptedEducationFields,
    required_languages: o.requiredLanguages,
    career_categories: o.careerCategories,
    eligibility: o.eligibility,
    is_active: o.isActive,
  }
}
// Keep invalid data detectable by the engine/schema rather than coercing it to a valid record.
export function opportunityFromRow(r: Record<string, unknown>): unknown {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    organization: r.organization,
    country: r.country,
    city: r.city,
    employmentType: r.employment_type,
    description: r.description,
    responsibilities: r.responsibilities,
    requiredSkills: r.required_skills,
    minimumExperienceYears: r.minimum_experience_years,
    minimumEducationLevel: r.minimum_education_level,
    acceptedEducationFields: r.accepted_education_fields,
    requiredLanguages: r.required_languages,
    careerCategories: r.career_categories,
    eligibility: r.eligibility,
    isActive: r.is_active,
  }
}
export function savedFromRow(r: {
  id: string
  candidate_id: string
  opportunity_id: string
  created_at: string
}): SavedOpportunity {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    opportunityId: r.opportunity_id,
    createdAt: r.created_at,
  }
}
