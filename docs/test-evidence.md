# Final test evidence

Executed locally on 2026-11-15 in explicit mock mode. Machine-readable results: [summary](evidence/summary.json), [Vitest report](evidence/vitest-results.json), [Playwright report](evidence/playwright-results.json), [accessibility scans](evidence/accessibility.json), and [complete scenario inputs/actual results](evidence/matching-scenarios.json).

## Executed checks

| Check                                | Result / scope                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Lint / TypeScript / production build | Passed in the development source tree                                                                                    |
| Vitest                               | 73 passed, 0 failed; scoring, eligibility, validation, API/adapters/session, actual migration/RLS in embedded PostgreSQL |
| Playwright                           | 23 passed, no failed/flaky/skipped cases; production mock build in headless Edge                                         |
| Responsive matrix                    | All five pages at widths 320, 375, 390, 768, 1024, 1280, 1440 and 1920                                                   |
| Automated accessibility              | 8 page/states scanned, zero detected A/AA violations; manual-review items remain explicitly listed in JSON               |
| Keyboard behavior                    | Drawer focus containment/Escape/return, first-invalid-field focus and keyboard bookmark removal                          |
| Seed CLI                             | --validate-only passed; fifteen validated jobs/mappings, no database writes                                              |
| Source ZIP                           | Per-file manifest, checksum and extracted-source verification; see final-qa.md                                           |
| Hosted Supabase                      | Not run: project credentials unavailable                                                                                 |

The suite verifies the complete Home → profile → recommendations → details → save → Saved → refresh → remove journey, profile edits/recalculation, duplicate prevention, missing-profile behavior, 404s, loading/error/empty states, failed storage mutations, unavailable saved records and independent eligibility wording.

Fresh reviewer setup also passed: a standalone extracted copy completed frozen/offline installation, production build, all 73 tests and HTTP checks. See [reviewer-install.json](evidence/reviewer-install.json) and the final archive runtime-fingerprint check.

After the shared text contrast and score-label semantics fixes, seven scanned states have no incomplete rules. The mobile Sheet retains one aria-hidden-focus item for manual review; explicit repeated-Tab containment and Escape/focus return passed. Zero detected violations does not mean full accessibility certification.

## Required assessment scenarios

Common fixture: bachelor's in business administration, two years' experience, Excel/research/reporting/project coordination/communication, professional English/native Bengali, Canada/Singapore/Germany preferences. Enrollment and country authorization are unknown unless a scenario explicitly overrides them. This is an illustrative fixture, not a verified copy of the unavailable original assessment candidate.

| Scenario                                          | Input difference                                       | Expected                                                             | Actual                                                         | Outcome |
| ------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- | ------- |
| Strong match: J01 Programme Assistant             | Common fixture                                         | All required criteria align; 100; no identified configured blocker   | 100; five criterion ratios 1; strengths listed                 | PASS    |
| Partial match: J05 Operations Analyst             | Common fixture lacks SQL/data visualization            | Skill ratio 0.5, both skills missing, lower score                    | 17.5 + 20 + 15 + 15 + 15 = 82.5 → 83; both gaps present        | PASS    |
| Critical requirement: J09 Business Analyst Intern | Explicit studentStatus=no; authorization still unknown | Confirmed enrollment failure overrides uncertainty; blocked          | 88; blocked; enrollment gap and authorization warning retained | PASS    |
| Unknown eligibility: J09                          | Unmodified fixture                                     | Enrollment/authorization require verification, not assumed satisfied | 88; requires_verification; both warnings                       | PASS    |
| Mandatory German: J10                             | Populated language list contains no German             | Mandatory language failure independently blocks role                 | 81; language ratio 0.5; mandatory German reason                | PASS    |

The evidence generator asserts these expectations against the engine and writes the complete profile, opportunity, expected result and actual MatchResult to JSON. The UI never supplies hardcoded versions of these outcomes.

## Screenshots

[Home desktop](evidence/screenshots/home-desktop.png) · [Home mobile](evidence/screenshots/home-mobile.png) · [Profile desktop](evidence/screenshots/profile-desktop.png) · [Profile mobile](evidence/screenshots/profile-mobile.png) · [Recommendations](evidence/screenshots/recommendations-desktop.png) · [Opportunity mobile](evidence/screenshots/opportunity-mobile.png) · [Saved desktop](evidence/screenshots/saved-desktop.png) · [Saved mobile](evidence/screenshots/saved-mobile.png).

## Reproduce

Run from the project root, sequentially:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd lint
pnpm.cmd test:report
pnpm.cmd seed -- --validate-only
$env:NEXT_PUBLIC_DATA_MODE = "mock"
pnpm.cmd build
pnpm.cmd typecheck
pnpm.cmd test:e2e
pnpm.cmd evidence
```

Edge must be installed and port 3100 free for the supplied Windows browser configuration. Build needs Google Fonts access for Inter. Evidence generation requires passing reports and screenshot output; it fails rather than packaging failed/flaky/skipped results. For the hosted-only test and its test-user cleanup instructions, see backend.md.

## Limits

Embedded PostgreSQL uses a minimal Auth stub; API and SDK tests use injected/mocked dependencies. Browser persistence tests use isolated localStorage. These do not prove hosted Supabase configuration, production abuse resistance or legal eligibility. Automated accessibility scans do not replace a full screen-reader/manual audit; incomplete axe items are preserved rather than described as passes.
