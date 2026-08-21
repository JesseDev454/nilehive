const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { createApp } = require("../src/app");
const { clearEnvCache } = require("../src/config/env");
const { CAMPUS_ONE_SESSION_COOKIE, createCampusOneSessionToken } = require("../src/shared/campusOneSession");
const { createCsrfToken, verifyCsrfToken } = require("../src/shared/csrf");
const { isStagingE2EAuthBridgeEnabled } = require("../src/modules/auth/campusOneOidc");

const FRONTEND_ORIGIN = "https://clubs.campusone.com.ng";
const WEBHOOK_SECRET = "csrf-test-webhook-secret";
const STAGING_BRIDGE_SECRET = "csrf-test-staging-bridge-secret";

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
    },
    async createCampusOneWebhookEvent() {
      return { id: "delivery-1" };
    },
    async updateCampusOneWebhookEvent() {
      return undefined;
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

function sessionCookie(token) {
  return `${CAMPUS_ONE_SESSION_COOKIE}=${encodeURIComponent(token)}`;
}

function createSessionToken(overrides = {}) {
  return createCampusOneSessionToken({
    profileId: "profile-1",
    portalUserId: "campus-user-1",
    portalRole: "student",
    email: "student@nileuniversity.edu.ng",
    ...overrides
  });
}

function withCsrfEnv(t, extra = {}) {
  const keys = [
    "AUTH_PROVIDER",
    "CAMPUS_ONE_CLIENT_ID",
    "CAMPUS_ONE_CLIENT_SECRET",
    "CAMPUS_ONE_SESSION_SECRET",
    "CAMPUS_ONE_REDIRECT_URI",
    "CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN",
    "CAMPUS_ONE_WEBHOOK_SECRET",
    "NODE_ENV",
    "APP_ENV",
    "FRONTEND_APP_URL",
    "CORS_ALLOWED_ORIGINS",
    "E2E_STAGING_AUTH_BRIDGE_ENABLED",
    "E2E_STAGING_AUTH_BRIDGE_SECRET",
    "E2E_STAGING_ALLOWED_PROFILE_IDS",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ];
  const previousEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  process.env.AUTH_PROVIDER = "campus_one_oidc";
  process.env.NODE_ENV = extra.NODE_ENV || "test";
  process.env.APP_ENV = extra.APP_ENV || "test";
  process.env.CAMPUS_ONE_CLIENT_ID = "test-campus-one-client";
  process.env.CAMPUS_ONE_CLIENT_SECRET = "test-campus-one-secret";
  process.env.CAMPUS_ONE_SESSION_SECRET = "test-campus-one-session-secret";
  process.env.CAMPUS_ONE_REDIRECT_URI = "http://localhost:4000/api/v1/auth/campus-one/callback";
  process.env.CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN = "false";
  process.env.CAMPUS_ONE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.FRONTEND_APP_URL = FRONTEND_ORIGIN;
  process.env.CORS_ALLOWED_ORIGINS = FRONTEND_ORIGIN;
  process.env.E2E_STAGING_AUTH_BRIDGE_ENABLED = extra.E2E_STAGING_AUTH_BRIDGE_ENABLED || "false";
  process.env.E2E_STAGING_AUTH_BRIDGE_SECRET = extra.E2E_STAGING_AUTH_BRIDGE_SECRET || "";
  process.env.E2E_STAGING_ALLOWED_PROFILE_IDS = extra.E2E_STAGING_ALLOWED_PROFILE_IDS || "";
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  return { response, payload, text };
}

async function getCsrfToken(baseUrl, token, extraHeaders = {}) {
  const { response, payload } = await fetchJson(`${baseUrl}/api/v1/auth/csrf`, {
    headers: {
      Cookie: sessionCookie(token),
      ...extraHeaders
    }
  });
  assert.equal(response.status, 200);
  assert.match(String(response.headers.get("cache-control") || ""), /no-store/i);
  assert.equal(typeof payload.data.csrf_token, "string");
  assert.ok(payload.data.csrf_token.length > 16);
  return payload.data.csrf_token;
}

test("CSRF token is unavailable without authentication", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload, text } = await fetchJson(`${server.baseUrl}/api/v1/auth/csrf`);
  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
  assert.equal(text.includes("csrf_token"), false);
});

