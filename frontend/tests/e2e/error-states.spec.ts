import { expect, test, type Page, type Route } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

function fail(route: Route, message: string, status = 500) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ error: { message, code: "E2E_FORCED_ERROR" } })
  });
}

async function failApi(page: Page, path: string, message: string, status = 500) {
  await page.route(`**/api/v1${path}**`, (route) => fail(route, message, status));
}

test("student sees a friendly error when club discovery cannot load", async ({ page }) => {
  await mockClubServicesApi(page);
  await failApi(page, "/clubs/public", "Club directory is temporarily unavailable.");
  await loginAs(page, "student");

  await page.goto("/membership");

  await expect(page.getByText("Unable to load clubs")).toBeVisible();
  await expect(page.getByText("Club directory is temporarily unavailable.")).toBeVisible();
});

test("student sees a helpful empty state when no clubs match filters", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership");
  await page.getByPlaceholder(/Search clubs/i).fill("no matching club here");

  await expect(page.getByText("No clubs match those filters")).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters" }).first()).toBeVisible();
});

test("student sees a club-not-found state for an unavailable club detail link", async ({ page }) => {
  await mockClubServicesApi(page);
  await failApi(page, "/clubs/missing-club", "Club not found.", 404);
  await loginAs(page, "student");

  await page.goto("/membership/clubs/missing-club");

  await expect(page.getByText("Club not found")).toBeVisible();
  await expect(page.getByText("Please go back to the discover page and choose another one.")).toBeVisible();
});

test("student sees an upload error when dues proof upload fails", async ({ page }) => {
  await mockClubServicesApi(page);
  await failApi(page, "/storage/upload", "Receipt storage is unavailable.");
  await loginAs(page, "student");

  await page.goto("/membership/clubs/club-tech");
  await page.getByLabel("Upload dues proof").setInputFiles({
    name: "dues-proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-dues-proof")
  });

  await expect(page.getByText("Could not upload dues proof")).toBeVisible();
  await expect(page.getByText("Receipt storage is unavailable.")).toBeVisible();
});

test("student sees a feedback submission error when feedback cannot be saved", async ({ page }) => {
  await mockClubServicesApi(page);
  await failApi(page, "/communications/feedback", "Feedback inbox is temporarily unavailable.");
  await loginAs(page, "student");

  await page.goto("/feedback");
  await page.getByLabel("Experience rating").fill("3");
  await page.getByLabel("What were you trying to do?").fill("Share a club with a friend");
  await page.getByLabel("What confused you or went wrong?").fill("The share action failed during testing.");
  await page.getByRole("button", { name: "Submit Feedback" }).click();

  await expect(page.getByText("Feedback failed")).toBeVisible();
  await expect(page.getByText("Feedback inbox is temporarily unavailable.")).toBeVisible();
});

test("student sees restricted access instead of admin analytics", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/analytics");

  await expect(page.getByText("Analytics access is restricted")).toBeVisible();
  await expect(page.getByText("Dues proofs verified")).toHaveCount(0);
});

test("announcement deep link shows a friendly unavailable state when announcements fail", async ({ page }) => {
  await mockClubServicesApi(page);
  await failApi(page, "/communications/announcements", "Announcements are temporarily unavailable.");
  await loginAs(page, "student");

  await page.goto("/notifications");
  await page.getByText("New club announcement: Welcome to Club Services").click();

  await expect(page).toHaveURL(/\/communications$/);
  await expect(page.getByText("Announcements are temporarily unavailable.")).toBeVisible();
});
