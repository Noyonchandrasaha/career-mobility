"use client"
import { useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, MapPin } from "lucide-react"
import type { Opportunity } from "@/types/domain"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useAsyncResource } from "@/hooks/use-async-resource"
import { CareerClientError } from "@/lib/client/errors"
import { EMPLOYMENT_LABELS } from "@/features/matching/presentation"
import { ErrorState } from "@/components/feedback/workspace-feedback"
import {
  OpportunityLoading,
  OpportunityNotFound,
} from "@/components/feedback/opportunity-feedback"
import { MatchScore } from "@/components/matching/match-score"
import { EligibilityStatusBadge } from "@/components/matching/eligibility-status-badge"
import { MatchBreakdown } from "@/components/matching/match-breakdown"
import {
  EligibilityAlert,
  MatchFindings,
} from "@/components/matching/match-findings"
import {
  SaveOpportunityButton,
  ShortlistError,
} from "@/components/shortlist/save-opportunity-button"
import { RequirementsSection } from "./requirements-section"

export function OpportunityDetails({
  initialOpportunity,
}: {
  initialOpportunity: Opportunity
}) {
  const {
    client,
    profile,
    dirty,
    status,
    error: workspaceError,
    retry: retryWorkspace,
  } = useWorkspace()
  const load = useCallback(async () => {
    if (!client) throw new Error("Your workspace is unavailable.")
    return client.getOpportunity(initialOpportunity.id)
  }, [client, initialOpportunity.id])
  const { data, error, loading, retry } = useAsyncResource(
    client ? load : null,
    profile
  )
  if (error instanceof CareerClientError && error.status === 404)
    return <OpportunityNotFound unavailable />
  const opportunity = data?.opportunity ?? initialOpportunity
  const match = data?.match ?? null
  return (
    <div className="space-y-6">
      <Link
        href="/recommendations"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Recommendations
      </Link>
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4" aria-hidden="true" />
          {opportunity.organization}
        </p>
        <h1 className="text-[26px] font-bold tracking-tight md:text-3xl">
          {opportunity.title}
        </h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {opportunity.city}, {opportunity.country}
          </span>
          <span>{EMPLOYMENT_LABELS[opportunity.employmentType]}</span>
          <span>Fictional opportunity</span>
        </p>
      </header>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <aside
          aria-label="Your opportunity match"
          className="space-y-4 lg:col-start-2 lg:row-start-1"
        >
          <div className="app-card space-y-5">
            {loading || status === "loading" ? (
              <div role="status" className="text-sm text-muted-foreground">
                Calculating your current match…
              </div>
            ) : status === "error" ? (
              <ErrorState
                title="Personal matching is unavailable"
                message={workspaceError ?? "Please retry your session."}
                onRetry={retryWorkspace}
              />
            ) : error ? (
              <ErrorState
                title="Could not load your match"
                message={
                  error instanceof Error ? error.message : "Please retry."
                }
                onRetry={retry}
              />
            ) : match ? (
              <>
                <MatchScore score={match.score} large />
                <EligibilityStatusBadge status={match.eligibilityStatus} />
                <p className="text-xs leading-5 text-muted-foreground">
                  Profile alignment, not an employment probability or legal
                  verification.
                </p>
                {dirty && (
                  <p className="text-xs text-warning">
                    Save your profile edits to recalculate this match.
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">
                  How does your profile compare?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create a profile to view your match.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
                >
                  Create Profile →
                </Link>
              </>
            )}
            <div className="border-t pt-4">
              <SaveOpportunityButton
                opportunityId={opportunity.id}
                title={opportunity.title}
              />
            </div>
          </div>
          <ShortlistError />
        </aside>
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <section aria-labelledby="overview-heading" className="app-card">
            <h2 id="overview-heading" className="text-lg font-semibold">
              About this opportunity
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {opportunity.description}
            </p>
            {opportunity.responsibilities.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-medium">
                  What you would work on
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {opportunity.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <RequirementsSection opportunity={opportunity} match={match} />
          {loading && profile ? (
            <OpportunityLoading label="Loading current match analysis" />
          ) : match ? (
            <>
              <MatchBreakdown match={match} />
              <EligibilityAlert match={match} />
              <MatchFindings match={match} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