test("authenticated mutation with a valid CSRF token succeeds", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();
  const csrf = await getCsrfToken(server.baseUrl, token);

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": csrf,
      "Content-Type": "application/json"
    }
  });

  assert.equal(response.status, 200);
  assert.equal(payload.data.signed_out, true);
  assert.equal(JSON.stringify(payload).includes(csrf), false);
});

test("missing CSRF token is rejected", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json"
    }
  });

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "CSRF_TOKEN_REQUIRED");
});

test("invalid CSRF token is rejected and never echoed", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();
  const forged = "leak-me-csrf-token-value.not-a-real-signature";
  const logs = [];
  const originalWarn = console.warn;
  console.warn = (...args) => {
    logs.push(args.map((value) => String(value)).join(" "));
  };
  t.after(() => {
    console.warn = originalWarn;
  });

  const { response, payload, text } = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": forged,
      "Content-Type": "application/json"
    }
  });

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "CSRF_TOKEN_INVALID");
  assert.equal(text.includes(forged), false);
  assert.equal(JSON.stringify(payload).includes(forged), false);
  assert.equal(logs.join("\n").includes(forged), false);
});

test("CSRF token from another session is rejected", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const tokenA = createSessionToken({ portalUserId: "campus-user-a" });
  const tokenB = createSessionToken({ portalUserId: "campus-user-b" });
  const csrfA = await getCsrfToken(server.baseUrl, tokenA);

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(tokenB),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": csrfA
    }
  });

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "CSRF_TOKEN_INVALID");
});

test("expired CSRF token is rejected", async (t) => {
  withCsrfEnv(t);
  const token = createSessionToken();
  const encodedPayload = token.split(".")[0];
  const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const sessionPayload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  const expired = createCsrfToken(sessionPayload, token, {
    now: Math.floor(Date.now() / 1000) - 30,
    exp: Math.floor(Date.now() / 1000) - 5
  });

  assert.throws(
    () => verifyCsrfToken(expired, sessionPayload, token),
    (error) => error.code === "CSRF_TOKEN_EXPIRED"
  );

  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": expired
    }
  });

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "CSRF_TOKEN_EXPIRED");
});

test("approved origin succeeds and rejected origin fails", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();
  const csrf = await getCsrfToken(server.baseUrl, token);

  const allowed = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": csrf
    }
  });
  assert.equal(allowed.response.status, 200);
  assert.equal(allowed.response.headers.get("access-control-allow-origin"), FRONTEND_ORIGIN);
  assert.equal(allowed.response.headers.get("access-control-allow-credentials"), "true");
  assert.notEqual(allowed.response.headers.get("access-control-allow-origin"), "*");

  const token2 = createSessionToken();
  const csrf2 = await getCsrfToken(server.baseUrl, token2);
  const rejected = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token2),
      Origin: "https://evil.example",
      "X-CSRF-Token": csrf2
    }
  });
  assert.equal(rejected.response.status, 403);
  assert.equal(rejected.payload.error.code, "CSRF_ORIGIN_REJECTED");
});

test("CSRF header is allowed on credentialed preflight", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "OPTIONS",
    headers: {
      Origin: FRONTEND_ORIGIN,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type,x-csrf-token"
    }
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), FRONTEND_ORIGIN);
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  assert.match(String(response.headers.get("access-control-allow-headers") || ""), /X-CSRF-Token/i);
});

