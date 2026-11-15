# Phase 4: workspace shell and profile

Implemented on 2026-11-15. The complete profile workflow is connected to the Phase 3 client adapter. Both data modes use the same form and validation. Browser verification used explicit mock mode; hosted Supabase verification still needs project credentials.

## Implemented behavior

- `/profile`: six sections for education, experience, skills, languages, preferences and eligibility. Blank experience remains invalid; zero and decimals are valid.
- Skills can be added with Enter or Add and removed with labeled buttons. Configured aliases normalize and duplicate skills are prevented. Suggestions come from the actual fictional dataset.
- Repeatable language/proficiency rows prevent choosing an already selected language and display indexed validation errors.
- Country choices create authorization controls defaulting to Unknown. Removing/reselecting a country retains the earlier declaration. Enrollment also defaults to Unknown.
- Existing saved profiles prepopulate. Workspace context preserves unsaved drafts between profile/recommendations/saved routes. A full reload can discard unsaved edits and triggers the browser's standard unsaved-change prompt; saved data survives reload.
- Load Sample Candidate is explicitly illustrative and confirms replacement when the form has content. Loading a sample does not persist until Save.
- Save Profile confirms persistence and stays on the form. Save & View Matches navigates only after confirmed persistence. A synchronous submission lock plus disabled controls prevents repeated active submissions.
- Failed saves show actionable inline/toast feedback, keep all edits and offer Retry save with the original navigation intent. Session/storage initialization errors have a separate Retry state; no fake authenticated state appears.

## Shell and accessibility

The workspace route group uses a 240px sidebar at 1024px and wider, a 68px topbar, breadcrumbs, and a shadcn/Base UI Sheet below desktop width. Drawer navigation closes on selection, traps focus, supports Escape and returns focus to its trigger. The Demo Mode indicator is shown only for a mock build. There are no account, notification or theme controls.

Form components use shared CSS tokens and shadcn primitives with at least 44px controls. Labels are associated with controls, required fields are marked, errors use aria-invalid/aria-describedby, and failed validation focuses the first invalid control. The global skip link targets the workspace main landmark. Focus rings and reduced-motion behavior remain enabled.

The proxy now permits the retry UI to render when Auth cannot be verified; protected APIs remain responsible for authorization. Browser tests also uncovered a Next.js loopback-host normalization mismatch in the origin guard. The guard now checks the actual incoming Host while continuing to reject cross-origin mutations; this has a regression test.

## Supporting routes and remaining scope

At the end of Phase 4, `/recommendations` provided a basic ranked list and `/saved` provided a basic read view. Phase 5 added full recommendation cards, detailed explanations, the details route and shared card/detail Save/Remove controls; see `recommendations-ui.md`. Phase 6 completed Saved page management and Home polish; see `saved-home-ui.md`.

Draft state lives inside the workspace layout, not in a second persistent store. Leaving the workspace entirely can discard unsaved drafts; saved profiles are retrieved again when reopening it.

## Verification

Passed locally: 69 Vitest tests, lint, TypeScript and a production mock build. Four Playwright tests passed in headless Microsoft Edge:

1. Empty-form validation/focus, sample replacement cancellation, skill aliases, language uniqueness, retained authorization, save/reload/edit, draft navigation and save-to-matches with fifteen computed results.
2. Simulated storage write failure: no navigation or false success, edits retained, successful retry navigates.
3. Simulated denied storage during initialization: error/retry returns to a usable form.
4. No horizontal overflow at widths 320, 375, 768, 1024 and 1440; mobile drawer keyboard open/Escape/focus return; keyboard Save.

Generated screenshots are in `test-results/profile-desktop.png` and `test-results/profile-mobile.png`. Browser artifacts are ignored by Git. This is viewport testing in Edge, not a claim of testing every mobile OS or a full screen-reader audit.

To repeat the browser suite on this Windows setup (Edge installed), first create a mock production build:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "mock"
pnpm.cmd build
pnpm.cmd test:e2e
```

The Playwright config starts/stops its own production server on port 3100. Keep that port free. The suite uses isolated browser storage and does not modify any Supabase project.
