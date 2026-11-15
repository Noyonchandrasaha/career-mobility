import type { MatchResult } from "@/types/domain"
import { MATCH_WEIGHTS } from "@/lib/constants/domain"
const labels = {
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  location: "Preferred location",
  language: "Language",
}
export function MatchBreakdown({ match }: { match: MatchResult }) {
  return (
    <section aria-labelledby="breakdown-heading" className="app-card">
      <h2 id="breakdown-heading" className="text-lg font-semibold">
        Match breakdown
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Weighted profile alignment. Eligibility is assessed separately.
      </p>
      <div className="mt-6 space-y-6">
        {(Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]).map(
          (key) => {
            const ratio = match.criterionScores[key]
            const points = Number((ratio * MATCH_WEIGHTS[key]).toFixed(2))
            return (
              <div key={key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <h3 className="font-medium">{labels[key]}</h3>
                  <span className="text-muted-foreground">
                    {points} / {MATCH_WEIGHTS[key]} points
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={labels[key] + " alignment"}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Number((ratio * 100).toFixed(2))}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {match.criterionExplanations?.[key] ??
                    "See the full explanation below for this criterion."}
                </p>
              </div>
            )
          }
        )}
      </div>
    </section>
  )
}
