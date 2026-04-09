const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createFakeDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    },
    "executive-2": {
      id: "executive-2",
      full_name: "Other Executive",
      role: "executive",
      club_id: "club-2"
    },
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    }
  };

  const proposals = [
    {
      id: "proposal-1",
      club_id: "club-1",
      submitted_by: "executive-1",
      title: "Leadership Summit",
      description: "A planning summit for executive handover.",
      event_date: "2026-05-20",
      location: "Main Hall",
      status: "pending_admin_review",
      advisor_remarks: "Ready for admin review.",
      advisor_decided_at: "2026-04-06T10:00:00.000Z",
      advisor_decided_by: "advisor-1",
      created_at: "2026-04-05T10:00:00.000Z",
      updated_at: "2026-04-06T10:00:00.000Z"
    },
    {
      id: "proposal-2",
      club_id: "club-1",
      submitted_by: "executive-1",
      title: "Budget Revision",
      description: "A revised budget proposal.",
      event_date: "2026-05-25",
      location: "Conference Room",
      status: "advisor_rejected",
      advisor_remarks: "Please revise the venue budget.",
      advisor_decided_at: "2026-04-07T10:00:00.000Z",
      advisor_decided_by: "advisor-1",
      created_at: "2026-04-06T10:00:00.000Z",
      updated_at: "2026-04-07T10:00:00.000Z"
    },
    {
      id: "proposal-3",
      club_id: "club-2",
      submitted_by: "executive-2",
      title: "Other Club Proposal",
      description: "Should not be visible to another executive.",
      event_date: "2026-05-26",
      location: "Auditorium",
      status: "pending_advisor_review",
      advisor_remarks: null,
      advisor_decided_at: null,
      advisor_decided_by: null,
      created_at: "2026-04-07T10:00:00.000Z",
      updated_at: "2026-04-07T10:00:00.000Z"
    }
  ];

  const latestApprovals = {
    "proposal-1": {
      proposal_id: "proposal-1",
      reviewer_id: "advisor-1",
      reviewer_role: "advisor",
      decision: "approve",
      remarks: "Ready for admin review.",
      decided_at: "2026-04-06T10:00:00.000Z"
    },
    "proposal-2": {
      proposal_id: "proposal-2",
      reviewer_id: "advisor-1",
      reviewer_role: "advisor",
      decision: "reject",
      remarks: "Please revise the venue budget.",
      decided_at: "2026-04-07T10:00:00.000Z"
    }
  };

  const tokens = {
    "executive-token": {
      id: "executive-1",
      email: "executive@nilehive.test"
    },
    "advisor-token": {
      id: "advisor-1",
      email: "advisor@nilehive.test"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listExecutiveProposals(submittedBy) {
      return proposals.filter((proposal) => proposal.submitted_by === submittedBy);
    },
    async getProposalById(proposalId) {
      return proposals.find((proposal) => proposal.id === proposalId) ?? null;
    },
    async getLatestApprovalByProposalId(proposalId) {
      return latestApprovals[proposalId] ?? null;
    },
    async getLatestApprovalsByProposalIds(proposalIds) {
      return proposalIds.reduce((approvalsByProposal, proposalId) => {
        if (latestApprovals[proposalId]) {
          approvalsByProposal[proposalId] = latestApprovals[proposalId];
        }

        return approvalsByProposal;
      }, {});
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

async function getExecutiveProposals(baseUrl, path, token) {
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

test("executive can fetch own proposals list", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 2);
  assert.equal(payload.data[0].submitted_at, payload.data[0].created_at);
  assert.ok(payload.data.every((proposal) => proposal.current_stage));
});

test("executive can fetch own proposal detail", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/proposal-1",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.id, "proposal-1");
  assert.equal(payload.data.status, "pending_admin_review");
  assert.equal(payload.data.latest_approval.decision, "approve");
  assert.equal(payload.data.advisor_remarks, "Ready for admin review.");
});

test("executive cannot fetch another club's proposal", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/proposal-3",
    "executive-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "PROPOSAL_NOT_FOUND");
});

test("wrong-role access is blocked", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    "advisor-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing-token access is blocked", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    ""
  );

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("not-found proposal returns correctly", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/does-not-exist",
    "executive-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "PROPOSAL_NOT_FOUND");
});
