import { expect, test } from "@playwright/test";
import {
  E2E_CHECKIN_STUDENT,
  expectNoFeedbackManager,
  mockEventsApi,
  mockProfileMe,
} from "./helpers";

test("Admin Events directory loads approved proposals and rosters", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page);

  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "Authorized Campus Events" })).toBeVisible();
  await expect(page.locator("[data-events-source='integrated']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Climate Showcase" })).toBeVisible();
  await expectNoFeedbackManager(page);
  await expect(page.getByRole("button", { name: /Create Event|Cancel event|Postpone/i })).toHaveCount(0);

  await page.getByLabel("Search events by title, venue or club").fill("Google");
  await expect(page.getByRole("heading", { name: "Climate Showcase" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon" })).toBeVisible();

  await page.getByRole("button", { name: "Open roster and details for Google Cloud Buildathon" }).click();
  const details = page.getByRole("dialog");
  await expect(details.getByRole("heading", { name: "Google Cloud Buildathon" })).toBeVisible();
  await expect(details.getByText("Proposal Ref: proposal-e2e-event-1")).toBeVisible();
  await expect(details.getByText(E2E_CHECKIN_STUDENT.full_name).first()).toBeVisible();
  await expect(details.getByText("Events cannot be created, edited, cancelled, or postponed")).toBeVisible();
  await details.getByRole("button", { name: "Close" }).last().click();
});

test("Admin Events filters by lifecycle and club", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page);
  await page.goto("/admin/events");
  await page.getByRole("tab", { name: /Past Events/ }).click();
  await expect(page.getByRole("heading", { name: "Climate Showcase" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon" })).toHaveCount(0);
});

test("duplicate manual check-in is blocked for a recorded student", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockEventsApi(page);
  await page.goto("/admin/events");
  await page.getByRole("button", { name: "Manual check-in for Google Cloud Buildathon" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Matric / Student ID").fill(E2E_CHECKIN_STUDENT.student_id);
  await dialog.getByRole("button", { name: "Record Check-In" }).click();
  await expect(dialog.locator("#admin-events-checkin-error")).toContainText("already verified");
  expect(api.attendancePosts).toHaveLength(0);
});

test("Events directory 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page, { listStatus: 403 });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "No access to Events" })).toBeVisible();
  await expect(page.getByText("Google Cloud Buildathon")).toHaveCount(0);
});

test("Events directory 500 offers retry without mock events", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockEventsApi(page, { listStatus: 500 });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "The events directory could not be loaded" })).toBeVisible();
  await expect(page.getByText("Climate Showcase")).toHaveCount(0);
  api.allowList();
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon" })).toBeVisible();
});

test("stale event details show a 404", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page, { engagementStatus: 404 });
  await page.goto("/admin/events");
  await page.getByRole("button", { name: "Open roster and details for Google Cloud Buildathon" }).click();
  await expect(page.getByRole("dialog").getByText("This approved event is no longer available.")).toBeVisible();
});

test("student president executive and advisor cannot open Admin Events", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "executive" } });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
});

test("expired session on Events shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
  await expect(page.getByText("Google Cloud Buildathon")).toHaveCount(0);
});

test("unsupported create edit cancel stay inactive", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page);
  await page.goto("/admin/events");
  await expect(page.getByRole("button", { name: /Create Event/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Edit event|Cancel event|Postpone/i })).toHaveCount(0);
});

test("desktop and mobile light and dark Events layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockEventsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/events");
  await expect(page.getByRole("heading", { name: "Authorized Campus Events" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Authorized Campus Events" })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Open roster and details for Google Cloud Buildathon" })).toBeVisible();
});
