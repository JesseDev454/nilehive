const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const PRESIDENT_ID = "33333333-3333-4333-8333-333333333333";
const EXECUTIVE_ID = "44444444-4444-4444-8444-444444444444";
const ADVISOR_ID = "55555555-5555-4555-8555-555555555555";
const FEEDBACK_MANAGER_ID = "66666666-6666-4666-8666-666666666666";
const CLUB_ID = "77777777-7777-4777-8777-777777777777";
const PROPOSAL_ID = "88888888-8888-4888-8888-888888888888";
const LOG_NEW = "99999999-9999-4999-8999-999999999999";
const LOG_OLD = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const LOG_SECRET = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MISSING_ACTOR_LOG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function createLogs() {
  return [
    {
      id: LOG_NEW,
      actor_id: ADMIN_ID,
      actor: { id: ADMIN_ID, full_name: "Club Services Admin", role: "admin", student_id: "STAFF1004" },
      entity_type: "proposal",
      action: "proposal_reviewed",
      target_profile_id: PRESIDENT_ID,
      target: { id: PRESIDENT_ID, full_name: "Tomi President", role: "president", student_id: "020232255" },
      club_id: CLUB_ID,
      club: { id: CLUB_ID, name: "Nile Innovators Club", code: "NIC" },
      proposal_id: PROPOSAL_ID,
      due_payment_id: null,
      leadership_application_id: null,
      announcement_id: null,
      remarks: "Approved for campus calendar.",
      metadata: { stage: "admin", decision: "approve" },
      created_at: "2026-08-20T10:00:00.000Z"
    },
    {
      id: LOG_SECRET,
      actor_id: ADMIN_ID,
      actor: { id: ADMIN_ID, full_name: "Club Services Admin", role: "admin", student_id: "STAFF1004" },
      entity_type: "due_payment",
      action: "dues_payment_reviewed",
      target_profile_id: STUDENT_ID,
      target: { id: STUDENT_ID, full_name: "Ada Student", role: "student", student_id: "020232255" },
      club_id: CLUB_ID,
      club: { id: CLUB_ID, name: "Nile Innovators Club", code: "NIC" },
      proposal_id: null,
      due_payment_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      leadership_application_id: null,
      announcement_id: null,
      remarks: "Verified transfer.",
      metadata: {
        status: "paid",
        nested: {
          access_token: "super-secret-access",
          cookies: "sid=abc"
        }
      },
      created_at: "2026-08-19T10:00:00.000Z"
    },
    {
      id: LOG_OLD,
      actor_id: ADMIN_ID,
      actor: { id: ADMIN_ID, full_name: "Club Services Admin", role: "admin", student_id: "STAFF1004" },
      entity_type: "club",
      action: "club_updated",
      target_profile_id: null,
      target: null,
      club_id: CLUB_ID,
      club: { id: CLUB_ID, name: "Nile Innovators Club", code: "NIC" },
      proposal_id: null,
      due_payment_id: null,
      leadership_application_id: null,
      announcement_id: null,
      remarks: "Updated public fields.",
      metadata: { fields: ["name"] },
      created_at: "2026-08-18T10:00:00.000Z"
    },
    {
      id: MISSING_ACTOR_LOG,
      actor_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      actor: null,
      entity_type: "announcement",
      action: "announcement_published",
      target_profile_id: null,
      target: null,
      club_id: null,
      club: null,
      proposal_id: null,
      due_payment_id: null,
      leadership_application_id: null,
      announcement_id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      remarks: null,
      metadata: {},
      created_at: "2026-08-17T10:00:00.000Z"
    }
  ];
}

