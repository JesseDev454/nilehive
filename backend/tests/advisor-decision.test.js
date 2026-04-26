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
    },
    "admin-1": {
      id: "admin-1",
      full_name: "Ada Admin",
      role: "admin",
      club_id: null
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
      "proposal-admin-review",
      {
        id: "proposal-admin-review",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Already Escalated",
        description: "Already awaiting admin review.",
        event_date: "2026-05-21",
        location: "Auditorium",
        status: "pending_admin_review",
        advisor_remarks: "Ready for admin review",
        advisor_decided_at: "2026-04-05T10:00:00.000Z",
        advisor_decided_by: "advisor-1",
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      }
    ],
    [
      "proposal-rejected",
      {
        id: "proposal-rejected",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Rejected Proposal",
        description: "Already rejected.",
        event_date: "2026-05-22",
        location: "Conference Room",
        status: "advisor_rejected",
        advisor_remarks: "Please revise budget.",
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
        event_date: "2026-05-23",
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

  const approvals = [];
  const notifications = [];

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
    approvals,
    notifications,
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
    async getAdminProfileIds() {
      return ["admin-1"];
    },
    async applyAdvisorDecision(decisionInput) {
      const proposal = proposals.get(decisionInput.proposalId);

      if (!proposal || proposal.status !== "pending_advisor_review") {
        return null;
      }

      approvals.push({
        proposal_id: decisionInput.proposalId,
        reviewer_id: decisionInput.reviewerId,
        reviewer_role: decisionInput.reviewerRole,
        decision: decisionInput.decision,
        remarks: decisionInput.remarks,
        decided_at: decisionInput.decidedAt
      });

      const updatedProposal = {
        ...proposal,
        status: decisionInput.nextStatus,
        advisor_remarks: decisionInput.remarks,
        advisor_decided_at: decisionInput.decidedAt,
        advisor_decided_by: decisionInput.reviewerId,
        updated_at: decisionInput.decidedAt
      };

      proposals.set(decisionInput.proposalId, updatedProposal);
      return updatedProposal;
    },
    async createNotifications(createdNotifications) {
      notifications.push(...createdNotifications);
      return createdNotifications;
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

test("advisor approval creates approval history and moves proposal to admin review", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "advisor-token",
    {
      decision: "approve",
      remarks: "Ready for admin review."
    }
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.status, "pending_admin_review");
  assert.equal(payload.data.advisor_remarks, "Ready for admin review.");
  assert.equal(database.approvals.length, 1);
  assert.equal(database.approvals[0].proposal_id, "proposal-pending");
  assert.equal(database.approvals[0].reviewer_id, "advisor-1");
  assert.equal(database.approvals[0].reviewer_role, "advisor");
  assert.equal(database.approvals[0].decision, "approve");
  assert.equal(database.notifications.length, 2);
  assert.deepEqual(
    database.notifications.map((notification) => [notification.user_id, notification.type]),
    [
      ["executive-1", "advisor_approved"],
      ["admin-1", "pending_admin_review"]
    ]
  );
});

test("advisor rejection creates approval history and moves proposal to rejected state", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-pending",
    "advisor-token",
    {
      decision: "reject",
      remarks: "Please revise the event schedule."
    }
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.status, "advisor_rejected");
  assert.equal(database.approvals.length, 1);
  assert.equal(database.approvals[0].decision, "reject");
  assert.equal(database.approvals[0].remarks, "Please revise the event schedule.");
  assert.equal(database.notifications.length, 1);
  assert.equal(database.notifications[0].user_id, "executive-1");
  assert.equal(database.notifications[0].type, "advisor_rejected");
});

test("advisor cannot review a proposal they submitted themselves", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer({
    ...database,
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-self");
      return {
        id: "proposal-self",
        club_id: "club-1",
        submitted_by: "advisor-1",
        title: "Self Submitted Proposal",
        description: "Should not be self-approved.",
        event_date: "2026-05-24",
        location: "Conference Room",
        status: "pending_advisor_review",
        advisor_remarks: null,
        advisor_decided_at: null,
        advisor_decided_by: null,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      };
    }
  });
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-self",
    "advisor-token",
    {
      decision: "approve",
      remarks: "Trying to self approve."
    }
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "SELF_REVIEW_FORBIDDEN");
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
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
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
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
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
});

test("duplicate or late transitions fail cleanly without new approval history", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-admin-review",
    "advisor-token",
    {
      decision: "reject"
    }
  );

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "INVALID_PROPOSAL_STATE");
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
});

test("invalid transition attempts from rejected proposals fail cleanly", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await postAdvisorDecision(
    server.baseUrl,
    "proposal-rejected",
    "advisor-token",
    {
      decision: "approve"
    }
  );

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "INVALID_PROPOSAL_STATE");
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
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
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
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
  assert.equal(database.approvals.length, 0);
  assert.equal(database.notifications.length, 0);
});
