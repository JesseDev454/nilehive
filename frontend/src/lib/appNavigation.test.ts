import { describe, expect, it } from "vitest";
import { getRoleNavItems, isNavItemActive } from "./appNavigation";

describe("isNavItemActive", () => {
  it("selects Home strictly on root path", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/", "/profile")).toBe(false);
    expect(isNavItemActive("/", "/tasks")).toBe(false);
    expect(isNavItemActive("/", "/events")).toBe(false);
  });

  it("selects Profile only on Profile and child routes", () => {
    expect(isNavItemActive("/profile", "/")).toBe(false);
    expect(isNavItemActive("/profile", "/profile")).toBe(true);
    expect(isNavItemActive("/profile", "/profile/")).toBe(true);
    expect(isNavItemActive("/profile", "/profile/settings")).toBe(true);
    expect(isNavItemActive("/profile", "/tasks")).toBe(false);
  });

  it("selects Executive tasks properly without selecting Profile or Home", () => {
    expect(isNavItemActive("/tasks", "/tasks")).toBe(true);
    expect(isNavItemActive("/tasks", "/")).toBe(false);
    expect(isNavItemActive("/profile", "/tasks")).toBe(false);
    expect(isNavItemActive("/", "/tasks")).toBe(false);
  });

  it("handles trailing slashes and query strings seamlessly", () => {
    expect(isNavItemActive("/clubs", "/clubs/")).toBe(true);
    expect(isNavItemActive("/clubs", "/clubs?view=grid")).toBe(true);
    expect(isNavItemActive("/events", "/events?month=09")).toBe(true);
  });

  it("distinguishes communications vs feedback tabs", () => {
    expect(isNavItemActive("/communications", "/communications")).toBe(true);
    expect(isNavItemActive("/communications", "/communications", "?tab=feedback")).toBe(false);
    expect(isNavItemActive("/feedback", "/communications", "?tab=feedback")).toBe(true);
    expect(isNavItemActive("/feedback", "/feedback")).toBe(true);
  });

  it("handles proposals vs new proposal vs admin proposal review", () => {
    expect(isNavItemActive("/proposals", "/proposals")).toBe(true);
    expect(isNavItemActive("/proposals", "/proposals/123")).toBe(true);
    expect(isNavItemActive("/proposals", "/proposals/new")).toBe(false);
    expect(isNavItemActive("/proposals/new", "/proposals/new")).toBe(true);
    expect(isNavItemActive("/admin/proposals/review", "/admin/proposals/review")).toBe(true);
    expect(isNavItemActive("/proposals", "/admin/proposals/review")).toBe(false);
  });

  it("provides nav items for all 5 roles", () => {
    expect(getRoleNavItems("student").length).toBe(5);
    expect(getRoleNavItems("president").length).toBe(6);
    expect(getRoleNavItems("executive").length).toBe(6);
    expect(getRoleNavItems("advisor").length).toBe(5);
    expect(getRoleNavItems("admin").length).toBe(8);
  });
});
