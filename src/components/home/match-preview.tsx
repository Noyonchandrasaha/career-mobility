import { BriefcaseBusiness, Check, CircleHelp, ArrowDown } from "lucide-react"
export function MatchPreview() {
  return (
    <figure
      aria-label="Illustrative profile matching example"
      className="relative min-w-0 rounded-2xl border bg-secondary p-5 md:p-8"
    >
      <figcaption className="mb-5 flex items-center gap-2 text-xs font-medium text-secondary-foreground">
        <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
        ILLUSTRATIVE EXAMPLE
      </figcaption>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <BriefcaseBusiness
              className="size-5 text-primary"
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="text-sm font-semibold">
              A profile with possibilities
            </p>
            <p className="text-xs text-muted-foreground">
              Skills, experience and preferences
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Excel", "Research", "Reporting"].map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              <Check className="size-3" aria-hidden="true" />
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-center py-3">
        <ArrowDown className="size-5 text-primary" aria-hidden="true" />
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Example profile alignment</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A score with an explanation
            </p>
          </div>
          <span className="text-4xl font-semibold tracking-tight text-primary">
            86<span className="text-lg">%</span>
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs leading-5 text-warning-soft-foreground">
          <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Work authorization needs verification. A strong profile match does
            not confirm eligibility.
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-secondary-foreground">
        Example only. Your real results are calculated from your saved profile
        and fictional opportunity requirements.
      </p>
    </figure>
  )
}
