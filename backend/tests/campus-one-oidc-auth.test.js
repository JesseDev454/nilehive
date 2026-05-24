const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { clearEnvCache } = require("../src/config/env");
const { CAMPUS_ONE_SESSION_COOKIE, createCampusOneSessionToken } = require("../src/shared/campusOneSession");

function createFakeDatabase(profileOverrides = {}) {
  const profile = {
    id: "profile-1",
    portal_user_id: "campus-user-1",
    email: "student@nileuniversity.edu.ng",
    full_name: "Campus Student",
    role: "student",
    club_id: null,
    student_id: "020232255",
    requested_role: "student",
    onboarding_status: "complete",
    account_status: "active",
    created_at: "2026-05-24T10:00:00.000Z",
    updated_at: "2026-05-24T10:00:00.000Z",
    ...profileOverrides
  };

  return {
    async getProfileById(profileId) {
      return profileId === profile.id ? profile : null;
    }
  };
}

async function createTestServer(database) {
  const app = createApp({ database });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const address = server.address();

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
}

function withCampusOneOidcEnv(t) {
  const previousEnv = {
    AUTH_PROVIDER: process.env.AUTH_PROVIDER,
    CAMPUS_ONE_CLIENT_SECRET: process.env.CAMPUS_ONE_CLIENT_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  process.env.AUTH_PROVIDER = "campus_one_oidc";
  process.env.CAMPUS_ONE_CLIENT_SECRET = "test-campus-one-secret";
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://example.supabase.co";
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "service";
  clearEnvCache();

  t.after(() => {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    clearEnvCache();
  });
}

test("CampusOne OIDC session cookie authenticates profile requests", async (t) => {
  withCampusOneOidcEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createCampusOneSessionToken({
    profileId: "profile-1",
    portalUserId: "campus-user-1",
    portalRole: "student",
    email: "student@nileuniversity.edu.ng"
  });

  const response = await fetch(`${server.baseUrl}/api/v1/profile/me`, {
    headers: {
      Cookie: `${CAMPUS_ONE_SESSION_COOKIE}=${encodeURIComponent(token)}`
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.profile.id, "profile-1");
  assert.equal(payload.data.profile.effective_role, "student");
  assert.equal(payload.data.profile.portal_role, "student");
});

test("CampusOne admin session receives effective admin role", async (t) => {
  withCampusOneOidcEnv(t);
  const server = await createTestServer(createFakeDatabase({ role: "student" }));
  t.after(() => server.close());
  const token = createCampusOneSessionToken({
    profileId: "profile-1",
    portalUserId: "campus-admin-1",
    portalRole: "admin",
    email: "admin@nileuniversity.edu.ng"
  });

  const response = await fetch(`${server.baseUrl}/api/v1/profile/me`, {
    headers: {
      Cookie: `${CAMPUS_ONE_SESSION_COOKIE}=${encodeURIComponent(token)}`
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.profile.app_role, "student");
  assert.equal(payload.data.profile.effective_role, "admin");
  assert.equal(payload.data.profile.portal_role, "admin");
});
