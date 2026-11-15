# Career Mobility Platform

A functional international career-mobility assessment MVP: create a profile, evaluate fifteen fictional opportunities, understand ranked matches, inspect requirements and manage a persistent shortlist.

Next.js App Router + React + TypeScript, Supabase PostgreSQL/Anonymous Auth, Tailwind v4 and shadcn/Base UI. Matching is deterministic and explainable; no external job feed or runtime AI API is required in this MVP.


## Prerequisites

- Node.js 22.12+ on the 22.x line, 24.x, or 26+ (matches the locked test-runner engine range). Verified here with Node 26.13.1.
- pnpm; tested with 12.18.0. The lockfile is included.
- Network access for initial packages and the Inter font download during a clean build. Fonts are self-hosted at runtime.
- For browser tests on this supplied Windows setup: Microsoft Edge installed and port 3100 free. The app itself uses ordinary Next.js commands.

## Quick start: credential-free demo

From the extracted career-mobility-platform directory:

```powershell
pnpm.cmd install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm.cmd dev
```

Open http://localhost:3000. Use `pnpm` instead of `pnpm.cmd` in other shells; the .cmd spelling avoids PowerShell script-policy restrictions. On non-Windows shells use `cp .env.example .env.local`.

The example selects **mock** mode explicitly. Home browsing creates no career identity; click Create My Career Profile or Explore Opportunities to begin. Load Sample Candidate, save, inspect recommendations/details, save a job, open Saved, refresh, then remove it. Edit experience/skills and save to see recalculated scores.

Mock mode uses localStorage for profile/shortlist and bundled JSON for opportunities. It still needs the Next.js server for matching, but no Supabase credentials. It is labeled Demo Mode and is not secure account storage. Data stays in that browser; clearing browser data removes it.

Production run:

```powershell
pnpm.cmd build
pnpm.cmd start
```

## Environment and Supabase setup

.env.local belongs at the project root and must not be committed. Public variables are fixed at build time: rebuild after changing mode.

| Variable                             | Purpose                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| NEXT_PUBLIC_DATA_MODE                | Explicit `mock` or `supabase`; no implicit/silent fallback                       |
| NEXT_PUBLIC_SUPABASE_URL             | Project URL in Supabase mode                                                     |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public/publishable project key, never a secret/service-role key                  |
| SUPABASE_SECRET_KEY                  | Local seed script only; not used by app requests or exposed through NEXT_PUBLIC_ |

For real persistence:

1. Create/configure a development Supabase project and enable Anonymous Sign-Ins.
2. Apply [the migration](supabase/migrations/202611150001_career_mobility.sql) once through the SQL editor or your migration tooling.
3. Set mode, URL and publishable key in .env.local. Temporarily provide the seed-only secret key.
4. Run `pnpm.cmd seed` to upsert the fifteen stable fictional records. Remove the seed secret from the app runtime environment afterward.
5. Rebuild/restart and follow [backend setup](docs/backend.md). The opt-in `pnpm.cmd verify:supabase` creates two test anonymous users; clean them up afterward as documented.

Supabase errors show retry states and never switch to mock mode. Anonymous identity has no recovery/permanent-account guarantee. Hosted setup has not been executed here because credentials were unavailable.

## Tests and reproducible evidence

```powershell
pnpm.cmd lint
pnpm.cmd test:report
pnpm.cmd seed -- --validate-only
$env:NEXT_PUBLIC_DATA_MODE = "mock"
pnpm.cmd build
pnpm.cmd typecheck
pnpm.cmd test:e2e
pnpm.cmd evidence
```

Run these sequentially; Next.js regenerates route types during build. `pnpm.cmd test` runs the normal Vitest suite; `test:watch`, `data:validate` and `test:rls` provide focused alternatives. Browser configuration starts/stops its own server on port 3100. [Test evidence](docs/test-evidence.md) distinguishes local/mocked/embedded-database coverage from hosted verification.

Evidence generation asserts five matching scenarios and requires passing reports, then writes JSON and copies eight screenshots into docs/evidence. Automated accessibility scans cover eight page/states; incomplete/manual-review items remain visible in the report rather than being treated as a full accessibility certification.

Create and inspect the local source package on Windows:

```powershell
pnpm.cmd package:submission
pnpm.cmd verify:package
```

The output ZIP, checksum and inspection report are under artifacts/. The archive includes its own source manifest and excludes .git, node_modules, .next and local credentials. Packaging/extraction helpers use Windows ZIP tooling; extracted application source is independent of those helpers. See [submission handoff](docs/submission.md).

## Architecture and matching

- src/app: five routes, metadata, global theme and API Route Handlers.
- src/components: reusable layout, profile, matching, opportunities, shortlist, feedback and UI primitives.
- src/features/matching: pure normalization, scoring, eligibility, explanations and ranking.
- src/lib: validation, verified Supabase sessions, repositories, explicit browser adapters and API boundaries.
- src/data: fifteen fictional opportunities and the illustrative sample candidate.
- supabase/migrations, scripts, tests and docs: schema/RLS, seed/evidence/package tools, checks and handoff material.

Weights: skills 35, experience 20, education 15, preferred location 15, language 15. Only the final total is rounded. Eligibility is separate: confirmed configured failure → blocked; otherwise unknown mandatory information → requires verification; otherwise no identified blocker. Results sort by eligibility group, descending score and stable ID, retaining poor/blocked matches. Scores are recomputed rather than stored.

Requests derive ownership from verified Supabase sessions, validate server-side and rely on RLS/unique constraints. Bookmark UI updates after persistence; failed mutations keep prior state. Inactive saved jobs remain removable without stale scores or active details links. Read the [technical note](docs/technical-note.md) and [matching methodology](docs/matching.md) for trade-offs and limitations.

## Specifications and known limits

Supplied specifications are included under [docs/specifications](docs/specifications/). The original assessment/profile and referenced companion CSS were unavailable. The candidate is illustrative, and globals.css reconstructs the documented theme. Final QA darkened the shared muted text token for contrast and documented that deviation.

The dataset is fictional, matching weights are MVP choices and no score verifies employment probability, credentials, visas or legal work permission. Local demo storage has no secure multi-user isolation or transactional cross-tab guarantees; full production abuse protection/recovery and a complete screen-reader audit are outside the verified scope. Hosted Supabase verification and actual submission details remain explicit external items.
