import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import type { AppProfile } from "@/contexts/AuthContext";
import { formatStudentGreeting, getStudentDisplayName } from "./studentDisplayName";

const profile = (fullName: string): AppProfile => ({
  id: "student-1",
  full_name: fullName,
  role: "student",
  club_id: null,
});

describe("student display name", () => {
  it("prefers explicit preferred and first names", () => {
    expect(getStudentDisplayName(profile("Amina Yusuf"), { user_metadata: { preferred_name: "Mina" } } as unknown as User)).toBe("Mina");
    expect(getStudentDisplayName(profile("Amina Yusuf"), { user_metadata: { first_name: "Amina" } } as unknown as User)).toBe("Amina");
  });

  it("uses the first token of a profile full name", () => {
    expect(getStudentDisplayName(profile("Daniel Okafor"), null)).toBe("Daniel");
  });

  it("uses a neutral greeting when no trustworthy name exists", () => {
    expect(getStudentDisplayName(profile("   "), null)).toBeNull();
    expect(formatStudentGreeting(null)).toBe("Welcome back");
  });

  it("formats a resolved name without exposing placeholder copy", () => {
    expect(formatStudentGreeting("Amina")).toBe("Welcome back, Amina");
  });
});
