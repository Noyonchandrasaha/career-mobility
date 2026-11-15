# Phase 5: recommendations and opportunity details

Implemented and verified locally on 2026-11-15. Both screens use the existing Phase 3 client adapter and deterministic server engine. No external AI/job service or scoring rule was added.

## Recommendations

`/recommendations` now includes:

- Saved candidate summary with education, experience, skills, countries and Edit Profile.
- Actual evaluated/no-identified-blocker/verification/blocked counts derived from returned results.
- Ranking and eligibility caveats. Server order is preserved exactly; weak and blocked results remain visible.
- Single-column opportunity cards with fictional organization, city/country, employment type, numeric profile match, eligibility badge, matched skills, grounded strengths and key gaps/verification findings.
- Working View Details and Save/Remove actions, with accessible pressed/pending states and confirmed persistence before success feedback.
- Skeletons, missing-profile CTA, zero-opportunity state and failure/retry handling. A failed request never displays fabricated scores.

The UI joins results to active opportunity data and rejects inconsistent totals, duplicate result identities or missing job records with a retry message. It never assigns its own ranking, recomputes criterion weights or infers eligibility from the numeric score. Profile edits invalidate old display data before fetching current results.

## Opportunity details

`/opportunities/[id]` validates UUIDs and reads active public opportunity data on the server. Missing, malformed and inactive IDs use Next.js `notFound()`; browser checks confirmed HTTP 404 for malformed/unknown URLs in mock mode. The server uses the public repository directly, not a request to its own API or a privileged read bypass.

Details show title, fictional organization, location, employment type, description, responsibilities, skills, education, experience, language proficiency, career categories and eligibility conditions. The layout places the score/status rail before the requirements on mobile and alongside content on desktop.

For a saved profile, the current API-derived result displays:

- Overall match and independent eligibility badge.
- Five labeled accessible progress bars, weighted points and server-generated criterion explanations.
- Matched/missing skills, complete strengths, gaps and warnings.
- Exact configured eligibility findings, including unknown internship enrollment/authorization and mandatory German gaps.
- Full explanation and explicit limits on legal/credential verification.

No profile means requirements remain readable and the personalized area offers Create Profile. If personal session/storage initialization fails, public requirements still render with a separate matching error/retry area. Personal matching failure does not fabricate a score or silently switch persistence modes. Server-fetch failures have a route error boundary with retry. An opportunity that becomes unavailable during client loading gets an unavailable state instead of an active-job presentation.

## Shared shortlist behavior

One workspace provider loads bookmark state for cards/details; cards do not perform individual saved-state requests. Both screens share the same persisted IDs. Mutations lock per opportunity, retain the prior state on failure, and show success only after the client confirms persistence. Refresh rehydrates the actual saved state. A saved-state load failure disables save actions and offers retry independently of match loading.

Phase 6 subsequently completed the saved route with current-match cards, confirmed removal/retry, actual counts and empty/unavailable states; see `saved-home-ui.md`. Saved, card and detail controls share the workspace shortlist state.

## Verification evidence

Passed: 73 Vitest tests, lint, TypeScript, production mock build, and all 12 Playwright tests in headless Edge (four existing profile tests plus eight Phase 5 tests).

| Scenario                                            | Verified result                                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Illustrative candidate recommendations              | 15 cards; counts 13 no blocker / 1 verification / 1 blocked; server eligibility order retained      |
| Request batching                                    | Initial empty-shortlist recommendations use one matching request, not one per card                  |
| Save → details → refresh → remove → recommendations | Same saved ID/state across screens and reload; removal reflected on card                            |
| Programme Assistant details                         | Five criterion bars; skills 35/35; full requirements and explanations                               |
| German-speaking role                                | Blocked with mandatory German reason; language alignment 50%                                        |
| Internship                                          | Score 88; enrollment and Canada authorization both require verification                             |
| Missing profile                                     | Profile CTA on recommendations; job requirements still readable without a fabricated personal score |
| Malformed/unknown ID                                | HTTP 404 and Opportunity not found UI                                                               |
| Matching delay/failure/empty response               | Skeleton, actionable retry, then genuine zero-opportunity state                                     |
| Profile experience 2 → 8 years                      | Senior Project Manager match recalculates 68 → 83                                                   |
| Bookmark storage failure                            | Prior unsaved state retained; error and successful retry                                            |
| Personal storage/session unavailable                | Public requirements visible; matching retry and disabled save                                       |

Viewport checks cover the existing shell at 320–1440px and Phase 5 details at 375px; desktop recommendations and mobile opportunity screenshots were visually reviewed. Generated artifacts: `test-results/recommendations-desktop.png` and `test-results/opportunity-mobile.png` (ignored by Git). This is not a hosted Supabase verification or full assistive-technology audit.

Repeat locally with Edge installed and port 3100 free:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "mock"
pnpm.cmd build
pnpm.cmd test:e2e
```

The browser fixture initializes storage only when absent, so reload/navigation exercises real persistence rather than resetting the candidate. The test runner starts/stops its own production server. Supabase mode uses the same components and adapter interface; live verification remains pending project credentials.
