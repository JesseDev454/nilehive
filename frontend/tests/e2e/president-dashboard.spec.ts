import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("president sees focused dashboard actions for their club", async ({ page }) => {
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

  const main = page.getByRole("main");
  const createProposalLinks = main.getByRole("link", { name: "Create Event Proposal", exact: true });
  await expect(createProposalLinks).toHaveCount(1);
  await expect(createProposalLinks.first()).toHaveAttribute("href", "/proposals/new");
  await expect(page.getByRole("link", { name: "Create event", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Create proposal", exact: true })).toHaveCount(0);
  await expect(main.getByRole("link", { name: "Track Proposal Status", exact: true })).toHaveAttribute("href", "/proposals");
  await expect(main.getByRole("link", { name: "Assign Tasks", exact: true })).toHaveAttribute("href", "/tasks");
  await expect(main.getByRole("link", { name: "Manage Members", exact: true })).toHaveAttribute("href", "/members");
  await expect(main.getByRole("link", { name: "Submit Event Report", exact: true })).toHaveAttribute("href", "/archive");
});

test("president create event proposal CTA opens the proposal form", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Create Event Proposal", exact: true }).click();

  await expect(page).toHaveURL(/\/proposals\/new$/);
  await expect(page.getByRole("heading", { name: /Create Event Proposal|New Event Proposal/i })).toBeVisible();
});

test("president can route from setup dashboard to task delegation", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/");
  await page.getByRole("link", { name: "Assign Tasks", exact: true }).first().click();

  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "Task Delegation" })).toBeVisible();
  await expect(page.getByText("Prepare check-in desk")).toBeVisible();
});

test("president sees no-executives guidance and can open members", async ({ page }) => {
  const state = createE2EState();
  state.presidentExecutives = [];
  await mockClubServicesApi(page, state);
  await loginAs(page, "president");

  await page.goto("/");

  await expect(page.getByText("No executives linked yet")).toBeVisible();
  await expect(page.getByText("Assign an executive from Members before creating tasks for your team.")).toBeVisible();
  const membersLink = page.getByRole("link", { name: "Manage Members", exact: true }).last();
  await expect(membersLink).toHaveAttribute("href", "/members");
  await membersLink.click();
  await expect(page).toHaveURL(/\/members$/);
});

test("president can edit only their assigned club profile and cannot add clubs", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "president");

  await page.goto("/clubs");

  await expect(page.getByRole("heading", { name: "Clubs", exact: true })).toBeVisible();
  await expect(page.getByText("Add a new club")).toHaveCount(0);
  await expect(page.getByText("Nile Tech Club", { exact: true })).toBeVisible();
  await expect(page.getByText("Nile Business Club")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add Club" })).toHaveCount(0);

  await page.getByRole("link", { name: /Edit Club/i }).click();
  await expect(page).toHaveURL(/\/clubs\/club-tech\/edit$/);
  await expect(page.getByRole("heading", { name: "Edit Club Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Edit Nile Tech Club" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Club" })).toHaveCount(0);
  await expect(page.getByText("Leave social links blank to remove them from the public club profile.")).toBeVisible();
  await expect(page.getByLabel("Website")).toHaveCount(0);
  await page.getByLabel("Description").fill("President-owned profile update for student discovery.");
  await page.getByLabel("Instagram").fill("https://instagram.com/robotics");
  await page.getByLabel("Instagram").fill("");
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
  await expect(page).toHaveURL(/\/clubs$/);

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
