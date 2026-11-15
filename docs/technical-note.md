# Technical note — Career Mobility Platform

## Architecture and responsibilities

This assessment MVP implements five routes: Home, Profile, Recommendations, Opportunity Details and Saved Opportunities. Next.js App Router and TypeScript provide the application and backend; Supabase is the only external application service in database mode. The UI uses Tailwind v4, shadcn/Base UI, Inter and Lucide.

Server Components compose pages and read active public opportunity details. Interactive forms and bookmark controls use Client Components. A small React workspace context holds the saved profile and temporary draft; another shares bookmark state. A typed client adapter selects explicit Supabase or mock behavior. There is no separate backend, global state library, external job feed, or runtime LLM.

Route Handlers verify identity, validate input with Zod, call repositories, execute matching and return structured data/errors. Server pages use the repository directly rather than fetching their own HTTP endpoints. Public opportunity reads never access candidate records. Mock mode keeps profile/shortlist in validated localStorage and opportunities in bundled JSON; matching still calls the same server engine.

## Data and identity

The migration defines three RLS-enabled tables: candidate_profiles (one row per Auth user), opportunities (stable UUID/slug, structured JSONB requirements), and saved_opportunities (user/opportunity foreign keys and a unique pair). Profile updates maintain updated_at. An idempotent, local-only seed script upserts fifteen fictional records; its privileged credential is not used in normal application requests.

Supabase Anonymous Auth supplies identity without a login form. SSR clients are created per request, verify with getUser(), and forward cookie chunks/cache headers. New identities are created only when a session is genuinely absent during a profile-dependent action. Invalid stored identity is not silently replaced during that request. RLS restricts candidate/profile mutations to the verified owner; only active opportunities are publicly readable. Previously saved inactive records retain a removable unavailable placeholder, without privileged historical reads.

## Matching and explanation

Pure TypeScript functions evaluate each profile/opportunity pair. Normalized ratios are weighted: skills 35, experience 20, education 15, preferred location 15 and language 15. Only the final total is rounded. Skills normalize whitespace/case/configured aliases and deduplicate. Experience is proportional up to full credit. Education averages qualification-level and accepted-field satisfaction. Location is a preference, not authorization. Language credit reflects configured proficiency requirements.

Eligibility is independent from alignment. An explicit failure of configured authorization, enrollment or mandatory language conditions produces blocked. Otherwise, an unknown mandatory condition produces requires_verification; otherwise no_identified_blocker. Free-text conditions require verification. Neither score nor status certifies legal permission or credentials.

Results sort by eligibility group, descending score and stable UUID. Poor/blocked results remain visible. Structured criterion observations generate strengths, gaps, warnings and explanations; the UI does not implement a second scoring engine. Scores are recalculated from current profile/data and are not persisted.

## Reliability and trade-offs

Profile navigation follows confirmed persistence. Bookmark mutations are locked per opportunity, update state after success and preserve prior state on failure. Schema errors are field-associated; skeleton, empty, unavailable and retry states distinguish failure from no data. Public job requirements remain readable when personal matching is unavailable. Profile revisions invalidate old displayed results.

All data API responses are private/no-store. Writes enforce same-origin browser requests and a 64 KiB JSON limit; browser-supplied ownership is rejected. Raw database errors, tokens and credentials are not logged or returned. Secrets are limited to the local seed environment.

The deliberately small fictional dataset makes evaluation deterministic and explainable, but is not calibrated hiring probability. Education aliases and experience years are simplified proxies; career interests are captured without an extra hidden score weight. Anonymous sessions have no account recovery, and local demo storage has no secure multi-user or transactional cross-tab guarantees. Production abuse protection, recovery, comprehensive credential verification and immigration advice are outside this MVP.

## Verification and remaining external checks

Automated tests cover scoring/eligibility boundaries, ranking, validation, API ownership routing, SSR cookie behavior and browser persistence. The actual migration/RLS runs in embedded PostgreSQL with minimal Auth stubs; browser tests exercise the mock production build. Final reports, screenshots and mandatory strong/partial/critical-gap inputs/results are included under docs/evidence.

Hosted Supabase Auth/PostgREST and seed execution remain unverified without project credentials. The supplied sample is illustrative because the original assessment profile/file was unavailable. No live site was deployed. Automated accessibility checks supplement keyboard/viewport testing and do not replace a full assistive-technology audit. The companion CSS referenced by the design guide was missing; its documented token/layout contract was reconstructed and disclosed.
