import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockProfileMe } from "./helpers";

test("Admin More lists canonical destinations and not Tasks or Feedback Manager", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.goto("/admin/more");
  await expect(page.getByRole("heading", { name: "More", exact: true })).toBeVisible();
  for (const id of ["events", "announcements", "notifications", "feedback", "analytics", "activity", "profile"]) {
    await expect(page.locator(`#admin-launcher-${id}`)).toBeVisible();
  }
  await expect(page.locator("#admin-launcher-tasks")).toHaveCount(0);
  await expectNoFeedbackManager(page);
  await page.locator("#admin-launcher-profile").click();
  await expect(page).toHaveURL(/\/admin\/profile/);
});

test("Admin More search filters destinations", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.goto("/admin/more");
  await page.getByPlaceholder(/Search/i).fill("activity");
  await expect(page.locator("#admin-launcher-activity")).toBeVisible();
  await expect(page.locator("#admin-launcher-events")).toHaveCount(0);
});

test("unknown Admin route is Not Found and Tasks is unavailable", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.goto("/admin/not-a-real-workspace");
  await expect(page.getByRole("heading", { name: "That destination is unavailable" })).toBeVisible();
  await page.goto("/admin/tasks");
  await expect(page.getByRole("heading", { name: "That destination is unavailable" })).toBeVisible();
});
