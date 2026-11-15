import { readFileSync } from "node:fs"
import { expect, test, type Page } from "@playwright/test"
const sample = JSON.parse(
  readFileSync(
    new URL("../../src/data/sample-profile.json", import.meta.url),
    "utf8"
  )
)
const userId = "10000000-0000-4000-8000-000000000001"
const jobId = (number: number) =>
  "00000000-0000-4000-8000-" + String(number).padStart(12, "0")
function bookmark(number: number) {
  return {
    id: "20000000-0000-4000-8000-" + String(number).padStart(12, "0"),
    candidateId: userId,
    opportunityId: jobId(number),
    createdAt: "2026-11-15T10:00:00.000Z",
  }
}
async function seed(page: Page, numbers: number[], profile = sample) {
  await page.addInitScript(
    (state) => {
      if (!localStorage.getItem("career-mobility:demo:v1"))
        localStorage.setItem("career-mobility:demo:v1", JSON.stringify(state))
    },
    { version: 1, candidateId: userId, profile, saved: numbers.map(bookmark) }
  )
}

test("public home to profile, matches, details, saved, reload and keyboard removal", async ({
  page,
}) => {
  let authRequests = 0
  page.on("request", (request) => {
    if (request.url().endsWith("/api/session")) authRequests++
  })
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Discover international career opportunities"
  )
  await expect(
    page.getByRole("figure", { name: "Illustrative profile matching example" })
  ).toContainText("Example only.")
  expect(
    await page.evaluate(() => localStorage.getItem("career-mobility:demo:v1"))
  ).toBeNull()
  expect(authRequests).toBe(0)
  await page.getByRole("link", { name: /How It Works/ }).click()
  await expect(page.locator("#how-it-works")).toBeInViewport()
  await page
    .getByRole("link", { name: "Explore Opportunities", exact: true })
    .click()
  await expect(page).toHaveURL(/\/profile$/)
  await page.getByRole("button", { name: "Load Sample Candidate" }).click()
  await page
    .getByRole("button", { name: "Save & View Matches", exact: true })
    .click()
  const card = page.locator('[data-opportunity-id="' + jobId(1) + '"]')
  await card
    .getByRole("button", {
      name: "Save opportunity: Programme Assistant",
      exact: true,
    })
    .click()
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
  await page.getByRole("link", { name: "Saved Jobs", exact: true }).click()
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(1)
  await expect(
    page.getByText("1 saved opportunity", { exact: true })
  ).toBeVisible()
  await page.reload()
  const savedCard = page.getByTestId("saved-opportunity-card")
  await expect(savedCard).toHaveCount(1)
  await expect(
    savedCard.locator('[aria-label="Profile match: 100 out of 100"]')
  ).toBeVisible()
  await savedCard
    .getByRole("button", {
      name: "Remove saved opportunity: Programme Assistant",
      exact: true,
    })
    .focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("heading", {
      name: "No Saved Opportunities Yet",
      exact: true,
    })
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole("heading", {
      name: "No Saved Opportunities Yet",
      exact: true,
    })
  ).toBeVisible()
  await page
    .getByRole("link", { name: "Explore Recommendations", exact: true })
    .click()
  await expect(
    page
      .locator('[data-opportunity-id="' + jobId(1) + '"]')
      .getByRole("button", {
        name: "Save opportunity: Programme Assistant",
        exact: true,
      })
  ).toHaveAttribute("aria-pressed", "false")
})

test("home Explore uses the existing profile and exposes storage failure without false navigation", async ({
  page,
}) => {
  await seed(page, [])
  await page.goto("/")
  await page
    .getByRole("link", { name: "Explore Opportunities", exact: true })
    .click()
  await expect(page).toHaveURL(/\/recommendations$/)
  await expect(page.getByTestId("opportunity-card")).toHaveCount(15)
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (
        key === "career-mobility:demo:v1" &&
        !(window as unknown as { allowHomeRead: boolean }).allowHomeRead
      )
        throw new DOMException("Denied")
      return original.call(this, key)
    }
  })
  await page.goto("/")
  await page
    .getByRole("link", { name: "Explore Opportunities", exact: true })
    .click()
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Browser storage is unavailable" })
  ).toBeVisible()
  await expect(page).toHaveURL("/")
  await page.evaluate(() => {
    ;(window as unknown as { allowHomeRead: boolean }).allowHomeRead = true
  })
  await page
    .getByRole("link", { name: "Explore Opportunities", exact: true })
    .click()
  await expect(page).toHaveURL(/\/recommendations$/)
})

