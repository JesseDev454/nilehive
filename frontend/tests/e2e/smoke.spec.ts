import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("app loads from the local dev server", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.locator("body")).toContainText("OneClub");
});

test("student can open the dashboard without CampusOne SSO", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Welcome back, E2E/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Discover Clubs/i }).first()).toHaveAttribute("href", "/membership");
  await expect(page.getByRole("link", { name: /Updates/i }).first()).toBeVisible();
});

test("admin can open the operations dashboard", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Operations Queue/i })).toBeVisible();
  await expect(page.getByText("A calm overview of the work that needs attention across campus clubs.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Open items/i })).toHaveAttribute("href", "/approvals");
  await expect(page.getByRole("link", { name: /Dues Proofs/i })).toHaveAttribute("href", "/dues?status=submitted");
});
