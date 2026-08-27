import { describe, expect, it } from "vitest";
import { formatStudentGreeting, getStudentDisplayName } from "./studentDisplayName";
import type { AppProfile } from "@/contexts/AuthContext";
import type { User } from "@supabase/supabase-js";

describe("getStudentDisplayName and formatStudentGreeting", () => {
  it("prefers explicit preferred_name from metadata", () => {
    const profile: AppProfile = { id: "1", full_name: "Amina Yusuf", role: "student", club_id: null };
    const user = { user_metadata: { preferred_name: "Mina" } } as unknown as User;
    const name = getStudentDisplayName(profile, user);
    expect(name).toBe("Mina");
    expect(formatStudentGreeting(name)).toBe("Welcome back, Mina");
  });

  it("prefers explicit first_name from metadata if preferred_name is missing", () => {
    const profile: AppProfile = { id: "1", full_name: "Amina Yusuf", role: "student", club_id: null };
    const user = { user_metadata: { first_name: "Amina" } } as unknown as User;
    const name = getStudentDisplayName(profile, user);
    expect(name).toBe("Amina");
    expect(formatStudentGreeting(name)).toBe("Welcome back, Amina");
  });

  it("extracts first token from full_name when metadata names are absent", () => {
    const profile: AppProfile = { id: "1", full_name: "Daniel Okafor", role: "president", club_id: "c1" };
    const name = getStudentDisplayName(profile, null);
    expect(name).toBe("Daniel");
    expect(formatStudentGreeting(name)).toBe("Welcome back, Daniel");
  });

  it("returns null fallback for empty or missing profile names", () => {
    const profile: AppProfile = { id: "1", full_name: "", role: "student", club_id: null };
    const name = getStudentDisplayName(profile, null);
    expect(name).toBeNull();
    expect(formatStudentGreeting(name)).toBe("Welcome back");
  });

  it("handles whitespace-only full names gracefully", () => {
    const profile: AppProfile = { id: "1", full_name: "   ", role: "student", club_id: null };
    const name = getStudentDisplayName(profile, null);
    expect(name).toBeNull();
    expect(formatStudentGreeting(name)).toBe("Welcome back");
  });
});
