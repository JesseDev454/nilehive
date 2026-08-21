import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadModules(env) {
  const previous = {
    VITE_ONECLUB_MODE: process.env.VITE_ONECLUB_MODE,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
  };

  process.env.VITE_ONECLUB_MODE = env.VITE_ONECLUB_MODE ?? "";
  process.env.VITE_API_BASE_URL = env.VITE_API_BASE_URL ?? "";

  const server = await createServer({
    configFile: path.join(root, "vite.config.ts"),
    root,
    appType: "custom",
    server: { middlewareMode: true, watch: { ignored: ["**"] } },
  });

  try {
    return {
      routes: await server.ssrLoadModule("/src/lib/workspaceRoutes.ts"),
      client: await server.ssrLoadModule("/src/lib/api/client.ts"),
      mode: await server.ssrLoadModule("/src/lib/oneclubMode.ts"),
      data: await server.ssrLoadModule("/src/data/adminMoreData.ts"),
      statuses: await server.ssrLoadModule("/src/lib/proposalStatus.ts"),
      membershipStatus: await server.ssrLoadModule("/src/lib/membershipStatus.ts"),
      duesStatus: await server.ssrLoadModule("/src/lib/duesStatus.ts"),
      adapters: await server.ssrLoadModule("/src/lib/approvals/adapters.ts"),
      errors: await server.ssrLoadModule("/src/lib/approvals/errors.ts"),
      approvals: await server.ssrLoadModule("/src/lib/api/approvals.ts"),
      peopleAdapters: await server.ssrLoadModule("/src/lib/people/adapters.ts"),
      peopleErrors: await server.ssrLoadModule("/src/lib/people/errors.ts"),
      peopleApi: await server.ssrLoadModule("/src/lib/api/people.ts"),
      peopleTypes: await server.ssrLoadModule("/src/lib/people/types.ts"),
      clubsAdapters: await server.ssrLoadModule("/src/lib/clubs/adapters.ts"),
      clubsErrors: await server.ssrLoadModule("/src/lib/clubs/errors.ts"),
      clubsApi: await server.ssrLoadModule("/src/lib/api/clubs.ts"),
      clubsTypes: await server.ssrLoadModule("/src/lib/clubs/types.ts"),
      eventsAdapters: await server.ssrLoadModule("/src/lib/events/adapters.ts"),
      eventsErrors: await server.ssrLoadModule("/src/lib/events/errors.ts"),
      eventsApi: await server.ssrLoadModule("/src/lib/api/events.ts"),
      announcementsAdapters: await server.ssrLoadModule("/src/lib/announcements/adapters.ts"),
      announcementsErrors: await server.ssrLoadModule("/src/lib/announcements/errors.ts"),
      announcementsApi: await server.ssrLoadModule("/src/lib/api/announcements.ts"),
      notificationsAdapters: await server.ssrLoadModule("/src/lib/notifications/adapters.ts"),
      notificationsErrors: await server.ssrLoadModule("/src/lib/notifications/errors.ts"),
      notificationsApi: await server.ssrLoadModule("/src/lib/api/notifications.ts"),
      notificationsDeepLinks: await server.ssrLoadModule("/src/lib/notifications/deepLinks.ts"),
      feedbackAdapters: await server.ssrLoadModule("/src/lib/feedback/adapters.ts"),
      feedbackErrors: await server.ssrLoadModule("/src/lib/feedback/errors.ts"),
      feedbackApi: await server.ssrLoadModule("/src/lib/api/feedback.ts"),
      analyticsAdapters: await server.ssrLoadModule("/src/lib/analytics/adapters.ts"),
      analyticsErrors: await server.ssrLoadModule("/src/lib/analytics/errors.ts"),
      analyticsApi: await server.ssrLoadModule("/src/lib/api/analytics.ts"),
    };
  } finally {
    await server.close();
    if (previous.VITE_ONECLUB_MODE === undefined) delete process.env.VITE_ONECLUB_MODE;
    else process.env.VITE_ONECLUB_MODE = previous.VITE_ONECLUB_MODE;
    if (previous.VITE_API_BASE_URL === undefined) delete process.env.VITE_API_BASE_URL;
    else process.env.VITE_API_BASE_URL = previous.VITE_API_BASE_URL;
  }
}

const integrated = await loadModules({
  VITE_ONECLUB_MODE: "",
  VITE_API_BASE_URL: "",
});
const mockMode = await loadModules({
  VITE_ONECLUB_MODE: "mock",
  VITE_API_BASE_URL: "",
});
const originOverride = await loadModules({
  VITE_ONECLUB_MODE: "",
  VITE_API_BASE_URL: "https://api.example.test",
});

test("matchAdminWorkspace matches exact Admin destinations", () => {
  const { matchAdminWorkspace } = integrated.routes;
  assert.equal(matchAdminWorkspace("/admin/home"), "home");
  assert.equal(matchAdminWorkspace("/admin/approvals"), "approvals");
  assert.equal(matchAdminWorkspace("/admin/people"), "people");
  assert.equal(matchAdminWorkspace("/admin/clubs"), "clubs");
  assert.equal(matchAdminWorkspace("/admin/events"), "events");
  assert.equal(matchAdminWorkspace("/admin/announcements"), "announcements");
  assert.equal(matchAdminWorkspace("/admin/notifications"), "notifications");
  assert.equal(matchAdminWorkspace("/admin/feedback"), "feedback");
  assert.equal(matchAdminWorkspace("/admin/analytics"), "analytics");
  assert.equal(matchAdminWorkspace("/admin/profile"), "profile");
  assert.equal(matchAdminWorkspace("/admin/more"), "more");
});

test("matchAdminWorkspace does not treat leftover Admin Tasks as Home", () => {
  assert.equal(integrated.routes.matchAdminWorkspace("/admin/tasks"), "notfound");
});

test("user-management aliases to People instead of Approvals", () => {
  assert.equal(integrated.routes.matchAdminWorkspace("/user-management"), "notfound");
  assert.equal(integrated.routes.adminAliasRedirect("/user-management"), "/admin/people");
});

test("adminAliasRedirect maps unprefixed Admin aliases", () => {
  const { adminAliasRedirect } = integrated.routes;
  assert.equal(adminAliasRedirect("/events"), "/admin/events");
  assert.equal(adminAliasRedirect("/communications"), "/admin/announcements");
  assert.equal(adminAliasRedirect("/dues"), "/admin/approvals");
  assert.equal(adminAliasRedirect("/archive"), "/admin/events");
});

