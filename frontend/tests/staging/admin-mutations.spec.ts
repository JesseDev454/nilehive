import { expect, test } from "@playwright/test";
import { apiAsRole, getStagingApiOrigin, hasStagingConfiguration, signInThroughStagingBridge } from "./helpers/campus-one";

test.describe("staging Admin mutations and API permissions", () => {
  test.skip(
    !hasStagingConfiguration() || process.env.E2E_STAGING_ENABLE_MUTATIONS !== "true",
    "Destructive Admin mutations run only against the isolated staging seed.",
  );

  test("Admin profile/me proves effective_role admin", async ({ request }) => {
    const apiOrigin = await apiAsRole(request, "admin");
    const response = await request.get(`${apiOrigin}/api/v1/profile/me`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.profile.effective_role || body.data.profile.role).toBe("admin");
    expect(body.data.profile.email).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/csrf_token|access_token|refresh_token/i);
  });

  test("wrong roles are denied Admin APIs", async ({ request }) => {
    for (const role of ["student", "president", "executive", "advisor"] as const) {
      const apiOrigin = await apiAsRole(request, role);
      const approvals = await request.get(`${apiOrigin}/api/v1/proposals/admin?page=1&page_size=5`);
      expect(approvals.status()).toBe(403);
      const audit = await request.get(`${apiOrigin}/api/v1/admin/audit-logs?page=1&page_size=5`);
      expect(audit.status()).toBe(403);
      const feedback = await request.get(`${apiOrigin}/api/v1/communications/feedback?page=1&page_size=5`);
      expect(feedback.status()).toBe(403);
    }
  });

  test("unauthenticated Admin APIs return 401", async ({ request }) => {
    const response = await request.get(`${getStagingApiOrigin()}/api/v1/admin/audit-logs?page=1&page_size=5`);
    if (response.status() === 404) {
      throw new Error(
        "EXTERNAL BLOCKER: staging Render backend does not expose GET /api/v1/admin/audit-logs. Deploy this branch to Render staging.",
      );
    }
    expect(response.status()).toBe(401);
  });

  test("Admin can list audit logs and redacts nested secrets", async ({ request }) => {
    const apiOrigin = await apiAsRole(request, "admin");
    const response = await request.get(`${apiOrigin}/api/v1/admin/audit-logs?page=1&page_size=20`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data.items)).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/should-be-redacted-if-read/);
  });

  test("missing CSRF is rejected on an Admin mutation", async ({ request }) => {
    const apiOrigin = await apiAsRole(request, "admin");
    const response = await request.post(`${apiOrigin}/api/v1/communications/announcements`, {
      data: {
        title: "E2E CSRF probe",
        message: "Should be rejected.",
        audience: "all_users",
        priority: "normal",
      },
    });
    expect([403, 400]).toContain(response.status());
    const body = await response.json();
    expect(String(body.error?.code || "")).toMatch(/CSRF|FORBIDDEN|VALIDATION/i);
  });

  test("Home announcement composer is the connected Admin composer", async ({ page }) => {
    await signInThroughStagingBridge(page, "admin");
    await page.goto("/admin/home", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "New announcement" }).click();
    await expect(page.getByRole("heading", { name: "New Campus Announcement" })).toBeVisible();
  });
});
