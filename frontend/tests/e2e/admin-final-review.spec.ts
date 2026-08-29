import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("Campus One Admin can load the final proposal review queue", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/admin/proposals/review");

  await expect(page.getByRole("heading", { name: "Final Proposal Review" })).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
  await expect(page.getByText("2026-06-25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeEnabled();
});