test("safeReturnTo rejects open redirects and leftover feedback paths", () => {
  const { safeReturnTo } = integrated.routes;
  assert.equal(safeReturnTo("https://evil.example"), "/");
  assert.equal(safeReturnTo("//evil.example"), "/");
  assert.equal(safeReturnTo("/feedback"), "/");
  assert.equal(safeReturnTo("/admin/home"), "/admin/home");
});

test("loginPath preserves a safe workspace return_to", () => {
  const { loginPath } = integrated.routes;
  assert.equal(loginPath("/admin/home"), "/login?return_to=%2Fadmin%2Fhome");
  assert.equal(loginPath("/"), "/login");
  assert.equal(loginPath("/login"), "/login");
});

test("homePathForRole routes from effective_role", () => {
  assert.equal(integrated.routes.homePathForRole("admin"), "/admin/home");
  assert.equal(integrated.routes.homePathForRole("student"), "/student/home");
});

test("OneClub mode defaults to integrated and requires an explicit mock flag", () => {
  assert.equal(integrated.mode.getOneClubMode(), "integrated");
  assert.equal(integrated.mode.isMockPreviewMode(), false);
  assert.equal(mockMode.mode.getOneClubMode(), "mock");
  assert.equal(mockMode.mode.isMockPreviewMode(), true);
});

test("getApiBaseUrl defaults to same-origin /api/v1", () => {
  assert.equal(integrated.client.getApiBaseUrl(), "/api/v1");
  assert.equal(originOverride.client.getApiBaseUrl(), "https://api.example.test/api/v1");
});

test("campusOneLoginUrl builds a cookie login redirect without exposing tokens", () => {
  assert.equal(
    integrated.client.campusOneLoginUrl("/admin/home"),
    "/api/v1/auth/campus-one/login?return_to=%2Fadmin%2Fhome",
  );
  assert.equal(
    integrated.client.campusOneLoginUrl("/feedback"),
    "/api/v1/auth/campus-one/login?return_to=%2F",
  );
});

test("Admin More destinations use explicit /admin prefixes", () => {
  const urls = integrated.data.ADMIN_LAUNCHER_DESTINATIONS.map((item) => item.url);
  assert.ok(urls.includes("/admin/events"));
  assert.ok(urls.includes("/admin/announcements"));
  assert.ok(urls.includes("/admin/notifications"));
  assert.ok(urls.includes("/admin/feedback"));
  assert.ok(urls.includes("/admin/analytics"));
  assert.ok(urls.includes("/admin/profile"));
  assert.equal(urls.some((url) => url === "/events" || url === "/communications"), false);
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function withMockFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    integrated.client.clearCsrfToken();
    return await run();
  } finally {
    integrated.client.clearCsrfToken();
    globalThis.fetch = original;
  }
}

test("proposal statuses map advisor mock decisions and reject unsupported aliases", () => {
  const { applyAdvisorMockDecision, proposalStatusLabel, isUnsupportedProposalStatus } = integrated.statuses;
  assert.equal(applyAdvisorMockDecision("pending_advisor_review", "approve"), "pending_admin_review");
  assert.equal(applyAdvisorMockDecision("pending_advisor_review", "reject"), "advisor_rejected");
  assert.equal(proposalStatusLabel("advisor_rejected"), "Returned by Advisor");
  assert.equal(proposalStatusLabel("admin_rejected"), "Returned by Admin");
  assert.equal(proposalStatusLabel("pending_admin_review"), "Waiting for Admin");
  assert.equal(proposalStatusLabel("pending_admin"), "Unknown status");
  assert.equal(proposalStatusLabel("revisions_requested"), "Unknown status");
  assert.equal(proposalStatusLabel("approved"), "Approved");
  assert.equal(isUnsupportedProposalStatus("pending_admin"), true);
  assert.equal(isUnsupportedProposalStatus("revisions_requested"), true);
  assert.equal(isUnsupportedProposalStatus("advisor_approved"), true);
  assert.equal(isUnsupportedProposalStatus("rejected"), true);
  assert.equal(isUnsupportedProposalStatus("pending_admin_review"), false);
});

test("shouldAttachCsrf covers unsafe own-API methods only", () => {
  const { shouldAttachCsrf } = integrated.client;
  assert.equal(shouldAttachCsrf("POST", "/api/v1/auth/campus-one/logout"), true);
  assert.equal(shouldAttachCsrf("PUT", "/api/v1/profile/me"), true);
  assert.equal(shouldAttachCsrf("PATCH", "/api/v1/profile/me"), true);
  assert.equal(shouldAttachCsrf("DELETE", "/api/v1/notifications/1"), true);
  assert.equal(shouldAttachCsrf("GET", "/api/v1/profile/me"), false);
  assert.equal(shouldAttachCsrf("POST", "https://evil.example/api/v1/auth/campus-one/logout"), false);
});

test("getCsrfToken fetches once and deduplicates in-flight requests", async () => {
  const calls = [];
  await withMockFetch(async (url) => {
    calls.push(String(url));
    return jsonResponse({ data: { csrf_token: "csrf-shared" } });
  }, async () => {
    const [first, second] = await Promise.all([
      integrated.client.getCsrfToken(),
      integrated.client.getCsrfToken(),
    ]);
    assert.equal(first, "csrf-shared");
    assert.equal(second, "csrf-shared");
    assert.equal(calls.length, 1);
    assert.equal(await integrated.client.getCsrfToken(), "csrf-shared");
    assert.equal(calls.length, 1);
  });
});

test("api client attaches CSRF to unsafe methods and skips GET", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-header" } });
    }
    return jsonResponse({ data: { ok: true } });
  }, async () => {
    await integrated.client.apiRequest("/profile/me");
    await integrated.client.apiRequest("/auth/campus-one/logout", { method: "POST" });
    await integrated.client.apiRequest("/profile/me", { method: "PUT", body: {} });
    await integrated.client.apiRequest("/profile/me", { method: "PATCH", body: {} });
    await integrated.client.apiRequest("/notifications/1", { method: "DELETE" });

    const getCall = calls.find((call) => call.method === "GET" && call.url.endsWith("/profile/me"));
    assert.equal(getCall.csrf, null);
    assert.equal(calls.find((call) => call.method === "POST").csrf, "csrf-header");
    assert.equal(calls.find((call) => call.method === "PUT").csrf, "csrf-header");
    assert.equal(calls.find((call) => call.method === "PATCH").csrf, "csrf-header");
    assert.equal(calls.find((call) => call.method === "DELETE").csrf, "csrf-header");
    assert.equal(calls.filter((call) => call.url.endsWith("/auth/csrf")).length, 1);
  });
});

