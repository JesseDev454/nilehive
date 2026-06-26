import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("executive dashboard is task-focused and shows relevant club updates", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "executive");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Executive Dashboard" })).toBeVisible();
  await expect(page.getByText("My Assigned Tasks")).toBeVisible();
  await expect(page.getByText("Prepare check-in desk")).toBeVisible();
  await expect(page.getByText("Club Announcements")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming Events", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Send Feedback/i })).toHaveAttribute("href", "/feedback");
});

test("executive can update an assigned task status", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "executive");

  await page.goto("/tasks");

  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
  await expect(page.getByText("Prepare check-in desk")).toBeVisible();
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "In progress" }).click();
  await expect(page.getByText("in progress").first()).toBeVisible();
});
