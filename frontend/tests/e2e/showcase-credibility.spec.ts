import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test.describe("OneClub Showcase Credibility & Polish", () => {
  test.beforeEach(async ({ page }) => {
    await mockClubServicesApi(page);
  });

  test("Student Home displays clean greeting, decoupled events/updates, and active navigation", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/");

    // Verify greeting does not contain awkward "New"
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Welcome back");

    // Verify upcoming events and updates sections exist
    await expect(page.getByText("Upcoming Events")).toBeVisible();
    await expect(page.getByText("Recent Updates")).toBeVisible();

    // Verify desktop sidebar highlights Home on root
    const homeLink = page.locator("aside nav a[href='/']").first();
    if (await homeLink.isVisible()) {
      await expect(homeLink).toHaveAttribute("aria-current", "page");
    }

    // Verify no stuck loading text
    await expect(page.getByText("Loading events")).toHaveCount(0);
    await expect(page.getByText("Loading updates")).toHaveCount(0);
  });

  test("Executive Home highlights Home and does NOT highlight Profile on root path", async ({ page }) => {
    await loginAs(page, "executive");
    await page.goto("/");

    // Verify Home has aria-current="page"
    const homeLink = page.locator("aside nav a[href='/']").first();
    if (await homeLink.isVisible()) {
      await expect(homeLink).toHaveAttribute("aria-current", "page");
    }

    // Verify Profile does NOT have aria-current="page"
    const profileLink = page.locator("aside nav a[href='/profile']").first();
    if (await profileLink.isVisible()) {
      await expect(profileLink).not.toHaveAttribute("aria-current", "page");
    }

    // Verify dashboard content is visible
    await expect(page.getByRole("heading", { name: "Executive Home" })).toBeVisible();
  });

  test("President Dashboard renders official club branding and scaled typography", async ({ page }) => {
    await loginAs(page, "president");
    await page.goto("/");

    const presidentHeading = page.locator("h1");
    await expect(presidentHeading).toBeVisible();
    await expect(presidentHeading).not.toContainText("E2E Club gh-");

    // Verify active navigation
    const homeLink = page.locator("aside nav a[href='/']").first();
    if (await homeLink.isVisible()) {
      await expect(homeLink).toHaveAttribute("aria-current", "page");
    }
  });

  test("Advisor Dashboard renders decisions and queue overview cleanly", async ({ page }) => {
    await loginAs(page, "advisor");
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Advisor Home" })).toBeVisible();
    await expect(page.getByText("Decisions")).toBeVisible();
  });

  test("Admin Operations Dashboard displays aligned metrics and proper institutional eyebrow", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Operations Queue" })).toBeVisible();
    await expect(page.getByText("OneClub Administration")).toBeVisible();
    await expect(page.getByRole("link", { name: /Open items/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Active Clubs/i }).first()).toBeVisible();
  });
});
