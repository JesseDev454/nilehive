import { expect, test } from "@playwright/test";
import { mockApprovalsApi, mockProfileMe } from "./helpers";

test("unauthenticated visitors are sent to Campus One login", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "AUTH_REQUIRED",
    message: "Please sign in",
  });

  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "Continue with Campus One" })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("a student cannot open Admin home", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });

  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  await page.getByRole("button", { name: "Return to My Dashboard" }).click();
  await expect(page).toHaveURL(/\/student\/home/);
});

test("an admin lands on Admin home from effective_role", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });

  await page.goto("/");
  await expect(page).toHaveURL(/\/admin\/home/);
  await expect(page.getByText("Club Services Admin")).toBeVisible();
  await expect(page.getByText("Feedback Manager")).toHaveCount(0);
  await expect(page.getByText("Mock data only")).toHaveCount(0);
  await expect(page.getByLabel("Preview a role in development")).toHaveCount(0);
});

test("expired sessions show the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });

  await page.goto("/admin/home");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
});

test("suspended accounts show the unavailable screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 403,
    code: "ACCOUNT_SUSPENDED",
    message: "This account is suspended",
  });

  await page.goto("/student/home");
  await expect(page.getByRole("heading", { name: "Account Temporarily Unavailable" })).toBeVisible();
});

test("Admin More uses /admin destinations and Tasks is not a Home fallback", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });

  await page.goto("/admin/more");
  await expect(page.locator("#admin-launcher-events")).toBeVisible();
  await page.locator("#admin-launcher-events").click();
  await expect(page).toHaveURL(/\/admin\/events/);

  await page.goto("/admin/tasks");
  await expect(page.getByRole("heading", { name: "That destination is unavailable" })).toBeVisible();
});

test("legacy Admin aliases redirect under an admin session", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });

  await page.goto("/user-management");
  await expect(page).toHaveURL(/\/admin\/people/);
});

test("admin sign-out returns to login", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await page.route("**/api/v1/auth/campus-one/logout", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(await route.request().headerValue("x-csrf-token")).toBe("e2e-csrf-token");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { signed_out: true } }),
    });
  });

  await page.goto("/admin/profile");
  await page.getByRole("button", { name: "Sign Out of OneClub" }).click();
  await page.getByRole("button", { name: "Confirm Sign Out" }).click();
  await expect(page.getByRole("heading", { name: "Continue with Campus One" })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("Admin Approvals loads backend proposal data for an authenticated Admin", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page);

  await page.goto("/admin/approvals");
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Approve proposal: Google Cloud Buildathon" }).click();
  await expect(page.getByRole("heading", { name: "Authorize Event Proposal" })).toBeVisible();
});

test("Advisor return still requires remarks in the UI", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/advisor/reviews");
  await expect(page.getByRole("heading", { name: "Proposal Review Queue" })).toBeVisible();
  await page.getByRole("button", { name: "Inspect Read-Only Body" }).first().click();
  await page.getByRole("button", { name: "Return for Changes (Mandatory Remarks)" }).click();
  await expect(page.getByText("Mandatory remarks required")).toBeVisible();
});

test("proposal status labels render the real backend states", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/president/proposals");
  await expect(page.getByText("Returned by Advisor").first()).toBeVisible();
  await expect(page.getByText("Returned by Admin").first()).toBeVisible();
  await expect(page.getByText("Waiting for Advisor").first()).toBeVisible();
  await page.getByRole("button", { name: "Under Review" }).click();
  await expect(page.getByText("Waiting for Advisor").first()).toBeVisible();
});

test("light and dark Admin Approvals layouts stay intact on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page);
  await page.goto("/admin/approvals");
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
});
