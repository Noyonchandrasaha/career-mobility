# Backend, sessions and persistence

Phase 3 implements the migration, Supabase repository, anonymous session flow, API handlers, seed command and browser demo adapter. Phase 4 connects the responsive shell and profile UI. No hosted credentials were available during implementation: local verification must not be represented as a deployed/verified Supabase project.

## Supabase setup

1. Use a development Supabase project and enable Anonymous Sign-Ins in its Auth configuration.
2. Apply `supabase/migrations/202611150001_career_mobility.sql` using the project's SQL editor (once), or your Supabase migration tooling. The file is transactional and assumes the standard `auth.users`, `auth.uid()`, `anon`, `authenticated` and `service_role` objects supplied by Supabase.
3. Copy `.env.example` to `.env.local` at the project root. Set `NEXT_PUBLIC_DATA_MODE=supabase`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from project settings.
4. Set `SUPABASE_SECRET_KEY` to the server secret/service-role key **only for local seeding**, then run `pnpm.cmd seed`. It upserts the fifteen fictional jobs on stable UUIDs, does not create duplicate records, and does not modify profiles/bookmarks. Existing seeded job fields are updated; unrelated jobs are not deleted. Remove the seed key from the runtime environment afterward.
5. Rebuild/restart the application after changing public configuration. Run `pnpm.cmd verify:supabase` against the development project for the opt-in hosted test.

Never put a secret/service-role key in a `NEXT_PUBLIC_` variable. Ordinary app requests use only the publishable key plus the verified user's cookie session, with RLS enforced. Missing configuration yields 503 for data APIs. A Supabase outage does not activate demo mode.

The hosted verification command creates **two anonymous Auth users and profiles**, exercises user isolation and bookmarks, and removes their bookmarks afterward. It prints their user IDs so you can remove the test users from the Auth dashboard; profiles cascade on user deletion. It needs a seeded project and Anonymous Auth enabled. No privileged key is used by this command. It has not been run here because credentials are absent.

Offline seed-data/mapping validation: `pnpm.cmd seed -- --validate-only`. This performs no database writes and requires no Supabase credentials.

## Session lifecycle

`POST /api/session` verifies an existing identity through Supabase `getUser()`. Only when a session is genuinely absent does it call `signInAnonymously()`. A rejected/expired stored identity is not silently replaced with a fresh account. Transient Auth errors return 503; rejected identity returns 401. Retry is exposed to the UI through rejected client promises; no login page is introduced.

Clients use `@supabase/ssr` per request, `getAll`/`setAll`, preserve all cookie chunks and refresh cache headers on API success/failure, and never trust the browser's user ID or embedded session user. API handlers refresh cookies themselves. The workspace-only Next.js proxy forwards successful refreshes and allows the session retry UI to render on failure while preserving the original incoming identity cookies. Data APIs still independently enforce access. The proxy does not initialize identities during public browsing. Server Components have a read-only client, while writes stay in Route Handlers.

All API responses are private/no-store and vary on cookies. Mutations reject cross-origin Origin headers and cross-site browser requests. JSON is schema-validated server-side and limited to 64 KiB. Session cookies survive ordinary refreshes but clearing browser data can lose the anonymous identity; no permanent account/recovery claim is made.

## API contract

| Method/path                   | Input                                          | Result / important behavior                                                             |
| ----------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| POST `/api/session`           | None                                           | `{ mode, userId }`; mock server returns null identity                                   |
| GET `/api/profile`            | Cookie session                                 | `{ profile }`; 404 when not created                                                     |
| PUT `/api/profile`            | Candidate profile JSON, no identity            | `{ profile }`; upsert for verified user                                                 |
| GET `/api/opportunities`      | None                                           | `{ opportunities }`; active, valid fictional jobs                                       |
| GET `/api/opportunities/[id]` | UUID                                           | `{ opportunity, match }`; match null without profile; inactive/unknown/malformed ID 404 |
| POST `/api/match`             | Supabase: no body or `{}`; mock: `{ profile }` | `{ total, results }`; current profile and active dataset, no stored scores              |
| GET `/api/saved`              | Cookie session                                 | `{ saved }`; enriched current match, no profile means null match                        |
| POST `/api/saved`             | `{ opportunityId }`                            | `{ saved }`; idempotent bookmark, existing saved ID retained                            |
| DELETE `/api/saved/[id]`      | **Saved record UUID**, not opportunity UUID    | `{ removed: true }`; 404 when absent/not owned                                          |

