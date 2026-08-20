import { expect, test } from "@playwright/test";
import {
  E2E_ANNOUNCEMENT,
  expectNoFeedbackManager,
  mockAnnouncementsApi,
  mockProfileMe,
} from "./helpers";

test("Admin Announcements loads backend records and publishes with CSRF", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAnnouncementsApi(page);

  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "Official Announcements" })).toBeVisible();
  await expect(page.locator("[data-announcements-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: E2E_ANNOUNCEMENT.title })).toBeVisible();
  await expect(page.getByText("Read totals are not stored by OneClub").first()).toBeVisible();
  await expectNoFeedbackManager(page);

  await page.getByLabel("Search announcements by title or keyword").fill("Grant");
  await expect(page.getByRole("heading", { name: E2E_ANNOUNCEMENT.title })).toBeVisible();

  await page.getByRole("button", { name: `View full broadcast: ${E2E_ANNOUNCEMENT.title}` }).click();
  const details = page.getByRole("dialog");
  await expect(details.getByRole("heading", { name: E2E_ANNOUNCEMENT.title })).toBeVisible();
  await expect(details.getByText("cannot be edited, deleted, pinned, or scheduled")).toBeVisible();
  await details.getByRole("button", { name: "Done" }).click();

  await page.getByRole("button", { name: "New Announcement" }).click();
  const composer = page.getByRole("dialog");
  await expect(composer.getByRole("heading", { name: "Publish New Announcement" })).toBeVisible();
  await composer.getByRole("button", { name: "Publish Broadcast" }).click();
  await expect(composer.getByText("Announcement title is required.")).toBeVisible();
  await composer.getByLabel("Announcement Title").fill("Lab access hours");
  await composer.getByLabel("Announcement Message").fill("Tech Lab 4 remains open until 20:00 for approved workshops.");
  await composer.getByRole("button", { name: "Single Club" }).click();
  await composer.getByRole("button", { name: "Publish Broadcast" }).click({ force: true });
  await expect(page.getByText("Announcement published.").first()).toBeVisible();
  expect(api.publishes).toHaveLength(1);
  expect(api.publishes[0].csrf).toBe("e2e-csrf-token");
  expect((api.publishes[0].body as { audience: string }).audience).toBe("club");
  expect((api.publishes[0].body as { club_id: string }).club_id).toBeTruthy();
  await page.getByLabel("Search announcements by title or keyword").fill("");
  await expect(page.getByRole("heading", { name: "Lab access hours" })).toBeVisible();
});

test("duplicate Announcement publish clicks send one request", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAnnouncementsApi(page);
  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "New Announcement" }).click();
  const composer = page.getByRole("dialog");
  await composer.getByLabel("Announcement Title").fill("Campus briefing notice");
  await composer.getByLabel("Announcement Message").fill("This is the official campus briefing for club presidents.");
  const publish = composer.getByRole("button", { name: "Publish Broadcast" });
  await Promise.all([publish.click({ force: true }), publish.click({ force: true })]);
  await expect(page.getByText("Announcement published.").first()).toBeVisible();
  expect(api.publishes).toHaveLength(1);
});

test("invalid announcement audience keeps the composer open", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page, {
    publishResult: {
      status: 400,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Audience must be one of: all, all_users, all_clubs, club, role",
          details: { field: "audience" },
        },
      },
    },
  });
  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "New Announcement" }).click();
  const composer = page.getByRole("dialog");
  await composer.getByLabel("Announcement Title").fill("Campus briefing notice");
  await composer.getByLabel("Announcement Message").fill("This is the official campus briefing for club presidents.");
  await composer.getByRole("button", { name: "Publish Broadcast" }).click({ force: true });
  await expect(page.locator("#admin-announcements-publish-error")).toContainText("Audience must be one of");
  await expect(composer.getByRole("heading", { name: "Publish New Announcement" })).toBeVisible();
});

test("Announcements 409 preserves the composer", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page, {
    publishResult: {
      status: 409,
      body: { error: { code: "CONFLICT", message: "This announcement could not be published" } },
    },
  });
  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "New Announcement" }).click();
  const composer = page.getByRole("dialog");
  await composer.getByLabel("Announcement Title").fill("Campus briefing notice");
  await composer.getByLabel("Announcement Message").fill("This is the official campus briefing for club presidents.");
  await composer.getByRole("button", { name: "Publish Broadcast" }).click({ force: true });
  await expect(page.locator("#admin-announcements-publish-error")).toContainText("already changed");
  await expect(composer.getByRole("heading", { name: "Publish New Announcement" })).toBeVisible();
});

test("Announcements 429 shows a wait-and-retry message", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page, {
    publishResult: {
      status: 429,
      body: { error: { code: "ANNOUNCEMENT_RATE_LIMITED", message: "Too many announcement attempts" } },
    },
  });
  await page.goto("/admin/announcements");
  await page.getByRole("button", { name: "New Announcement" }).click();
  const composer = page.getByRole("dialog");
  await composer.getByLabel("Announcement Title").fill("Campus briefing notice");
  await composer.getByLabel("Announcement Message").fill("This is the official campus briefing for club presidents.");
  await composer.getByRole("button", { name: "Publish Broadcast" }).click({ force: true });
  await expect(page.locator("#admin-announcements-publish-error")).toContainText("Too many announcement attempts");
  await expect(composer.getByLabel("Announcement Title")).toHaveValue("Campus briefing notice");
});

test("Announcements directory 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page, { listStatus: 403 });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "No access to Announcements" })).toBeVisible();
  await expect(page.getByText("Grant Guidelines")).toHaveCount(0);
});

test("Announcements directory 500 offers retry without mock records", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockAnnouncementsApi(page, { listStatus: 500 });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "Announcements could not be loaded" })).toBeVisible();
  await expect(page.getByText("Grant Guidelines")).toHaveCount(0);
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Grant Guidelines" })).toBeVisible();
});

test("student president executive and advisor cannot open Admin Announcements", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "executive" } });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
});

test("expired session on Announcements shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
  await expect(page.getByText("Grant Guidelines")).toHaveCount(0);
});

test("unsupported edit delete pin and schedule stay inactive", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page);
  await page.goto("/admin/announcements");
  await expect(page.getByRole("button", { name: /Edit|Delete|Pin|Schedule/i })).toHaveCount(0);
});

test("desktop and mobile light and dark Announcements layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockAnnouncementsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/announcements");
  await expect(page.getByRole("heading", { name: "Official Announcements" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("heading", { name: "Grant Guidelines" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Official Announcements" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "New Announcement" })).toBeVisible();
});
