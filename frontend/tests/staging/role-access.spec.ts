import { expect, test } from "@playwright/test";
import {
  expectRestrictedRoute,
  hasStagingConfiguration,
  signInThroughStagingBridge,
  stagingRoles,
  type StagingRole
} from "./helpers/campus-one";

const restrictedRouteByRole: Partial<Record<StagingRole, string>> = {
  student: "/analytics",
  president: "/analytics",
  executive: "/analytics",
  advisor: "/analytics",
  feedback_manager: "/user-management"
};

test.describe("staging bridge role access", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E is enabled only when the dedicated bridge settings are configured.");

  for (const role of stagingRoles.filter((role) => restrictedRouteByRole[role])) {
    test(`${role} receives a staging session and is kept out of a restricted workspace`, async ({ page }) => {
      await signInThroughStagingBridge(page, role);
      await expect(page).not.toHaveURL(/\/login/);
      await expectRestrictedRoute(page, restrictedRouteByRole[role]!);
    });
  }

  test("admin can reach the analytics workspace after staging sign-in", async ({ page }) => {
    await signInThroughStagingBridge(page, "admin");
    await page.goto("/analytics", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/analytics$/);
  });
});
