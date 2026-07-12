import { expect, test } from "@playwright/test";
import { loginAs, type TestRole } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

const viewports = [
  { name: "small-mobile", width: 320, height: 720 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 }
];
const roles: TestRole[] = ["student", "president", "executive", "advisor", "admin", "feedback_manager"];

for (const viewport of viewports) {
  test(`${viewport.name} has no shell overflow for every role`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockClubServicesApi(page);
    for (const role of roles) {
      await loginAs(page, role);
      await page.goto(role === "feedback_manager" ? "/feedback" : "/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(() => ({
        overflowed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        offenders: Array.from(document.querySelectorAll<HTMLElement>("body *")).map((element) => ({ tag: element.tagName, text: element.innerText?.slice(0, 40), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width), className: element.className })).filter((item) => item.right > document.documentElement.clientWidth + 1).slice(0, 5)
      }));
      expect(overflow.overflowed, `${role} overflowed at ${viewport.width}px: ${JSON.stringify(overflow.offenders)}`).toBe(false);
    }
  });
}
