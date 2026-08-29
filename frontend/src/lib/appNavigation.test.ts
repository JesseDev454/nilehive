import { describe, expect, it } from "vitest";
import { getRoleNavItems, isNavItemActive } from "./appNavigation";

describe("isNavItemActive", () => {
  it("selects Home strictly on the root path", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/", "/profile")).toBe(false);
    expect(isNavItemActive("/", "/tasks")).toBe(false);
  });

  it("selects a section for its exact path and child routes", () => {
    expect(isNavItemActive("/profile", "/profile")).toBe(true);
    expect(isNavItemActive("/profile", "/profile/")).toBe(true);
    expect(isNavItemActive("/profile", "/profile/settings")).toBe(true);
    expect(isNavItemActive("/profile", "/tasks")).toBe(false);
  });

  it("normalizes trailing slashes and query strings in the pathname", () => {
    expect(isNavItemActive("/clubs", "/clubs/")).toBe(true);
    expect(isNavItemActive("/clubs", "/clubs?view=grid")).toBe(true);
    expect(isNavItemActive("/events", "/events?month=09")).toBe(true);
  });

  it("distinguishes communications from its feedback tab", () => {
    expect(isNavItemActive("/communications", "/communications")).toBe(true);
    expect(isNavItemActive("/communications", "/communications", "?tab=feedback")).toBe(false);
    expect(isNavItemActive("/feedback", "/communications", "?tab=feedback")).toBe(true);
    expect(isNavItemActive("/feedback", "/feedback")).toBe(true);
  });

  it("does not select the proposal list for creation or Admin review", () => {
    expect(isNavItemActive("/proposals", "/proposals/123")).toBe(true);
    expect(isNavItemActive("/proposals", "/proposals/new")).toBe(false);
    expect(isNavItemActive("/proposals/new", "/proposals/new")).toBe(true);
    expect(isNavItemActive("/proposals", "/admin/proposals/review")).toBe(false);
  });

  it("provides navigation for every supported role", () => {
    expect(getRoleNavItems("student").length).toBe(5);
    expect(getRoleNavItems("president").length).toBe(6);
    expect(getRoleNavItems("executive").length).toBe(6);
    expect(getRoleNavItems("advisor").length).toBe(5);
    expect(getRoleNavItems("admin").length).toBe(8);
  });
});
