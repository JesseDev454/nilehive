import { expect, test, type Page } from "@playwright/test";

interface ProfileFixture {
  effectiveRole: "student" | "admin";
  fullName?: string;
}

function profileResponse({ effectiveRole, fullName }: ProfileFixture) {
  const email = effectiveRole === "admin"
    ? "zainab.ahmed@nileuniversity.edu.ng"
    : "amina.bello@nileuniversity.edu.ng";

  return {
    data: {
      user: {
        id: `e2e-${effectiveRole}`,
        email,
        role: effectiveRole === "admin" ? "staff" : "student",
      },
      profile: {
        id: `e2e-${effectiveRole}-profile`,
        email,
        portal_user_id: "portal-e2e",
        full_name: fullName || (effectiveRole === "admin" ? "Zainab Ahmed" : "Amina Bello"),
        role: effectiveRole,
        app_role: effectiveRole,
        effective_role: effectiveRole,
        portal_role: effectiveRole === "admin" ? "staff" : "student",
        custom_roles: effectiveRole === "admin" ? ["club_services_admin"] : [],
        access_pending: false,
        role_sync_state: "active",
        club_id: null,
        student_id: "NIL/2023/UG/0458",
        requested_role: null,
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      requires_profile_setup: false,
    },
  };
}

async function mockProfileMe(
  page: Page,
  result:
    | { status: 200; profile: ProfileFixture }
    | { status: number; code: string; message: string },
) {
  await page.route("**/api/v1/profile/me", async (route) => {
    if ("profile" in result) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(profileResponse(result.profile)),
      });
      return;
    }

    await route.fulfill({
      status: result.status,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: result.code, message: result.message },
      }),
    });
  });
}

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
