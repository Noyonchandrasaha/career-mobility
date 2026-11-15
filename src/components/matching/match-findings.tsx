import { Check, CircleAlert } from "lucide-react"
import type { MatchResult } from "@/types/domain"
import { EligibilityStatusBadge } from "./eligibility-status-badge"
export function EligibilityAlert({ match }: { match: MatchResult }) {
  return (
    <section
      aria-labelledby="eligibility-heading"
      className="app-card space-y-4"
    >
      <div>
        <h2 id="eligibility-heading" className="mb-3 text-lg font-semibold">
          Eligibility findings
        </h2>
        <EligibilityStatusBadge status={match.eligibilityStatus} />
      </div>
      {(match.eligibilityFindings?.length ?? 0) > 0 && (
        <ul className="space-y-3 text-sm">
          {match.eligibilityFindings?.map((finding, index) => (
            <li key={index} className="flex items-start gap-2">
              <CircleAlert
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="rounded-lg bg-warning-soft p-3 text-xs leading-5 text-warning-soft-foreground">
        This assessment only checks configured requirements against your
        declarations. It does not verify visas, credentials or legal permission
        to work.
      </p>
    </section>
  )
}
export function MatchFindings({ match }: { match: MatchResult }) {
  return (
    <section aria-labelledby="findings-heading" className="app-card">
      <h2 id="findings-heading" className="text-lg font-semibold">
        Your strengths and gaps
      </h2>
      <div className="mt-5 space-y-6">
        {[
          { label: "Matching strengths", items: match.strengths, icon: Check },
          {
            label: "Requirements to address",
            items: match.gaps,
            icon: CircleAlert,
          },
          {
            label: "Warnings and unknown information",
            items: match.warnings,
            icon: CircleAlert,
          },
        ].map(({ label, items, icon: Icon }) => (
          <div key={label}>
            <h3 className="text-sm font-medium">{label}</h3>
            <ul className="mt-3 space-y-2">
              {items.length ? (
                items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Icon
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  None identified in the configured evaluation.
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <details className="mt-6 border-t pt-4">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-primary">
          Read the full matching explanation
        </summary>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {match.explanation}
        </p>
      </details>
    </section>
  )
}
