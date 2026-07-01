import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("admin can view privacy-safe usage and operational analytics", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");
  await page.goto("/analytics");

  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.getByText("Active Users")).toBeVisible();
  await expect(page.getByText("42", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Dues proofs verified")).toBeVisible();
  await expect(page.getByText(/No search text or browsing histories/i)).toBeVisible();
});

test("admin dashboard shows club health values in the performance matrix", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");
  await page.goto("/");

  await expect(page.getByText("Club performance matrix")).toBeVisible();
  await expect(page.getByRole("link", { name: "Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("80 - healthy")).toBeVisible();
});

test("student cannot access admin analytics", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/analytics");

  await expect(page.getByText("Analytics access is restricted")).toBeVisible();
  await expect(page.getByText("Dues proofs verified")).toHaveCount(0);
});
