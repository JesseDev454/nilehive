const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { clearEnvCache } = require("../src/config/env");
const { resolveCampusOneProfile } = require("../src/modules/auth/campusOneOidc");
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
    CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN: process.env.CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN,
    FRONTEND_APP_URL: process.env.FRONTEND_APP_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  process.env.AUTH_PROVIDER = "campus_one_oidc";
  process.env.CAMPUS_ONE_CLIENT_SECRET = "test-campus-one-secret";
  process.env.CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN = "false";
  process.env.FRONTEND_APP_URL = "https://clubs.campusone.com.ng";
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

test("CampusOne OIDC profile resolution trusts CampusOne email claims by default", async (t) => {
  withCampusOneOidcEnv(t);
  let createdProfile = null;
  const database = {
    async getProfileByPortalUserId() {
      return null;
    },
    async getProfileByEmail() {
      return null;
    },
    async createProfile(profile) {
      createdProfile = {
        ...profile,
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T10:00:00.000Z"
      };
      return createdProfile;
    }
  };

  const result = await resolveCampusOneProfile(database, {
    sub: "campus-user-2",
    email: "student@campusone.com.ng",
    email_verified: true,
    name: "Campus One Student",
    role: "student",
    student_id: "020232255"
  });

  assert.equal(result.profile.email, "student@campusone.com.ng");
  assert.equal(result.profile.portal_user_id, "campus-user-2");
  assert.equal(result.portalRole, "student");
  assert.equal(createdProfile.student_id, "020232255");
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

test("CampusOne cancelled consent redirects to friendly login page", async (t) => {
  withCampusOneOidcEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/auth/campus-one/callback?error=access_denied`, {
    redirect: "manual"
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://clubs.campusone.com.ng/login?auth_error=cancelled");
});
