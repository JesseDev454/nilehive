import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("theme control swaps directly between explicit light and dark preferences", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("clubly-theme"))).toBe("dark");
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("clubly-theme"))).toBe("light");
});

test("legacy system preference is migrated to light", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("clubly-theme", "system"));
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveClass(/light/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("clubly-theme"))).toBe("light");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
});

test("explicit dark preference persists after reload", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/dark/);
});
