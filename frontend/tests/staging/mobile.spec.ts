import { expect, test } from "@playwright/test";
import { hasStagingConfiguration, signInThroughStagingBridge } from "./helpers/campus-one";

test.describe("staging bridge mobile smoke", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E is enabled only when the dedicated bridge settings are configured.");

  for (const role of ["student", "president", "admin"] as const) {
    test(`${role} has a usable mobile shell after staging sign-in`, async ({ page }) => {
      await signInThroughStagingBridge(page, role);
      const viewportWidth = await page.locator("body").evaluate((body) => body.clientWidth);
      const contentWidth = await page.locator("body").evaluate((body) => body.scrollWidth);
      expect(contentWidth).toBeLessThanOrEqual(viewportWidth + 1);
      await expect(page.getByRole("navigation").last()).toBeVisible();
    });
  }
});
