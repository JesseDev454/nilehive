import type { Page } from "@playwright/test";

export type TestRole = "student" | "admin" | "president" | "advisor" | "executive" | "feedback_manager";

const E2E_AUTH_STORAGE_KEY = "club-services:e2e-auth";
const testProfileIds = new WeakMap<Page, string>();

const roleNames: Record<TestRole, string> = {
  student: "E2E Student",
  admin: "E2E Admin",
  president: "E2E President",
  advisor: "E2E Advisor",
  executive: "E2E Executive",
  feedback_manager: "E2E Feedback Manager"
};

export async function loginAs(page: Page, role: TestRole) {
  const profile = {
    id: `e2e-${role}`,
    full_name: roleNames[role],
    role,
    app_role: role,
    effective_role: role,
    portal_role: role === "admin" ? "admin" : role === "advisor" ? "staff" : "student",
    access_pending: false,
    club_id: role === "student" || role === "feedback_manager" || role === "admin" ? null : "club-tech",
    student_id: role === "student" || role === "executive" || role === "president" ? "123456789" : null,
    phone_number: role === "student" ? "08000000000" : null,
    department: role === "student" ? "Computer Science" : null,
    student_type: role === "student" ? "returning" : null,
    join_reason: null,
    requested_role: role,
    onboarding_status: "complete",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  };

  testProfileIds.set(page, profile.id);

  await page.addInitScript(
    ({ storageKey, auth }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(auth));
      window.localStorage.setItem(`nilehive:onboarding:v1:${auth.profile.id}:${auth.profile.effective_role || auth.profile.role}`, "completed");
    },
    {
      storageKey: E2E_AUTH_STORAGE_KEY,
      auth: {
        email: `${profile.id}@nilehive.test`,
        profile
      }
    }
  );
}

export function getTestProfileId(page: Page) {
  return testProfileIds.get(page) || null;
}

export async function clearTestAuth(page: Page) {
  testProfileIds.delete(page);
  await page.addInitScript((storageKey) => {
    window.localStorage.removeItem(storageKey);
  }, E2E_AUTH_STORAGE_KEY);
}
