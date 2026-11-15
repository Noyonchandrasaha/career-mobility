import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ExploreOpportunitiesLink } from "./explore-opportunities-link"
import { MatchPreview } from "./match-preview"
export function HeroSection() {
  return (
    <section className="app-container grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
      <div>
        <p className="mb-5 text-xs font-semibold tracking-widest text-primary">
          INTERNATIONAL CAREER MOBILITY
        </p>
        <h1 className="max-w-2xl text-[32px] leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Discover international career opportunities that{" "}
          <span className="text-primary">match your profile.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
          Explore global career opportunities, understand your matching
          strengths, and identify the requirements you may need to meet.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start">
          <Link
            href="/profile"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create My Career Profile
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <ExploreOpportunitiesLink />
        </div>
        <a
          href="#how-it-works"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          How It Works ↓
        </a>
        <p className="mt-5 max-w-md text-xs leading-5 text-muted-foreground">
          An assessment prototype with fictional opportunities. Matching is
          explainable; work eligibility requires verification.
        </p>
      </div>
      <MatchPreview />
    </section>
  )
}
