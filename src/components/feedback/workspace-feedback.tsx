"use client"
import { AlertTriangle, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="app-card space-y-4 border-danger-soft-foreground/20"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-5 shrink-0 text-warning"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
export function WorkspaceLoading() {
  return (
    <div
      role="status"
      aria-label="Preparing your workspace"
      className="space-y-6"
    >
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Preparing your workspace…
      </p>
      {[0, 1, 2].map((index) => (
        <div key={index} className="app-card space-y-4" aria-hidden="true">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>
      ))}
    </div>
  )
}
