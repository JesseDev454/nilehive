import { expect, test } from "@playwright/test";
import { E2E_FEEDBACK, expectNoFeedbackManager, mockFeedbackApi, mockProfileMe } from "./helpers";

test("Admin Feedback loads backend records and details", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockFeedbackApi(page);
  await page.goto("/admin/feedback");
  await expect(page.getByRole("heading", { name: "Student & Club Feedback" })).toBeVisible();
  await expect(page.locator("[data-feedback-source='integrated']")).toBeVisible();
  await expect(page.getByText("Tariq Ibrahim")).toBeVisible();
  await expect(page.getByText("Anonymous")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Mark reviewed|Archive|Reply|Assign|Export/i })).toHaveCount(0);
  await expectNoFeedbackManager(page);

  await page.getByRole("tab", { name: "Dues & Payments" }).click();
  await expect(page.getByText("Tariq Ibrahim")).toBeVisible();
  await page.getByRole("button", { name: "Read Feedback" }).click();
  const details = page.getByRole("dialog");
  await expect(details.getByRole("heading", { name: E2E_FEEDBACK.comment })).toBeVisible();
  await expect(details.getByText("210103044")).toBeVisible();
  await expect(details.getByText(/follow-up email/i)).toBeVisible();
});

test("Admin Feedback 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockFeedbackApi(page, { listStatus: 403 });
  await page.goto("/admin/feedback");
  await expect(page.getByRole("heading", { name: "No access to Feedback" })).toBeVisible();
  await expect(page.getByText("Tariq Ibrahim")).toHaveCount(0);
});

test("Admin Feedback 500 offers retry without mock records", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockFeedbackApi(page, { listStatus: 500 });
  await page.goto("/admin/feedback");
  await expect(page.getByRole("heading", { name: "Feedback could not be loaded" })).toBeVisible();
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Tariq Ibrahim")).toBeVisible();
});

test("student president executive and advisor cannot open Admin Feedback", async ({ page }) => {
  for (const role of ["student", "president", "executive", "advisor"] as const) {
    await mockProfileMe(page, { status: 200, profile: { effectiveRole: role } });
    await page.goto("/admin/feedback");
    await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  }
});

test("expired session on Feedback shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/feedback");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
});

test("desktop and mobile light and dark Feedback layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockFeedbackApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/feedback");
  await expect(page.getByRole("heading", { name: "Student & Club Feedback" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Tariq Ibrahim")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Student & Club Feedback" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Read Feedback" })).toBeVisible();
});
