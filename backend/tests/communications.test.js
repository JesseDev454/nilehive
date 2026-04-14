const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback
} = require("../src/modules/communications/communications.service");

function createAnnouncementRecord(overrides = {}) {
  return {
    id: "announcement-1",
    club_id: "club-1",
    created_by: "president-1",
    title: "General meeting",
    message: "Club meeting holds on Friday.",
    audience: "club",
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
    ...overrides
  };
}

function createFeedbackRecord(overrides = {}) {
  return {
    id: "feedback-1",
    club_id: "club-1",
    proposal_id: "proposal-1",
    submitted_by: "executive-1",
    category: "event",
    rating: 4,
    comment: "The event went well.",
    status: "open",
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
    ...overrides
  };
}

test("president can create a club announcement for their club", async () => {
  let createdAnnouncement;
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    }
  };

  const announcement = await createAnnouncement({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: {
      title: "General meeting",
      message: "Club meeting holds on Friday.",
      audience: "all",
      club_id: "club-2"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.club_id, "club-1");
  assert.equal(createdAnnouncement.audience, "club");
  assert.equal(announcement.created_by, "president-1");
});

test("admin can create a global announcement", async () => {
  let createdAnnouncement;
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    }
  };

  const announcement = await createAnnouncement({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      title: "Club Services notice",
      message: "All clubs should update their records.",
      audience: "all"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.club_id, null);
  assert.equal(createdAnnouncement.audience, "all");
  assert.equal(announcement.audience, "all");
});

test("advisor cannot create announcements", async () => {
  await assert.rejects(
    () =>
      createAnnouncement({
        actor: {
          id: "advisor-1",
          role: "advisor",
          clubId: null
        },
        payload: {
          title: "Advisor notice",
          message: "This should not be allowed."
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("executive can submit feedback for own club proposal", async () => {
  let createdFeedback;
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return {
        id: "proposal-1",
        club_id: "club-1"
      };
    },
    async createFeedback(feedback) {
      createdFeedback = feedback;
      return createFeedbackRecord(feedback);
    }
  };

  const feedback = await createFeedback({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    payload: {
      proposal_id: "proposal-1",
      category: "event",
      rating: 4,
      comment: "The event went well."
    },
    database: fakeDatabase
  });

  assert.equal(createdFeedback.club_id, "club-1");
  assert.equal(createdFeedback.submitted_by, "executive-1");
  assert.equal(createdFeedback.status, "open");
  assert.equal(feedback.rating, 4);
});

test("feedback rejects proposals from another club", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return {
        id: "proposal-2",
        club_id: "club-2"
      };
    }
  };

  await assert.rejects(
    () =>
      createFeedback({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        payload: {
          proposal_id: "proposal-2",
          category: "event",
          comment: "Wrong club."
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 404 && error.code === "PROPOSAL_NOT_FOUND"
  );
});

test("advisor can list announcements and feedback for assigned clubs", async () => {
  const fakeDatabase = {
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-1"];
    },
    async listAnnouncements(filters) {
      assert.deepEqual(filters, {
        clubIds: ["club-1"],
        audience: undefined
      });
      return [createAnnouncementRecord()];
    },
    async listFeedback(filters) {
      assert.deepEqual(filters, {
        clubIds: ["club-1"],
        proposalId: undefined,
        status: undefined
      });
      return [createFeedbackRecord()];
    }
  };

  const actor = {
    id: "advisor-1",
    role: "advisor",
    clubId: null
  };

  const announcements = await listAnnouncements({ actor, database: fakeDatabase });
  const feedback = await listFeedback({ actor, database: fakeDatabase });

  assert.equal(announcements.length, 1);
  assert.equal(feedback.length, 1);
});

function createRouteDatabase() {
  const profiles = {
    "president-1": {
      id: "president-1",
      full_name: "Ada President",
      role: "president",
      club_id: "club-1"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      if (accessToken !== "president-token") {
        return null;
      }

      return {
        id: "president-1",
        email: "president@nilehive.test"
      };
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listAnnouncements() {
      return [createAnnouncementRecord()];
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

test("missing-token access is blocked for communications", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/communications/announcements`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