function createFakeDatabase(logs = createLogs()) {
  const profiles = {
    [ADMIN_ID]: { id: ADMIN_ID, full_name: "Club Services Admin", role: "admin", club_id: null },
    [STUDENT_ID]: { id: STUDENT_ID, full_name: "Ada Student", role: "student", club_id: CLUB_ID },
    [PRESIDENT_ID]: { id: PRESIDENT_ID, full_name: "Tomi President", role: "president", club_id: CLUB_ID },
    [EXECUTIVE_ID]: { id: EXECUTIVE_ID, full_name: "Amina Executive", role: "executive", club_id: CLUB_ID },
    [ADVISOR_ID]: { id: ADVISOR_ID, full_name: "Daniel Advisor", role: "advisor", club_id: null },
    [FEEDBACK_MANAGER_ID]: { id: FEEDBACK_MANAGER_ID, full_name: "Feedback Manager", role: "feedback_manager", club_id: null }
  };

  return {
    async getUserByAccessToken(accessToken) {
      const tokens = {
        "admin-token": ADMIN_ID,
        "student-token": STUDENT_ID,
        "president-token": PRESIDENT_ID,
        "executive-token": EXECUTIVE_ID,
        "advisor-token": ADVISOR_ID,
        "feedback-manager-token": FEEDBACK_MANAGER_ID
      };
      const profileId = tokens[accessToken];
      return profileId ? { id: profileId, email: `${profileId}@nilehive.test` } : null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listAuditLogs(filters = {}) {
      let items = [...logs];

      if (filters.actor_id) {
        items = items.filter((item) => item.actor_id === filters.actor_id);
      }
      if (filters.action) {
        items = items.filter((item) => item.action === filters.action);
      }
      if (filters.entity_type) {
        items = items.filter((item) => item.entity_type === filters.entity_type);
      }
      if (filters.club_id) {
        items = items.filter((item) => item.club_id === filters.club_id);
      }
      if (filters.entity_id) {
        items = items.filter((item) =>
          [
            item.proposal_id,
            item.due_payment_id,
            item.announcement_id,
            item.leadership_application_id,
            item.target_profile_id,
            item.club_id
          ].includes(filters.entity_id)
        );
      }
      if (filters.date_from) {
        items = items.filter((item) => item.created_at >= filters.date_from);
      }
      if (filters.date_to) {
        items = items.filter((item) => item.created_at <= filters.date_to);
      }
      if (filters.q) {
        const needle = filters.q.toLowerCase();
        items = items.filter((item) =>
          [item.action, item.entity_type, item.remarks].some((value) => String(value || "").toLowerCase().includes(needle))
        );
      }

      items.sort((left, right) => {
        if (left.created_at === right.created_at) {
          return right.id.localeCompare(left.id);
        }
        return left.created_at < right.created_at ? 1 : -1;
      });

      if (!filters.pagination) {
        return items;
      }

      const { from, to, page, pageSize } = filters.pagination;
      return {
        items: items.slice(from, to + 1),
        page,
        page_size: pageSize,
        total: items.length,
        has_next: page * pageSize < items.length
      };
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

async function requestLogs(baseUrl, { token = "", path = "/api/v1/admin/audit-logs", method = "GET" } = {}) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}${path}`, { method, headers });
  const payload = await response.json();
  return { response, payload };
}

test("admin can list audit logs newest first with stable ordering", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestLogs(server.baseUrl, { token: "admin-token" });
  assert.equal(response.status, 200);
  assert.equal(payload.data.page, 1);
  assert.equal(payload.data.total, 4);
  assert.deepEqual(
    payload.data.items.map((item) => item.id),
    [LOG_NEW, LOG_SECRET, LOG_OLD, MISSING_ACTOR_LOG]
  );
  assert.equal(payload.data.items[0].actor.full_name, "Club Services Admin");
  assert.equal(payload.data.items[0].action, "proposal_reviewed");
});

test("audit list paginates and bounds page size", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const pageOne = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?page=1&page_size=2"
  });
  assert.equal(pageOne.response.status, 200);
  assert.equal(pageOne.payload.data.items.length, 2);
  assert.equal(pageOne.payload.data.has_next, true);

  const pageTwo = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?page=2&page_size=2"
  });
  assert.equal(pageTwo.payload.data.items[0].id, LOG_OLD);
  assert.equal(pageTwo.payload.data.has_next, false);

  const oversized = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?page_size=51"
  });
  assert.equal(oversized.response.status, 400);
  assert.equal(oversized.payload.error.code, "VALIDATION_ERROR");
});

test("audit list supports filters and rejects invalid UUID or date ranges", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const filtered = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: `/api/v1/admin/audit-logs?action=proposal_reviewed&entity_type=proposal&entity_id=${PROPOSAL_ID}&club_id=${CLUB_ID}&q=calendar`
  });
  assert.equal(filtered.response.status, 200);
  assert.equal(filtered.payload.data.total, 1);
  assert.equal(filtered.payload.data.items[0].id, LOG_NEW);

  const ranged = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?date_from=2026-08-19&date_to=2026-08-20"
  });
  assert.equal(ranged.payload.data.total, 2);

  const invalidUuid = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?actor_id=not-a-uuid"
  });
  assert.equal(invalidUuid.response.status, 400);

  const invalidRange = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: "/api/v1/admin/audit-logs?date_from=2026-08-20&date_to=2026-08-18"
  });
  assert.equal(invalidRange.response.status, 400);
});

test("audit metadata secrets are redacted and deleted actors remain listable", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { payload } = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: `/api/v1/admin/audit-logs?action=dues_payment_reviewed`
  });
  const secretItem = payload.data.items[0];
  assert.equal(secretItem.metadata.status, "paid");
  assert.deepEqual(secretItem.metadata.nested.access_token, { redacted: true });
  assert.deepEqual(secretItem.metadata.nested.cookies, { redacted: true });
  assert.equal(JSON.stringify(payload).includes("super-secret-access"), false);

  const missingActor = await requestLogs(server.baseUrl, {
    token: "admin-token",
    path: `/api/v1/admin/audit-logs?action=announcement_published`
  });
  assert.equal(missingActor.payload.data.items[0].actor.full_name, null);
  assert.equal(missingActor.payload.data.items[0].actor.id, "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
});

test("non-admin roles cannot list audit logs", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  for (const token of ["student-token", "president-token", "executive-token", "advisor-token", "feedback-manager-token"]) {
    const { response, payload } = await requestLogs(server.baseUrl, { token });
    assert.equal(response.status, 403, token);
    assert.equal(payload.error.code, "FORBIDDEN");
  }
});

test("unauthenticated audit log access is blocked and mutations are absent", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const missing = await requestLogs(server.baseUrl);
  assert.equal(missing.response.status, 401);

  const posted = await requestLogs(server.baseUrl, { token: "admin-token", method: "POST" });
  assert.equal(posted.response.status, 404);
});
