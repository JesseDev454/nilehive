import { describe, expect, it } from "vitest";
import { getStudentNextAction } from "./studentActivation";

describe("getStudentNextAction", () => {
  it("prioritizes profile completion before discovery", () => {
    const action = getStudentNextAction({
      membershipRequests: [],
      duePayments: [],
      upcomingEvents: [],
      hasRsvp: false,
      isProfileComplete: false
    });

    expect(action.kind).toBe("complete_profile");
    expect(action.to).toBe("/membership");
  });

  it("starts students in club discovery when they have no requests", () => {
    const action = getStudentNextAction({
      membershipRequests: [],
      duePayments: [],
      upcomingEvents: [],
      hasRsvp: false
    });

    expect(action.kind).toBe("discover_clubs");
    expect(action.to).toBe("/membership");
  });

  it("prioritizes payment fixes before event engagement", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "rejected" }],
      upcomingEvents: [{ id: "event-1" }],
      hasRsvp: false
    });

    expect(action.kind).toBe("update_payment");
    expect(action.label).toBe("Update payment");
  });

  it("moves active students with unrsvped events toward events", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "paid" }],
      upcomingEvents: [{ id: "event-1" }],
      hasRsvp: false
    });

    expect(action.kind).toBe("rsvp_event");
    expect(action.to).toBe("/events");
  });

  it("prioritizes today's check-in before RSVP follow-up", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "paid" }],
      upcomingEvents: [{ id: "event-1" }],
      hasRsvp: false,
      hasTodayCheckIn: true
    });

    expect(action.kind).toBe("check_in");
    expect(action.label).toBe("Check in");
  });

  it("moves active students with unread announcements toward communications", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "paid" }],
      upcomingEvents: [],
      hasRsvp: true,
      hasUnreadAnnouncement: true
    });

    expect(action.kind).toBe("read_announcement");
    expect(action.to).toBe("/communications");
  });

  it("offers feedback after higher-priority student actions are done", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "paid" }],
      upcomingEvents: [],
      hasRsvp: true,
      hasFeedbackOpportunity: true
    });

    expect(action.kind).toBe("submit_feedback");
    expect(action.to).toBe("/events");
  });

  it("keeps active students with no urgent action connected to announcements", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "active" }],
      duePayments: [{ status: "paid" }],
      upcomingEvents: [{ id: "event-1" }],
      hasRsvp: true
    });

    expect(action.kind).toBe("see_updates");
    expect(action.to).toBe("/communications");
  });

  it("tracks submitted join requests while students wait", () => {
    const action = getStudentNextAction({
      membershipRequests: [{ status: "pending" }],
      duePayments: [],
      upcomingEvents: [],
      hasRsvp: false
    });

    expect(action.kind).toBe("track_request");
    expect(action.label).toBe("View membership");
  });
});
