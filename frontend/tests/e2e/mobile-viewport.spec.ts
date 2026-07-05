import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile viewport supports student dashboard, notifications, and QR check-in", async ({ page }) => {
  const state = createE2EState();
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Hello, E2E/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Discover Clubs/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Announcements/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View Announcements" })).toBeVisible();
  await expect(page.getByText("Menu")).toBeVisible();
  await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
  await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();

  await page.goto("/notifications", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await expect(page.getByText("Dues proof approved for Nile Tech Club. No action needed.")).toBeVisible();

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Check-in recorded" })).toBeVisible();
});

test("mobile viewport shows student membership tracker", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership/clubs/club-tech", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Membership Progress" })).toBeVisible();
  await expect(page.getByText("Choose Club", { exact: true })).toBeVisible();
  await expect(page.getByText("Await Approval", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue Membership Setup", exact: true })).toHaveCount(1);
});

test("mobile viewport supports president dashboard actions", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("Club Setup Checklist")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Create Event Proposal", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Assign Tasks", exact: true }).first()).toBeVisible();
});

test("mobile viewport shows admin needs-action queues", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Admin Operations" })).toBeVisible();
  await expect(page.getByText("Needs Action Today")).toBeVisible();
  await expect(page.getByRole("link", { name: /Review Payments/i })).toBeVisible();
});

test("mobile viewport limits feedback manager menu to feedback tools", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "feedback_manager");

  await page.goto("/feedback", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Feedback Inbox", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
  await expect(page.getByRole("link", { name: /App Feedback|Feedback/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /User Management|Members|Discover Clubs/i })).toHaveCount(0);
});
