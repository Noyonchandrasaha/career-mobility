"use client"
import { useCallback, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Bookmark } from "lucide-react"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { useShortlist } from "./shortlist-provider"
import { useAsyncResource } from "@/hooks/use-async-resource"
import { ErrorState } from "@/components/feedback/workspace-feedback"
import { OpportunityLoading } from "@/components/feedback/opportunity-feedback"
import { SavedOpportunityCard } from "./saved-opportunity-card"

export function SavedWorkspace() {
  const { client, profile, dirty } = useWorkspace()
  const shortlist = useShortlist()
  const load = useCallback(async () => {
    if (!client) throw new Error("Your workspace is unavailable.")
    return client.getSaved()
  }, [client])
  const revision = useMemo(
    () => ({ profile, bookmarks: shortlist.saved }),
    [profile, shortlist.saved]
  )
  const { data, error, retry } = useAsyncResource(
    client && shortlist.status === "ready" ? load : null,
    revision
  )
  const failure = shortlist.status === "error" ? shortlist.error : error
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-primary">
            KEEP YOUR POSSIBILITIES CLOSE
          </p>
          <h1 className="text-[26px] font-bold tracking-tight md:text-3xl">
            Saved Opportunities
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A shortlist to revisit as you plan your next step.
          </p>
        </div>
        <Link
          href="/recommendations"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium"
        >
          Find more opportunities
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {failure ? (
        <ErrorState
          title="Could not load saved opportunities"
          message={failure instanceof Error ? failure.message : String(failure)}
          onRetry={shortlist.status === "error" ? shortlist.retry : retry}
        />
      ) : !data ? (
        <OpportunityLoading label="Loading saved opportunities" />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <p aria-live="polite" className="text-sm font-medium">
              {data.length} saved{" "}
              {data.length === 1 ? "opportunity" : "opportunities"}
            </p>
            <p className="text-xs text-muted-foreground">
              {
                data.filter(
                  (item) => item.unavailable || !item.opportunity?.isActive
                ).length
              }{" "}
              unavailable
            </p>
          </div>
          {data.length ? (
            <>
              <p className="text-xs leading-5 text-muted-foreground">
                {profile
                  ? "Scores use your current saved profile. A match does not confirm legal work eligibility."
                  : "Your shortlist is saved. Create a profile to compare requirements."}
                {dirty &&
                  " Save your latest profile edits to update these scores."}
              </p>
              <div className="space-y-4 md:space-y-5">
                {data.map((item) => (
                  <SavedOpportunityCard key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            <section
              aria-labelledby="saved-empty-heading"
              className="app-card flex flex-col items-center gap-4 py-12 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Bookmark className="size-6" aria-hidden="true" />
              </span>
              <h2 id="saved-empty-heading" className="text-xl font-semibold">
                No Saved Opportunities Yet
              </h2>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Explore your recommendations and save opportunities you want to
                revisit.
              </p>
              <Link
                href="/recommendations"
                className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Explore Recommendations
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  )
}
