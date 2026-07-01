import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("production shell does not show the prototype role switcher", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.getByText("Design preview only")).toHaveCount(0);
});

test("mobile shell shows top bar and the first five role nav items", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");

  await expect(page.getByRole("banner")).toContainText("Clubly");
  const mobileNav = page.getByRole("navigation", { name: "Mobile primary navigation" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Home/i })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Clubs/i })).toHaveAttribute("href", "/membership");
  await expect(mobileNav.getByRole("link", { name: /Events/i })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Updates/i })).toHaveAttribute("href", "/communications");
  await expect(mobileNav.getByRole("link", { name: /Feedback/i })).toBeVisible();
});

test("display preferences persist accent and compact density", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/");
  await page.getByRole("button", { name: "Display preferences" }).click();
  await page.getByRole("menuitem", { name: /Soft teal/i }).click();
  await page.getByRole("button", { name: "Display preferences" }).click();
  await page.getByRole("menuitemcheckbox", { name: /Compact density/i }).click();

  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  await expect(page.locator("html")).toHaveCSS("--clubly-accent", "hsl(173 80% 32%)");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
});

test("desktop sidebar can collapse and expand", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
});
