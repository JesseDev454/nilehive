import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("first-time student can complete discovery preferences and see transparent matches", async ({ page }) => {
  const state = createE2EState();
  state.clubPreferences = null;
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Find clubs that fit you" })).toBeVisible();
  await page.getByLabel("Tech", { exact: true }).check();
  await page.getByLabel("Technical", { exact: true }).check();
  await page.getByLabel("Build a portfolio", { exact: true }).check();
  await page.getByLabel("Weekday evening", { exact: true }).check();
  await page.getByLabel("3-5 hours", { exact: true }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("heading", { name: "Find clubs that fit you" })).toHaveCount(0);

  await page.goto("/membership", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Your Best Matches")).toBeVisible();
  await expect(page.getByText("100% match")).toBeVisible();
  await expect(page.getByText(/Interests: Tech/)).toBeVisible();
});

test("student shell keeps exact role capitalization and no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Student Mode", { exact: true })).toBeHidden();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByText("Student Mode", { exact: true })).toBeVisible();
  await expect(page.getByText("Announcements Preview", { exact: true })).toHaveCount(1);
});
