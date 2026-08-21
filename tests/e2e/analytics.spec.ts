import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockAnalyticsApi, mockProfileMe } from "./helpers";

test("Admin Analytics loads real-shaped metrics and switches ranges", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAnalyticsApi(page);
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "Directorate Analytics" })).toBeVisible();
  await expect(page.locator("[data-analytics-source='integrated']")).toBeVisible();
  await expect(page.getByText("24")).toBeVisible();
  await expectNoFeedbackManager(page);

  await page.getByRole("tab", { name: "Last 7 Days" }).click();
  await expect.poll(() => api.requests.some((url) => url.includes("days=7"))).toBe(true);
  await expect(page.getByText("12")).toBeVisible();

  await page.getByRole("button", { name: "Metric Details" }).first().click();
  const details = page.getByRole("dialog");
  await expect(details.getByText("Window: 7 Days")).toBeVisible();
  await expect(details.getByText("Current window total")).toBeVisible();
  await expect(details.getByText("comparison trend", { exact: false })).toBeVisible();
});

test("Admin Analytics handles all-zero data without fabricated trends", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnalyticsApi(page, { zeros: true });
  await page.goto("/admin/analytics");
  await expect(page.getByText("0").first()).toBeVisible();
  await expect(page.getByText("%")).toHaveCount(0);
  await page.getByRole("button", { name: "Metric Details" }).first().click();
  await expect(page.getByRole("dialog").getByText("No role breakdown is available for this window.")).toBeVisible();
});

test("Admin Analytics 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnalyticsApi(page, { listStatus: 403 });
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "No access to Analytics" })).toBeVisible();
});

test("Admin Analytics 500 offers retry", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAnalyticsApi(page, { listStatus: 500 });
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "Analytics could not be loaded" })).toBeVisible();
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("24")).toBeVisible();
});

test("student president executive and advisor cannot open Admin Analytics", async ({ page }) => {
  for (const role of ["student", "president", "executive", "advisor"] as const) {
    await mockProfileMe(page, { status: 200, profile: { effectiveRole: role } });
    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  }
});

test("expired session on Analytics shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
});

test("desktop and mobile light and dark Analytics layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnalyticsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/analytics");
  await expect(page.getByRole("heading", { name: "Directorate Analytics" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Active Campus Users")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Directorate Analytics" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Metric Details" }).first()).toBeVisible();
});
