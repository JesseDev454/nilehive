import { expect, test } from "@playwright/test";
import { loginAs, type TestRole } from "./helpers/auth";
import { mockClubServicesApi } from "./helpers/mock-api";

const restrictedRoutes: Array<{ role: TestRole; route: string }> = [
  { role: "student", route: "/analytics" },
  { role: "student", route: "/user-management" },
  { role: "president", route: "/analytics" },
  { role: "president", route: "/user-management" },
  { role: "executive", route: "/proposals/new" },
  { role: "executive", route: "/analytics" },
  { role: "advisor", route: "/members" },
  { role: "advisor", route: "/user-management" },
  { role: "feedback_manager", route: "/analytics" },
  { role: "feedback_manager", route: "/members" }
];

test.describe("role route boundaries", () => {
  for (const { role, route } of restrictedRoutes) {
    test(`${role} cannot remain on ${route}`, async ({ page }) => {
      await mockClubServicesApi(page);
      await loginAs(page, role);
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page).not.toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    });
  }

  test("admin can open the analytics workspace", async ({ page }) => {
    await mockClubServicesApi(page);
    await loginAs(page, "admin");
    await page.goto("/analytics", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/analytics$/);
    await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible();
  });
});
