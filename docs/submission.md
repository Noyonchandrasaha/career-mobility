# Submission handoff

The local source package demonstrates all five screens and the complete profile → evaluation → ranked results → details → shortlist workflow. It includes reproducible fictional data, migration/RLS, environment examples, automated test evidence, technical note and AI/tool disclosure.

## Deliverables

| Deliverable                                     | Location                                               |
| ----------------------------------------------- | ------------------------------------------------------ |
| Runnable application and setup                  | README.md                                              |
| Source ZIP                                      | artifacts/career-mobility-platform-submission.zip      |
| Archive checksum                                | artifacts/submission.sha256                            |
| Per-file source manifest                        | SUBMISSION-MANIFEST.json inside the archive            |
| Technical note (concise 1–2 page equivalent)    | docs/technical-note.md                                 |
| Required matching evidence and test reports     | docs/test-evidence.md, docs/evidence/                  |
| Requirement traceability / limits               | docs/acceptance-checklist.md                           |
| AI/tools disclosure                             | docs/ai-tool-disclosure.md                             |
| Supabase configuration/migration/seed           | docs/backend.md, supabase/migrations/, scripts/seed.ts |
| Original supplied implementation specifications | docs/specifications/                                   |

The archive excludes .git, node_modules, .next, local environment credentials and browser trace directories. Only .env.example is included. It packages the current working-tree source, including uncommitted implementation; it does not commit or publish anything.

## External items before actual submission

- Enter the candidate's full name and the assessment recipient. Neither was supplied.
- If submitting a repository link, ensure the reviewer has access; a source ZIP is provided as the alternative.
- Configure a development Supabase project, enable Anonymous Auth, apply the migration, seed, and run verify:supabase before claiming hosted verification. That command creates two test users; remove them from the Auth dashboard afterward.
- Reconcile the illustrative candidate fixture against the original assessment/profile if available.
- A deployed demo is optional and was not requested/performed. Do not invent a URL or claim deployment.

## Reviewer walkthrough

1. Extract the ZIP and open the career-mobility-platform directory.
2. Install with pnpm install --frozen-lockfile (pnpm.cmd in restricted Windows PowerShell).
3. Copy .env.example to .env.local. Default mode is the labeled mock demo.
4. Run pnpm dev, open Home, choose Create Profile and load the illustrative candidate.
5. Save & View Matches; inspect strong, partial, mandatory-language and unknown-internship results.
6. Open Details, review criterion points/findings, save, open Saved, refresh, then remove.
7. Edit experience/skills, save and confirm recomputed recommendations/Saved scores.
8. Follow README for tests or docs/backend.md for real Supabase mode.

## Unsent submission template

Subject: Technical Assessment – Full-Stack Developer – [Your full name]

Hello [recipient],

Please find attached the source package for my Career Mobility Platform assessment. The README contains local setup, mock-mode instructions and Supabase setup. The package includes the technical note, requirement checklist, test evidence and AI/tool disclosure.

Implemented: profile editing, explainable deterministic matching, full opportunity details and persistent shortlist management across five responsive screens.

Verification: see docs/test-evidence.md for executed local results. Hosted Supabase verification requires project configuration and is not claimed in this package. The sample profile is illustrative because the original assessment profile was unavailable during implementation.

Repository: [optional accessible URL]
Demo: [optional deployed URL, otherwise state local setup provided]
Name: [your full name]

Regards,
[Your full name]

This is a local draft only; no email or external message has been sent.
