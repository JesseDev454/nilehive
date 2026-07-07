import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test.describe.configure({ mode: "serial" });

test("production shell does not show the prototype role switcher", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Design preview only")).toHaveCount(0);
});

test("mobile shell shows top bar and the first five role nav items", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("banner")).toContainText("Menu");
  await page.getByRole("button", { name: /Toggle Sidebar|Menu/i }).click();
  await expect(page.getByRole("link", { name: /Home/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Discover Clubs/i })).toHaveAttribute("href", "/membership");
  await expect(page.getByRole("link", { name: /Events/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Announcements/i })).toHaveAttribute("href", "/communications");
  await expect(page.getByRole("link", { name: /Feedback/i })).toBeVisible();
});

test("top bar exposes role context, help, and logout controls", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("banner")).toContainText("Student Mode");
  await expect(page.getByRole("button", { name: /Help \/ Guide|Guide/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});

test("desktop sidebar can collapse and expand", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockClubServicesApi(page);
  await loginAs(page, "admin");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
});