test("api client clears CSRF on logout helper and 401 responses", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    calls.push(String(url));
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: `csrf-${calls.length}` } });
    }
    if (String(url).includes("/profile/me")) {
      return jsonResponse({ error: { code: "AUTH_REQUIRED", message: "Please sign in" } }, 401);
    }
    return jsonResponse({ data: { signed_out: true } });
  }, async () => {
    await integrated.client.getCsrfToken();
    await assert.rejects(
      () => integrated.client.apiRequest("/profile/me"),
      (error) => error.status === 401 && error.code === "AUTH_REQUIRED",
    );
    await integrated.client.getCsrfToken();
    assert.equal(calls.filter((url) => url.endsWith("/auth/csrf")).length, 2);
    integrated.client.clearCsrfToken();
    await integrated.client.getCsrfToken();
    assert.equal(calls.filter((url) => url.endsWith("/auth/csrf")).length, 3);
  });
});

test("api client retries CSRF expiration once and does not loop", async () => {
  let csrfFetches = 0;
  let posts = 0;
  await withMockFetch(async (url, init = {}) => {
    if (String(url).endsWith("/auth/csrf")) {
      csrfFetches += 1;
      return jsonResponse({ data: { csrf_token: `csrf-${csrfFetches}` } });
    }
    posts += 1;
    return jsonResponse({ error: { code: "CSRF_TOKEN_EXPIRED", message: "expired" } }, 403);
  }, async () => {
    await assert.rejects(
      () => integrated.client.apiRequest("/auth/campus-one/logout", { method: "POST" }),
      (error) => error.status === 403 && error.code === "CSRF_TOKEN_EXPIRED",
    );
    assert.equal(csrfFetches, 2);
    assert.equal(posts, 2);
  });
});

test("api client retries a CSRF failure once then succeeds", async () => {
  let posts = 0;
  await withMockFetch(async (url, init = {}) => {
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-retry" } });
    }
    posts += 1;
    if (posts === 1) {
      return jsonResponse({ error: { code: "CSRF_TOKEN_INVALID", message: "invalid" } }, 403);
    }
    return jsonResponse({ data: { signed_out: true } });
  }, async () => {
    const payload = await integrated.client.apiRequest("/auth/campus-one/logout", { method: "POST" });
    assert.equal(payload.data.signed_out, true);
    assert.equal(posts, 2);
  });
});

test("api client preserves abort and normalized network errors", async () => {
  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      const error = new DOMException("The operation was aborted.", "AbortError");
      throw error;
    }
    throw new TypeError("failed to fetch");
  }, async () => {
    await assert.rejects(
      () => integrated.client.apiRequest("/profile/me", { signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });

  await withMockFetch(async () => {
    throw new TypeError("failed to fetch");
  }, async () => {
    await assert.rejects(
      () => integrated.client.apiRequest("/profile/me"),
      (error) => error.code === "NETWORK_ERROR" && error.status === 0,
    );
  });
});

test("membership and dues statuses map backend values and reject mock aliases", () => {
  const { membershipRequestStatusLabel, isUnsupportedMembershipStatus, isPendingMembershipRequest } = integrated.membershipStatus;
  const { duesStatusLabel, isUnsupportedDuesStatus, isActionableDuesStatus } = integrated.duesStatus;
  assert.equal(membershipRequestStatusLabel("pending"), "Pending review");
  assert.equal(membershipRequestStatusLabel("approved_pending_dues"), "Admitted, waiting for dues");
  assert.equal(membershipRequestStatusLabel("active"), "Admitted");
  assert.equal(membershipRequestStatusLabel("approved"), "Unknown status");
  assert.equal(isUnsupportedMembershipStatus("approved"), true);
  assert.equal(isPendingMembershipRequest("pending"), true);
  assert.equal(duesStatusLabel("submitted"), "Proof submitted");
  assert.equal(duesStatusLabel("paid"), "Verified");
  assert.equal(duesStatusLabel("verified"), "Unknown status");
  assert.equal(isUnsupportedDuesStatus("verified"), true);
  assert.equal(isActionableDuesStatus("submitted"), true);
  assert.equal(isActionableDuesStatus("paid"), false);
});

test("approval adapters preserve backend ids and do not fabricate required fields", () => {
  const { adaptAdminProposal, adaptMembershipRequest, adaptDuesPayment, unwrapPaginated, unwrapDuesPayments } = integrated.adapters;
  const proposal = adaptAdminProposal({
    id: "proposal-99",
    title: "Cloud Buildathon",
    description: "Build with students.",
    club_id: "club-8",
    club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
    submitted_by: "president-1",
    event_date: "2026-09-12",
    location: "Technology Auditorium",
    budget_estimate: 150000,
    status: "pending_admin_review",
    advisor_remarks: "Ready for Admin.",
  });
  assert.equal(proposal.id, "proposal-99");
  assert.equal(proposal.status, "pending_admin_review");
  assert.equal(proposal.submitted_by_name, null);
  assert.equal(proposal.advisor_name, null);
  assert.equal(proposal.can_authorize, true);
  assert.equal(proposal.can_override, false);

  const join = adaptMembershipRequest({
    id: "request-9",
    profile_id: "student-9",
    club_id: "club-4",
    status: "pending",
    join_reason: "I want to help.",
    created_at: "2026-08-18T14:30:00Z",
    profile: { id: "student-9", full_name: "Amina Bello", student_id: "NIL/1", role: "student" },
    club: { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
    due_payment: { id: "due-9", status: "submitted", amount: 10000 },
    whatsapp_onboarding_status: "not_ready",
  });
  assert.equal(join.id, "request-9");
  assert.equal(join.student_email, null);
  assert.equal(join.whatsapp_ready, false);
  assert.equal(join.status, "pending");

  const dues = adaptDuesPayment({
    id: "due-3",
    club_id: "club-2",
    amount: 10000,
    payment_reference: "REF-1",
    proof_url: "https://files.example/receipt",
    status: "submitted",
    submitted_at: "2026-08-18T16:15:00Z",
    club: { id: "club-2", name: "Nile Business Club", code: "NBC" },
    member: { id: "member-3", full_name: "Amina Bello", student_id: "NIL/2", email: null },
  });
  assert.equal(dues.id, "due-3");
  assert.equal(dues.has_proof, true);
  assert.equal(dues.student_email, null);
  assert.equal(dues.payment_channel, null);

  const page = unwrapPaginated({ items: [{ id: "a" }], page: 1, page_size: 20, total: 1, has_next: false });
  assert.equal(page.items[0].id, "a");
  const duesPage = unwrapDuesPayments({ summary: { paid: 0 }, payments: { items: [{ id: "due-3" }], page: 1, page_size: 20, total: 1, has_next: false } });
  assert.equal(duesPage.items[0].id, "due-3");
});

test("approval error normalization covers 401 403 404 409 429 and 500", () => {
  const { ApiClientError } = integrated.client;
  const { normalizeApprovalsError } = integrated.errors;
  assert.equal(normalizeApprovalsError(new ApiClientError(401, "AUTH_REQUIRED", "Please sign in")).kind, "unauthorized");
  assert.equal(normalizeApprovalsError(new ApiClientError(403, "FORBIDDEN", "No")).kind, "forbidden");
  assert.equal(normalizeApprovalsError(new ApiClientError(404, "PROPOSAL_NOT_FOUND", "Missing")).kind, "not_found");
  assert.equal(normalizeApprovalsError(new ApiClientError(409, "INVALID_PROPOSAL_STATE", "Stale")).kind, "conflict");
  const limited = normalizeApprovalsError(new ApiClientError(429, "ADMIN_DECISION_RATE_LIMITED", "Wait", null, 12));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /12 seconds/);
  assert.equal(normalizeApprovalsError(new ApiClientError(500, "SERVER", "Boom")).kind, "server");
});

