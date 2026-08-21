import { expect, test } from "@playwright/test";
import { expectNoFeedbackManager, mockProfileMe } from "./helpers";

test("Admin Profile uses the authenticated Campus One identity", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.goto("/admin/profile");
  await expect(page.locator("[data-profile-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Campus One Identity" })).toBeVisible();
  await expect(page.getByText("Zainab Ahmed").first()).toBeVisible();
  await expect(page.getByText("zainab.ahmed@nileuniversity.edu.ng").first()).toBeVisible();
  await expect(page.getByText("Read-Only Record")).toBeVisible();
  await expect(page.getByText("club_services_admin")).toBeVisible();
  await expect(page.getByRole("button", { name: /Grant Admin|Edit Identity/i })).toHaveCount(0);
  await expectNoFeedbackManager(page);
});

test("Admin Profile copy and theme controls are accessible", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.goto("/admin/profile");
  await expect(page.getByRole("button", { name: "Copy institutional email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy staff or student ID" })).toBeVisible();
  const light = page.getByRole("button", { name: /Light Appearance/ });
  const dark = page.getByRole("button", { name: /Dark Appearance/ });
  await expect(light).toHaveAttribute("aria-pressed", "true");
  await dark.click();
  await expect(dark).toHaveAttribute("aria-pressed", "true");
  await light.click();
  await expect(light).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /System/i })).toHaveCount(0);
});

test("student president executive and advisor cannot open Admin Profile", async ({ page }) => {
  for (const role of ["student", "president", "executive", "advisor"] as const) {
    await mockProfileMe(page, { status: 200, profile: { effectiveRole: role } });
    await page.goto("/admin/profile");
    await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  }
});
