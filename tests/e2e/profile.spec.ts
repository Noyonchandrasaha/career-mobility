import { expect, test } from "@playwright/test"

test("create, validate, edit, save, reload and navigate with a persisted profile", async ({
  page,
}) => {
  const runtimeErrors: string[] = []
  page.on("pageerror", (error) => runtimeErrors.push(error.message))
  await page.goto("/profile")
  await expect(
    page.getByRole("heading", { name: "Your Career Profile", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Save Profile", exact: true }).click()
  await expect(page.locator("#field-educationLevel")).toBeFocused()
  await expect(
    page.getByRole("alert").filter({ hasText: "review the highlighted fields" })
  ).toContainText("review the highlighted fields")
  await page.getByRole("button", { name: "Load Sample Candidate" }).click()
  await expect(page.getByLabel("Field of study", { exact: true })).toHaveValue(
    "business administration"
  )
  await expect(
    page.getByLabel("Work authorization — Canada", { exact: true })
  ).toHaveValue("unknown")
  await expect(
    page.getByLabel("Currently enrolled as a student?", { exact: true })
  ).toHaveValue("unknown")
  await page
    .getByLabel("Field of study", { exact: true })
    .fill("Business administration updated")
  await page.getByRole("button", { name: "Load Sample Candidate" }).click()
  await expect(page.getByRole("alertdialog")).toBeVisible()
  await page.getByRole("button", { name: "Keep my edits" }).click()
  await expect(page.getByLabel("Field of study", { exact: true })).toHaveValue(
    "Business administration updated"
  )
  await page.getByLabel("Your skills", { exact: true }).fill("MS Excel")
  await page.getByLabel("Your skills", { exact: true }).press("Enter")
  await expect(
    page.getByRole("button", { name: "Remove skill excel", exact: true })
  ).toHaveCount(1)
  await page.getByRole("button", { name: "Add language", exact: true }).click()
  await page.getByLabel("Language 3", { exact: true }).selectOption("German")
  await page
    .getByLabel("Proficiency 3", { exact: true })
    .selectOption("professional")
  await expect(
    page
      .getByLabel("Language 3", { exact: true })
      .locator('option[value="English"]')
  ).toBeDisabled()
  await page
    .getByRole("button", { name: "Remove language 3", exact: true })
    .click()
  await page
    .getByLabel("Work authorization — Canada", { exact: true })
    .selectOption("yes")
  await page.getByRole("checkbox", { name: "Canada", exact: true }).uncheck()
  await expect(
    page.getByLabel("Work authorization — Canada", { exact: true })
  ).toHaveCount(0)
  await page.getByRole("checkbox", { name: "Canada", exact: true }).check()
  await expect(
    page.getByLabel("Work authorization — Canada", { exact: true })
  ).toHaveValue("yes")
  await page.getByRole("button", { name: "Save Profile", exact: true }).click()
  await expect(page.getByText("Profile saved.", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("Field of study", { exact: true })).toHaveValue(
    "Business administration updated"
  )
  await page
    .getByLabel("Experience summary", { exact: true })
    .fill("An unsaved draft that should survive workspace navigation.")
  await page.getByRole("link", { name: "Recommendations", exact: true }).click()
  await page.getByRole("link", { name: "My Profile", exact: true }).click()
  await expect(
    page.getByLabel("Experience summary", { exact: true })
  ).toHaveValue("An unsaved draft that should survive workspace navigation.")
  await page
    .getByRole("button", { name: "Save & View Matches", exact: true })
    .click()
  await expect(page).toHaveURL(/\/recommendations$/)
  await expect(
    page.getByRole("heading", { name: "Your Career Matches", exact: true })
  ).toBeVisible()
  await expect(page.getByText(/15 opportunities evaluated/)).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test("failed storage save preserves edits and stays on profile until a successful retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "career-mobility:demo:v1" &&
        (window as unknown as { failDemoWrite: boolean }).failDemoWrite
      )
        throw new DOMException("Test quota failure", "QuotaExceededError")
      original.call(this, key, value)
    }
  })
  await page.goto("/profile")
  await page.getByRole("button", { name: "Load Sample Candidate" }).click()
  await page.evaluate(() => {
    ;(window as unknown as { failDemoWrite: boolean }).failDemoWrite = true
  })
  await page
    .getByRole("button", { name: "Save & View Matches", exact: true })
    .click()
  await expect(
    page.getByRole("alert").filter({ hasText: "Your edits are still here." })
  ).toBeVisible()
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByLabel("Field of study", { exact: true })).toHaveValue(
    "business administration"
  )
  await page.evaluate(() => {
    ;(window as unknown as { failDemoWrite: boolean }).failDemoWrite = false
  })
  await page.getByRole("button", { name: "Retry save", exact: true }).click()
  await expect(page).toHaveURL(/\/recommendations$/)
})

test("session/storage initialization exposes a retry without discarding data", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = function (key) {
      if (
        key === "career-mobility:demo:v1" &&
        !(window as unknown as { allowDemoRead: boolean }).allowDemoRead
      )
        throw new DOMException("Storage denied")
      return original.call(this, key)
    }
  })
  await page.goto("/profile")
  await expect(
    page.getByRole("heading", { name: "Your workspace is unavailable" })
  ).toBeVisible()
  await page.evaluate(() => {
    ;(window as unknown as { allowDemoRead: boolean }).allowDemoRead = true
  })
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Your Career Profile", exact: true })
  ).toBeVisible()
})

test("responsive layout, drawer focus and keyboard save journey", async ({
  page,
}) => {
  await page.goto("/profile")
  await page.getByRole("button", { name: "Load Sample Candidate" }).click()
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(
      page.getByRole("heading", { name: "Your Career Profile", exact: true })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    if (width < 1024) {
      const menu = page.getByRole("button", {
        name: "Open navigation",
        exact: true,
      })
      await menu.focus()
      await page.keyboard.press("Enter")
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("dialog")).toBeHidden()
      await expect(menu).toBeFocused()
    } else {
      await expect(
        page.getByRole("complementary", { name: "Workspace sidebar" })
      ).toBeVisible()
    }
  }
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole("button", { name: "Save Profile", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("Profile saved.", { exact: true })).toBeVisible()
  await page.screenshot({
    path: "test-results/profile-mobile.png",
    fullPage: false,
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => {
    ;(document.activeElement as HTMLElement)?.blur()
    window.scrollTo(0, 0)
  })
  await page.screenshot({
    path: "test-results/profile-desktop.png",
    fullPage: false,
  })
})
