import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("student discovers a club, uploads dues proof, and submits a join request", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/membership");

  await expect(page.getByRole("heading", { name: "Discover Clubs" })).toBeVisible();
  await page.getByPlaceholder(/Search clubs/i).fill("tech");
  await expect(page.getByRole("heading", { name: "Nile Tech Club" }).first()).toBeVisible();

  await page.getByRole("link", { name: "View Club" }).first().click();
  await expect(page.getByRole("heading", { name: /Join Nile Tech Club/i })).toBeVisible();
  await expect(page.getByText("Tech", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Approved events" })).toBeVisible();
  await expect(page.getByText("Build Night", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Website" })).toHaveAttribute("href", "https://clubs.campusone.com.ng/nile-tech");
  await expect(page.getByText("Students presenting projects at Build Night")).toBeVisible();

  await page.getByLabel("Student ID").fill("123456789");
  await page.getByLabel("Phone Number").fill("08000000000");
  await page.getByLabel("Department").fill("Computer Science");
  await page.getByLabel("Name on account used").fill("E2E Student");
  await page.getByLabel("Payment date").fill("2026-06-22");
  await page.getByLabel("Upload dues proof").setInputFiles({
    name: "dues-proof.png",
    mimeType: "image/png",
    buffer: Buffer.from("e2e-dues-proof")
  });

  await expect(page.getByText("Dues proof ready to submit.")).toBeVisible();
  await page.getByRole("button", { name: "Join Club" }).click();

  await expect(page.getByText(/Current request:/i)).toBeVisible();
  await expect(page.getByText("Current request: Payment Under Review.")).toBeVisible();
});

test("student can RSVP for an upcoming event", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/events");

  await expect(page.getByRole("heading", { name: "Events", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build Night" }).first()).toBeVisible();
  await page.getByRole("button", { name: "RSVP" }).first().click();
  await expect(page.getByRole("button", { name: "RSVP Saved" }).first()).toBeVisible();
});
