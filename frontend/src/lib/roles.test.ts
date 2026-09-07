import { describe, expect, it } from "vitest";
import { formatRoleLabel } from "@/lib/roles";

describe("formatRoleLabel", () => {
  it("renders Student Mode capitalization correctly", () => expect(`${formatRoleLabel("student")} Mode`).toBe("Student Mode"));
  it("formats multi-word roles", () => expect(formatRoleLabel("feedback_manager")).toBe("Feedback Manager"));
});
