"use client"
import { LoaderCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShortlist } from "./shortlist-provider"
export function RemoveSavedButton({
  opportunityId,
  title,
}: {
  opportunityId: string
  title: string
}) {
  const { remove, busy, status, errors } = useShortlist()
  const pending = busy.has(opportunityId)
  return (
    <div className="min-w-0 space-y-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full px-4 sm:w-auto"
        disabled={pending || status !== "ready"}
        aria-label={"Remove saved opportunity: " + title}
        onClick={() => {
          void remove(opportunityId)
        }}
      >
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 aria-hidden="true" />
        )}
        {pending ? "Removing…" : "Remove"}
      </Button>
      {errors[opportunityId] && (
        <p role="alert" className="max-w-md text-xs leading-5 text-destructive">
          {errors[opportunityId]} Your saved item is still here. Use Remove to
          retry.
        </p>
      )}
    </div>
  )
}
