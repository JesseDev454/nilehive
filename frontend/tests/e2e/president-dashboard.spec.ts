import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("president sees action cards and quick actions for their club", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("Club Setup Checklist")).toHaveCount(0);

  await expect(page.getByRole("link", { name: /Needs Attention/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Upcoming Events/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Members/ }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Club Health Score" })).toBeVisible();

  await expect(page.getByRole("link", { name: "Create announcement", exact: true }).first()).toHaveAttribute("href", "/communications");
  await expect(page.getByRole("link", { name: "Create event", exact: true })).toHaveAttribute("href", "/proposals/new");
  await expect(page.getByRole("link", { name: "Create proposal", exact: true })).toHaveAttribute("href", "/proposals/new");
  await expect(page.getByRole("link", { name: "Assign task", exact: true }).first()).toHaveAttribute("href", "/tasks");
  await expect(page.getByRole("link", { name: "View members", exact: true })).toHaveAttribute("href", "/members");
  await expect(page.getByRole("link", { name: "View reports", exact: true })).toHaveAttribute("href", "/archive");
});

test("president can route from setup dashboard to task delegation", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/");
  await page.getByRole("link", { name: "Assign task", exact: true }).first().click();

  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "Task Delegation" })).toBeVisible();
  await expect(page.getByText("Prepare check-in desk")).toBeVisible();
});
