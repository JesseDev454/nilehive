import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("advisor dashboard focuses on assigned proposals, reports, and club activity", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Advisor Home" })).toBeVisible();
  await expect(page.getByText("Decisions", { exact: true })).toBeVisible();
  await expect(page.getByText("Reports", { exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByText("Events", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Review proposals/i })).toHaveAttribute("href", "/approvals");
});

test("advisor cannot reject without remarks and sees inline validation", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/approvals");

  await expect(page.getByRole("heading", { name: "Pending Approvals" })).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByText("Add rejection remarks before rejecting this proposal.")).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
});

test("advisor can approve an assigned proposal without remarks", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/approvals");

  await expect(page.getByRole("heading", { name: "Pending Approvals" })).toBeVisible();
  await expect(page.getByText("Build Night Proposal")).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("No pending approvals")).toBeVisible();
});

test("proposal detail opened from approvals links back to approvals", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "advisor");

  await page.goto("/approvals");

  await page.getByRole("link", { name: "View details" }).click();
  await expect(page).toHaveURL(/\/proposals\/proposal-tech-demo$/);
  await expect(page.getByRole("link", { name: "Back to Approvals" })).toHaveAttribute("href", "/approvals");
});
