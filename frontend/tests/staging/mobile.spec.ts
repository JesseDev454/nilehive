import { expect, test } from "@playwright/test";
import { hasStagingConfiguration, signInThroughStagingBridge, stagingRoles } from "./helpers/campus-one";

test.describe("staging Admin mobile smoke", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E requires dedicated bridge settings.");

  test("admin has a usable mobile shell after staging sign-in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signInThroughStagingBridge(page, "admin");
    await page.goto("/admin/home", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.getByRole("button", { name: "New announcement" })).toBeVisible();
  });

  for (const role of stagingRoles.filter((item) => item !== "admin")) {
    test(`${role} has a usable mobile shell after staging sign-in`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await signInThroughStagingBridge(page, role);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }
});
