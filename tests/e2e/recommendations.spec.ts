import { readFileSync } from "node:fs"
import { expect, test, type Page } from "@playwright/test"
const sample = JSON.parse(
  readFileSync(
    new URL("../../src/data/sample-profile.json", import.meta.url),
    "utf8"
  )
)
const id = (number: number) =>
  "00000000-0000-4000-8000-" + String(number).padStart(12, "0")
async function seed(page: Page, profile = sample) {
  await page.addInitScript((profile) => {
    if (localStorage.getItem("career-mobility:demo:v1") === null)
      localStorage.setItem(
        "career-mobility:demo:v1",
        JSON.stringify({
          version: 1,
          candidateId: "10000000-0000-4000-8000-000000000001",
          profile,
          saved: [],
        })
      )
  }, profile)
}

test("recommendations show actual counts, all ranked cards and one batch evaluation", async ({
  page,
}) => {
  await seed(page)
  let requests = 0
  page.on("request", (request) => {
    if (request.url().endsWith("/api/match")) requests++
  })
  await page.goto("/recommendations")
  await expect(page.getByTestId("opportunity-card")).toHaveCount(15)
  const summary = page.getByRole("definition")
  await expect(summary).toHaveCount(4)
  await expect(summary.nth(0)).toHaveText("15")
  await expect(summary.nth(1)).toHaveText("13")
  await expect(summary.nth(2)).toHaveText("1")
  await expect(summary.nth(3)).toHaveText("1")
  const cards = page.getByTestId("opportunity-card")
  await expect(cards.nth(13)).toHaveAttribute(
    "data-eligibility",
    "requires_verification"
  )
  await expect(cards.nth(14)).toHaveAttribute("data-eligibility", "blocked")
  await expect(page.getByText(/A higher-scoring blocked role/)).toBeVisible()
  expect(requests).toBe(1)
  await page.screenshot({ path: "test-results/recommendations-desktop.png" })
})

test("cards and details share persisted save/remove state and full explanations", async ({
  page,
}) => {
  await seed(page)
  await page.goto("/recommendations")
  const card = page.locator('[data-opportunity-id="' + id(1) + '"]')
  const save = card.getByRole("button", {
    name: "Save opportunity: Programme Assistant",
    exact: true,
  })
  await expect(save).toBeEnabled()
  await save.click()
  await expect(
    card.getByRole("button", {
      name: "Remove saved opportunity: Programme Assistant",
      exact: true,
    })
  ).toHaveAttribute("aria-pressed", "true")
  await card
    .getByRole("link", {
      name: "View details: Programme Assistant",
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(new RegExp("/opportunities/" + id(1) + "$"))
  await expect(
    page.getByRole("heading", { name: "Programme Assistant", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("progressbar")).toHaveCount(5)
  await expect(
    page.getByRole("region", { name: "Match breakdown" })
  ).toContainText("35 / 35 points")
  await page.reload()
  const remove = page.getByRole("button", {
    name: "Remove saved opportunity: Programme Assistant",
    exact: true,
  })
  await expect(remove).toBeEnabled()
  await remove.click()
  await expect(
    page.getByRole("button", {
      name: "Save opportunity: Programme Assistant",
      exact: true,
    })
  ).toHaveAttribute("aria-pressed", "false")
  await page
    .getByRole("link", { name: "Back to Recommendations", exact: true })
    .click()
  await expect(
    page.locator('[data-opportunity-id="' + id(1) + '"]').getByRole("button", {
      name: "Save opportunity: Programme Assistant",
      exact: true,
    })
  ).toHaveAttribute("aria-pressed", "false")
})

test("mandatory language and unknown internship conditions are explained independently from score", async ({
  page,
}) => {
  await seed(page)
  await page.goto("/opportunities/" + id(10))
  const findings = page.getByRole("region", {
    name: "Eligibility findings",
    exact: true,
  })
  await expect(findings).toContainText("Blocked")
  await expect(findings).toContainText(
    "Mandatory German proficiency requirement is not met."
  )
  await expect(
    page.getByRole("progressbar", { name: "Language alignment", exact: true })
  ).toHaveAttribute("aria-valuenow", "50")
  await page.goto("/opportunities/" + id(9))
  await expect(findings).toContainText("Requires verification")
  await expect(findings).toContainText(
    "Current student enrollment requires verification."
  )
  await expect(findings).toContainText(
    "Local work authorization for Canada requires verification."
  )
  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: "test-results/opportunity-mobile.png" })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
})

test("missing profile permits job details, and invalid/unknown URLs return not found", async ({
  page,
}) => {
  await page.goto("/recommendations")
  await expect(
    page.getByRole("heading", { name: "Start with your career profile" })
  ).toBeVisible()
  await expect(page.getByTestId("opportunity-card")).toHaveCount(0)
  await page.goto("/opportunities/" + id(1))
  await expect(
    page.getByRole("heading", { name: "Opportunity requirements" })
  ).toBeVisible()
  await expect(
    page.getByText("Create a profile to view your match.", { exact: true })
  ).toBeVisible()
  await expect(page.getByRole("progressbar")).toHaveCount(0)
  for (const invalid of ["not-an-id", id(99)]) {
    const response = await page.goto("/opportunities/" + invalid)
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "Opportunity not found", exact: true })
    ).toBeVisible()
  }
})