Private persistence endpoints require a verified session (401 otherwise). Errors use `{ error: { code, message, details? } }`; invalid input 400, cross-origin 403, missing resource 404, conflict 409, oversized JSON 413, unexpected error 500, service unavailable 503. Raw database errors, tokens and credentials are not included in responses/logs.

Supabase mode rejects browser-submitted profile/identity overrides for matching and loads the persisted profile instead. Evaluation excludes invalid records with server diagnostics. Saved scores are recomputed; changing profile data cannot leave persisted stale scores.

## RLS and unavailable opportunities

- Candidate profiles: authenticated owner-only SELECT/INSERT/UPDATE, including UPDATE WITH CHECK to prevent changing ownership.
- Opportunities: active rows readable by public visitors and authenticated anonymous users; neither may insert/update/delete jobs.
- Saved rows: owner-only SELECT/INSERT/DELETE, a unique candidate/opportunity pair, and active opportunity check for inserts.
- Anonymous Auth users use the `authenticated` database role. Public visitors without a session use `anon`.
- Inactive jobs remain hidden by the active-only read policy. A retained saved row is returned as `unavailable: true`, `opportunity: null`, `match: null`, and can still be removed. Details return 404. No privileged read bypass is used for history.

## Explicit browser demo mode

Set `NEXT_PUBLIC_DATA_MODE=mock` before building. Call `createCareerClient()` from a mounted Client Component (or supply a Storage adapter in tests). Read `.mode` to display the mandatory **Demo Mode** indicator in the upcoming workspace UI. Both modes share the same client interface, schemas and server matching engine.

```ts
import { createCareerClient } from "@/lib/client/career-client"

// Inside client-side initialization after mounting:
const client = createCareerClient()
await client.initializeSession()
await client.saveProfile(profile)
const matches = await client.getMatches()
const saved = await client.saveOpportunity(opportunityId)
await client.removeSaved(saved.id)
```

Mock opportunities are bundled JSON; profile, demo UUID and shortlist live in a single versioned localStorage record (`career-mobility:demo:v1`). State is validated on every read. Corrupt data or denied/full storage returns an actionable error without silently resetting or claiming success. Recreating the adapter/browser refresh reads the persisted data. Different browser stores remain separate; this is **not secure multi-user storage**, and cross-tab edits do not provide database transaction guarantees.

The mock adapter sends its validated local profile to `/api/match`; the server evaluates the bundled dataset with the same pure engine used by Supabase mode. It does not compute alternative browser scores. This requires the Next.js server, but no Supabase credentials. Direct mock `/api/profile` and `/api/saved` persistence requests return 409 `MODE_LOCAL_ONLY`: the UI must use the adapter, not a server-global in-memory fake database.

## Verification boundaries

Executed locally on 2026-11-15: all 65 tests passed, lint/typecheck and production build passed, seed CLI validation-only mode passed, and the built server passed HTTP checks for opportunities, details/404, mock session/matching, invalid input, origin protection, no-store headers and browser-only persistence boundaries. Hosted verification remains unexecuted without project credentials.

- API tests exercise request validation, ownership routing, cookie forwarding, current matching, duplicate saves, unavailable items and errors with an injected repository.
- Browser adapter tests cover save/reload/edit/match/bookmark/remove, storage failure, corruption and network failure, using an injected Storage implementation and the real matching handler.
- SSR session tests cover verified identity reuse, genuine missing-session initialization, invalid-cookie protection, Auth failures and chunked cookie propagation with a mocked SDK.
- `pnpm.cmd test:rls` runs the **actual migration** in PGlite (embedded PostgreSQL) with minimal Auth schema/roles. It exercises profile/shortlist isolation, ownership changes, active-only reads, prohibited writes, constraints, timestamps and repeatable stable-ID seeding.
- These local tests do not verify hosted Supabase Auth/PostgREST configuration or a real browser UI. Use `verify:supabase` after providing project configuration; screen/browser QA follows in Phase 4 onward.

Implementation references: [Supabase SSR setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous), and the installed Next.js docs under `node_modules/next/dist/docs/`.
