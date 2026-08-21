import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockNotificationsApi, mockProfileMe } from "./helpers";

test("Admin Notifications loads own records, filters unread, and marks one read", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockNotificationsApi(page);

  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "Notifications", exact: true })).toBeVisible();
  await expect(page.locator("[data-notifications-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proposal needs admin review" })).toBeVisible();
  await expect(page.getByText("1 New")).toBeVisible();
  await expectNoFeedbackManager(page);

  await page.getByRole("tab", { name: "Unread" }).click();
  await expect(page.getByRole("heading", { name: "Proposal needs admin review" })).toBeVisible();

  await page.getByRole("link", { name: "Review in Approvals" }).click();
  await expect(page).toHaveURL(/\/admin\/approvals/);
  expect(api.reads).toHaveLength(1);
  expect(api.reads[0].csrf).toBe("e2e-csrf-token");
  await page.goto("/admin/notifications");
  await expect(page.getByText("Unread")).toBeVisible();
  await expect(page.getByText("1 New")).toHaveCount(0);
});

test("Admin Notifications rejects unsafe destinations and keeps canonical links", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockNotificationsApi(page);
  await page.goto("/admin/notifications");
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator('a[href*="://"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Review in Approvals" })).toHaveAttribute("href", "/admin/approvals");
});

test("Notifications directory 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockNotificationsApi(page, { listStatus: 403 });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "No access to Notifications" })).toBeVisible();
  await expect(page.getByText("Google Cloud Buildathon")).toHaveCount(0);
});

test("Notifications directory 500 offers retry without mock records", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockNotificationsApi(page, { listStatus: 500 });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "Notifications could not be loaded" })).toBeVisible();
  await expect(page.getByText("Proposal needs admin review")).toHaveCount(0);
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Proposal needs admin review" })).toBeVisible();
});

test("student president executive and advisor cannot open Admin Notifications workspace as Admin", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
});

test("expired session on Notifications shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
});

test("desktop and mobile light and dark Notifications layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockNotificationsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/notifications");
  await expect(page.getByRole("heading", { name: "Notifications", exact: true })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("heading", { name: "Proposal needs admin review" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Notifications", exact: true })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Details" })).toBeVisible();
});
