"use client"
import { ErrorState } from "@/components/feedback/workspace-feedback"
export default function OpportunityError({ retry }: { retry(): void }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Opportunity details</h1>
      <ErrorState
        title="Could not load this opportunity"
        message="The opportunity service is unavailable. Please retry."
        onRetry={retry}
      />
    </div>
  )
}
