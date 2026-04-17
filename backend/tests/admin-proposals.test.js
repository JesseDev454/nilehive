const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createFakeDatabase() {
  const profiles = {
    "admin-1": {
      id: "admin-1",
      full_name: "Admin User",
      role: "admin",
      club_id: null
    },
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
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
      club_id: "club-2",
      submitted_by: "executive-2",
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
      club_id: "club-3",
      submitted_by: "executive-3",
      title: "Pending Advisor Proposal",
      description: "Still waiting on advisor review.",
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
  const approvalHistory = {
    "proposal-1": [
      {
        proposal_id: "proposal-1",
        reviewer_id: "advisor-1",
        reviewer_role: "advisor",
        decision: "approve",
        remarks: "Ready for admin review.",
        decided_at: "2026-04-06T10:00:00.000Z"
      }
    ]
  };

  const tokens = {
    "admin-token": {
      id: "admin-1",
      email: "admin@nilehive.test"
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
    async listAdminProposals(filters = {}) {
      return proposals.filter((proposal) => {
        if (filters.status && proposal.status !== filters.status) {
          return false;
        }

        return true;
      });
    },
    async getProposalById(proposalId) {
      return proposals.find((proposal) => proposal.id === proposalId) ?? null;
    },
    async getLatestApprovalByProposalId(proposalId) {
      return latestApprovals[proposalId] ?? null;
    },
    async getApprovalsByProposalId(proposalId) {
      return approvalHistory[proposalId] ?? [];
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

async function getAdminProposals(baseUrl, path, token) {
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

test("admin can fetch all proposals", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 3);
  assert.equal(payload.data[0].latest_approval.reviewer_role, "advisor");
  assert.ok(payload.data.every((proposal) => proposal.current_stage));
});

test("admin can fetch one proposal detail", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin/proposal-1",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.id, "proposal-1");
  assert.equal(payload.data.club_id, "club-1");
  assert.equal(payload.data.submitted_by, "executive-1");
  assert.equal(payload.data.latest_approval.decision, "approve");
  assert.equal(payload.data.approval_history.length, 1);
  assert.equal(payload.data.approval_history[0].reviewer_role, "advisor");
});

test("wrong-role access is blocked for admin proposal routes", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin",
    "executive-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing-token access is blocked for admin proposal routes", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin",
    ""
  );

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("not-found proposal returns correctly for admin detail", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin/does-not-exist",
    "admin-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "PROPOSAL_NOT_FOUND");
});

test("optional status filter works correctly", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin?status=pending_admin_review",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].status, "pending_admin_review");
});

test("optional current_stage filter works correctly", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getAdminProposals(
    server.baseUrl,
    "/api/v1/proposals/admin?current_stage=rejected",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].current_stage, "rejected");
});