test("approval API functions use CSRF on mutations and honor abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
      body: init.body ? JSON.parse(String(init.body)) : null,
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-approvals" } });
    }
    if (String(url).includes("/proposals/admin") && (init.method || "GET") === "GET") {
      return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
    }
    if (String(url).includes("/membership-requests") && (init.method || "GET") === "GET") {
      return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
    }
    if (String(url).includes("/dues") && (init.method || "GET") === "GET") {
      return jsonResponse({ data: { summary: {}, payments: { items: [], page: 1, page_size: 100, total: 0, has_next: false } } });
    }
    return jsonResponse({ data: { id: "ok", status: "approved" } });
  }, async () => {
    await integrated.approvals.listAdminProposals({ status: "pending_admin_review", page_size: 100 });
    await integrated.approvals.submitAdminProposalDecision("proposal-1", { decision: "approve" });
    await integrated.approvals.submitMembershipDecision("request-1", { decision: "reject", remarks: "Capacity reached" });
    await integrated.approvals.markMembershipWhatsAppAdded("request-1", { notes: "Added" });
    await integrated.approvals.submitDuesDecision("due-1", { status: "paid" });

    const getCall = calls.find((call) => call.method === "GET" && call.url.includes("/proposals/admin"));
    assert.equal(getCall.csrf, null);
    const proposalDecision = calls.find((call) => call.url.endsWith("/proposals/admin/proposal-1/decision"));
    assert.equal(proposalDecision.csrf, "csrf-approvals");
    assert.deepEqual(proposalDecision.body, { decision: "approve" });
    const membershipDecision = calls.find((call) => call.url.endsWith("/membership-requests/request-1/decision"));
    assert.equal(membershipDecision.csrf, "csrf-approvals");
    assert.equal(membershipDecision.body.remarks, "Capacity reached");
    const duesDecision = calls.find((call) => call.url.endsWith("/dues/due-1"));
    assert.equal(duesDecision.csrf, "csrf-approvals");
    assert.deepEqual(duesDecision.body, { status: "paid" });
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: { items: [] } });
  }, async () => {
    await assert.rejects(
      () => integrated.approvals.listAdminProposals({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("integrated mode never falls back to mock approval records", () => {
  assert.equal(integrated.mode.isMockPreviewMode(), false);
  assert.equal(mockMode.mode.isMockPreviewMode(), true);
});

test("People adapters preserve backend IDs and do not fabricate Campus One fields", () => {
  const { adaptAdminUser, unwrapPaginated, isAssignableOneClubRole, accountStatusLabel } = integrated.peopleAdapters;
  const person = adaptAdminUser({
    id: "profile-9",
    full_name: "Amina Bello",
    email: null,
    portal_user_id: "campus-9",
    department: null,
    student_type: null,
    role: "president",
    app_role: "president",
    effective_role: "president",
    portal_role: null,
    custom_roles: [],
    club_id: "club-8",
    student_id: "NIL/2023/UG/0458",
    requested_role: null,
    onboarding_status: "complete",
    account_status: "active",
    club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
    advisor_assignments: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(person.id, "profile-9");
  assert.equal(person.email, null);
  assert.equal(person.faculty, null);
  assert.equal(person.department, null);
  assert.equal(person.campusOneBaseRole, null);
  assert.equal(person.oneClubRole, "president");
  assert.equal(person.assignedClubId, "club-8");
  assert.equal(person.joinedClubsCount, null);
  assert.equal(accountStatusLabel("suspended"), "Suspended");
  assert.equal(isAssignableOneClubRole("admin"), false);
  assert.equal(isAssignableOneClubRole("feedback_manager"), false);
  assert.deepEqual(integrated.peopleTypes.ASSIGNABLE_ONECLUB_ROLES, ["student", "executive", "president", "advisor"]);

  const page = unwrapPaginated({ items: [{ id: "a" }], page: 2, page_size: 20, total: 21, has_next: true });
  assert.equal(page.page, 2);
  assert.equal(page.has_next, true);
  assert.equal(page.total, 21);
});

test("People error normalization covers 401 403 404 409 429 and president conflict details", () => {
  const { ApiClientError } = integrated.client;
  const { normalizePeopleError } = integrated.peopleErrors;
  assert.equal(normalizePeopleError(new ApiClientError(401, "AUTH_REQUIRED", "Please sign in")).kind, "unauthorized");
  assert.equal(normalizePeopleError(new ApiClientError(403, "FORBIDDEN", "No")).kind, "forbidden");
  assert.equal(normalizePeopleError(new ApiClientError(404, "PROFILE_NOT_FOUND", "Missing")).kind, "not_found");
  const conflict = normalizePeopleError(new ApiClientError(
    409,
    "PRESIDENT_ALREADY_EXISTS",
    "Club has a president",
    { current_president: { id: "pres-1", full_name: "Farouk Aliyu", student_id: "NIL/1", club_id: "club-8" } },
  ));
  assert.equal(conflict.kind, "conflict");
  assert.equal(conflict.currentPresident.full_name, "Farouk Aliyu");
  const limited = normalizePeopleError(new ApiClientError(429, "RATE_LIMITED", "Wait", null, 8));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /8 seconds/);
  assert.equal(normalizePeopleError(new ApiClientError(500, "SERVER", "Boom")).kind, "server");
});

test("People API functions use CSRF on mutations and honor abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
      body: init.body ? JSON.parse(String(init.body)) : null,
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-people" } });
    }
    if (String(url).includes("/admin/users") && (init.method || "GET") === "GET") {
      return jsonResponse({
        data: {
          items: [{
            id: "profile-1",
            full_name: "Amina Bello",
            email: null,
            role: "student",
            app_role: "student",
            club_id: null,
            advisor_assignments: [],
          }],
          page: 1,
          page_size: 20,
          total: 1,
          has_next: false,
        },
      });
    }
    if (String(url).endsWith("/clubs")) {
      return jsonResponse({ data: [{ id: "club-8", name: "Nile Google Developers", code: "NGDC" }] });
    }
    return jsonResponse({
      data: {
        profile: { id: "profile-1", role: "president", app_role: "president", club_id: "club-8", advisor_assignments: [] },
        history: { id: "history-1" },
      },
    });
  }, async () => {
    await integrated.peopleApi.listAdminUsers({ q: "Amina", page: 1, page_size: 20 });
    await integrated.peopleApi.getAdminUser("profile-1");
    await integrated.peopleApi.assignOneClubRole("profile-1", { role: "president", club_id: "club-8" });
    await integrated.peopleApi.updateAdvisorAssignment("profile-1", { club_id: "club-8" });
    await integrated.peopleApi.listClubsForAssignment();

    const listCall = calls.find((call) => call.method === "GET" && call.url.includes("/admin/users?"));
    assert.equal(listCall.csrf, null);
    assert.match(listCall.url, /q=Amina/);
    const roleCall = calls.find((call) => call.url.endsWith("/admin/users/profile-1/role"));
    assert.equal(roleCall.csrf, "csrf-people");
    assert.deepEqual(roleCall.body, { role: "president", club_id: "club-8" });
    const advisorCall = calls.find((call) => call.url.endsWith("/admin/users/profile-1/advisor-assignment"));
    assert.equal(advisorCall.csrf, "csrf-people");
    assert.deepEqual(advisorCall.body, { club_id: "club-8" });
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: { items: [] } });
  }, async () => {
    await assert.rejects(
      () => integrated.peopleApi.listAdminUsers({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("integrated mode never falls back to mock People records", () => {
  assert.equal(integrated.mode.isMockPreviewMode(), false);
  assert.equal(mockMode.mode.isMockPreviewMode(), true);
});

test("Clubs adapters preserve backend IDs and do not invent counts or leadership", () => {
  const { adaptClubRecord, adaptClubList, adaptAdminClubView, adaptClubMemberPage, adaptPaymentSettings } = integrated.clubsAdapters;
  const club = adaptClubRecord({
    id: "club-uuid-1",
    name: "Nile Google Developers",
    code: "NGD",
    description: "Developer community",
    advisor_id: null,
    dues_amount: 10000,
    is_public_signup: true,
    whatsapp_onboarding_notes: "Private note",
    categories: ["Tech"],
    logo_path: "club-uuid-1/logo.png",
    created_at: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(club.id, "club-uuid-1");
  assert.equal(club.code, "NGD");
  assert.equal(club.dues_amount, 10000);
  const view = adaptAdminClubView(club);
  assert.equal(view.presidentName, null);
  assert.equal(view.advisorName, null);
  assert.equal(view.memberCount, null);
  assert.equal(view.location, null);
  assert.equal(view.coverImage, null);
  assert.equal(view.supportsDelete, false);
  assert.equal(view.supportsLogoUpload, false);
  assert.equal(integrated.clubsTypes.AUTHORITATIVE_OFFICIAL_CLUBS.length, 14);
  assert.equal(integrated.clubsTypes.AUTHORITATIVE_OFFICIAL_CLUBS.find((item) => item.name === "Nile Google Developers").code, "NGD");
  assert.equal(integrated.clubsTypes.AUTHORITATIVE_OFFICIAL_CLUBS.find((item) => item.name === "Women in Tech Club").code, "WIT");

  const page = adaptClubMemberPage({
    items: [{ id: "member-1", club_id: "club-uuid-1", full_name: "Amina Bello", student_id: "NIL/1", club_role: "member", membership_status: "active" }],
    page: 1,
    page_size: 20,
    total: 1,
    has_next: false,
  });
  assert.equal(page.total, 1);
  assert.equal(page.items[0].clubId, "club-uuid-1");
  assert.equal(adaptClubList([{ id: "x" }]).length, 0);
  assert.equal(adaptPaymentSettings({ club_id: "club-uuid-1", bank_name: "Providus Bank", account_number: "1305861314" }).bank_name, "Providus Bank");
});

test("Clubs error normalization covers 401 403 404 409 429 and duplicate names", () => {
  const { ApiClientError } = integrated.client;
  const { normalizeClubsError } = integrated.clubsErrors;
  assert.equal(normalizeClubsError(new ApiClientError(401, "AUTH_REQUIRED", "Please sign in")).kind, "unauthorized");
  assert.equal(normalizeClubsError(new ApiClientError(403, "FORBIDDEN", "No")).kind, "forbidden");
  assert.equal(normalizeClubsError(new ApiClientError(404, "CLUB_NOT_FOUND", "Missing")).kind, "not_found");
  const conflict = normalizeClubsError(new ApiClientError(409, "CLUB_ALREADY_EXISTS", "Duplicate"));
  assert.equal(conflict.kind, "conflict");
  assert.match(conflict.message, /already exists/);
  const limited = normalizeClubsError(new ApiClientError(429, "CLUB_WRITE_RATE_LIMITED", "Wait", null, 8));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /8 seconds/);
  assert.equal(normalizeClubsError(new ApiClientError(400, "VALIDATION_ERROR", "Bad", { field: "dues_amount" })).field, "dues_amount");
  assert.equal(normalizeClubsError(new ApiClientError(500, "SERVER", "Boom")).kind, "server");
});

test("Clubs API functions use CSRF on mutations and honor abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
      body: init.body ? JSON.parse(String(init.body)) : null,
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-clubs" } });
    }
    if (String(url).includes("/members")) {
      return jsonResponse({
        data: { items: [{ id: "member-1", club_id: "club-1", full_name: "Amina Bello" }], page: 1, page_size: 20, total: 1, has_next: false },
      });
    }
    if (String(url).includes("/dues/payment-settings")) {
      return jsonResponse({ data: { club_id: "club-1", bank_name: "Providus Bank", account_number: "1305861314", account_name: "Nile Arts" } });
    }
    if (String(url).endsWith("/clubs") && (init.method || "GET") === "GET") {
      return jsonResponse({
        data: [{ id: "club-1", name: "Nile Book Club", code: "NBC", dues_amount: 10000, is_public_signup: true, categories: [] }],
      });
    }
    if (String(url).endsWith("/clubs") && init.method === "POST") {
      return jsonResponse({
        data: { id: "club-new", name: "Nile Robotics Club", code: "NRC", description: "A new official club description.", dues_amount: 10000, is_public_signup: true, categories: [] },
      });
    }
    return jsonResponse({
      data: { id: "club-1", name: "Nile Book Club", code: "NBC", description: "Updated club description for tests.", dues_amount: 10000, is_public_signup: false, categories: [] },
    });
  }, async () => {
    await integrated.clubsApi.listClubs();
    await integrated.clubsApi.getClub("club-1");
    await integrated.clubsApi.createClub({ name: "Nile Robotics Club", description: "A new official club description." });
    await integrated.clubsApi.updateClub("club-1", { is_public_signup: false, dues_amount: 10000 });
    await integrated.clubsApi.listClubMembers({ club_id: "club-1", page: 1, page_size: 20 });
    await integrated.clubsApi.getClubPaymentSettings("club-1");
    await integrated.clubsApi.upsertClubPaymentSettings({
      bank_name: "Providus Bank",
      account_number: "1305861314",
      account_name: "Nile Arts",
    });

    const listCall = calls.find((call) => call.method === "GET" && call.url.endsWith("/clubs"));
    assert.equal(listCall.csrf, null);
    const createCall = calls.find((call) => call.method === "POST" && call.url.endsWith("/clubs"));
    assert.equal(createCall.csrf, "csrf-clubs");
    const updateCall = calls.find((call) => call.method === "PATCH" && call.url.endsWith("/clubs/club-1"));
    assert.equal(updateCall.csrf, "csrf-clubs");
    assert.deepEqual(updateCall.body, { is_public_signup: false, dues_amount: 10000 });
    const paymentCall = calls.find((call) => call.method === "POST" && call.url.includes("/dues/payment-settings"));
    assert.equal(paymentCall.csrf, "csrf-clubs");
    const membersCall = calls.find((call) => call.url.includes("/members?"));
    assert.match(membersCall.url, /club_id=club-1/);
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: [] });
  }, async () => {
    await assert.rejects(
      () => integrated.clubsApi.listClubs(controller.signal),
      (error) => error.name === "AbortError",
    );
  });
});

test("integrated mode never falls back to mock club records", () => {
  assert.equal(integrated.mode.isMockPreviewMode(), false);
  assert.equal(mockMode.mode.isMockPreviewMode(), true);
});

test("event adapters preserve proposal IDs and omit fabricated counts", () => {
  const event = integrated.eventsAdapters.adaptApprovedEvent({
    id: "proposal-1",
    proposal_id: "proposal-1",
    club_id: "club-1",
    title: "Leadership Summit",
    description: "A planning summit",
    event_date: "2099-01-01",
    event_time: "10:00:00",
    location: "Main Hall",
    number_of_participants: 80,
    status: "approved",
    event_lifecycle: "upcoming",
    can_rsvp: true,
  });
  assert.equal(event.id, "proposal-1");
  assert.equal(event.proposal_id, "proposal-1");
  const view = integrated.eventsAdapters.toAdminEventView(event, { clubName: "Nile Book Club" });
  assert.equal(view.proposalId, "proposal-1");
  assert.equal(view.clubName, "Nile Book Club");
  assert.equal(view.rsvpsCount, null);
  assert.equal(view.attendeesCount, null);
  assert.equal(view.engagementLoaded, false);
  assert.equal(view.checkInPath, "/check-in?proposal=proposal-1");
  assert.equal(view.startTime, "10:00");
  assert.equal(view.endTime, null);

  const engagement = integrated.eventsAdapters.adaptEventEngagement({
    event,
    summary: { total_rsvps: 2, going: 1, interested: 1, not_going: 0, cancelled: 0, attended: 1 },
    rsvps: [
      {
        id: "rsvp-1",
        proposal_id: "proposal-1",
        club_id: "club-1",
        user_id: "student-1",
        status: "going",
        profile: { id: "student-1", full_name: "Ada Student", student_id: "020232255", role: "student" },
      },
    ],
    attendance: [
      {
        id: "att-1",
        proposal_id: "proposal-1",
        club_id: "club-1",
        user_id: "student-1",
        attended: true,
        checked_in_by: "admin-1",
        checked_in_at: "2026-08-20T10:00:00.000Z",
        profile: { id: "student-1", full_name: "Ada Student", student_id: "020232255", role: "student" },
      },
    ],
  });
  const loaded = integrated.eventsAdapters.mergeEventEngagement(view, engagement);
  assert.equal(loaded.rsvpsCount, 2);
  assert.equal(loaded.attendeesCount, 1);
  assert.equal(loaded.attendanceRoster[0].studentName, "Ada Student");
  assert.equal(loaded.attendanceRoster[0].checkInMethod, "manual_fallback");
});

test("event errors distinguish 404 409 and 429", () => {
  const { ApiClientError } = integrated.client;
  const { normalizeEventsError } = integrated.eventsErrors;
  assert.equal(normalizeEventsError(new ApiClientError(404, "APPROVED_EVENT_NOT_FOUND", "Missing")).kind, "not_found");
  assert.equal(normalizeEventsError(new ApiClientError(409, "EVENT_CHECK_IN_CLOSED", "Closed")).kind, "conflict");
  const limited = normalizeEventsError(new ApiClientError(429, "RATE", "Wait", null, 9));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /9 seconds/);
});

