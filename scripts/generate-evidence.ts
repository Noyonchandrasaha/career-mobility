import { strict as assert } from "node:assert"
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises"
import { resolve, relative, sep } from "node:path"
import { opportunities, sampleProfile } from "../src/data"
import { evaluateOpportunity } from "../src/features/matching"
import type { CandidateProfile } from "../src/types/domain"

const root = resolve(process.cwd())
const directory = resolve(root, "docs/evidence")
await mkdir(resolve(directory, "screenshots"), { recursive: true })
const definitions = [
  {
    name: "Strong match",
    job: 1,
    profile: sampleProfile,
    score: 100,
    status: "no_identified_blocker",
  },
  {
    name: "Partial match",
    job: 5,
    profile: sampleProfile,
    score: 83,
    status: "no_identified_blocker",
  },
  {
    name: "Critical enrollment gap",
    job: 9,
    profile: { ...sampleProfile, studentStatus: "no" } as CandidateProfile,
    score: 88,
    status: "blocked",
  },
  {
    name: "Unknown eligibility",
    job: 9,
    profile: sampleProfile,
    score: 88,
    status: "requires_verification",
  },
  {
    name: "Mandatory German gap",
    job: 10,
    profile: sampleProfile,
    score: 81,
    status: "blocked",
  },
]
const scenarios = definitions.map((definition) => {
  const opportunity = opportunities[definition.job - 1]
  const actual = evaluateOpportunity(definition.profile, opportunity)
  assert.equal(actual.score, definition.score)
  assert.equal(actual.eligibilityStatus, definition.status)
  if (definition.job === 5)
    assert.deepEqual(actual.missingSkills, ["sql", "data visualization"])
  if (definition.name === "Critical enrollment gap")
    assert(actual.gaps.some((gap) => gap.includes("not enrolled")))
  return {
    name: definition.name,
    input: { profile: definition.profile, opportunity },
    expected: { score: definition.score, eligibilityStatus: definition.status },
    actual,
    passed: true,
  }
})
const vitest = JSON.parse(
  await readFile(resolve(directory, "vitest-results.json"), "utf8")
)
const playwright = JSON.parse(
  await readFile(resolve(directory, "playwright-results.json"), "utf8")
)
function accessibilityAttachment(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return
  const item = value as Record<string, unknown>
  if (item.name === "accessibility-summary" && typeof item.body === "string")
    return item.body
  for (const entry of Object.values(item)) {
    if (Array.isArray(entry)) {
      for (const child of entry) {
        const found = accessibilityAttachment(child)
        if (found) return found
      }
    } else {
      const found = accessibilityAttachment(entry)
      if (found) return found
    }
  }
}
const attached = accessibilityAttachment(playwright)
assert(attached, "Accessibility evidence is required.")
const accessibility = JSON.parse(
  Buffer.from(attached, "base64").toString("utf8")
) as { path: string; violations: unknown[]; incomplete: unknown[] }[]
assert(
  accessibility.length >= 8 &&
    accessibility.every((item) => item.violations.length === 0),
  "Accessibility scans must pass."
)
await writeFile(
  resolve(directory, "accessibility.json"),
  JSON.stringify(accessibility, null, 2) + "\n"
)
assert(
  vitest.success && vitest.numFailedTests === 0,
  "Unit/integration suite must pass."
)
assert(
  playwright.stats.expected > 0 &&
    playwright.stats.unexpected === 0 &&
    playwright.stats.flaky === 0 &&
    playwright.stats.skipped === 0,
  "Browser suite must pass without flaky/skipped cases."
)
function sanitize(value: unknown): unknown {
  if (typeof value === "string")
    return value
      .replaceAll(root, ".")
      .replaceAll(root.replaceAll(sep, "/"), ".")
  if (Array.isArray(value)) return value.map(sanitize)
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitize(entry)])
    )
  return value
}
await writeFile(
  resolve(directory, "vitest-results.json"),
  JSON.stringify(sanitize(vitest), null, 2) + "\n"
)
await writeFile(
  resolve(directory, "playwright-results.json"),
  JSON.stringify(sanitize(playwright), null, 2) + "\n"
)
await writeFile(
  resolve(directory, "matching-scenarios.json"),
  JSON.stringify(
    {
      fixture:
        "Illustrative candidate, not a verified copy of the unavailable original assessment profile.",
      scenarios,
    },
    null,
    2
  ) + "\n"
)
const screenshots = [
  "home-desktop.png",
  "home-mobile.png",
  "profile-desktop.png",
  "profile-mobile.png",
  "recommendations-desktop.png",
  "opportunity-mobile.png",
  "saved-desktop.png",
  "saved-mobile.png",
]
for (const file of screenshots)
  await copyFile(
    resolve(root, "test-results", file),
    resolve(directory, "screenshots", file)
  )
const summary = {
  generatedAt: new Date().toISOString(),
  mode: "mock",
  unitIntegration: {
    passed: vitest.numPassedTests,
    failed: vitest.numFailedTests,
  },
  browser: {
    passed: playwright.stats.expected,
    failed: playwright.stats.unexpected,
    flaky: playwright.stats.flaky,
    skipped: playwright.stats.skipped,
  },
  matchingScenarios: scenarios.length,
  accessibility: {
    scannedStates: accessibility.length,
    violations: 0,
    manualReviewItems: accessibility.reduce(
      (sum, item) => sum + item.incomplete.length,
      0
    ),
  },
  screenshots: screenshots.map((file) =>
    relative(root, resolve(directory, "screenshots", file)).replaceAll(sep, "/")
  ),
  hostedSupabase: "NOT_RUN: no project credentials supplied",
  originalAssessment: "NOT_AVAILABLE",
  productionDeployment: "NOT_PERFORMED",
}
await writeFile(
  resolve(directory, "summary.json"),
  JSON.stringify(summary, null, 2) + "\n"
)
console.log(
  `Evidence generated: ${summary.unitIntegration.passed} unit/integration tests, ${summary.browser.passed} browser tests, ${scenarios.length} matching scenarios, ${screenshots.length} screenshots.`
)
