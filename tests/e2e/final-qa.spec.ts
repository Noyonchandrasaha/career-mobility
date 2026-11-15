import { readFileSync } from "node:fs"
import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
const sample = JSON.parse(
  readFileSync(
    new URL("../../src/data/sample-profile.json", import.meta.url),
    "utf8"
  )
)
const id = "00000000-0000-4000-8000-000000000001"
async function seed(page: Page) {
  await page.addInitScript(
    ({ profile, id }) => {
      if (localStorage.getItem("career-mobility:demo:v1")) return
      const candidateId = "10000000-0000-4000-8000-000000000001"
      localStorage.setItem(
        "career-mobility:demo:v1",
        JSON.stringify({
          version: 1,
          candidateId,
          profile,
          saved: [
            {
              id: "20000000-0000-4000-8000-000000000001",
              candidateId,
              opportunityId: id,
              createdAt: "2026-11-15T10:00:00.000Z",
            },
          ],
        })
      )
    },
    { profile: sample, id }
  )
}
async function ready(page: Page, path: string) {
  await page.goto(path)
  if (path === "/profile")
    await expect(
      page.getByLabel("Field of study", { exact: true })
    ).toHaveValue("business administration")
  if (path === "/recommendations")
    await expect(page.getByTestId("opportunity-card")).toHaveCount(15)
  if (path.startsWith("/opportunities/"))
    await expect(page.getByRole("progressbar")).toHaveCount(5)
  if (path === "/saved")
    await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(1)
}
for (const [name, routes] of [
  ["public and profile", ["/", "/profile"]],
  ["recommendations and details", ["/recommendations", "/opportunities/" + id]],
  ["saved", ["/saved"]],
] as const) {
  test("final responsive QA: " + name, async ({ page }) => {
    await seed(page)
    for (const path of routes) {
      await ready(page, path)
      for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          ),
          path + " at " + width
        ).toBe(true)
      }
    }
  })
}

test("automated WCAG A/AA scan on all five pages and the mobile drawer", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000)
  await seed(page)
  const report = []
  for (const path of [
    "/",
    "/profile",
    "/recommendations",
    "/opportunities/" + id,
    "/saved",
  ]) {
    await ready(page, path)
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    report.push({
      path,
      violations: result.violations,
      incomplete: result.incomplete.map((item) => ({
        id: item.id,
        description: item.description,
      })),
    })
    expect
      .soft(result.violations, "Accessibility violations on " + path)
      .toEqual([])
  }
  await page.setViewportSize({ width: 375, height: 812 })
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("dialog")).not.toHaveAttribute(
    "data-starting-style",
    ""
  )
  await page.getByRole("dialog").evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {}))
    )
  })
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press("Tab")
    expect(
      await page
        .getByRole("dialog")
        .evaluate((element) => element.contains(document.activeElement))
    ).toBe(true)
  }
  const drawer = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  report.push({
    path: "/saved (mobile drawer)",
    violations: drawer.violations,
    incomplete: drawer.incomplete.map((item) => ({
      id: item.id,
      description: item.description,
    })),
  })
  expect.soft(drawer.violations).toEqual([])
  await page.keyboard.press("Escape")
  await page.evaluate(() => {
    const key = "career-mobility:demo:v1"
    const state = JSON.parse(localStorage.getItem(key)!)
    state.profile = null
    state.saved = []
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.goto("/profile")
  await expect(page.getByLabel("Field of study", { exact: true })).toHaveValue(
    ""
  )
  for (const invalid of [false, true]) {
    if (invalid)
      await page
        .getByRole("button", { name: "Save Profile", exact: true })
        .click()
    const scanned = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    report.push({
      path: invalid ? "/profile (validation errors)" : "/profile (empty)",
      violations: scanned.violations,
      incomplete: scanned.incomplete.map((item) => ({
        id: item.id,
        description: item.description,
      })),
    })
    expect.soft(scanned.violations).toEqual([])
  }
  await testInfo.attach("accessibility-summary", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  })
})
