# AI, tools and external services disclosure

## AI assistance

OpenAI Codex assisted with requirements analysis, implementation planning, TypeScript/React/SQL code, fictional fixtures, tests, documentation and local submission packaging across Phases 1–7. No claim is made that the project was written without AI assistance.

The assistant inspected the supplied PRD/blueprint/design and installed framework/SDK documentation, implemented the workflow, ran automated checks, inspected failures, corrected code or test fixtures where needed, and visually reviewed generated desktop/mobile screenshots. Test reports identify what was actually executed. Human candidate review, ownership and the ability to explain the implementation remain the submitter's responsibility; no unperformed human verification is claimed.

No application feature calls an AI inference API. Recommendations use explicit deterministic rules.

## Tools and libraries actually used

| Tool/library                                | Use                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Next.js App Router, React, TypeScript       | Five-screen application, server pages, Route Handlers and typed contracts             |
| Tailwind v4, shadcn/Base UI, Lucide, Sonner | Theme, accessible primitives, icons and confirmed mutation feedback                   |
| Supabase JS and SSR SDK                     | PostgreSQL/Auth integration and cookie sessions; hosted execution pending credentials |
| Zod                                         | Candidate/opportunity/configuration/result validation                                 |
| Vitest                                      | Domain, API, adapter, session and embedded-database tests                             |
| PGlite                                      | Execute the migration/RLS locally with an Auth schema stub                            |
| Playwright + installed Microsoft Edge       | Production browser workflows, keyboard interactions and viewport checks               |
| axe-core/Playwright                         | Automated WCAG A/AA scans of tested pages and drawer                                  |
| pnpm, Node.js, PowerShell, ripgrep, Git     | Dependencies, scripts, local inspection, source/archive handling and diff checks      |
| Prettier and ESLint                         | Formatting and static checks                                                          |
| next/font/google                            | Inter download during build, then self-hosted runtime font assets                     |

Supabase is the intended external runtime application service in database mode. Google Fonts is a build-time font source. Package registries provide dependencies. Official Supabase documentation was consulted online for SSR/anonymous identity behavior; installed Next.js documentation was consulted for framework-specific APIs.

## Verification boundaries

Local automated reports and the mock-mode browser journey are included. PGlite tests do not substitute for hosted Supabase Auth/PostgREST verification. No external job API, scraping, actual job listing feed, runtime LLM, cloud deployment or outbound assessment email was used.

The original assessment file/profile was not supplied; the provided candidate fixture is explicitly illustrative. The missing design companion CSS was reconstructed from the supplied guide rather than presented as the original file. The submitter should review these disclosed limits before sending the source archive.
