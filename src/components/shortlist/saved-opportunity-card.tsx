import Link from "next/link"
import { Building2, MapPin, CircleAlert, ArrowUpRight } from "lucide-react"
import type { SavedItem } from "@/types/career-client"
import { EligibilityStatusBadge } from "@/components/matching/eligibility-status-badge"
import { MatchScore } from "@/components/matching/match-score"
import { EMPLOYMENT_LABELS } from "@/features/matching/presentation"
import { RemoveSavedButton } from "./remove-saved-button"

export function SavedOpportunityCard({ item }: { item: SavedItem }) {
  const available = !item.unavailable && item.opportunity?.isActive
  const opportunity = available ? item.opportunity : null
  const title = opportunity?.title ?? "Unavailable opportunity"
  return (
    <article
      data-testid="saved-opportunity-card"
      data-opportunity-id={item.opportunityId}
      aria-labelledby={"saved-" + item.id}
      className="app-card space-y-4"
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          {opportunity && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
              {opportunity.organization}
            </p>
          )}
          <h2
            id={"saved-" + item.id}
            className="text-lg leading-snug font-semibold"
          >
            {title}
          </h2>
          {opportunity && (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {opportunity.city}, {opportunity.country}
              </span>
              <span>{EMPLOYMENT_LABELS[opportunity.employmentType]}</span>
            </p>
          )}
        </div>
        {opportunity && item.match && <MatchScore score={item.match.score} />}
      </div>
      {opportunity ? (
        item.match ? (
          <div className="space-y-3">
            <EligibilityStatusBadge status={item.match.eligibilityStatus} />
            {(item.match.eligibilityFindings?.[0] ??
              item.match.gaps[0] ??
              item.match.warnings[0]) && (
              <p className="text-sm text-muted-foreground">
                {item.match.eligibilityFindings?.[0] ??
                  item.match.gaps[0] ??
                  item.match.warnings[0]}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Create a profile to see your current match.{" "}
            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center font-medium text-primary"
            >
              Create Profile →
            </Link>
          </p>
        )
      ) : (
        <div className="rounded-lg bg-muted p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <CircleAlert className="size-4" aria-hidden="true" />
            Unavailable
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            This listing is no longer available. You can remove it from your
            saved list.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-start sm:justify-between">
        {opportunity && (
          <Link
            href={"/opportunities/" + item.opportunityId}
            aria-label={"View details: " + title}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium"
          >
            View Details
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        )}
        <div className={opportunity ? "" : "sm:ml-auto"}>
          <RemoveSavedButton opportunityId={item.opportunityId} title={title} />
        </div>
      </div>
    </article>
  )
}
