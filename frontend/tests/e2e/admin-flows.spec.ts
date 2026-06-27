import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("admin reviews membership queue and marks a dues proof paid", async ({ page }) => {
  const state = createE2EState();
  state.adminMemberships[0].due_payment.status = "paid";
  state.adminMemberships.push({
    ...state.adminMemberships[0],
    id: "membership-active-1",
    status: "active",
    profile: {
      ...state.adminMemberships[0].profile,
      id: "e2e-active-student",
      full_name: "E2E Active Student"
    }
  });
  await mockClubServicesApi(page, state);
  await loginAs(page, "admin");

  await page.goto("/membership?status=pending");

  await expect(page.getByRole("heading", { name: "Membership Review" })).toBeVisible();
  await expect(page.getByText("E2E Student", { exact: true })).toBeVisible();
  await expect(page.getByText("Pending Review", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Active Student", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Active Member", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Nile Tech Club")).toBeVisible();

  await page.goto("/dues?status=submitted");

  await expect(page.getByRole("heading", { name: "Dues & Payment Review" })).toBeVisible();
  await expect(page.getByText("E2E Student")).toBeVisible();
  await page.getByRole("button", { name: "Mark Paid" }).click();
  await expect(page.getByText("Paid").first()).toBeVisible();
});
