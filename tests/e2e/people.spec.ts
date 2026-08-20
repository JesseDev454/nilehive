import { expect, test } from "@playwright/test";
import {
  E2E_PERSON,
  expectNoFeedbackManager,
  mockPeopleApi,
  mockProfileMe,
} from "./helpers";

test("Admin People directory loads backend-shaped users and assigns a president with CSRF", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockPeopleApi(page);

  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "People & Club Leadership" })).toBeVisible();
  await expect(page.getByText("Amina Bello")).toBeVisible();
  await expect(page.getByText("Campus One Identity (Read-Only)").first()).toBeVisible();
  await expect(page.locator("[data-people-source='integrated']")).toBeVisible();

  await page.getByLabel("Search people by name, campus ID or email").fill("Amina");
  await expect(page.getByText("Dr. Kalu Okonkwo")).toHaveCount(0);
  await expect(page.getByText("Amina Bello")).toBeVisible();

  await page.getByLabel("Filter by OneClub role").click();
  await page.getByRole("option", { name: "Students" }).click();
  await expect(page.getByText("Amina Bello")).toBeVisible();

  await page.getByRole("button", { name: "View details for Amina Bello" }).click();
  const inspector = page.getByRole("dialog");
  await expect(inspector.getByRole("heading", { name: "Amina Bello" })).toBeVisible();
  await expect(inspector.getByText("Campus One Identity (Read-Only)")).toBeVisible();
  await expect(inspector.getByText("Managed in Campus One").first()).toBeVisible();
  await expect(inspector.getByRole("button", { name: "Edit Campus One" })).toHaveCount(0);
  await inspector.getByRole("button", { name: "Close" }).last().click();

  await page.getByRole("button", { name: "Change OneClub role for Amina Bello" }).click();
  const assign = page.getByRole("dialog");
  await expect(assign.getByRole("heading", { name: "Change OneClub role for Amina Bello" })).toBeVisible();
  await assign.getByRole("combobox", { name: "Select OneClub Role" }).click();
  await expect(page.getByRole("option", { name: "Admin" })).toHaveCount(0);
  await expectNoFeedbackManager(page);
  await page.getByRole("option", { name: "Club President" }).click();
  await assign.getByRole("combobox", { name: "Assigned Club" }).click();
  await page.getByRole("option", { name: "Nile Google Developers" }).click();
  await assign.getByRole("button", { name: "Confirm OneClub role change for Amina Bello" }).click({ force: true });
  await expect(page.getByText("OneClub role saved.").first()).toBeVisible();
  expect(api.rolePosts).toHaveLength(1);
  expect(api.rolePosts[0].csrf).toBe("e2e-csrf-token");
  expect(api.rolePosts[0].body).toEqual({ role: "president", club_id: "club-8" });
  expect(api.rolePosts[0].url).toContain("/api/v1/admin/users/person-e2e-1/role");
});

test("Advisor club assignment persists through the existing endpoint", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockPeopleApi(page);
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "Change OneClub role for Dr. Kalu Okonkwo" }).click();
  const assign = page.getByRole("dialog");
  await expect(assign.getByText("Nile Google Developers").first()).toBeVisible();
  await assign.getByRole("combobox", { name: "Assigned Club" }).click();
  await page.getByRole("option", { name: "Nile Business Club" }).click();
  await assign.getByRole("button", { name: "Confirm OneClub role change for Dr. Kalu Okonkwo" }).click({ force: true });
  await expect(page.getByText("OneClub role saved.").first()).toBeVisible();
  expect(api.advisorPosts).toHaveLength(1);
  expect(api.advisorPosts[0].csrf).toBe("e2e-csrf-token");
  expect(api.advisorPosts[0].body).toEqual({ club_id: "club-2" });
});

