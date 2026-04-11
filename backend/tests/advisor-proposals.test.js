const test = require("node:test");
const assert = require("node:assert/strict");

const { createAuthMiddleware } = require("../src/middleware/auth");
const {
  getAdvisorProposalDetail,
  getPendingAdvisorProposals
} = require("../src/modules/proposals/proposals.service");

function runMiddleware(middleware, req = {}) {
  return new Promise((resolve) => {
    const response = {};

    middleware(req, response, (error) => {
      resolve(error || null);
    });
  });
}

test("advisor only receives pending proposals for assigned clubs", async () => {
  let requestedClubIds;
  const fakeDatabase = {
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-1"];
    },
    async listPendingProposalsByClubIds(clubIds) {
      requestedClubIds = clubIds;
      return [
        {
          id: "proposal-1",
          club_id: "club-1",
          submitted_by: "exec-1",
          title: "Leadership Summit",
          description: "A planning summit for executive handover.",
          event_date: "2026-05-20",
          location: "Main Hall",
          status: "pending_advisor_review",
          created_at: "2026-04-05T10:00:00.000Z",
          updated_at: "2026-04-05T10:00:00.000Z"
        }
      ];
    }
  };

  const proposals = await getPendingAdvisorProposals({
    actor: {
      id: "advisor-1",
      role: "advisor"
    },
    database: fakeDatabase
  });

  assert.deepEqual(requestedClubIds, ["club-1"]);
  assert.equal(proposals.length, 1);
  assert.equal(proposals[0].club_id, "club-1");
});

test("non-advisors cannot load the advisor queue", async () => {
  await assert.rejects(
    () =>
      getPendingAdvisorProposals({
        actor: {
          id: "exec-1",
          role: "executive"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("advisor can fetch proposal detail for assigned clubs", async () => {
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return {
        id: "proposal-1",
        club_id: "club-1",
        submitted_by: "exec-1",
        title: "Leadership Summit",
        description: "A planning summit for executive handover.",
        event_date: "2026-05-20",
        location: "Main Hall",
        aim_objectives: "Prepare executives for handover.",
        proposed_activity: "Leadership Summit",
        event_time: "14:30",
        number_of_participants: 80,
        budget_estimate: 125000,
        budget_line_items: [
          {
            item: "Refreshments",
            quantity: 80,
            description: "Light refreshments",
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
        ],
        status: "pending_advisor_review",
        advisor_remarks: null,
        advisor_decided_at: null,
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      };
    },
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-1"];
    },
    async getLatestApprovalByProposalId(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return null;
    }
  };

  const proposal = await getAdvisorProposalDetail({
    actor: {
      id: "advisor-1",
      role: "advisor"
    },
    proposalId: "proposal-1",
    database: fakeDatabase
  });

  assert.equal(proposal.id, "proposal-1");
  assert.equal(proposal.current_stage, "advisor_review");
  assert.equal(proposal.aim_objectives, "Prepare executives for handover.");
  assert.equal(proposal.budget_line_items.length, 1);
  assert.equal(proposal.responsible_members.length, 1);
});

test("advisor cannot fetch proposal detail outside assigned clubs", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return {
        id: "proposal-1",
        club_id: "club-2",
        submitted_by: "exec-2",
        title: "Other Club Proposal",
        description: "Should not be visible.",
        event_date: "2026-05-20",
        location: "Main Hall",
        status: "pending_advisor_review",
        created_at: "2026-04-05T10:00:00.000Z",
        updated_at: "2026-04-05T10:00:00.000Z"
      };
    },
    async getAdvisorClubIds() {
      return ["club-1"];
    }
  };

  await assert.rejects(
    () =>
      getAdvisorProposalDetail({
        actor: {
          id: "advisor-1",
          role: "advisor"
        },
        proposalId: "proposal-1",
        database: fakeDatabase
      }),
    (error) => error.statusCode === 404 && error.code === "PROPOSAL_NOT_FOUND"
  );
});

test("auth middleware rejects authenticated users without an app profile", async () => {
  const authMiddleware = createAuthMiddleware({
    database: {
      async getUserByAccessToken() {
        return {
          id: "user-1",
          email: "user@nilehive.test"
        };
      },
      async getProfileById() {
        return null;
      }
    }
  });

  const error = await runMiddleware(authMiddleware, {
    headers: {
      authorization: "Bearer valid-token"
    }
  });

  assert.ok(error);
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "PROFILE_NOT_FOUND");
});
