import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("feedback manager can review and export feedback without admin navigation", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "feedback_manager");

  await page.goto("/feedback");

  await expect(page.getByRole("heading", { name: "Feedback Inbox", exact: true })).toBeVisible();
  await expect(page.getByText("App Feedback Inbox")).toBeVisible();
  await expect(page.getByText("Keep improving")).toBeVisible();
  await expect(page.getByRole("link", { name: /User Management/i })).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("Feedback");
});

test("feedback manager status filters and clear filters work", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "feedback_manager");

  await page.goto("/feedback");

  await expect(page.getByRole("heading", { name: "Feedback Inbox", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /App Feedback|Feedback/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Discover Clubs|Members|User Management/i })).toHaveCount(0);

  await page.getByRole("combobox").nth(1).click();
  await expect(page.getByRole("option", { name: "New / Open" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Reviewed" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Archived" })).toBeVisible();
  await page.getByRole("option", { name: "Reviewed" }).click();
  await expect(page.getByText("Timeline labels were unclear")).toBeVisible();

  await page.getByRole("combobox").nth(2).click();
  await page.getByRole("option", { name: "Students" }).click();
  await expect(page.getByText("No feedback matches these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("Keep improving")).toBeVisible();
});

test("feedback manager notification links stay within feedback tools", async ({ page }) => {
  const state = createE2EState();
  state.notifications = [
    {
      id: "notification-fm-feedback-1",
      user_id: "e2e-feedback_manager",
      proposal_id: null,
      announcement_id: null,
      type: "feedback",
      message: "New feedback needs review from Club Services.",
      delivery_status: "unread",
      created_at: "2026-06-22T10:00:00.000Z"
    },
    {
      id: "notification-fm-event-1",
      user_id: "e2e-feedback_manager",
      proposal_id: "proposal-tech-demo",
      announcement_id: null,
      type: "event",
      message: "Event report pending review for Build Night.",
      delivery_status: "queued",
      created_at: "2026-06-22T10:00:00.000Z"
    },
    {
      id: "notification-fm-announcement-1",
      user_id: "e2e-feedback_manager",
      proposal_id: null,
      announcement_id: "announcement-1",
      type: "announcement",
      message: "New club announcement: Welcome to OneClub.",
      delivery_status: "unread",
      created_at: "2026-06-22T10:00:00.000Z"
    }
  ];
  await mockClubServicesApi(page, state);
  await loginAs(page, "feedback_manager");

  await page.goto("/notifications");

  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await page.getByText("New feedback needs review from Club Services.").click();
  await expect(page).toHaveURL(/\/feedback$/);

  await page.goto("/notifications");
  await page.getByText("Event report pending review for Build Night.").click();
  await expect(page).toHaveURL(/\/feedback$/);

  await page.goto("/notifications");
  await page.getByText("New club announcement: Welcome to OneClub.").click();
  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByText("linked workflow is outside app-feedback access")).toBeVisible();
});
