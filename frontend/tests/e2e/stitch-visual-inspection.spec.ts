import { test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("capture the current student home for Stitch comparison", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "C:/Users/goodl/Documents/NileHive/__codex_tmp/current-student-home.png",
    fullPage: true
  });
});

test("capture the corrected dark student home for Stitch comparison", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.screenshot({
    path: "C:/Users/goodl/Documents/NileHive/__codex_tmp/current-student-home-dark.png",
    fullPage: true
  });
});

test("capture the five-step president proposal builder for Stitch comparison", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await mockClubServicesApi(page);
  await loginAs(page, "president");
  await page.goto("/proposals/new", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "C:/Users/goodl/Documents/NileHive/__codex_tmp/current-president-proposal-step-1.png",
    fullPage: true
  });
});
