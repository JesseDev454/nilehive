import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("app loads from the local dev server", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.locator("body")).toContainText("Clubly");
});

test("student can open the dashboard without CampusOne SSO", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Hello, E2E/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Discover Clubs/i }).first()).toHaveAttribute("href", "/membership");
  await expect(page.getByRole("link", { name: /Announcements/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Feedback", exact: true })).toHaveAttribute("href", "/feedback");
});

test("admin can open the operations dashboard", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Admin Operations/i })).toBeVisible();
  await expect(page.getByText("Needs Action Today")).toBeVisible();
  await expect(page.getByRole("link", { name: /Review Members/i })).toHaveAttribute("href", "/membership?status=pending");
  await expect(page.getByRole("link", { name: /Review Payments/i })).toHaveAttribute("href", "/dues?status=submitted");
});

test("feedback manager is routed to feedback tools only", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "feedback_manager");

  await page.goto("/");

  await expect(page).toHaveURL(/\/feedback$/);
  await expect(page.getByRole("heading", { name: "Feedback Inbox", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /User Management/i })).toHaveCount(0);
});
