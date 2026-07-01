import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("student sees only role-safe notifications", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");

  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await expect(page.getByText("New club announcement: Welcome to Club Services")).toBeVisible();
  await expect(page.getByText("Dues proof approved for Nile Tech Club. No action needed.")).toBeVisible();
  await expect(page.getByText("Event reminder: Today Check-in Lab is ready for QR check-in.")).toBeVisible();
  await expect(page.getByText("Proposal needs advisor review")).toHaveCount(0);
  await expect(page.getByText("Task assigned: Prepare check-in desk.")).toHaveCount(0);
});

test("student follows an announcement notification deep link", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");

  await page.getByText("New club announcement: Welcome to Club Services").click();
  await expect(page).toHaveURL(/\/communications$/);
  await expect(page.getByText("Welcome to Club Services").first()).toBeVisible();
});

test("student follows a dues notification deep link", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");
  await page.getByText("Dues proof approved for Nile Tech Club. No action needed.").click();
  await expect(page).toHaveURL(/\/membership$/);
  await expect(page.getByRole("heading", { name: "Discover Clubs" })).toBeVisible();
});

test("student can mark an announcement preview as read from notification center", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");

  await expect(page.getByText("Welcome to Club Services").first()).toBeVisible();
  await page.getByRole("button", { name: "Mark read" }).click();
  await expect(page.getByText("Read", { exact: true })).toBeVisible();
});
