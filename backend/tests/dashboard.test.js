const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    title: "Leadership Summit",
    description: "A leadership event.",
    event_date: "2026-05-20",
    event_time: "10:00:00",
    location: "Main Hall",
    proposed_activity: "Leadership Summit 2026",
    status: "pending_advisor_review",
    admin_decided_at: null,
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
    ...overrides
  };
}

function createFakeDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    },
    "president-1": {
      id: "president-1",
      full_name: "Tomi President",
      role: "president",
      club_id: "club-1"
    },
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    }
  };
  const proposals = [
    createProposal(),
    createProposal({
      id: "proposal-2",
      title: "Approved Event",
      status: "approved",
      admin_decided_at: "2026-04-04T10:00:00.000Z",
      updated_at: "2026-04-04T10:00:00.000Z"
    }),
    createProposal({
      id: "proposal-3",
      title: "Rejected Event",
      status: "admin_rejected",
      updated_at: "2026-04-03T10:00:00.000Z"
    })
  ];

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "executive-token": "executive-1",
        "president-token": "president-1",
        "advisor-token": "advisor-1"
      };
      const profileId = tokenProfiles[accessToken];

      return profileId
        ? {
            id: profileId,
            email: `${profileId}@nilehive.test`
          }
        : null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return {
        id: "club-1",
        name: "Nile Innovators Club",
        code: "NIC",
        advisor_id: "advisor-1",
        created_at: "2026-04-01T10:00:00.000Z"
      };
    },
    async listExecutiveProposals(submittedBy) {
      assert.equal(submittedBy, "executive-1");
      return proposals.filter((proposal) => proposal.submitted_by === submittedBy);
    },
    async listProposalsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return proposals;
    },
    async listApprovedProposals(filters = {}) {
      assert.deepEqual(filters.clubIds, ["club-1"]);
      return proposals.filter((proposal) => proposal.status === "approved");
    },
    async listEventRemindersByUserId(userId) {
      return [
        {
          id: "reminder-1",
          user_id: userId,
          proposal_id: "proposal-2",
          message: "Approved event reminder.",
          remind_at: "2026-05-20T09:00:00.000Z",
          delivery_status: "stored",
          created_at: "2026-04-04T10:00:00.000Z"
        }
      ];
    },
    async listNotificationsByUserId(userId) {
      return [
        {
          id: "notification-1",
          user_id: userId,
          proposal_id: "proposal-2",
          type: "admin_approved",
          message: "Proposal approved.",
          delivery_status: "stored",
          created_at: "2026-04-04T10:00:00.000Z"
        }
      ];
    },
    async listProfilesByClubId(clubId, filters = {}) {
      assert.equal(clubId, "club-1");
      assert.equal(filters.role, "executive");
      return [profiles["executive-1"]];
    }
  };
}

async function createTestServer(database) {
  const app = createApp({ database });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
  };
}

async function getDashboard(baseUrl, path, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

test("executive can fetch live dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/executive",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "executive");
  assert.equal(payload.data.summary.total_proposals, 3);
  assert.equal(payload.data.summary.approved_proposals, 1);
  assert.equal(payload.data.upcoming_events.length, 1);
  assert.equal(payload.data.action_items.length, 3);
});

test("president can fetch live club dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/president",
    "president-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "president");
  assert.equal(payload.data.club.name, "Nile Innovators Club");
  assert.equal(payload.data.summary.executive_count, 1);
  assert.equal(payload.data.recent_activity.length, 3);
  assert.equal(payload.data.pending_proposals.length, 1);
});

test("wrong-role dashboard access is blocked", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/president",
    "advisor-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing-token dashboard access is blocked", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(server.baseUrl, "/api/v1/dashboard/executive");

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
