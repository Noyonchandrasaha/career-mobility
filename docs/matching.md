# Matching engine: methodology and evidence

The engine is pure TypeScript in `src/features/matching/`, with no React, Supabase, network, browser storage or LLM dependencies. Both future persistence modes must call this engine. Sample outcomes are calculated, not branches tied to job IDs.

## Data provenance

`src/data/opportunities.json` contains fifteen fictional records corresponding to PRD scenarios J01–J15. UUID suffixes 001–015 map to those scenario numbers; slugs and IDs must remain stable for future idempotent seeding. Organizations, descriptions and responsibilities are fictional. Countries and languages use consistent display values; skills and fields use normalized values. `src/data/index.ts` validates imports before export.

The original assessment candidate was not supplied. `sample-profile.json` is an **illustrative fixture**, not a verified copy: bachelor's in business administration, two years of experience, Excel/research/reporting/project coordination/communication, professional English, native Bengali, Canada/Singapore/Germany preferences. Enrollment and authorization are unknown.

## API for later integration

```ts
import { evaluateOpportunity, evaluateOpportunities } from "@/features/matching"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"

const profile = candidateProfileSchema.parse(input)
const { total, results, invalidRecords } = evaluateOpportunities(
  profile,
  records,
  (issue) => logger.error("Invalid opportunity", issue)
)
```

Callers must validate candidate data at the API/storage boundary. `evaluateOpportunity` takes one validated job/profile pair; `evaluateOpportunities` additionally validates raw opportunities, excludes inactive/invalid/duplicate identities, and ranks results. `total` counts evaluated active records, not rejected or inactive ones. Diagnostics contain index/reason without raw record payloads. Future server integration must supply logging or log returned diagnostics; the pure engine itself performs no logging side effects.

## Scoring and findings

| Criterion  | Weight | Rule                                                                |
| ---------- | -----: | ------------------------------------------------------------------- |
| Skills     |     35 | Unique matched required skills / unique required skills             |
| Experience |     20 | Candidate years / required years, clamped 0–1; zero requirement = 1 |
| Education  |     15 | Average of level-met and accepted-field-met                         |
| Location   |     15 | Country among preferences = 1, otherwise 0                          |
| Language   |     15 | Fraction of requirements meeting stated proficiency                 |

Only the final weighted total is rounded. Matching normalizes casing/whitespace; configured aliases include MS Excel/Microsoft Excel and BBA. No fuzzy semantic equivalence is inferred (Java is not JavaScript). Duplicate skills do not inflate coverage. An empty skill requirement earns neutral 0.5 plus a data-quality warning; no language restriction earns full language credit; an empty accepted-field list means any field.

Criterion observations generate strengths, gaps and the explanation. Education is fully satisfied only when level and field both match. Years are a simplified proxy, not proof of domain expertise. Career interests are persisted inputs, not an extra score/filter. Scores are recomputed, never persisted by the engine.

Phase 5 also returns `criterionExplanations` (the engine's observation for each of the five criteria) and `eligibilityFindings` (configured hard-constraint gaps/unknowns). These are additive optional fields in the response schema for compatibility; the current engine always supplies them. Details render these observations directly instead of implementing another scoring/eligibility evaluator in the UI.

## Eligibility and ranking

Configured hard constraints are local work authorization, current enrollment and mandatory languages. Explicit failure takes precedence (`blocked`), then uncertainty (`requires_verification`), otherwise `no_identified_blocker`. A valid populated language list without German is a declared German gap; empty/incomplete imported proficiency data requires verification. User-facing profile validation still requires at least one complete language.

Absent country authorization is unknown. Country keys are compared case/whitespace-insensitively; conflicting declarations require verification. Free-text additional conditions have no automatic verification rule and produce verification warnings. Education/experience gaps affect score and explanation but do not introduce extra hard constraints beyond PRD Section 8.8.

`no_identified_blocker` concerns configured requirements only and is never legal verification. Eligibility does not change the numerical score. Sort by eligibility group (no blocker → verification → blocked), then descending score, then lexical stable UUID. Blocked/weak results remain visible. Ranking returns a new array.

## Executed test evidence

Run `pnpm.cmd test` or `pnpm.cmd data:validate` for the dataset-only check. Automated assertions cover the following required scenarios:

| Scenario and input                                           | Expected                                                            | Actual assertion result                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| Strong: illustrative candidate + J01                         | All criteria satisfied, score 100, no identified configured blocker | Pass: 100; all five criterion ratios = 1                    |
| Partial: same candidate + J05                                | Two of four skills matched; SQL/data visualization missing          | Pass: 83; skill ratio 0.5; both gaps present                |
| Critical gap: same candidate, enrollment explicitly no + J09 | Blocked with enrollment reason; authorization still unknown         | Pass: blocked; score remains 88; reason and warning present |
| Unknown eligibility: unmodified candidate + J09              | Verification, never assumed enrollment/authorization                | Pass: requires_verification, both warnings                  |
| Mandatory German: unmodified candidate + J10                 | Blocked, missing German explained                                   | Pass: blocked; language ratio 0.5; score 81                 |

Additional tests cover experience proportions/caps, specialized education mismatch, input nonmutation, aliases, zero/full scores, recalculation after profile updates, optional languages, free-text conditions, invalid/inactive records, and stable ranking independent of input order. These are engine tests; DB/RLS, browser persistence and screen-flow evidence belong to later phases.
