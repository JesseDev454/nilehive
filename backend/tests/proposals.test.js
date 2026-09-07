const test = require("node:test");
const assert = require("node:assert/strict");

const { createAuthMiddleware } = require("../src/middleware/auth");
const requireRole = require("../src/middleware/requireRole");
const { createProposal } = require("../src/modules/proposals/proposals.service");

function createResponsibleMembers(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Responsible Member ${index + 1}`,
    student_id: `0202300${String(index + 1).padStart(2, "0")}`,
    phone_number: `+23480123456${String(index).padStart(2, "0")}`,
    position: index === 0 ? "Project Lead" : "Team Member"
  }));
}

function createValidProposalPayload(overrides = {}) {
  return {
    title: "Leadership Summit",
    proposed_activity: "Leadership Summit",
    aim_objectives: "Prepare the incoming leadership team for handover.",
    description: "A planning summit for leadership handover.",
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
    responsible_members: createResponsibleMembers(1),
    ...overrides
  };
}

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
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: createValidProposalPayload(),
    database: fakeDatabase
  });

  assert.equal(insertedProposal.club_id, "club-1");
  assert.equal(insertedProposal.submitted_by, "president-1");
  assert.equal(insertedProposal.status, "pending_advisor_review");
  assert.equal(insertedProposal.aim_objectives, "Prepare the incoming leadership team for handover.");
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

test("createProposal accepts up to 10 responsible members", async () => {
  let insertedProposal;
  const fakeDatabase = {
    async createProposal(proposal) {
      insertedProposal = proposal;
      return {
        id: "proposal-10-members",
        ...proposal,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      };
    },
    async getAdvisorProfileIdsByClubId() {
      return [];
    },
    async createNotifications(notifications) {
      return notifications;
    }
  };

  await createProposal({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: createValidProposalPayload({
      responsible_members: createResponsibleMembers(10)
    }),
    database: fakeDatabase
  });

  assert.equal(insertedProposal.responsible_members.length, 10);
});

test("createProposal rejects more than 10 responsible members", async () => {
  await assert.rejects(
    () =>
      createProposal({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: createValidProposalPayload({
          responsible_members: createResponsibleMembers(11)
        }),
        database: {}
      }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.ok(
        error.details.fields.some(
          (field) =>
            field.field === "responsible_members" &&
            field.message === "a proposal can have at most 10 responsible members"
        )
      );
      return true;
    }
  );
});

test("createProposal rejects responsible members without a 9 digit student ID", async () => {
  await assert.rejects(
    () =>
      createProposal({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: createValidProposalPayload({
          responsible_members: [
            {
              name: "Responsible Member",
              student_id: "NUN-001",
              phone_number: "08012345678",
              position: "Team Member"
            }
          ]
        }),
        database: {}
      }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.ok(
        error.details.fields.some(
          (field) =>
            field.field === "responsible_members[0].student_id" &&
            field.message === "Student ID must be exactly 9 digits"
        )
      );
      return true;
    }
  );
});

test("createProposal rejects invalid Proposal Form 2.0 payloads", async () => {
  const fakeDatabase = {};

  await assert.rejects(
    () =>
      createProposal({
        actor: {
          id: "president-1",
          role: "president",
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

test("requireRole blocks non-presidents from president routes", async () => {
  const error = await runMiddleware(requireRole("president"), {
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

