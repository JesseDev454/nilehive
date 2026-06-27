import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("admin reviews membership queue and marks a dues proof paid", async ({ page }) => {
  const state = createE2EState();
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

test("admin can create a club and edit club profile media", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/clubs");

  await expect(page.getByRole("heading", { name: "Clubs", exact: true })).toBeVisible();
  await expect(page.getByText("Add a new club")).toBeVisible();
  await page.getByLabel("Club Name").fill("Nile Robotics Club");
  await page.getByLabel("Short Code").fill("NRC");
  await page.getByLabel("Description").fill("Students build robotics projects and learn practical automation.");
  await page.getByRole("button", { name: "Tech" }).click();
  await page.getByRole("button", { name: "Add Club" }).click();

  await expect(page.getByText("Club created")).toBeVisible();
  await expect(page.getByText("Nile Robotics Club")).toBeVisible();

  await page.getByRole("button", { name: /Edit Club/i }).first().click();
  await page.getByLabel("Description").fill("Updated club profile with workshop details and project goals.");
  await page.getByLabel("Club logo").setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-logo")
  });
  await page.getByLabel("Add gallery image").setInputFiles({
    name: "gallery.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-gallery")
  });
  await page.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Club updated")).toBeVisible();
});
