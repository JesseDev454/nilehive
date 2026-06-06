const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { clearEnvCache } = require("../src/config/env");
const {
  getCampusOneCustomRoles,
  resolveCampusOneProfile,
  resolveCampusOnePortalRole
} = require("../src/modules/auth/campusOneOidc");
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

test("CampusOne OIDC ignores invalid student ID claims on new profiles", async (t) => {
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
    sub: "campus-user-invalid-id",
    email: "student-invalid-id@campusone.com.ng",
    email_verified: true,
    name: "Campus One Student",
    role: "student",
    student_id: "20232286"
  });

  assert.equal(result.profile.student_id, null);
  assert.equal(createdProfile.student_id, null);
});

test("CampusOne OIDC does not write invalid student ID claims to existing profiles", async (t) => {
  withCampusOneOidcEnv(t);
  let updatePayload = null;
  const database = {
    async getProfileByPortalUserId() {
      return null;
    },
    async getProfileByEmail() {
      return {
        id: "profile-existing",
        portal_user_id: null,
        email: "existing@campusone.com.ng",
        full_name: "Existing Student",
        role: "student",
        club_id: null,
        student_id: null,
        requested_role: "student",
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T10:00:00.000Z"
      };
    },
    async updateProfile(profileId, update) {
      updatePayload = update;
      return {
        id: profileId,
        portal_user_id: update.portal_user_id,
        email: "existing@campusone.com.ng",
        full_name: "Existing Student",
        role: "student",
        club_id: null,
        student_id: null,
        requested_role: "student",
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T10:00:00.000Z"
      };
    }
  };

  const result = await resolveCampusOneProfile(database, {
    sub: "campus-user-existing-invalid-id",
    email: "existing@campusone.com.ng",
    email_verified: true,
    name: "Existing Student",
    role: "student",
    student_id: "20232286"
  });

  assert.equal(result.profile.student_id, null);
  assert.deepEqual(updatePayload, {
    portal_user_id: "campus-user-existing-invalid-id"
  });
});

