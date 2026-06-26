import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile viewport supports student dashboard, notifications, and QR check-in", async ({ page }) => {
  const state = createE2EState();
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hello, E2E/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Join a Club/i })).toBeVisible();

  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await expect(page.getByText("Dues proof approved for Nile Tech Club. No action needed.")).toBeVisible();

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`);
  await expect(page.getByRole("heading", { name: "Check-in recorded" })).toBeVisible();
});

test("mobile viewport supports president dashboard actions", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("Club Setup Checklist")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Assign task", exact: true }).first()).toBeVisible();
});
