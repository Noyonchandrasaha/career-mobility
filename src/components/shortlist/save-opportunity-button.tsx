"use client"
import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShortlist } from "./shortlist-provider"
import { useWorkspace } from "@/components/layout/workspace-provider"

export function SaveOpportunityButton({
  opportunityId,
  title,
}: {
  opportunityId: string
  title: string
}) {
  const shortlist = useShortlist()
  const { status: workspaceStatus } = useWorkspace()
  const saved = shortlist.saved.some(
    (item) => item.opportunityId === opportunityId
  )
  const busy = shortlist.busy.has(opportunityId)
  const error = shortlist.errors[opportunityId]
  return (
    <div className="min-w-0 space-y-2">
      <Button
        type="button"
        variant={saved ? "secondary" : "outline"}
        className="min-h-11 w-full px-4 sm:w-auto"
        aria-label={
          (saved ? "Remove saved opportunity: " : "Save opportunity: ") + title
        }
        aria-pressed={saved}
        disabled={busy || shortlist.status !== "ready"}
        onClick={() => {
          void shortlist.toggle(opportunityId)
        }}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : saved ? (
          <BookmarkCheck aria-hidden="true" />
        ) : (
          <Bookmark aria-hidden="true" />
        )}
        {workspaceStatus === "error"
          ? "Save unavailable"
          : busy
            ? "Updating…"
            : shortlist.status === "loading"
              ? "Loading saved state…"
              : shortlist.status === "error"
                ? "Save unavailable"
                : saved
                  ? "Saved"
                  : "Save opportunity"}
      </Button>
      {error && (
        <p role="alert" className="max-w-md text-xs text-destructive">
          {error} Use the button to retry.
        </p>
      )}
    </div>
  )
}
export function ShortlistError() {
  const { status, error, retry } = useShortlist()
  if (status !== "error") return null
  return (
    <div
      role="alert"
      className="rounded-lg border bg-warning-soft p-4 text-sm text-warning-soft-foreground"
    >
      <p>Saved state could not be loaded. {error}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-3 min-h-11 px-4"
        onClick={retry}
      >
        Retry saved state
      </Button>
    </div>
  )
}
