import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";
import { mockBrowserPushSupport, mockBrowserPushUnsupported } from "./helpers/push";

test("student can open notification settings and see optional browser alerts", async ({ page }) => {
  await mockBrowserPushSupport(page);
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");

  await expect(page.getByRole("heading", { name: "Notification Center" })).toBeVisible();
  await expect(page.getByText("Optional phone alerts")).toBeVisible();
  await expect(page.getByText("Enable alerts for important Club Services updates on this device.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable on this device" })).toBeVisible();
});

test("student can enable browser alerts and save a push subscription", async ({ page }) => {
  const state = createE2EState();
  await mockBrowserPushSupport(page);
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto("/notifications");
  await page.getByRole("button", { name: "Enable on this device" }).click();

  await expect(page.getByText("Enabled on this device.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Disable on this device" })).toBeVisible();
  await expect(page.getByText("Phone notifications enabled")).toBeVisible();
  await expect
    .poll(() => state.pushSubscriptionRequests.length, { message: "push subscription save request" })
    .toBe(1);
  expect(state.pushSubscriptions[0]).toMatchObject({
    user_id: "e2e-student",
    endpoint: "https://push.example.test/e2e-subscription",
    p256dh: "e2e-p256dh-key",
    auth: "e2e-auth-key"
  });
});

test("student can disable browser alerts and remove the saved subscription", async ({ page }) => {
  const state = createE2EState();
  await mockBrowserPushSupport(page, { initiallySubscribed: true });
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto("/notifications");
  await expect(page.getByRole("button", { name: "Disable on this device" })).toBeVisible();

  await page.getByRole("button", { name: "Disable on this device" }).click();

  await expect(page.getByText("Enable alerts for important Club Services updates on this device.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable on this device" })).toBeVisible();
  await expect(page.getByText("Phone notifications disabled")).toBeVisible();
  await expect
    .poll(() => state.removedPushEndpoints, { message: "push subscription removal request" })
    .toContain("https://push.example.test/e2e-subscription");
});

test("permission denied shows a helpful browser alerts message", async ({ page }) => {
  const state = createE2EState();
  await mockBrowserPushSupport(page, { permission: "denied" });
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto("/notifications");
  await page.getByRole("button", { name: "Enable on this device" }).click();

  await expect(page.getByText("Could not enable notifications")).toBeVisible();
  await expect(page.getByText("Notification permission was not granted for this device.")).toBeVisible();
  expect(state.pushSubscriptionRequests).toHaveLength(0);
});

test("unsupported browser state shows a fallback instead of push controls", async ({ page }) => {
  await mockBrowserPushUnsupported(page);
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/notifications");

  await expect(page.getByText("Optional phone alerts")).toBeVisible();
  await expect(page.getByText("This browser does not support web push notifications.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enable on this device" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Disable on this device" })).toHaveCount(0);
});
