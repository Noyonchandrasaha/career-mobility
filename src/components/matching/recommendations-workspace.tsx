"use client"
import { useCallback } from "react"
import Link from "next/link"
import { ArrowRight, GraduationCap } from "lucide-react"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useAsyncResource } from "@/hooks/use-async-resource"
import {
  EDUCATION_LABELS,
  joinRecommendations,
  summarizeMatches,
} from "@/features/matching/presentation"
import { ErrorState } from "@/components/feedback/workspace-feedback"
import {
  OpportunityLoading,
  ProfileRequired,
} from "@/components/feedback/opportunity-feedback"
import { OpportunityCard } from "@/components/opportunities/opportunity-card"
import { ShortlistError } from "@/components/shortlist/save-opportunity-button"

export function RecommendationsWorkspace() {
  const { client, profile, dirty } = useWorkspace()
  const load = useCallback(async () => {
    if (!client) throw new Error("Your workspace is unavailable. Please retry.")
    const [matches, jobs] = await Promise.all([
      client.getMatches(),
      client.listOpportunities(),
    ])
    return {
      matches,
      rows: joinRecommendations(matches, jobs),
      counts: summarizeMatches(matches),
    }
  }, [client])
  const { data, error, retry } = useAsyncResource(
    profile ? load : null,
    profile
  )
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-primary">
            EXPLORE YOUR POSSIBILITIES
          </p>
          <h1 className="text-[26px] font-bold tracking-tight md:text-3xl">
            Your Career Matches
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Explore opportunities that align with your background, and see what
            needs a closer look.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium"
        >
          Edit Profile
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {!profile ? (
        <ProfileRequired />
      ) : (
        <>
          <section
            aria-label="Candidate summary"
            className="flex flex-wrap items-start gap-4 rounded-xl border bg-card p-4 md:p-5"
          >
            <GraduationCap
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-medium">
                {EDUCATION_LABELS[profile.educationLevel]} ·{" "}
                {profile.fieldOfStudy}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.experienceYears} years of experience ·{" "}
                {profile.preferredCountries.join(", ")}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Key skills: {profile.skills.slice(0, 5).join(", ")}
              </p>
              {dirty && (
                <p className="mt-2 text-xs text-warning">
                  Results use your saved profile. Save your latest edits to
                  update these matches.
                </p>
              )}
            </div>
          </section>
          {error ? (
            <ErrorState
              title="Could not load your matches"
              message={error instanceof Error ? error.message : "Please retry."}
              onRetry={retry}
            />
          ) : !data ? (
            <OpportunityLoading />
          ) : (
            <>
              <dl
                aria-label="Evaluation summary"
                className="grid grid-cols-2 gap-3 xl:grid-cols-4"
              >
                {[
                  {
                    label: "Opportunities Evaluated",
                    value: data.matches.total,
                    tone: "text-primary",
                  },
                  {
                    label: "No Identified Blocker",
                    value: data.counts.no_identified_blocker,
                    tone: "text-success-soft-foreground",
                  },
                  {
                    label: "Needs Verification",
                    value: data.counts.requires_verification,
                    tone: "text-warning-soft-foreground",
                  },
                  {
                    label: "Blocked",
                    value: data.counts.blocked,
                    tone: "text-danger-soft-foreground",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border bg-card p-4"
                  >
                    <dt className="text-xs leading-5 text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className={"mt-2 text-3xl font-semibold " + stat.tone}>
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-2 rounded-xl border border-secondary-foreground/10 bg-secondary p-4 text-sm text-secondary-foreground">
                <p>
                  Match scores reflect profile alignment, not confirmed legal
                  eligibility. {data.matches.total} opportunities evaluated.
                </p>
                <p className="text-xs leading-5">
                  Ranked by eligibility group first, then score, with a stable
                  tie-breaker. A higher-scoring blocked role can appear below a
                  lower-scoring role. “No identified blocker” is not legal
                  verification.
                </p>
              </div>
              <ShortlistError />
              {data.rows.length ? (
                <div className="space-y-4 md:space-y-5">
                  {data.rows.map((row) => (
                    <OpportunityCard key={row.opportunity.id} {...row} />
                  ))}
                </div>
              ) : (
                <div className="app-card space-y-3">
                  <h2 className="text-lg font-semibold">
                    No opportunities are currently available.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your profile is saved. You can retry to check the current
                    fictional dataset.
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="min-h-11 rounded-lg border px-4 text-sm font-medium"
                  >
                    Retry opportunities
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
