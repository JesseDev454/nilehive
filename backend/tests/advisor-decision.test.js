const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createFakeDatabase() {
  const profiles = {
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    },
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    }
  };

  const proposals = new Map([
    [
      "proposal-pending",
      {
        id: "proposal-pending",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Leadership Summit",
        description: "A planning summit for executive handover.",
        event_date: "2026-05-20",
        location: "Main Hall",
        status: "pending_advisor_review",
        advisor_remarks: null,
        advisor_decided_at: null,
        advisor_decided_by: null,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      }
    ],
    [
      "proposal-approved",
      {
        id: "proposal-approved",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Already Approved",
        description: "Already reviewed.",
        event_date: "2026-05-21",
        location: "Auditorium",
        status: "advisor_approved",
        advisor_remarks: "Looks good",
        advisor_decided_at: "2026-04-05T10:00:00.000Z",
        advisor_decided_by: "advisor-1",
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      }
    ],
    [
      "proposal-other-club",
      {
        id: "proposal-other-club",
        club_id: "club-2",
        submitted_by: "executive-1",
        title: "Other Club Proposal",
        description: "Not assigned to this advisor.",
        event_date: "2026-05-22",
        location: "Conference Room",
        status: "pending_advisor_review",
        advisor_remarks: null,
        advisor_decided_at: null,
        advisor_decided_by: null,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      }
    ]
  ]);

  const tokens = {
    "advisor-token": {
      id: "advisor-1",
      email: "advisor@nilehive.test"
    },
    "executive-token": {
      id: "executive-1",
      email: "executive@nilehive.test"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async getProposalById(proposalId) {
      return proposals.get(proposalId) ?? null;
    },
    async getAdvisorClubIds(advisorId) {
      if (advisorId === "advisor-1") {
        return ["club-1"];
      }

      return [];
    },
    async updateProposalAdvisorDecision(proposalId, updates) {
      const proposal = proposals.get(proposalId);
      const updatedProposal = {
        ...proposal,
        ...updates,
        updated_at: "2026-04-06T10:00:00.000Z"
      };

      proposals.set(proposalId, updatedProposal);
      return updatedProposal;
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

async function postAdvisorDecision(baseUrl, proposalId, token, body) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/proposals/${proposalId}/advisor-decision`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const payload = await response.json();

  return { response, payload };
}

test("advisor can approve a pending proposal", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "advisor-token",
    {
      decision: "approve",
      remarks: "Ready for the next stage."
    }
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.status, "advisor_approved");
  assert.equal(payload.data.advisor_remarks, "Ready for the next stage.");
  assert.equal(payload.data.advisor_decided_by, "advisor-1");
});

test("advisor can reject a pending proposal", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "advisor-token",
    {
      decision: "reject",
      remarks: "Please revise the schedule."
    }
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.status, "advisor_rejected");
  assert.equal(payload.data.advisor_remarks, "Please revise the schedule.");
});

test("wrong role is blocked from advisor decisions", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "executive-token",
    {
      decision: "approve"
    }
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing token is blocked from advisor decisions", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "",
    {
      decision: "approve"
    }
  );

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("invalid proposal state is blocked from duplicate advisor actions", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-approved",
    "advisor-token",
    {
      decision: "reject"
    }
  );

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "INVALID_PROPOSAL_STATE");
});

test("invalid decision input is blocked", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "advisor-token",
    {
      decision: "hold"
    }
  );

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
});

test("advisor cannot act on a proposal outside assigned clubs", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-other-club",
    "advisor-token",
    {
      decision: "approve"
    }
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});
