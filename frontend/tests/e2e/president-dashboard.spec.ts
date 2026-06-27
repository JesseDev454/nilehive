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
  await expect(page.getByText("76", { exact: true })).toBeVisible();
  await expect(page.getByText("Healthy", { exact: true })).toBeVisible();

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

test("president can edit only their assigned club profile and cannot add clubs", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/clubs");

  await expect(page.getByRole("heading", { name: "Clubs", exact: true })).toBeVisible();
  await expect(page.getByText("Add a new club")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Edit Nile Tech Club" })).toBeVisible();
  await expect(page.getByText("Nile Business Club")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add Club" })).toHaveCount(0);

  await expect(page.getByText("Edit Nile Tech Club")).toBeVisible();
  await page.getByLabel("Description").fill("President-owned profile update for student discovery.");
  await page.getByLabel("Club logo").setInputFiles({
    name: "president-logo.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-president-logo")
  });
  await page.getByLabel("Add gallery image").setInputFiles({
    name: "president-gallery.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-president-gallery")
  });
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Club updated")).toBeVisible();

  const forbiddenEditStatus = await page.evaluate(async () => {
    const response = await fetch("/api/v1/clubs/club-business/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "President should not edit another club." })
    });

    return response.status;
  });

  expect(forbiddenEditStatus).toBe(403);
});
