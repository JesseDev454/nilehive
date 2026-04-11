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
      proposed_activity: "Leadership Summit",
      aim_objectives: "Prepare the incoming executive team for handover.",
      description: "A planning summit for executive handover.",
      event_date: "2026-05-20",
      event_time: "14:30",
      location: "Main Hall",
      number_of_participants: 80,
      budget_estimate: 125000,
      budget_line_items: [
        {
          item: "Refreshments",
          quantity: 80,
          description: "Light refreshments for participants",
          amount: 80000
        }
      ],
      responsible_members: [
        {
          name: "Amina Executive",
          student_id: "NU-2023-0001",
          phone_number: "+2348012345678",
          position: "Project Lead"
        }
      ]
    },
    database: fakeDatabase
  });

  assert.equal(insertedProposal.club_id, "club-1");
  assert.equal(insertedProposal.submitted_by, "exec-1");
  assert.equal(insertedProposal.status, "pending_advisor_review");
  assert.equal(insertedProposal.aim_objectives, "Prepare the incoming executive team for handover.");
  assert.equal(insertedProposal.proposed_activity, "Leadership Summit");
  assert.equal(insertedProposal.event_time, "14:30");
  assert.equal(insertedProposal.number_of_participants, 80);
  assert.equal(insertedProposal.budget_estimate, 125000);
  assert.equal(insertedProposal.budget_line_items.length, 1);
  assert.equal(insertedProposal.responsible_members.length, 1);
  assert.equal(proposal.title, "Leadership Summit");
  assert.equal(createdNotifications.length, 1);
  assert.equal(createdNotifications[0].user_id, "advisor-1");
  assert.equal(createdNotifications[0].proposal_id, "proposal-1");
  assert.equal(createdNotifications[0].type, "proposal_submitted");
});

test("createProposal rejects invalid Proposal Form 2.0 payloads", async () => {
  const fakeDatabase = {};

  await assert.rejects(
    () =>
      createProposal({
        actor: {
          id: "exec-1",
          role: "executive",
          clubId: "club-1"
        },
        payload: {
          title: "Incomplete Proposal",
          description: "Missing required Stage 3 fields.",
          event_date: "2026-05-20",
          location: "Main Hall",
          number_of_participants: 0,
          responsible_members: []
        },
        database: fakeDatabase
      }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.ok(error.details.fields.some((field) => field.field === "aim_objectives"));
      assert.ok(error.details.fields.some((field) => field.field === "proposed_activity"));
      assert.ok(error.details.fields.some((field) => field.field === "responsible_members"));
      return true;
    }
  );
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
