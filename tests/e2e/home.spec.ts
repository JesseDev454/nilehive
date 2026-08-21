import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockAdminHomeApi, mockProfileMe } from "./helpers";

test("Admin Home loads backend dashboard counts and destinations", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAdminHomeApi(page);
  await page.goto("/admin/home");
  await expect(page.locator("[data-home-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Welcome, Zainab/ })).toBeVisible();
  await expect(page.getByLabel("2 Proposals waiting", { exact: true })).toBeVisible();
  await expect(page.getByLabel("1 Join requests waiting", { exact: true })).toBeVisible();
  await expectNoFeedbackManager(page);
  await expect(page.getByText("Director Zainab Ahmed")).toHaveCount(0);

  await page.getByRole("link", { name: /Review next proposal/ }).click();
  await expect(page).toHaveURL(/\/admin\/approvals/);
});

test("Admin Home quiet state and refresh", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAdminHomeApi(page, { zeros: true });
  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "Nothing needs your attention" })).toBeVisible();
  await page.getByRole("button", { name: "Refresh campus operations" }).click();
  await expect.poll(() => api.requests.length).toBeGreaterThan(1);
});

test("Admin Home opens the connected announcement composer", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAdminHomeApi(page);
  await page.route("**/api/v1/clubs**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [{ id: "club-8", name: "Nile Google Developers", code: "NGDC" }] }),
    });
  });
  await page.goto("/admin/home");
  await page.getByRole("button", { name: "New announcement" }).click();
  await expect(page.getByRole("heading", { name: "New Campus Announcement" })).toBeVisible();
});

test("Admin Home 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAdminHomeApi(page, { listStatus: 403 });
  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "No access to Admin Home" })).toBeVisible();
});

test("Admin Home 500 offers retry", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAdminHomeApi(page, { listStatus: 500 });
  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "Could not load campus operations" })).toBeVisible();
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: /Welcome, Zainab/ })).toBeVisible();
});

test("student president executive and advisor cannot open Admin Home", async ({ page }) => {
  for (const role of ["student", "president", "executive", "advisor"] as const) {
    await mockProfileMe(page, { status: 200, profile: { effectiveRole: role } });
    await page.goto("/admin/home");
    await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  }
});

test("desktop and mobile light and dark Admin Home layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAdminHomeApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: /Welcome, Zainab/ })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Items Requiring Attention")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: /Welcome, Zainab/ })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "New announcement" })).toBeVisible();
});
