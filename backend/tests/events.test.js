const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createApprovedProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    title: "Leadership Summit",
    description: "A planning summit for executive handover.",
    event_date: "2026-05-20",
    event_time: "10:00:00",
    location: "Main Hall",
    proposed_activity: "Leadership Summit 2026",
    number_of_participants: 80,
    budget_estimate: 250000,
    status: "approved",
    admin_decided_at: "2026-04-10T10:00:00.000Z",
    created_at: "2026-04-05T10:00:00.000Z",
    updated_at: "2026-04-10T10:00:00.000Z",
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
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    },
    "admin-1": {
      id: "admin-1",
      full_name: "Club Services Admin",
      role: "admin",
      club_id: null
    }
  };
  const proposals = [
    createApprovedProposal(),
    createApprovedProposal({
      id: "proposal-2",
      club_id: "club-2",
      title: "Cultural Night",
      proposed_activity: "Cultural Night"
    })
  ];

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "executive-token": "executive-1",
        "advisor-token": "advisor-1",
        "admin-token": "admin-1"
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
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-2"];
    },
    async listApprovedProposals(filters = {}) {
      if (!filters.clubIds) {
        return proposals;
      }

      return proposals.filter((proposal) => filters.clubIds.includes(proposal.club_id));
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

async function getApprovedEvents(baseUrl, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/events/approved`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

test("admin can fetch all approved events", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "admin-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 2);
  assert.ok(payload.data.every((event) => event.status === "approved"));
});

test("executive can fetch approved events for their club", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].club_id, "club-1");
  assert.equal(payload.data[0].proposal_id, "proposal-1");
});

test("advisor can fetch approved events for assigned clubs", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "advisor-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].club_id, "club-2");
});

test("missing-token access is blocked for approved events", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl);

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
