import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  MapPin,
  Check,
  CircleAlert,
} from "lucide-react"
import type { MatchResult, Opportunity } from "@/types/domain"
import { EMPLOYMENT_LABELS } from "@/features/matching/presentation"
import { EligibilityStatusBadge } from "@/components/matching/eligibility-status-badge"
import { MatchScore } from "@/components/matching/match-score"
import { SaveOpportunityButton } from "@/components/shortlist/save-opportunity-button"

export function OpportunityCard({
  opportunity,
  match,
}: {
  opportunity: Opportunity
  match: MatchResult
}) {
  const finding =
    match.eligibilityFindings?.[0] ?? match.gaps[0] ?? match.warnings[0]
  return (
    <article
      aria-labelledby={"job-" + opportunity.id}
      data-testid="opportunity-card"
      data-opportunity-id={opportunity.id}
      data-eligibility={match.eligibilityStatus}
      className="app-card space-y-5"
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="break-words">{opportunity.organization}</span>
          </p>
          <h2
            id={"job-" + opportunity.id}
            className="text-lg leading-snug font-semibold"
          >
            {opportunity.title}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {opportunity.city}, {opportunity.country}
            </span>
            <span>{EMPLOYMENT_LABELS[opportunity.employmentType]}</span>
          </p>
        </div>
        <MatchScore score={match.score} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EligibilityStatusBadge status={match.eligibilityStatus} />
        {match.matchedSkills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="max-w-full rounded-md bg-muted px-2 py-1 text-xs break-words text-muted-foreground"
          >
            {skill}
          </span>
        ))}
        {match.matchedSkills.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{match.matchedSkills.length - 3} more matched
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-start gap-2 text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {match.strengths[0] ??
              "No matching strengths identified; review the requirements."}
          </span>
        </p>
        {finding && (
          <p className="flex items-start gap-2 text-muted-foreground">
            <CircleAlert
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span>{finding}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          href={"/opportunities/" + opportunity.id}
          aria-label={"View details: " + opportunity.title}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          View Details
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <SaveOpportunityButton
          opportunityId={opportunity.id}
          title={opportunity.title}
        />
      </div>
    </article>
  )
}