test("GET requests remain unaffected by CSRF", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/profile/me`, {
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN
    }
  });

  assert.equal(response.status, 200);
  assert.equal(payload.data.profile.id, "profile-1");
});

test("OIDC login still works without a CSRF header", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/auth/campus-one/login?return_to=/admin/home`, {
    redirect: "manual"
  });

  assert.equal(response.status, 302);
  assert.match(String(response.headers.get("location") || ""), /auth\.campusone\.com\.ng/);
});

test("OIDC callback still works without a CSRF header", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/auth/campus-one/callback?error=access_denied`, {
    redirect: "manual"
  });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), `${FRONTEND_ORIGIN}/login?auth_error=cancelled`);
});

test("signed Campus One webhook is exempt from CSRF", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const body = JSON.stringify({
    id: "delivery-csrf-1",
    event: "session.revoked",
    data: {}
  });
  const signature = `sha256=${crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")}`;

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/webhooks/campus-one`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Campus-One-Signature": signature,
      "X-Campus-One-Delivery": "delivery-csrf-1",
      "X-Campus-One-Event": "session.revoked"
    },
    body
  });

  assert.equal(response.status, 200);
  assert.equal(payload.data.accepted, true);
  assert.notEqual(payload.error?.code, "CSRF_TOKEN_REQUIRED");
});

test("staging session bridge remains staging-only and works under its explicit exemption", async (t) => {
  withCsrfEnv(t, {
    APP_ENV: "staging",
    NODE_ENV: "test",
    E2E_STAGING_AUTH_BRIDGE_ENABLED: "true",
    E2E_STAGING_AUTH_BRIDGE_SECRET: STAGING_BRIDGE_SECRET
  });
  assert.equal(isStagingE2EAuthBridgeEnabled(), true);
  const server = await createTestServer(createFakeDatabase({ email: "e2e+student@nilehive.test" }));
  t.after(() => server.close());

  const { response } = await fetchJson(`${server.baseUrl}/api/v1/auth/e2e/staging-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-e2e-staging-auth": STAGING_BRIDGE_SECRET
    },
    body: JSON.stringify({ profile_id: "profile-1" })
  });

  assert.equal(response.status, 204);
});

