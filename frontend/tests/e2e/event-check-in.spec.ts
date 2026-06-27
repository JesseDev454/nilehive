import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/auth";
import { createE2EState, mockClubServicesApi } from "./helpers/mock-api";

test("student checks in through a valid QR check-in route", async ({ page }) => {
  const state = createE2EState();
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`);

  await expect(page.getByRole("heading", { name: "Check-in recorded" })).toBeVisible();
  await expect(page.getByText("Your attendance for Today Check-in Lab has been saved successfully.")).toBeVisible();
  await expect(page.getByRole("link", { name: "View Events" })).toBeVisible();
});

test("student sees an already checked-in state for the same event", async ({ page }) => {
  const state = createE2EState();
  state.attendance.set(state.todayEvent.proposal_id, {
    id: "attendance-existing",
    proposal_id: state.todayEvent.proposal_id,
    club_id: "club-tech",
    user_id: "e2e-student",
    attended: true,
    checked_in_at: "2026-06-23T10:05:00.000Z",
    check_in_method: "self",
    profile: { id: "e2e-student", full_name: "E2E Student", student_id: "123456789", role: "student" },
    created_at: "2026-06-23T10:05:00.000Z",
    updated_at: "2026-06-23T10:05:00.000Z"
  });
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`);

  await expect(page.getByRole("heading", { name: "Already checked in" })).toBeVisible();
  await expect(page.getByText("Your attendance for Today Check-in Lab has already been recorded.")).toBeVisible();
});

test("non-student role cannot use the student QR check-in action", async ({ page }) => {
  const state = createE2EState();
  await mockClubServicesApi(page, state);
  await loginAs(page, "president");

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`);

  await expect(page.getByRole("heading", { name: "Student check-in only" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View Events" })).toBeVisible();
});

test("student sees a friendly state for an expired or inactive QR check-in link", async ({ page }) => {
  const state = createE2EState();
  state.todayEvent.event_lifecycle = "past";
  await mockClubServicesApi(page, state);
  await loginAs(page, "student");

  await page.goto(`/events/${state.todayEvent.proposal_id}/check-in`);

  await expect(page.getByRole("heading", { name: "Check-in unavailable right now" })).toBeVisible();
  await expect(page.getByText("Attendance for Today Check-in Lab can only be recorded while Club Services check-in is active")).toBeVisible();
});

test("student sees a friendly state for an invalid QR check-in link", async ({ page }) => {
  await mockClubServicesApi(page);
  await loginAs(page, "student");

  await page.goto("/events/missing-event/check-in");

  await expect(page.getByRole("heading", { name: "Invalid check-in link" })).toBeVisible();
  await expect(page.getByText("This check-in link does not match an event.")).toBeVisible();
});
