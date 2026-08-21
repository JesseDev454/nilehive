import { expect, test } from "@playwright/test";
import {
  expectRestrictedAdminRoute,
  hasStagingConfiguration,
  signInThroughStagingBridge,
  stagingRoles,
} from "./helpers/campus-one";

const adminRoutes = [
  "/admin/home",
  "/admin/approvals",
  "/admin/clubs",
  "/admin/people",
  "/admin/events",
  "/admin/announcements",
  "/admin/notifications",
  "/admin/feedback",
  "/admin/analytics",
  "/admin/activity",
  "/admin/profile",
  "/admin/more",
] as const;

test.describe("staging Admin role access", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E requires dedicated bridge settings.");

  for (const role of stagingRoles.filter((item) => item !== "admin")) {
    test(`${role} cannot open Admin Home or Activity Log`, async ({ page }) => {
      await signInThroughStagingBridge(page, role);
      await expect(page).not.toHaveURL(/\/login/);
      await expectRestrictedAdminRoute(page, "/admin/home");
      await expectRestrictedAdminRoute(page, "/admin/activity");
    });
  }

  test("admin can open every Admin workspace", async ({ page }) => {
    await signInThroughStagingBridge(page, "admin");
    for (const route of adminRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(`${route}$`));
      await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toHaveCount(0);
      await expect(page.getByText("Feedback Manager")).toHaveCount(0);
      await expect(page.getByText("Mock data only")).toHaveCount(0);
    }
  });

  test("unknown Admin Tasks route is Not Found", async ({ page }) => {
    await signInThroughStagingBridge(page, "admin");
    await page.goto("/admin/tasks", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "That destination is unavailable" })).toBeVisible();
  });
});
