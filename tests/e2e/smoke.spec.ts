import { expect, test } from "@playwright/test";

test("app loads from the local dev server", async ({ page }) => {
  await page.addInitScript(() => {
    const profile = {
      id: "e2e-student",
      full_name: "E2E Student",
      role: "student",
      app_role: "student",
      effective_role: "student",
      portal_role: "student",
      access_pending: false,
      club_id: null,
      student_id: "123456789",
      phone_number: "08000000000",
      department: "Computer Science",
      student_type: "returning",
      join_reason: null,
      requested_role: "student",
      onboarding_status: "complete",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z"
    };

    window.localStorage.setItem("club-services:e2e-auth", JSON.stringify({
      email: "e2e-student@nilehive.test",
      profile
    }));
    window.localStorage.setItem("nilehive:onboarding:v1:e2e-student:student", "completed");
  });

  await page.goto("/");

  await expect(page.locator("body")).toContainText("Club Services");
});
