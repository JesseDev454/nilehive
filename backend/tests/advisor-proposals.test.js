const test = require("node:test");
const assert = require("node:assert/strict");

const { createAuthMiddleware } = require("../src/middleware/auth");
const { getPendingAdvisorProposals } = require("../src/modules/proposals/proposals.service");

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
