import { expect, test } from "@playwright/test";

test("unauthenticated app load shows Campus One login", async ({ page }) => {
  await page.route("**/api/v1/profile/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "AUTH_REQUIRED", message: "Please sign in" },
      }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue with Campus One" })).toBeVisible();
});
