# Phase 6: Saved management and Home

Implemented and verified locally on 2026-11-15. The complete five-screen workflow now runs in explicit mock mode, with the same UI/client interface available for Supabase mode after project setup. Hosted verification remains pending credentials.

## Saved opportunities

`/saved` replaces the earlier read-only preview with:

- Actual saved and unavailable counts, displayed only after successful loading.
- Cards with fictional role/organization, location, employment type, current match score and eligibility, working View Details, and Remove.
- Current scores recomputed by the existing server engine from the saved profile. Unsaved profile edits are identified; saving profile changes invalidates the earlier display.
- Saved records without a profile remain visible and removable, with a Create Profile link and no fabricated score.
- Unavailable records show a truthful unavailable state with no stale score or active details link. Their saved record can still be removed.
- Genuine loading, empty, failure and retry states. The empty state routes to Recommendations.

Remove uses a dedicated remove-only action in the shared shortlist provider. It cannot accidentally save an item while attempting removal. Per-opportunity locks disable repeated active mutations. The provider updates state and announces success only after confirmed persistence. A failed delete retains the existing card/count and shows a retry message; the same Remove button retries. Simple reversible bookmark removal does not require a destructive confirmation dialog.

The displayed list is invalidated when shared bookmarks or the saved profile change. Recommendations, details and Saved therefore stay consistent across navigation and browser refresh. Supabase operations use the previously implemented verified session and ownership/RLS rules; mock operations use validated browser storage.

## Public Home

The public page now includes responsive brand/navigation, an international-career hero, Create My Career Profile, Explore Opportunities, a real How It Works anchor/section, a three-step workflow, prototype scope notes and footer.

The CSS/HTML match illustration is explicitly labeled an illustrative example. Its 86% score is not a real recommendation, live availability statistic or employment probability. Actual matches still come from the server engine.

Home browsing does not initialize an anonymous career session or demo identity. The Explore action checks the profile after a user click and routes to Recommendations when a profile exists, or Profile otherwise. Failure stays on Home with an actionable error/retry message. The primary Create Profile action and ordinary navigation remain accessible. Modifier-clicks preserve normal link behavior.

Home has its own mobile navigation Sheet, with an accessible title, keyboard open/Escape behavior and focus return. Layouts use existing theme tokens, Inter and Lucide. Interactive targets are at least 44px, primary CTAs 48px, and the mobile layout has no horizontal scrolling at the tested widths.

## Executed verification

Passed: 73 Vitest tests, lint, typecheck, production mock build and all **19 Playwright tests** in headless Microsoft Edge. Seven new Phase 6 scenarios extend the previous twelve:

| Scenario                                                                                                               | Actual result                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Home → Explore without profile → sample profile → save/matches → save job → details → Saved → reload → keyboard Remove | Pass; real persisted state, then genuine empty state and unsaved recommendation card      |
| Home Explore with existing profile, then denied storage and retry                                                      | Pass; correct destination, no false navigation on failure                                 |
| Active and unavailable saved records                                                                                   | Pass; real count, no unavailable score/details action, confirmed removal survives refresh |
| Failed removal and retry                                                                                               | Pass; card/count retained; only intended saved item removed after success                 |
| Profile experience 2 → 8 years, then profile absent                                                                    | Pass; Saved score 68 → 83; profile-less item remains removable without score              |
| Saved matching delay/failure/retry                                                                                     | Pass; loading/error states shown, no false empty state, successful retry restores list    |
| Home and Saved at 320, 375, 768 and 1440px                                                                             | Pass; no horizontal overflow, mobile drawer Escape/focus return                           |

The unavailable mock fixture uses a retained bookmark whose opportunity is absent from the active bundled dataset. Embedded PostgreSQL/RLS tests from Phase 3 separately cover a saved opportunity becoming inactive.

Desktop Home and mobile Saved screenshots were visually reviewed. Generated artifacts are ignored by Git:

- `test-results/home-desktop.png`
- `test-results/home-mobile.png`
- `test-results/saved-desktop.png`
- `test-results/saved-mobile.png`

Repeat the browser suite on this Windows setup with Edge installed and port 3100 free:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "mock"
pnpm.cmd build
pnpm.cmd test:e2e
```

The runner starts/stops its own production server and uses isolated browser storage. These results are local mock/browser and embedded-database verification, not a claim of hosted Supabase configuration or a complete screen-reader audit. Final submission documentation and hosted verification belong to Phase 7.