test("Events API functions use CSRF on attendance and honor abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
      body: init.body ? JSON.parse(String(init.body)) : null,
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-events" } });
    }
    if (String(url).includes("/engagement")) {
      return jsonResponse({
        data: {
          event: {
            id: "proposal-1",
            proposal_id: "proposal-1",
            club_id: "club-1",
            title: "Summit",
            status: "approved",
            event_lifecycle: "upcoming",
            can_rsvp: true,
          },
          summary: { total_rsvps: 0, going: 0, interested: 0, not_going: 0, cancelled: 0, attended: 0 },
          rsvps: [],
          attendance: [],
        },
      });
    }
    if (String(url).includes("/attendance")) {
      return jsonResponse({
        data: {
          id: "att-1",
          proposal_id: "proposal-1",
          club_id: "club-1",
          user_id: "student-1",
          attended: true,
          checked_in_by: "admin-1",
          checked_in_at: "2026-08-20T10:00:00.000Z",
          profile: { id: "student-1", full_name: "Ada Student", student_id: "020232255", role: "student" },
        },
      });
    }
    if (String(url).includes("/reports")) {
      return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
    }
    return jsonResponse({
      data: {
        items: [
          {
            id: "proposal-1",
            proposal_id: "proposal-1",
            club_id: "club-1",
            title: "Summit",
            status: "approved",
            event_lifecycle: "upcoming",
            can_rsvp: true,
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
        has_next: false,
      },
    });
  }, async () => {
    await integrated.eventsApi.listApprovedEvents({ page: 1, page_size: 100 });
    await integrated.eventsApi.getEventEngagement("proposal-1");
    await integrated.eventsApi.submitEventAttendance("proposal-1", { user_id: "student-1", attended: true });
    await integrated.eventsApi.listEventReports({ page_size: 100 });
    const listCall = calls.find((call) => call.method === "GET" && call.url.includes("/events/approved"));
    assert.equal(listCall.csrf, null);
    assert.match(listCall.url, /sort=event_date/);
    const attendanceCall = calls.find((call) => call.method === "POST" && call.url.includes("/attendance"));
    assert.equal(attendanceCall.csrf, "csrf-events");
    assert.deepEqual(attendanceCall.body, { user_id: "student-1", attended: true });
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
  }, async () => {
    await assert.rejects(
      () => integrated.eventsApi.listApprovedEvents({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("announcement adapters map club audience and validate required fields", () => {
  const record = integrated.announcementsAdapters.adaptAnnouncementRecord({
    id: "ann-1",
    club_id: "club-1",
    created_by: "admin-1",
    title: "Lab hours",
    message: "Tech Lab 4 stays open until 20:00 this week.",
    audience: "club",
    priority: "low",
    created_at: "2026-08-11T16:45:00Z",
  });
  const view = integrated.announcementsAdapters.toAdminAnnouncementView(record, {
    clubName: "Nile Google Developers",
    publisherName: "Zainab Ahmed",
  });
  assert.equal(view.audience, "one_club");
  assert.equal(view.targetClubId, "club-1");
  assert.equal(view.readCount, null);
  assert.equal(view.totalRecipients, null);
  const payload = integrated.announcementsAdapters.buildCreateAnnouncementPayload({
    title: "Grant calendar",
    content: "Review the approved proposal calendar before disbursement.",
    audience: "one_club",
    targetClubId: "club-1",
    priority: "high",
  });
  assert.equal(payload.audience, "club");
  assert.equal(payload.club_id, "club-1");
  assert.equal(payload.message, "Review the approved proposal calendar before disbursement.");
  const errors = integrated.announcementsAdapters.validateAnnouncementComposer({
    title: "",
    content: "short",
    audience: "one_club",
    priority: "normal",
  });
  assert.equal(errors.title, "Announcement title is required.");
  assert.ok(errors.content);
  assert.equal(errors.targetClubId, "Please select a target club.");
});

test("announcement errors distinguish rate limits and validation", () => {
  const { ApiClientError } = integrated.client;
  const { normalizeAnnouncementsError } = integrated.announcementsErrors;
  const limited = normalizeAnnouncementsError(new ApiClientError(429, "ANNOUNCEMENT_RATE_LIMITED", "Wait", null, 12));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /12 seconds/);
  assert.equal(normalizeAnnouncementsError(new ApiClientError(403, "FORBIDDEN", "No")).kind, "forbidden");
  assert.equal(
    normalizeAnnouncementsError(new ApiClientError(400, "VALIDATION_ERROR", "Bad", { field: "audience" })).field,
    "audience",
  );
});

test("Announcements API functions use CSRF on publish and honor abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
      body: init.body ? JSON.parse(String(init.body)) : null,
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-announcements" } });
    }
    if ((init.method || "GET") === "POST") {
      return jsonResponse({
        data: {
          id: "ann-new",
          title: "Grant calendar",
          message: "Review the approved proposal calendar before disbursement.",
          audience: "all_users",
          priority: "high",
          created_at: "2026-08-20T11:00:00.000Z",
        },
      }, 201);
    }
    return jsonResponse({
      data: {
        items: [
          {
            id: "ann-1",
            title: "Grant calendar",
            message: "Review the approved proposal calendar before disbursement.",
            audience: "all_users",
            priority: "high",
            created_at: "2026-08-18T14:30:00Z",
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
        has_next: false,
      },
    });
  }, async () => {
    await integrated.announcementsApi.listAnnouncements({ page: 1, page_size: 100 });
    await integrated.announcementsApi.publishAdminAnnouncement({
      title: "Grant calendar",
      message: "Review the approved proposal calendar before disbursement.",
      audience: "all_users",
      priority: "high",
    });
    const listCall = calls.find((call) => call.method === "GET" && call.url.includes("/communications/announcements"));
    assert.equal(listCall.csrf, null);
    const publishCall = calls.find((call) => call.method === "POST");
    assert.equal(publishCall.csrf, "csrf-announcements");
    assert.equal(publishCall.body.audience, "all_users");
    assert.equal(publishCall.body.priority, "high");
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
  }, async () => {
    await assert.rejects(
      () => integrated.announcementsApi.listAnnouncements({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("notification adapters map types, read state, and reject unsafe deep links", () => {
  const record = integrated.notificationsAdapters.adaptNotificationRecord({
    id: "n-1",
    user_id: "admin-1",
    proposal_id: "proposal-1",
    type: "pending_admin_review",
    message: "A proposal is waiting for Admin review.",
    read_at: null,
    created_at: "2026-08-20T10:00:00.000Z",
  });
  const view = integrated.notificationsAdapters.toAdminNotificationView(record);
  assert.equal(view.category, "proposal");
  assert.equal(view.isRead, false);
  assert.equal(view.destinationUrl, "/admin/approvals");
  assert.equal(integrated.notificationsDeepLinks.sanitizeAdminDeepLink("https://evil.test"), null);
  assert.equal(integrated.notificationsDeepLinks.sanitizeAdminDeepLink("javascript:alert(1)"), null);
  assert.equal(integrated.notificationsDeepLinks.sanitizeAdminDeepLink("//evil.test"), null);
  assert.equal(integrated.notificationsDeepLinks.sanitizeAdminDeepLink("/admin/home"), null);
  assert.equal(integrated.notificationsDeepLinks.sanitizeAdminDeepLink("/admin/approvals"), "/admin/approvals");
});

test("notification errors distinguish 404 and rate limits", () => {
  const { ApiClientError } = integrated.client;
  const { normalizeNotificationsError } = integrated.notificationsErrors;
  assert.equal(normalizeNotificationsError(new ApiClientError(404, "NOTIFICATION_NOT_FOUND", "Missing")).kind, "not_found");
  const limited = normalizeNotificationsError(new ApiClientError(429, "RATE_LIMITED", "Wait", null, 8));
  assert.equal(limited.kind, "rate_limited");
  assert.match(limited.message, /8 seconds/);
});

test("Notifications API uses CSRF on mark-read and honors abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({
      url: String(url),
      method: init.method || "GET",
      csrf: headers.get("X-CSRF-Token"),
    });
    if (String(url).endsWith("/auth/csrf")) {
      return jsonResponse({ data: { csrf_token: "csrf-notifications" } });
    }
    if ((init.method || "GET") === "PATCH") {
      return jsonResponse({
        data: {
          id: "n-1",
          user_id: "admin-1",
          type: "pending_admin_review",
          message: "A proposal is waiting for Admin review.",
          read_at: "2026-08-21T10:00:00.000Z",
          created_at: "2026-08-20T10:00:00.000Z",
        },
      });
    }
    return jsonResponse({
      data: {
        items: [{
          id: "n-1",
          user_id: "admin-1",
          type: "pending_admin_review",
          message: "A proposal is waiting for Admin review.",
          read_at: null,
          created_at: "2026-08-20T10:00:00.000Z",
        }],
        page: 1,
        page_size: 100,
        total: 1,
        has_next: false,
      },
    });
  }, async () => {
    await integrated.notificationsApi.listNotifications({ page: 1, page_size: 100 });
    await integrated.notificationsApi.markNotificationRead("n-1");
    const listCall = calls.find((call) => call.method === "GET" && call.url.includes("/notifications"));
    assert.equal(listCall.csrf, null);
    const readCall = calls.find((call) => call.method === "PATCH");
    assert.equal(readCall.csrf, "csrf-notifications");
    assert.match(readCall.url, /\/notifications\/n-1\/read$/);
  });

  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }
    return jsonResponse({ data: { items: [], page: 1, page_size: 100, total: 0, has_next: false } });
  }, async () => {
    await assert.rejects(
      () => integrated.notificationsApi.listNotifications({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("feedback adapters map categories and keep anonymous-looking records honest", () => {
  const record = integrated.feedbackAdapters.adaptFeedbackRecord({
    id: "fb-1",
    club_id: "club-1",
    submitted_by: "student-1",
    category: "club_joining",
    rating: 4,
    comment: "Clearer membership notices would help.",
    status: "open",
    club: { id: "club-1", name: "Cyber Security Club", code: "CSC" },
    submitter: { id: "student-1", full_name: "Emeka Okafor", role: "student", student_id: "220105088" },
    created_at: "2026-08-16T16:10:00Z",
  });
  const view = integrated.feedbackAdapters.toAdminFeedbackView(record);
  assert.equal(view.category, "joining");
  assert.equal(view.clubName, "Cyber Security Club");
  assert.equal(view.identityAvailable, true);
  const unnamed = integrated.feedbackAdapters.toAdminFeedbackView(
    integrated.feedbackAdapters.adaptFeedbackRecord({
      id: "fb-2",
      submitted_by: "student-2",
      category: "general",
      comment: "The dark theme is readable.",
      status: "open",
      created_at: "2026-08-12T19:00:00Z",
    }),
  );
  assert.equal(unnamed.identityAvailable, false);
  assert.equal(unnamed.authorName, "Submitter on record");
});

test("feedback errors and API honor abort and omit invented query params", async () => {
  const { ApiClientError } = integrated.client;
  assert.equal(integrated.feedbackErrors.normalizeFeedbackError(new ApiClientError(403, "FORBIDDEN", "No")).kind, "forbidden");
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET" });
    return jsonResponse({
      data: [{
        id: "fb-1",
        category: "onboarding",
        comment: "Need a handbook.",
        status: "open",
        created_at: "2026-08-15T09:30:00Z",
      }],
    });
  }, async () => {
    const items = await integrated.feedbackApi.listAdminFeedback({ category: "onboarding" });
    assert.equal(items.length, 1);
    assert.match(calls[0].url, /category=onboarding/);
    assert.equal(calls[0].url.includes("sentiment"), false);
  });
  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    return jsonResponse({ data: [] });
  }, async () => {
    await assert.rejects(
      () => integrated.feedbackApi.listAdminFeedback({ signal: controller.signal }),
      (error) => error.name === "AbortError",
    );
  });
});

test("analytics adapters map 7/30/90, zeros, and missing series", () => {
  const summary = integrated.analyticsAdapters.adaptAnalyticsSummary({
    range_days: 7,
    active_users: 0,
    daily_active_users: [{ date: "2026-08-15", active_users: 0 }],
    usage_by_role: {},
    features: {},
    operations: {},
  });
  const view = integrated.analyticsAdapters.toAnalyticsPeriodView(summary);
  assert.equal(view.rangeDays, 7);
  assert.equal(view.activeUsers, 0);
  assert.equal(view.joinRequests, 0);
  assert.equal(view.eventAttendance, 0);
  const invalid = integrated.analyticsAdapters.adaptAnalyticsSummary({ range_days: 14, operations: { join_requests_started: 3 } });
  assert.equal(invalid.range_days, 30);
  assert.equal(invalid.operations.join_requests_started, 3);
});

test("Analytics API requests the selected range, omits CSRF on GET, and honors abort", async () => {
  const calls = [];
  await withMockFetch(async (url, init = {}) => {
    const headers = new Headers(init.headers);
    calls.push({ url: String(url), method: init.method || "GET", csrf: headers.get("X-CSRF-Token") });
    return jsonResponse({
      data: {
        range_days: 90,
        active_users: 12,
        daily_active_users: [],
        usage_by_role: { student: 10 },
        features: {},
        operations: { join_requests_started: 4, dues_proofs_submitted: 2, event_check_ins: 6 },
      },
    });
  }, async () => {
    const summary = await integrated.analyticsApi.getAdminAnalytics(90);
    assert.equal(summary.range_days, 90);
    assert.equal(calls[0].csrf, null);
    assert.match(calls[0].url, /days=90/);
  });
  const controller = new AbortController();
  controller.abort();
  await withMockFetch(async (_url, init = {}) => {
    if (init.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    return jsonResponse({ data: {} });
  }, async () => {
    await assert.rejects(
      () => integrated.analyticsApi.getAdminAnalytics(30, controller.signal),
      (error) => error.name === "AbortError",
    );
  });
});

