const test = require("node:test");
const assert = require("node:assert/strict");

const { createAuthMiddleware } = require("../src/middleware/auth");
const requireRole = require("../src/middleware/requireRole");
const { createProposal } = require("../src/modules/proposals/proposals.service");

function runMiddleware(middleware, req = {}) {
  return new Promise((resolve) => {
    const response = {};

    middleware(req, response, (error) => {
      resolve(error || null);
    });
  });
}

test("createProposal stores the expected Week 1 proposal record", async () => {
  let insertedProposal;
  let createdNotifications = [];
  const fakeDatabase = {
    async createProposal(proposal) {
      insertedProposal = proposal;
      return {
        id: "proposal-1",
        ...proposal,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      };
    },
    async getAdvisorProfileIdsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return ["advisor-1"];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
    }
  };

  const proposal = await createProposal({
    actor: {
      id: "exec-1",
      role: "executive",
      clubId: "club-1"
    },
    payload: {
      title: "Leadership Summit",
      description: "A planning summit for executive handover.",
      event_date: "2026-05-20",
      location: "Main Hall"
    },
    database: fakeDatabase
  });

  assert.equal(insertedProposal.club_id, "club-1");
  assert.equal(insertedProposal.submitted_by, "exec-1");
  assert.equal(insertedProposal.status, "pending_advisor_review");
  assert.equal(proposal.title, "Leadership Summit");
  assert.equal(createdNotifications.length, 1);
  assert.equal(createdNotifications[0].user_id, "advisor-1");
  assert.equal(createdNotifications[0].proposal_id, "proposal-1");
  assert.equal(createdNotifications[0].type, "proposal_submitted");
});

test("requireRole blocks non-executives from executive routes", async () => {
  const error = await runMiddleware(requireRole("executive"), {
    user: { id: "advisor-1", role: "advisor" }
  });

  assert.ok(error);
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "FORBIDDEN");
});

test("auth middleware rejects invalid access tokens", async () => {
  const authMiddleware = createAuthMiddleware({
    database: {
      async getUserByAccessToken() {
        return null;
      }
    }
  });

  const error = await runMiddleware(authMiddleware, {
    headers: {
      authorization: "Bearer bad-token"
    }
  });

  assert.ok(error);
  assert.equal(error.statusCode, 401);
  assert.equal(error.code, "INVALID_TOKEN");
});
