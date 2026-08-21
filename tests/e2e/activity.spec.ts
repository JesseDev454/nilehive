import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockAuditLogsApi, mockProfileMe } from "./helpers";

test("Admin Activity Log loads audit records and details", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAuditLogsApi(page);
  await page.goto("/admin/activity");
  await expect(page.locator("[data-activity-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity Log", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open details for Proposal reviewed" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Delete|Clear history/i })).toHaveCount(0);
  await expectNoFeedbackManager(page);

  await page.getByRole("button", { name: "Open details for Proposal reviewed" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Protected field")).toBeVisible();
  await expect(dialog.getByText("approve", { exact: true })).toBeVisible();
});

test("Admin Activity Log empty and filtered empty states", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAuditLogsApi(page, { empty: true });
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "No audit records yet" })).toBeVisible();
});

test("Admin Activity Log 400 403 and 500 retry", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAuditLogsApi(page, { listStatus: 403 });
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "No access to Activity Log" })).toBeVisible();

  await mockAuditLogsApi(page, { listStatus: 400 });
  await page.goto("/admin/activity");
  await expect(page.getByText(/not valid|date_from/i)).toBeVisible();

  const api = await mockAuditLogsApi(page, { listStatus: 500 });
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "Activity log could not be loaded" })).toBeVisible();
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("button", { name: "Open details for Proposal reviewed" })).toBeVisible();
});

test("student president executive and advisor cannot open Activity Log", async ({ page }) => {
  for (const role of ["student", "president", "executive", "advisor"] as const) {
    await mockProfileMe(page, { status: 200, profile: { effectiveRole: role } });
    await page.goto("/admin/activity");
    await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  }
});

test("desktop and mobile light and dark Activity Log layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAuditLogsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "Activity Log", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open details for Proposal reviewed" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByLabel("Search activity log")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Activity Log", exact: true })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Open details for Proposal reviewed" })).toBeVisible();
});