test("CampusOne OIDC keeps existing valid student ID when claim is invalid", async (t) => {
  withCampusOneOidcEnv(t);
  let updatePayload = null;
  const database = {
    async getProfileByPortalUserId() {
      return null;
    },
    async getProfileByEmail() {
      return {
        id: "profile-existing-valid-id",
        portal_user_id: null,
        email: "existing-valid@campusone.com.ng",
        full_name: "Existing Student",
        role: "student",
        club_id: null,
        student_id: "020232255",
        requested_role: "student",
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T10:00:00.000Z"
      };
    },
    async updateProfile(profileId, update) {
      updatePayload = update;
      return {
        id: profileId,
        portal_user_id: update.portal_user_id,
        email: "existing-valid@campusone.com.ng",
        full_name: "Existing Student",
        role: "student",
        club_id: null,
        student_id: "020232255",
        requested_role: "student",
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T10:00:00.000Z"
      };
    }
  };

  const result = await resolveCampusOneProfile(database, {
    sub: "campus-user-existing-valid-id",
    email: "existing-valid@campusone.com.ng",
    email_verified: true,
    name: "Existing Student",
    role: "student",
    student_id: "20232286"
  });

  assert.equal(result.profile.student_id, "020232255");
  assert.deepEqual(updatePayload, {
    portal_user_id: "campus-user-existing-valid-id"
  });
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

test("CampusOne club_services_admin custom role receives effective admin access", async (t) => {
  withCampusOneOidcEnv(t);
  const server = await createTestServer(createFakeDatabase({ role: "student" }));
  t.after(() => server.close());
  const token = createCampusOneSessionToken({
    profileId: "profile-1",
    portalUserId: "campus-club-services-admin-1",
    portalRole: "staff",
    customRoles: ["club_services_admin"],
    email: "club-services-admin@nileuniversity.edu.ng"
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
  assert.equal(payload.data.profile.portal_role, "staff");
  assert.deepEqual(payload.data.profile.custom_roles, ["club_services_admin"]);
});

test("CampusOne custom admin-like roles remain ignored unless explicitly whitelisted", async (t) => {
  withCampusOneOidcEnv(t);
  const server = await createTestServer(createFakeDatabase({ role: "student" }));
  t.after(() => server.close());
  const token = createCampusOneSessionToken({
    profileId: "profile-1",
    portalUserId: "campus-custom-admin-1",
    portalRole: "staff",
    customRoles: ["admin", "president"],
    email: "custom-admin@nileuniversity.edu.ng"
  });

  const response = await fetch(`${server.baseUrl}/api/v1/profile/me`, {
    headers: {
      Cookie: `${CAMPUS_ONE_SESSION_COOKIE}=${encodeURIComponent(token)}`
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.profile.effective_role, "student");
  assert.equal(payload.data.profile.portal_role, "staff");
});

test("CampusOne global role normalization trusts only the top-level academic role", () => {
  assert.equal(resolveCampusOnePortalRole({ role: "admin", roles: ["admin", "president"] }), "admin");
  assert.equal(resolveCampusOnePortalRole({ role: "staff", roles: ["staff", "advisor"] }), "staff");
  assert.equal(resolveCampusOnePortalRole({ role: "student", roles: ["student", "admin"] }), "student");
  assert.equal(resolveCampusOnePortalRole({ role: "student", custom_roles: ["admin"] }), "student");
  assert.equal(resolveCampusOnePortalRole({ role: "external", roles: ["external", "admin"] }), "student");
});

test("CampusOne custom roles are normalized for diagnostics without granting access", () => {
  assert.deepEqual(
    getCampusOneCustomRoles({ custom_roles: [" President ", "advisor", "PRESIDENT", null] }),
    ["president", "advisor"]
  );
  assert.deepEqual(getCampusOneCustomRoles({ roles: ["student", "president"] }), []);
  assert.deepEqual(getCampusOneCustomRoles({ roles: ["staff", "club_services_admin"] }), ["club_services_admin"]);
  assert.deepEqual(getCampusOneCustomRoles({ customRoles: ["club_services_admin"] }), ["club_services_admin"]);
});

test("CampusOne OIDC links an existing local role by valid student ID without overwriting it", async (t) => {
  withCampusOneOidcEnv(t);
  let updatePayload = null;
  const existingProfile = {
    id: "profile-president",
    portal_user_id: null,
    email: "old-president@nileuniversity.edu.ng",
    full_name: "Existing President",
    role: "president",
    club_id: "club-1",
    student_id: "020232255",
    requested_role: "student",
    onboarding_status: "complete",
    account_status: "active"
  };
  const database = {
    async getProfileByPortalUserId() {
      return null;
    },
    async getProfileByEmail() {
      return null;
    },
    async getProfileByStudentId(studentId) {
      return studentId === "020232255" ? existingProfile : null;
    },
    async updateProfile(profileId, update) {
      updatePayload = update;
      return { ...existingProfile, id: profileId, ...update };
    }
  };

  const result = await resolveCampusOneProfile(database, {
    sub: "campus-president-1",
    email: "new-president@nileuniversity.edu.ng",
    name: "Existing President",
    role: "staff",
    student_id: "020232255",
    custom_roles: ["president"]
  });

  assert.equal(result.profile.role, "president");
  assert.equal(result.profile.club_id, "club-1");
  assert.equal(result.portalRole, "staff");
  assert.deepEqual(result.customRoles, ["president"]);
  assert.deepEqual(updatePayload, {
    portal_user_id: "campus-president-1"
  });
});

test("CampusOne OIDC rejects identity claims that match different local profiles", async (t) => {
  withCampusOneOidcEnv(t);
  const portalProfile = {
    id: "profile-by-portal",
    portal_user_id: "campus-user-conflict",
    email: "portal@nileuniversity.edu.ng",
    role: "student",
    club_id: null,
    student_id: null
  };
  const emailProfile = {
    id: "profile-by-email",
    portal_user_id: null,
    email: "conflict@nileuniversity.edu.ng",
    role: "advisor",
    club_id: "club-1",
    student_id: null
  };
  const database = {
    async getProfileByPortalUserId() {
      return portalProfile;
    },
    async getProfileByEmail() {
      return emailProfile;
    },
    async getProfileByStudentId() {
      return null;
    }
  };

  await assert.rejects(
    resolveCampusOneProfile(database, {
      sub: "campus-user-conflict",
      email: "conflict@nileuniversity.edu.ng",
      name: "Conflicting User",
      role: "staff"
    }),
    (error) => {
      assert.equal(error.code, "CAMPUS_ONE_PROFILE_LINK_CONFLICT");
      assert.equal(error.statusCode, 409);
      return true;
    }
  );
});

test("new CampusOne staff users remain local students until assigned", async (t) => {
  withCampusOneOidcEnv(t);
  let createdProfile = null;
  const database = {
    async getProfileByPortalUserId() {
      return null;
    },
    async getProfileByEmail() {
      return null;
    },
    async getProfileByStudentId() {
      return null;
    },
    async createProfile(profile) {
      createdProfile = profile;
      return profile;
    }
  };

  const result = await resolveCampusOneProfile(database, {
    sub: "campus-staff-new",
    email: "staff@nileuniversity.edu.ng",
    name: "New Staff",
    role: "staff",
    custom_roles: ["advisor"]
  });

  assert.equal(result.portalRole, "staff");
  assert.equal(result.profile.role, "student");
  assert.equal(createdProfile.role, "student");
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