test("production cannot enable the staging session bridge", async (t) => {
  withCsrfEnv(t, {
    APP_ENV: "production",
    NODE_ENV: "test",
    E2E_STAGING_AUTH_BRIDGE_ENABLED: "true",
    E2E_STAGING_AUTH_BRIDGE_SECRET: STAGING_BRIDGE_SECRET
  });
  assert.equal(isStagingE2EAuthBridgeEnabled(), false);
  const server = await createTestServer(createFakeDatabase({ email: "e2e+student@nilehive.test" }));
  t.after(() => server.close());

  const { response, payload } = await fetchJson(`${server.baseUrl}/api/v1/auth/e2e/staging-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-e2e-staging-auth": STAGING_BRIDGE_SECRET
    },
    body: JSON.stringify({ profile_id: "profile-1" })
  });

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "NOT_FOUND");
});

test("multipart mutation supports the CSRF header", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();
  const csrf = await getCsrfToken(server.baseUrl, token);

  const missing = await fetchJson(`${server.baseUrl}/api/v1/storage/upload`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN
    },
    body: new FormData()
  });
  assert.equal(missing.response.status, 403);
  assert.equal(missing.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const form = new FormData();
  form.append("file", new Blob(["demo"]), "demo.txt");
  const withToken = await fetch(`${server.baseUrl}/api/v1/storage/upload`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": csrf
    },
    body: form
  });
  const withPayload = await withToken.json();
  assert.notEqual(withToken.status, 403);
  assert.notEqual(withPayload.error?.code, "CSRF_TOKEN_REQUIRED");
  assert.notEqual(withPayload.error?.code, "CSRF_TOKEN_INVALID");
});

test("GET logout does not clear the session cookie", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();

  const logout = await fetch(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "GET",
    redirect: "manual",
    headers: { Cookie: sessionCookie(token) }
  });
  assert.equal(logout.status, 302);
  assert.equal(logout.headers.get("location"), `${FRONTEND_ORIGIN}/login`);
  const setCookie = String(logout.headers.get("set-cookie") || "");
  assert.equal(setCookie.includes(CAMPUS_ONE_SESSION_COOKIE), false);

  const profile = await fetchJson(`${server.baseUrl}/api/v1/profile/me`, {
    headers: { Cookie: sessionCookie(token) }
  });
  assert.equal(profile.response.status, 200);
});

test("POST logout requires CSRF while a valid session exists", async (t) => {
  withCsrfEnv(t);
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());
  const token = createSessionToken();

  const blocked = await fetchJson(`${server.baseUrl}/api/v1/auth/campus-one/logout`, {
    method: "POST",
    headers: { Cookie: sessionCookie(token) }
  });
  assert.equal(blocked.response.status, 403);
  assert.equal(blocked.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const stillAuthed = await fetchJson(`${server.baseUrl}/api/v1/profile/me`, {
    headers: { Cookie: sessionCookie(token) }
  });
  assert.equal(stillAuthed.response.status, 200);
});

test("Admin approval mutations require a valid CSRF token", async (t) => {
  withCsrfEnv(t);
  const database = createFakeDatabase({
    role: "admin",
    email: "admin@nileuniversity.edu.ng",
    custom_roles: ["club_services_admin"]
  });
  database.getProposalById = async () => null;
  database.getMembershipRequestById = async () => null;
  database.getDuePaymentById = async () => null;
  const server = await createTestServer(database);
  t.after(() => server.close());
  const token = createSessionToken({
    portalRole: "staff",
    email: "admin@nileuniversity.edu.ng",
    customRoles: ["club_services_admin"]
  });

  const endpoints = [
    "/api/v1/proposals/admin/proposal-1/decision",
    "/api/v1/membership-requests/request-1/decision",
    "/api/v1/dues/payment-1"
  ];

  for (const path of endpoints) {
    const missing = await fetchJson(`${server.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie(token),
        Origin: FRONTEND_ORIGIN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ decision: "approve", status: "paid" })
    });
    assert.equal(missing.response.status, 403);
    assert.equal(missing.payload.error.code, "CSRF_TOKEN_REQUIRED");
  }

  const csrf = await getCsrfToken(server.baseUrl, token);
  const invalid = await fetchJson(`${server.baseUrl}/api/v1/proposals/admin/proposal-1/decision`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": "not-a-valid-token"
    },
    body: JSON.stringify({ decision: "approve" })
  });
  assert.equal(invalid.response.status, 403);
  assert.equal(invalid.payload.error.code, "CSRF_TOKEN_INVALID");

  const proposal = await fetchJson(`${server.baseUrl}/api/v1/proposals/admin/proposal-1/decision`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ decision: "approve" })
  });
  assert.equal(proposal.response.status, 404);
  assert.equal(proposal.payload.error.code, "PROPOSAL_NOT_FOUND");

  const membership = await fetchJson(`${server.baseUrl}/api/v1/membership-requests/request-1/decision`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ decision: "reject" })
  });
  assert.equal(membership.response.status, 404);
  assert.equal(membership.payload.error.code, "MEMBERSHIP_REQUEST_NOT_FOUND");

  const dues = await fetchJson(`${server.baseUrl}/api/v1/dues/payment-1`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ status: "paid" })
  });
  assert.equal(dues.response.status, 404);
  assert.equal(dues.payload.error.code, "DUE_PAYMENT_NOT_FOUND");
});

