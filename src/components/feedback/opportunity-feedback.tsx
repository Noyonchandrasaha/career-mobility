import Link from "next/link"
import { Compass, SearchX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
export function OpportunityLoading({
  label = "Loading your matches",
}: {
  label?: string
}) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <span className="sr-only">{label}</span>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-24 rounded-xl" />
        ))}
      </div>
      {[0, 1, 2].map((item) => (
        <div key={item} className="app-card space-y-4" aria-hidden="true">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}
export function ProfileRequired() {
  return (
    <div className="app-card space-y-4">
      <Compass className="size-8 text-primary" aria-hidden="true" />
      <h2 className="text-lg font-semibold">Start with your career profile</h2>
      <p className="max-w-xl text-sm text-muted-foreground">
        Create your career profile to get personalized recommendations. Your
        skills, experience and preferences help explain each match.
      </p>
      <Link
        href="/profile"
        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Create Profile
      </Link>
    </div>
  )
}
export function OpportunityNotFound({
  unavailable = false,
}: {
  unavailable?: boolean
}) {
  return (
    <div className="app-card space-y-4">
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-bold">
        {unavailable ? "Opportunity unavailable" : "Opportunity not found"}
      </h1>
      <p className="text-sm text-muted-foreground">
        This opportunity is unavailable or does not exist. It is not being
        presented as an active opening.
      </p>
      <Link
        href="/recommendations"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
      >
        Back to Recommendations →
      </Link>
    </div>
  )
}
