import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("advisor dashboard focuses on assigned proposals, reports, and club activity", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Advisor Dashboard" })).toBeVisible();
  await expect(page.getByText("Proposals Assigned To Me")).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
  await expect(page.getByText("Reports To Review / Check")).toBeVisible();
  await expect(page.getByText("Upcoming Events For Assigned Clubs")).toBeVisible();
  await expect(page.getByRole("link", { name: /Review Proposals/i })).toHaveAttribute("href", "/approvals");
});

test("advisor can approve an assigned proposal from the review queue", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/approvals");

  await expect(page.getByRole("heading", { name: "Pending Approvals" })).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
  await page.getByPlaceholder("Add advisor remarks before approving or rejecting...").fill("Looks good for students.");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("No pending approvals")).toBeVisible();
});
