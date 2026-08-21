import { expect, test } from "@playwright/test";
import { getStagingBrowserOrigin, hasStagingConfiguration } from "./helpers/campus-one";

function stagingApiOrigin() {
  return (process.env.E2E_STAGING_API_BASE_URL || process.env.E2E_STAGING_BASE_URL || "").replace(/\/$/, "");
}

test.describe("staging environment contract", () => {
  test.skip(!hasStagingConfiguration(), "Staging E2E requires dedicated bridge settings.");

  test("frontend is OneClub, not leftover Clubly", async ({ page }) => {
    await page.goto(`${getStagingBrowserOrigin()}/login`, { waitUntil: "domcontentloaded" });
    const clublyHeading = page.getByRole("heading", { name: "Club Services" });
    if (await clublyHeading.isVisible().catch(() => false)) {
      throw new Error(
        "EXTERNAL BLOCKER: E2E_STAGING_BASE_URL still serves Clubly login. Deploy the OneClub frontend from this branch to the staging Vercel project before the Admin staging gate can pass.",
      );
    }
    await expect(page.getByRole("heading", { name: "Continue with Campus One" })).toBeVisible();
    await expect(page.getByText("Create an account")).toHaveCount(0);
  });

  test("Render staging backend exposes Admin audit-logs", async ({ request }) => {
    const response = await request.get(`${stagingApiOrigin()}/api/v1/admin/audit-logs?page=1&page_size=1`);
    if (response.status() === 404) {
      throw new Error(
        "EXTERNAL BLOCKER: E2E_STAGING_API_BASE_URL does not expose GET /api/v1/admin/audit-logs. Deploy this branch to the staging Render backend before the Admin staging gate can pass.",
      );
    }
    expect([401, 403]).toContain(response.status());
  });
});