test("duplicate People assignment clicks send one request", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockPeopleApi(page);
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "Change OneClub role for Amina Bello" }).click();
  const assign = page.getByRole("dialog");
  await assign.getByRole("combobox", { name: "Select OneClub Role" }).click();
  await page.getByRole("option", { name: "Club President" }).click();
  await assign.getByRole("combobox", { name: "Assigned Club" }).click();
  await page.getByRole("option", { name: "Nile Google Developers" }).click();
  const confirm = assign.getByRole("button", { name: "Confirm OneClub role change for Amina Bello" });
  await Promise.all([confirm.click({ force: true }), confirm.click({ force: true })]);
  await expect(page.getByText("OneClub role saved.").first()).toBeVisible();
  expect(api.rolePosts).toHaveLength(1);
});

test("stale president assignment shows conflict and preserves the dialog", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page, {
    roleResult: {
      status: 409,
      body: {
        error: {
          code: "PRESIDENT_ALREADY_EXISTS",
          message: "This club already has a president. Confirm replacement before continuing.",
          details: { current_president: { id: "pres-1", full_name: "Farouk Aliyu", club_id: "club-8" } },
        },
      },
    },
  });
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "Change OneClub role for Amina Bello" }).click();
  const assign = page.getByRole("dialog");
  await assign.getByRole("combobox", { name: "Select OneClub Role" }).click();
  await page.getByRole("option", { name: "Club President" }).click();
  await assign.getByRole("combobox", { name: "Assigned Club" }).click();
  await page.getByRole("option", { name: "Nile Google Developers" }).click();
  await assign.getByRole("button", { name: "Confirm OneClub role change for Amina Bello" }).click({ force: true });
  await expect(page.locator("#admin-people-role-error")).toContainText("This club already has a president");
  await expect(page.getByText("Farouk Aliyu").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Change OneClub role for Amina Bello" })).toBeVisible();
});

test("People role 429 shows a wait-and-retry message", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page, {
    roleResult: {
      status: 429,
      body: { error: { code: "RATE_LIMITED", message: "Too many requests" } },
    },
  });
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "Change OneClub role for Amina Bello" }).click();
  const limited = page.getByRole("dialog");
  await limited.getByRole("combobox", { name: "Select OneClub Role" }).click();
  await page.getByRole("option", { name: "Club President" }).click();
  await limited.getByRole("combobox", { name: "Assigned Club" }).click();
  await page.getByRole("option", { name: "Nile Google Developers" }).click();
  await limited.getByRole("button", { name: "Confirm OneClub role change for Amina Bello" }).click({ force: true });
  await expect(page.locator("#admin-people-role-error")).toContainText("Too many People updates");
});

test("People directory 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page, { listStatus: 403 });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "No access to People" })).toBeVisible();
  await expect(page.getByText("Amina Bello")).toHaveCount(0);
});

test("People directory 500 offers retry without mock users", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockPeopleApi(page, { listStatus: 500 });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "The directory could not be loaded" })).toBeVisible();
  await expect(page.getByText("Farouk Aliyu")).toHaveCount(0);
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Amina Bello")).toBeVisible();
});

test("stale person details show a 404 and close the inspector", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page, { detailStatus: 404 });
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "View details for Amina Bello" }).click();
  await expect(page.getByText("This person is no longer available.")).toBeVisible();
});

test("student president and advisor cannot open Admin People", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Change OneClub role for Amina Bello" })).toHaveCount(0);
});

test("expired session on People shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
  await expect(page.getByText("Amina Bello")).toHaveCount(0);
});

test("People has no fake suspend action and keeps Campus One status read-only", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page);
  await page.goto("/admin/people");
  await page.getByRole("button", { name: "View details for Amina Bello" }).click();
  await expect(page.getByText("Account status is managed through Campus One.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Suspend" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reactivate" })).toHaveCount(0);
  void E2E_PERSON;
});

test("desktop and mobile light and dark People layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockPeopleApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/people");
  await expect(page.getByRole("heading", { name: "People & Club Leadership" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Amina Bello")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "People & Club Leadership" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Change OneClub role for Amina Bello" })).toBeVisible();
});
