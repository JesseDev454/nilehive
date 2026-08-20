import { expect, test } from "@playwright/test";
import {
  E2E_CLUB_MEMBER,
  expectNoFeedbackManager,
  mockClubsApi,
  mockProfileMe,
} from "./helpers";

test("Admin Clubs directory loads backend-shaped clubs and edits with CSRF", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockClubsApi(page);

  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "Club Registry & Payment Directives" })).toBeVisible();
  await expect(page.locator("[data-clubs-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nile Google Developers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Women in Tech Club" })).toBeVisible();
  await expect(page.getByText("14 / 14 Active")).toBeVisible();
  await expectNoFeedbackManager(page);
  await expect(page.getByRole("button", { name: "Create a new club" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Archive|Delete club/i })).toHaveCount(0);

  await page.getByLabel("Search clubs by name, code or president").fill("Google");
  await expect(page.getByRole("heading", { name: "Nile Book Club" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Nile Google Developers" })).toBeVisible();

  await page.getByRole("radio", { name: "Show all club categories" }).click();
  await page.getByRole("button", { name: "View Nile Google Developers details" }).click();
  const details = page.getByRole("dialog");
  await expect(details.getByRole("heading", { name: "Nile Google Developers", exact: true })).toBeVisible();
  await expect(details.getByText("Farouk Aliyu").first()).toBeVisible();
  await expect(details.getByText("Dr. Kalu Okonkwo").first()).toBeVisible();
  await expect(details.getByText(E2E_CLUB_MEMBER.student_id)).toBeVisible();
  await expect(details.getByText("Not stored by OneClub yet").first()).toBeVisible();
  await details.getByRole("button", { name: "Close" }).last().click();

  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await expect(editor.getByRole("heading", { name: /Edit Nile Google Developers/ })).toBeVisible();
  await expect(editor.getByRole("button", { name: "Save club settings for Nile Google Developers" })).toBeDisabled();
  await editor.getByLabel("Club Description & Mission").fill("Nile Google Developers is the official campus developer community for workshops and builds.");
  await editor.getByRole("button", { name: "Save club settings for Nile Google Developers" }).click({ force: true });
  await expect(page.getByText("Updated settings & payment directives for Nile Google Developers.").first()).toBeVisible();
  expect(api.patches).toHaveLength(1);
  expect(api.patches[0].csrf).toBe("e2e-csrf-token");
  expect((api.patches[0].body as { description: string }).description).toContain("official campus developer community");
});

test("duplicate Clubs save clicks send one request", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockClubsApi(page);
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await editor.getByLabel("Club Description & Mission").fill("Nile Google Developers hosts buildathons, study jams, and student developer workshops.");
  const save = editor.getByRole("button", { name: "Save club settings for Nile Google Developers" });
  await Promise.all([save.click({ force: true }), save.click({ force: true })]);
  await expect(page.getByText("Updated settings & payment directives for Nile Google Developers.").first()).toBeVisible();
  expect(api.patches).toHaveLength(1);
});

test("public signup toggle requires confirmation and persists", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockClubsApi(page);
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await editor.getByLabel("Public signup for Nile Google Developers").click();
  await editor.getByText("Students will no longer be able to apply through public signup.").click();
  await editor.getByRole("button", { name: "Save club settings for Nile Google Developers" }).click({ force: true });
  await expect(page.getByText("Updated settings & payment directives for Nile Google Developers.").first()).toBeVisible();
  expect((api.patches[0].body as { is_public_signup: boolean }).is_public_signup).toBe(false);
});

test("stale club update shows conflict and preserves the editor", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page, {
    updateResult: {
      status: 409,
      body: { error: { code: "CLUB_ALREADY_EXISTS", message: "A club with this name or code already exists" } },
    },
  });
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await editor.getByLabel("Club Description & Mission").fill("Nile Google Developers remains the official developer community on campus for students.");
  await editor.getByRole("button", { name: "Save club settings for Nile Google Developers" }).click({ force: true });
  await expect(page.locator("#admin-clubs-save-error")).toContainText("already exists");
  await expect(editor.getByRole("heading", { name: /Edit Nile Google Developers/ })).toBeVisible();
  await expect(editor.getByLabel("Club Description & Mission")).toHaveValue(/remains the official developer community/);
});

test("Clubs 429 shows a wait-and-retry message", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page, {
    updateResult: {
      status: 429,
      body: { error: { code: "CLUB_WRITE_RATE_LIMITED", message: "Too many club updates" } },
    },
  });
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await editor.getByLabel("Club Description & Mission").fill("Nile Google Developers offers student developer workshops and community projects.");
  await editor.getByRole("button", { name: "Save club settings for Nile Google Developers" }).click({ force: true });
  await expect(page.locator("#admin-clubs-save-error")).toContainText("Too many club updates");
});

test("Clubs directory 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page, { listStatus: 403 });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "No access to Clubs" })).toBeVisible();
  await expect(page.getByText("Nile Google Developers")).toHaveCount(0);
});

test("Clubs directory 500 offers retry without mock clubs", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockClubsApi(page, { listStatus: 500 });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "The club directory could not be loaded" })).toBeVisible();
  await expect(page.getByText("Nile Book Club")).toHaveCount(0);
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Nile Google Developers" })).toBeVisible();
});

test("stale club details show a 404", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page, { detailStatus: 404 });
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "View Nile Google Developers details" }).click();
  await expect(page.getByRole("dialog").getByText("This club is no longer available.")).toBeVisible();
});

test("student president executive and advisor cannot open Admin Clubs", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "executive" } });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit Nile Google Developers" })).toHaveCount(0);
});

test("expired session on Clubs shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
  await expect(page.getByText("Nile Google Developers")).toHaveCount(0);
});

test("unsupported archive delete and logo upload stay inactive", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page);
  await page.goto("/admin/clubs");
  await page.getByRole("button", { name: "Edit Nile Google Developers" }).first().click();
  const editor = page.getByRole("dialog");
  await expect(editor.getByLabel("Cover Image URL")).toBeDisabled();
  await expect(editor.getByLabel("Campus Meeting Location")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Archive" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
});

test("desktop and mobile light and dark Clubs layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockClubsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/clubs");
  await expect(page.getByRole("heading", { name: "Club Registry & Payment Directives" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("heading", { name: "Nile Google Developers" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Club Registry & Payment Directives" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "View Nile Google Developers details" })).toBeVisible();
});