test("Admin People mutations require a valid CSRF token", async (t) => {
  withCsrfEnv(t);
  const database = createFakeDatabase({
    role: "admin",
    email: "admin@nileuniversity.edu.ng",
    custom_roles: ["club_services_admin"]
  });
  const server = await createTestServer(database);
  t.after(() => server.close());
  const token = createSessionToken({
    portalRole: "staff",
    email: "admin@nileuniversity.edu.ng",
    customRoles: ["club_services_admin"]
  });

  const endpoints = [
    "/api/v1/admin/users/profile-2/role",
    "/api/v1/admin/users/profile-2/advisor-assignment"
  ];

  for (const path of endpoints) {
    const missing = await fetchJson(`${server.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie(token),
        Origin: FRONTEND_ORIGIN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "student", club_id: "club-1" })
    });
    assert.equal(missing.response.status, 403);
    assert.equal(missing.payload.error.code, "CSRF_TOKEN_REQUIRED");
  }

  const csrf = await getCsrfToken(server.baseUrl, token);
  const invalid = await fetchJson(`${server.baseUrl}/api/v1/admin/users/profile-2/role`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": "not-a-valid-token"
    },
    body: JSON.stringify({ role: "student" })
  });
  assert.equal(invalid.response.status, 403);
  assert.equal(invalid.payload.error.code, "CSRF_TOKEN_INVALID");

  const role = await fetchJson(`${server.baseUrl}/api/v1/admin/users/profile-2/role`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ role: "student" })
  });
  assert.equal(role.response.status, 404);
  assert.equal(role.payload.error.code, "PROFILE_NOT_FOUND");

  const advisor = await fetchJson(`${server.baseUrl}/api/v1/admin/users/profile-2/advisor-assignment`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ club_id: "club-1" })
  });
  assert.equal(advisor.response.status, 404);
  assert.equal(advisor.payload.error.code, "PROFILE_NOT_FOUND");
});

test("Admin event attendance and announcement publish require CSRF", async (t) => {
  withCsrfEnv(t);
  const announcements = [];
  const database = createFakeDatabase({
    role: "admin",
    email: "admin@nileuniversity.edu.ng",
    custom_roles: ["club_services_admin"]
  });
  database.getApprovedProposalById = async (proposalId) => (
    proposalId === "proposal-1"
      ? {
          id: "proposal-1",
          club_id: "club-1",
          title: "Leadership Summit",
          proposed_activity: "Leadership Summit",
          description: "Planning summit",
          event_date: "2099-01-01",
          event_time: "10:00:00",
          location: "Main Hall",
          number_of_participants: 80,
          budget_estimate: 250000,
          status: "approved",
          admin_decided_at: "2026-04-10T10:00:00.000Z",
          created_at: "2026-04-05T10:00:00.000Z",
          updated_at: "2026-04-10T10:00:00.000Z"
        }
      : null
  );
  database.listEventAttendance = async () => [];
  database.upsertEventAttendance = async (attendance) => ({
    id: "attendance-csrf",
    ...attendance,
    profile: {
      id: attendance.user_id,
      full_name: "Ada Student",
      student_id: "020232255",
      role: "student"
    },
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z"
  });
  database.createAnnouncement = async (announcement) => {
    const created = {
      id: "announcement-csrf",
      ...announcement,
      created_at: "2026-08-20T10:00:00.000Z",
      updated_at: "2026-08-20T10:00:00.000Z"
    };
    announcements.push(created);
    return created;
  };
  database.createAuditLog = async (entry) => entry;

  const server = await createTestServer(database);
  t.after(() => server.close());
  const token = createSessionToken({
    portalRole: "admin",
    email: "admin@nileuniversity.edu.ng",
    customRoles: ["club_services_admin"]
  });

  const missingAttendance = await fetchJson(`${server.baseUrl}/api/v1/events/proposal-1/attendance`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id: "student-1", attended: true })
  });
  assert.equal(missingAttendance.response.status, 403);
  assert.equal(missingAttendance.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const missingAnnouncement = await fetchJson(`${server.baseUrl}/api/v1/communications/announcements`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Campus briefing",
      message: "This is an official campus announcement body.",
      audience: "all_users",
      priority: "normal"
    })
  });
  assert.equal(missingAnnouncement.response.status, 403);
  assert.equal(missingAnnouncement.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const csrf = await getCsrfToken(server.baseUrl, token);
  const attendance = await fetchJson(`${server.baseUrl}/api/v1/events/proposal-1/attendance`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ user_id: "student-1", attended: true })
  });
  assert.equal(attendance.response.status, 200);
  assert.equal(attendance.payload.data.user_id, "student-1");
  assert.equal(JSON.stringify(attendance.payload).includes(csrf), false);

  const published = await fetchJson(`${server.baseUrl}/api/v1/communications/announcements`, {
    method: "POST",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({
      title: "Campus briefing",
      message: "This is an official campus announcement body.",
      audience: "all_users",
      priority: "normal"
    })
  });
  assert.equal(published.response.status, 201);
  assert.equal(published.payload.data.audience, "all_users");
  assert.equal(published.payload.data.title, "Campus briefing");
  assert.equal(announcements.length, 1);
  assert.equal(JSON.stringify(published.payload).includes(csrf), false);

  database.markNotificationRead = async (notificationId, userId) => ({
    id: notificationId,
    user_id: userId,
    type: "pending_admin_review",
    message: "A proposal is waiting for Admin review.",
    delivery_status: "stored",
    read_at: "2026-08-21T10:00:00.000Z",
    created_at: "2026-08-20T10:00:00.000Z"
  });

  const missingRead = await fetchJson(`${server.baseUrl}/api/v1/notifications/notification-csrf/read`, {
    method: "PATCH",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN
    }
  });
  assert.equal(missingRead.response.status, 403);
  assert.equal(missingRead.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const marked = await fetchJson(`${server.baseUrl}/api/v1/notifications/notification-csrf/read`, {
    method: "PATCH",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "X-CSRF-Token": csrf
    }
  });
  assert.equal(marked.response.status, 200);
  assert.equal(marked.payload.data.id, "notification-csrf");
  assert.equal(marked.payload.data.read_at, "2026-08-21T10:00:00.000Z");
  assert.equal(JSON.stringify(marked.payload).includes(csrf), false);
});

test("cookie club update requires CSRF and does not leak secrets", async (t) => {
  withCsrfEnv(t);
  const audits = [];
  const database = createFakeDatabase({ role: "student" });
  database.getClubById = async () => ({
    id: "club-1",
    name: "Nile Book Club",
    description: "Literature club",
    is_public_signup: true,
    dues_amount: 10000
  });
  database.updateClub = async (_clubId, update) => ({
    id: "club-1",
    name: "Nile Book Club",
    description: "Literature club",
    is_public_signup: true,
    dues_amount: 10000,
    ...update
  });
  database.createAuditLog = async (entry) => {
    audits.push(entry);
    return entry;
  };

  const server = await createTestServer(database);
  t.after(() => server.close());
  const token = createSessionToken({
    portalRole: "admin",
    email: "admin@nileuniversity.edu.ng"
  });

  const missing = await fetchJson(`${server.baseUrl}/api/v1/clubs/club-1`, {
    method: "PATCH",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ is_public_signup: false })
  });
  assert.equal(missing.response.status, 403);
  assert.equal(missing.payload.error.code, "CSRF_TOKEN_REQUIRED");

  const csrf = await getCsrfToken(server.baseUrl, token);
  const updated = await fetchJson(`${server.baseUrl}/api/v1/clubs/club-1`, {
    method: "PATCH",
    headers: {
      Cookie: sessionCookie(token),
      Origin: FRONTEND_ORIGIN,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf
    },
    body: JSON.stringify({ is_public_signup: false })
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.payload.data.is_public_signup, false);
  assert.equal(JSON.stringify(updated.payload).includes(csrf), false);
  assert.equal(audits[0].action, "club_updated");
});
