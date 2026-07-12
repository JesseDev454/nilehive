import { describe, expect, it } from "vitest";
import { shouldPersistQuery } from "@/lib/queryClient";

describe("query persistence allowlist", () => {
  it("persists public clubs", () => expect(shouldPersistQuery({ queryKey: ["public-clubs"] })).toBe(true));
  it.each(["feedback", "dues", "members", "admin-dashboard", "notifications"])("does not persist sensitive %s data", (key) => expect(shouldPersistQuery({ queryKey: [key] })).toBe(false));
});
