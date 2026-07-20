import { expect, type Page } from "@playwright/test";

export const stagingRoles = ["student", "president", "executive", "advisor", "admin", "feedback_manager"] as const;
export type StagingRole = (typeof stagingRoles)[number];

const requiredSettings = ["E2E_STAGING_BASE_URL", "E2E_STAGING_AUTH_BRIDGE_SECRET", "E2E_STAGING_ACTORS_JSON"] as const;

function requireSetting(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required staging E2E setting: ${name}`);
  return value;
}

function origin(value: string) {
  return new URL(value).origin;
}

export function hasStagingConfiguration() {
  return requiredSettings.every((name) => Boolean(process.env[name]));
}

export function assertStagingConfiguration() {
  for (const name of requiredSettings) requireSetting(name);
}

export function getStagingApiBaseUrl() {
  return (process.env.E2E_STAGING_API_BASE_URL || process.env.E2E_STAGING_BASE_URL || "").replace(/\/$/, "");
}

export function getStagingBrowserApiBaseUrl() {
  return origin(requireSetting("E2E_STAGING_BASE_URL"));
}

function getStagingActorProfileId(role: StagingRole) {
  try {
    const actors = JSON.parse(requireSetting("E2E_STAGING_ACTORS_JSON"));
    const profileId = actors?.[role]?.profile_id;
    if (typeof profileId === "string" && profileId.trim()) return profileId.trim();
  } catch {
    // Use the consistent error below rather than printing a secret value.
  }
  throw new Error(`E2E_STAGING_ACTORS_JSON.${role}.profile_id is required.`);
}

/**
 * Creates a normal short-lived Campus One session cookie through the staging-
 * only bridge. The backend rejects this outside APP_ENV=staging, without the
 * CI secret, or for a profile whose email does not start with e2e+.
 */
export async function signInThroughStagingBridge(page: Page, role: StagingRole) {
  assertStagingConfiguration();
  // Route through the Vercel same-origin API rewrite so the test session cookie
  // belongs to the frontend origin rather than the separate Render origin.
  const response = await page.request.post(`${origin(requireSetting("E2E_STAGING_BASE_URL"))}/api/v1/auth/e2e/staging-session`, {
    headers: { "x-e2e-staging-auth": requireSetting("E2E_STAGING_AUTH_BRIDGE_SECRET") },
    data: { profile_id: getStagingActorProfileId(role) }
  });
  if (response.status() !== 204) {
    throw new Error(`Staging auth bridge rejected ${role} (${response.status()}): ${await response.text()}`);
  }

  await page.goto(`${origin(requireSetting("E2E_STAGING_BASE_URL"))}/`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("main")).toBeVisible();
}

export async function expectRestrictedRoute(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page).not.toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
}
