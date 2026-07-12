import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("theme control persists an explicit dark preference", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Theme:/ }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("clubly-theme"))).toBe("dark");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/dark/);
});
