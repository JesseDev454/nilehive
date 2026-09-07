import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

test("primary student action meets WCAG AA text contrast", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await mockClubServicesApi(page);
  await loginAs(page, "student");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const action = page.locator("main").getByRole("link", { name: "Discover Clubs" }).first();
  await expect(action).toBeVisible();
  const ratio = await action.evaluate((element) => {
    const parse = (color: string) => color.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0];
    const luminance = (rgb: number[]) => rgb.map((value) => value / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const style = getComputedStyle(element);
    const foreground = luminance(parse(style.color));
    const background = luminance(parse(style.backgroundColor));
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