test("saved unavailable records have no stale score or details action and remain removable", async ({
  page,
}) => {
  await seed(page, [1, 99])
  await page.goto("/saved")
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(2)
  await expect(
    page.getByText("2 saved opportunities", { exact: true })
  ).toBeVisible()
  await expect(page.getByText("1 unavailable", { exact: true })).toBeVisible()
  const unavailable = page.locator('[data-opportunity-id="' + jobId(99) + '"]')
  await expect(
    unavailable.getByRole("heading", {
      name: "Unavailable opportunity",
      exact: true,
    })
  ).toBeVisible()
  await expect(unavailable.getByRole("link")).toHaveCount(0)
  await expect(
    unavailable.locator("[aria-label^='Profile match:']")
  ).toHaveCount(0)
  await unavailable
    .getByRole("button", {
      name: "Remove saved opportunity: Unavailable opportunity",
      exact: true,
    })
    .click()
  await expect(unavailable).toHaveCount(0)
  await expect(
    page.getByText("1 saved opportunity", { exact: true })
  ).toBeVisible()
  await page.reload()
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(1)
})

test("failed removal retains the card/count and retry removes only the intended item", async ({
  page,
}) => {
  await seed(page, [1, 2])
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "career-mobility:demo:v1" &&
        (window as unknown as { failRemoval: boolean }).failRemoval
      )
        throw new DOMException("Quota", "QuotaExceededError")
      original.call(this, key, value)
    }
  })
  await page.goto("/saved")
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(2)
  const card = page.locator('[data-opportunity-id="' + jobId(1) + '"]')
  const button = card.getByRole("button", {
    name: "Remove saved opportunity: Programme Assistant",
    exact: true,
  })
  await expect(button).toBeEnabled()
  await page.evaluate(() => {
    ;(window as unknown as { failRemoval: boolean }).failRemoval = true
  })
  await button.click()
  await expect(card.getByRole("alert")).toContainText(
    "Your saved item is still here."
  )
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(2)
  await expect(
    page.getByText("2 saved opportunities", { exact: true })
  ).toBeVisible()
  await page.evaluate(() => {
    ;(window as unknown as { failRemoval: boolean }).failRemoval = false
  })
  await button.click()
  await expect(card).toHaveCount(0)
  await expect(
    page.locator('[data-opportunity-id="' + jobId(2) + '"]')
  ).toBeVisible()
  await expect(
    page.getByText("1 saved opportunity", { exact: true })
  ).toBeVisible()
})

test("saved current scores change after profile edits and saved records work without a profile", async ({
  page,
}) => {
  await seed(page, [11])
  await page.goto("/saved")
  await expect(
    page.locator('[aria-label="Profile match: 68 out of 100"]')
  ).toBeVisible()
  await page.getByRole("link", { name: "My Profile", exact: true }).click()
  await page.getByLabel("Years of experience", { exact: true }).fill("8")
  await page.getByRole("button", { name: "Save Profile", exact: true }).click()
  await expect(page.getByText("Profile saved.", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Saved Jobs", exact: true }).click()
  await expect(
    page.locator('[aria-label="Profile match: 83 out of 100"]')
  ).toBeVisible()
  await page.evaluate(() => {
    const key = "career-mobility:demo:v1"
    const state = JSON.parse(localStorage.getItem(key)!)
    state.profile = null
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.reload()
  const card = page.getByTestId("saved-opportunity-card")
  await expect(card).toHaveCount(1)
  await expect(
    card.getByRole("link", { name: /^Create Profile/ })
  ).toBeVisible()
  await expect(card.locator("[aria-label^='Profile match:']")).toHaveCount(0)
  await expect(
    card.getByRole("button", {
      name: "Remove saved opportunity: Senior Project Manager",
      exact: true,
    })
  ).toBeEnabled()
})

test("saved load delay/failure can be retried without a false empty state", async ({
  page,
}) => {
  await seed(page, [1])
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
            message: "Test match service unavailable.",
          },
        }),
      })
    else await route.continue()
  })
  await page.goto("/saved")
  await expect(
    page.getByRole("status", {
      name: "Loading saved opportunities",
      exact: true,
    })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "No Saved Opportunities Yet" })
  ).toHaveCount(0)
  release()
  await expect(
    page.getByRole("heading", { name: "Could not load saved opportunities" })
  ).toBeVisible()
  fail = false
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(1)
})

test("home and saved layouts fit small screens and public drawer returns focus", async ({
  page,
}) => {
  await seed(page, [10, 99])
  await page.goto("/")
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    if (width < 768) {
      const menu = page.getByRole("button", {
        name: "Open navigation",
        exact: true,
      })
      await menu.focus()
      await page.keyboard.press("Enter")
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(menu).toBeFocused()
    }
  }
  await page.evaluate(() => {
    ;(document.activeElement as HTMLElement)?.blur()
    window.scrollTo(0, 0)
  })
  await page.screenshot({ path: "test-results/home-desktop.png" })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: "test-results/home-mobile.png" })
  await page.goto("/saved")
  await expect(page.getByTestId("saved-opportunity-card")).toHaveCount(2)
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  }
  await page.screenshot({ path: "test-results/saved-desktop.png" })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: "test-results/saved-mobile.png" })
})
