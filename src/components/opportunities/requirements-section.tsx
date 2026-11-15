import { Check, Minus, CircleHelp } from "lucide-react"
import type { MatchResult, Opportunity } from "@/types/domain"
import { normalizeSkill } from "@/features/matching/normalization"
import { EDUCATION_LABELS } from "@/features/matching/presentation"

export function RequirementsSection({
  opportunity,
  match,
}: {
  opportunity: Opportunity
  match: MatchResult | null
}) {
  return (
    <section
      aria-labelledby="requirements-heading"
      className="app-card space-y-6"
    >
      <h2 id="requirements-heading" className="text-lg font-semibold">
        Opportunity requirements
      </h2>
      <div>
        <h3 className="mb-3 text-sm font-medium">Required skills</h3>
        <ul className="flex flex-wrap gap-2">
          {opportunity.requiredSkills.length ? (
            opportunity.requiredSkills.map((skill, index) => {
              const matched = match?.matchedSkills.includes(
                normalizeSkill(skill)
              )
              const missing = match?.missingSkills.includes(
                normalizeSkill(skill)
              )
              const Icon = matched ? Check : missing ? Minus : CircleHelp
              return (
                <li
                  key={index}
                  className="inline-flex max-w-full items-start gap-1.5 rounded-lg border px-3 py-2 text-sm"
                >
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="break-words">
                    {skill}
                    <span className="block text-xs text-muted-foreground">
                      {matched
                        ? "Listed in your profile"
                        : missing
                          ? "Not listed in your profile"
                          : "Create a profile to compare"}
                    </span>
                  </span>
                </li>
              )
            })
          ) : (
            <li className="text-sm text-muted-foreground">
              No required skills configured.
            </li>
          )}
        </ul>
      </div>
      <dl className="space-y-5 text-sm">
        <div>
          <dt className="font-medium">Minimum experience</dt>
          <dd className="mt-1 text-muted-foreground">
            {opportunity.minimumExperienceYears} years
          </dd>
        </div>
        <div>
          <dt className="font-medium">Minimum education</dt>
          <dd className="mt-1 text-muted-foreground">
            {EDUCATION_LABELS[opportunity.minimumEducationLevel]}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Accepted fields of study</dt>
          <dd className="mt-1 text-muted-foreground">
            {opportunity.acceptedEducationFields.join(", ") ||
              "Any field accepted"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Career categories</dt>
          <dd className="mt-1 text-muted-foreground">
            {opportunity.careerCategories.join(", ")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Languages</dt>
          <dd className="mt-2">
            <ul className="space-y-2 text-muted-foreground">
              {opportunity.requiredLanguages.length ? (
                opportunity.requiredLanguages.map((item, index) => (
                  <li key={index}>
                    {item.language} · {item.minimumProficiency} proficiency ·{" "}
                    {item.mandatory ? "Mandatory" : "Non-mandatory"}
                  </li>
                ))
              ) : (
                <li>No language restriction configured.</li>
              )}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-medium">Eligibility conditions</dt>
          <dd className="mt-2">
            <ul className="space-y-2 text-muted-foreground">
              <li>
                Current student enrollment:{" "}
                {opportunity.eligibility.requiresCurrentEnrollment
                  ? "Required"
                  : "Not required"}
              </li>
              <li>
                Local work authorization:{" "}
                {opportunity.eligibility.requiresLocalWorkAuthorization
                  ? "Required in " + opportunity.country
                  : "Not a configured condition; this does not establish legal work permission"}
              </li>
              {opportunity.eligibility.additionalConditions.map(
                (condition, index) => (
                  <li key={index}>{condition}</li>
                )
              )}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  )
}
