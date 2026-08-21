import { expect, test } from "@playwright/test";
import { hasStagingConfiguration, signInThroughStagingBridge } from "./helpers/campus-one";

test.describe("staging Admin workspaces", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E requires dedicated bridge settings.");

  test.beforeEach(async ({ page }) => {
    await signInThroughStagingBridge(page, "admin");
  });

  test("Admin Home loads real dashboard counts without mock fallback", async ({ page }) => {
    await page.goto("/admin/home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-home-source='integrated']")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
    await expect(page.getByText("Items Requiring Attention")).toBeVisible();
    await expect(page.getByRole("button", { name: "New announcement" })).toBeVisible();
    await page.getByRole("button", { name: "Refresh campus operations" }).click();
    await expect(page.locator("[data-home-source='integrated']")).toBeVisible();
    await expect(page.getByText("Director Zainab Ahmed")).toHaveCount(0);
  });

  test("Approvals, People, Clubs, Events, and Announcements load live directories", async ({ page }) => {
    await page.goto("/admin/approvals", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-approvals-source='integrated']")).toBeVisible();

    await page.goto("/admin/people", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-people-source='integrated']")).toBeVisible();

    await page.goto("/admin/clubs", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-clubs-source='integrated']")).toBeVisible();

    await page.goto("/admin/events", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-events-source='integrated']")).toBeVisible();

    await page.goto("/admin/announcements", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-announcements-source='integrated']")).toBeVisible();
  });

  test("Notifications, Feedback, Analytics, and Activity Log load live data", async ({ page }) => {
    await page.goto("/admin/notifications", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-notifications-source='integrated']")).toBeVisible();

    await page.goto("/admin/feedback", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-feedback-source='integrated']")).toBeVisible();

    await page.goto("/admin/analytics", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-analytics-source='integrated']")).toBeVisible();

    await page.goto("/admin/activity", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-activity-source='integrated']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activity Log", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Delete|Clear history/i })).toHaveCount(0);
  });

  test("Profile is the authenticated Admin and More uses canonical routes", async ({ page }) => {
    await page.goto("/admin/profile", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-profile-source='integrated']")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Campus One Identity" })).toBeVisible();
    await expect(page.getByText("Read-Only Record")).toBeVisible();
    await expect(page.getByRole("button", { name: /Grant Admin|Edit Identity/i })).toHaveCount(0);

    await page.goto("/admin/more", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#admin-launcher-activity")).toBeVisible();
    await expect(page.locator("#admin-launcher-feedback")).toBeVisible();
    await expect(page.getByText("Feedback Manager")).toHaveCount(0);
    await page.locator("#admin-launcher-activity").click();
    await expect(page).toHaveURL(/\/admin\/activity$/);
  });
});
