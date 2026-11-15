# Phase 7 final QA and packaging

Local functional implementation, documentation and submission preparation are complete, subject to the external items listed below. No deployment, repository publication or outbound assessment message was requested or performed.

## Final QA

- 73 unit/integration tests passed, including the actual migration/RLS in embedded PostgreSQL.
- 23 production-browser tests passed with no failures, flaky cases or skips.
- All five screens were checked at 320/375/390/768/1024/1280/1440/1920px.
- Automated axe A/AA scans cover the five populated pages, mobile drawer, empty profile and validation errors. Detected violations: zero; any incomplete items remain in accessibility.json for manual review.
- Lint, TypeScript, production build, dataset validation and seed dry-run passed.
- Existing desktop/mobile screenshot evidence was refreshed and copied into the submission docs.

Two final-review changes were made: muted foreground text was darkened centrally from #64748b to #5b6b82 after detecting 4.34:1 contrast on muted surfaces, and score displays gained explicit accessible semantics. The opportunity error boundary now uses the installed Next.js supported retry callback. These changes were included in the final build/browser checks.

## Archive verification

The package command copies an allowlist of source/configuration/docs/tests/migrations and creates a source ZIP, per-file SHA-256 manifest and external ZIP checksum. It excludes dependency/build directories, Git history, credentials and transient browser traces.

The verification command checks the ZIP checksum, rejects unsafe archive paths, extracts into a new workspace-local reviewer directory, verifies every manifest hash and required files, then records the source directory. Clean-install/build/test results are recorded in evidence/reviewer-install.json when completed. The final runtime fingerprint must match the tested extracted source; final documentation/evidence updates are excluded from that fingerprint.

Archive clean-install verification: **passed** in a standalone extracted directory outside the development repository. Frozen/offline installation used the cached package store, the supplied .env.example was copied to .env.local, standard production build passed, and all 73 tests passed again. HTTP smoke checks returned Home 200, fifteen opportunities and fifteen calculated matches (Programme Assistant 100). All 168 candidate source-file hashes matched before recording the check. See [reviewer-install.json](evidence/reviewer-install.json).

Final documentation/evidence was completed afterward. The final archive verifier checks every final file and confirms its runtime fingerprint still matches that clean-built source. Generated artifact folders are excluded from lint/TypeScript, so packaging a reviewer copy inside the workspace does not add a second application to static analysis.

The remaining axe incomplete item is aria-hidden-focus in the open Sheet. Twelve consecutive Tab steps remained inside the dialog, and Escape/focus-return tests passed. It is retained for assistive-technology review, rather than being reported as a completed full screen-reader audit.

## Explicit external items

| Item                                              | Status / next action                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Hosted Supabase migration/seed/Auth/PostgREST/RLS | Credentials not supplied. Apply setup and run verify:supabase in a development project; do not describe local tests as hosted verification |
| Original assessment/profile                       | Not supplied. Reconcile the illustrative fixture and traceability if the original becomes available                                        |
| Candidate full name/recipient                     | Not supplied. Fill the unsent template before sending                                                                                      |
| Repository access / live URL                      | Not supplied/not deployed. Source ZIP and local instructions provided; deployed demo optional                                              |
| Full assistive-technology audit                   | Not claimed. Automated results, keyboard checks and incomplete-rule notes included                                                         |

See submission.md for the concrete deliverables and unsent handoff template.
