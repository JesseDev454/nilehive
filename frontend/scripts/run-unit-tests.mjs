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

