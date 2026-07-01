import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("feedback manager can review and export feedback without admin navigation", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "feedback_manager");

  await page.goto("/feedback");

  await expect(page.getByRole("heading", { name: "Feedback Inbox", exact: true })).toBeVisible();
  await expect(page.getByText("App Feedback Inbox")).toBeVisible();
  await expect(page.getByText("Keep improving")).toBeVisible();
  await expect(page.getByRole("link", { name: /User Management/i })).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("Feedback");
});
