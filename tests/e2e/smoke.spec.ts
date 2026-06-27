import { expect, test } from "@playwright/test";

test("app loads from the local dev server", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toContainText("Club Services");
});
