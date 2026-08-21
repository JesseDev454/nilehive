import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const stagingRoles = ["student", "president", "executive", "advisor", "admin"] as const;
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

export function getStagingApiOrigin() {
  return (process.env.E2E_STAGING_API_BASE_URL || process.env.E2E_STAGING_BASE_URL || "").replace(/\/$/, "");
}

export function getStagingBrowserOrigin() {
  return origin(requireSetting("E2E_STAGING_BASE_URL"));
}

export function getStagingActorProfileId(role: StagingRole) {
  try {
    const actors = JSON.parse(requireSetting("E2E_STAGING_ACTORS_JSON"));
    const profileId = actors?.[role]?.profile_id;
    if (typeof profileId === "string" && profileId.trim()) return profileId.trim();
  } catch {
    // Do not print actor JSON; it may contain emails.
  }
  throw new Error(`E2E_STAGING_ACTORS_JSON.${role}.profile_id is required.`);
}

export async function signInThroughStagingBridge(page: Page, role: StagingRole) {
  assertStagingConfiguration();
  const response = await page.request.post(`${getStagingBrowserOrigin()}/api/v1/auth/e2e/staging-session`, {
    headers: { "x-e2e-staging-auth": requireSetting("E2E_STAGING_AUTH_BRIDGE_SECRET") },
    data: { profile_id: getStagingActorProfileId(role) },
  });
  if (response.status() !== 204) {
    throw new Error(`Staging auth bridge rejected ${role} (${response.status()}).`);
  }

  await page.goto(`${getStagingBrowserOrigin()}/`, { waitUntil: "domcontentloaded" });
  if (await page.getByRole("heading", { name: "Club Services" }).isVisible().catch(() => false)) {
    throw new Error(
      "EXTERNAL BLOCKER: staging frontend is still Clubly. Deploy the OneClub build from this branch to E2E_STAGING_BASE_URL.",
    );
  }
}

export async function expectRestrictedAdminRoute(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
}

export async function apiAsRole(request: APIRequestContext, role: StagingRole) {
  assertStagingConfiguration();
  const apiOrigin = getStagingApiOrigin();
  const session = await request.post(`${apiOrigin}/api/v1/auth/e2e/staging-session`, {
    headers: { "x-e2e-staging-auth": requireSetting("E2E_STAGING_AUTH_BRIDGE_SECRET") },
    data: { profile_id: getStagingActorProfileId(role) },
  });
  if (session.status() === 404) {
    throw new Error(
      "EXTERNAL BLOCKER: staging Render backend does not expose the staging session bridge. Deploy this branch with APP_ENV=staging.",
    );
  }
  if (session.status() !== 204) {
    throw new Error(`Staging auth bridge rejected ${role} API session (${session.status()}).`);
  }
  return apiOrigin;
}