test("loading, retry and zero-opportunity states do not fabricate results", async ({
  page,
}) => {
  await seed(page)
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  let fail = true
  await page.route("**/api/match", async (route) => {
    await gate
    if (fail)
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Test service unavailable.",
          },
        }),
      })
    else
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ total: 0, results: [] }),
      })
  })
  await page.goto("/recommendations")
  await expect(
    page.getByRole("status", { name: "Loading your matches", exact: true })
  ).toBeVisible()
  await expect(page.getByTestId("opportunity-card")).toHaveCount(0)
  release()
  await expect(
    page.getByRole("heading", { name: "Could not load your matches" })
  ).toBeVisible()
  fail = false
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await expect(
    page.getByRole("heading", {
      name: "No opportunities are currently available.",
    })
  ).toBeVisible()
  await expect(page.getByTestId("opportunity-card")).toHaveCount(0)
})

test("weak matches remain visible and details recalculate after editing the saved profile", async ({
  page,
}) => {
  await seed(page)
  await page.goto("/opportunities/" + id(11))
  await expect(
    page.locator('[aria-label="Profile match: 68 out of 100"]')
  ).toBeVisible()
  await page.getByRole("link", { name: "Edit Profile", exact: true }).click()
  await page.getByLabel("Years of experience", { exact: true }).fill("8")
  await page.getByRole("button", { name: "Save Profile", exact: true }).click()
  await expect(page.getByText("Profile saved.", { exact: true })).toBeVisible()
  await page.goto("/opportunities/" + id(11))
  await expect(
    page.locator('[aria-label="Profile match: 83 out of 100"]')
  ).toBeVisible()
  await page.goto("/recommendations")
  await expect(page.getByTestId("opportunity-card")).toHaveCount(15)
  await expect(
    page.locator('[data-opportunity-id="' + id(15) + '"]')
  ).toBeVisible()
})

test("failed bookmark writes retain the unsaved state and allow retry", async ({
  page,
}) => {
  await seed(page)
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "career-mobility:demo:v1" &&
        (window as unknown as { failBookmark: boolean }).failBookmark
      )
        throw new DOMException("Quota", "QuotaExceededError")
      original.call(this, key, value)
    }
  })
  await page.goto("/recommendations")
  const card = page.locator('[data-opportunity-id="' + id(1) + '"]')
  const button = card.getByRole("button", {
    name: "Save opportunity: Programme Assistant",
    exact: true,
  })
  await expect(button).toBeEnabled()
  await page.evaluate(() => {
    ;(window as unknown as { failBookmark: boolean }).failBookmark = true
  })
  await button.click()
  await expect(card.getByRole("alert")).toContainText("could not be saved")
  await expect(button).toHaveAttribute("aria-pressed", "false")
  await page.evaluate(() => {
    ;(window as unknown as { failBookmark: boolean }).failBookmark = false
  })
  await button.click()
  await expect(
    card.getByRole("button", {
      name: "Remove saved opportunity: Programme Assistant",
      exact: true,
    })
  ).toHaveAttribute("aria-pressed", "true")
})

test("public job requirements remain accessible when personal storage/session fails", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (key === "career-mobility:demo:v1")
        throw new DOMException("Storage unavailable")
      return original.call(this, key)
    }
  })
  await page.goto("/opportunities/" + id(1))
  await expect(
    page.getByRole("heading", { name: "Opportunity requirements" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Personal matching is unavailable" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", {
      name: "Save opportunity: Programme Assistant",
      exact: true,
    })
  ).toBeDisabled()
})
