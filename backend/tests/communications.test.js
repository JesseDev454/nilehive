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
    priority: "normal",
    target_role: null,
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
    },
    async listProfiles() {
      return [];
    },
    async listClubMembers() {
      return [];
    },
    async getAdvisorProfileIdsByClubId() {
      return [];
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
  let createdNotifications = [];
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    },
    async listProfiles() {
      return [
        { id: "student-1" },
        { id: "president-1" }
      ];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
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
      audience: "all_users",
      priority: "urgent"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.club_id, null);
  assert.equal(createdAnnouncement.audience, "all_users");
  assert.equal(createdAnnouncement.priority, "urgent");
  assert.equal(announcement.audience, "all_users");
  assert.equal(createdNotifications.length, 2);
  assert.ok(createdNotifications.every((notification) => notification.type === "announcement_published"));
  assert.ok(createdNotifications.every((notification) => notification.announcement_id === "announcement-1"));
});

test("admin can create an all-clubs announcement", async () => {
  let createdNotifications = [];
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      return createAnnouncementRecord({
        ...announcement,
        club_id: null,
        audience: "all_clubs"
      });
    },
    async listProfiles() {
      return [
        { id: "president-1", club_id: "club-1" },
        { id: "executive-1", club_id: "club-1" },
        { id: "student-without-club", club_id: null }
      ];
    },
    async listClubMembers() {
      return [
        { profile_id: "student-1" },
        { profile_id: "executive-1" }
      ];
    },
    async listClubs() {
      return [
        { id: "club-1", advisor_id: "advisor-1" },
        { id: "club-2", advisor_id: null }
      ];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
    }
  };

  const announcement = await createAnnouncement({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      title: "All clubs update",
      message: "Every active club should review this.",
      audience: "all_clubs"
    },
    database: fakeDatabase
  });

  assert.equal(announcement.audience, "all_clubs");
  assert.deepEqual(createdNotifications.map((notification) => notification.user_id).sort(), [
    "advisor-1",
    "executive-1",
    "president-1",
    "student-1"
  ]);
});

test("admin can create a one-club announcement", async () => {
  let createdAnnouncement;
  let createdNotifications = [];
  const fakeDatabase = {
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return { id: "club-1" };
    },
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, { clubId: "club-1" });
      return [{ id: "president-1" }];
    },
    async listClubMembers(filters) {
      assert.deepEqual(filters, { clubId: "club-1", membershipStatus: "active" });
      return [{ profile_id: "student-1" }];
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

  const announcement = await createAnnouncement({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      title: "Nile Innovators update",
      message: "This is only for one club.",
      audience: "club",
      club_id: "club-1"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.club_id, "club-1");
  assert.equal(announcement.audience, "club");
  assert.deepEqual(createdNotifications.map((notification) => notification.user_id).sort(), [
    "advisor-1",
    "president-1",
    "student-1"
  ]);
});

test("admin can create a role-targeted announcement", async () => {
  let createdAnnouncement;
  let createdNotifications = [];
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, { role: "executive", clubId: undefined });
      return [{ id: "executive-1" }];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
    }
  };

  const announcement = await createAnnouncement({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      title: "Executive reminder",
      message: "Please check your assigned tasks.",
      audience: "role",
      target_role: "executive"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.audience, "role");
  assert.equal(createdAnnouncement.target_role, "executive");
  assert.equal(announcement.target_role, "executive");
  assert.equal(createdNotifications.length, 1);
});

test("president can create own-club executive announcement", async () => {
  let createdAnnouncement;
  const fakeDatabase = {
    async createAnnouncement(announcement) {
      createdAnnouncement = announcement;
      return createAnnouncementRecord(announcement);
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, { role: "executive", clubId: "club-1" });
      return [{ id: "executive-1" }];
    },
    async createNotifications(notifications) {
      return notifications;
    }
  };

  const announcement = await createAnnouncement({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: {
      title: "Executive sync",
      message: "Meet after lectures.",
      audience: "role",
      target_role: "executive"
    },
    database: fakeDatabase
  });

  assert.equal(createdAnnouncement.club_id, "club-1");
  assert.equal(createdAnnouncement.audience, "role");
  assert.equal(createdAnnouncement.target_role, "executive");
  assert.equal(announcement.audience, "role");
});

test("president cannot target advisor role announcements", async () => {
  await assert.rejects(
    () =>
      createAnnouncement({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: {
          title: "Wrong target",
          message: "This should not be allowed.",
          audience: "role",
          target_role: "advisor"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("executive, advisor, and student cannot create announcements", async () => {
  for (const role of ["executive", "advisor", "student"]) {
    await assert.rejects(
      () =>
        createAnnouncement({
          actor: {
            id: `${role}-1`,
            role,
            clubId: role === "advisor" ? null : "club-1"
          },
          payload: {
            title: "Blocked notice",
            message: "This should not be allowed."
          },
          database: {}
        }),
      (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
    );
  }
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
        audience: undefined,
        clubId: undefined,
        priority: undefined
      });
      return [
        createAnnouncementRecord(),
        createAnnouncementRecord({
          id: "announcement-2",
          club_id: "club-2"
        }),
        createAnnouncementRecord({
          id: "announcement-3",
          club_id: null,
          audience: "all_users"
        })
      ];
    },
    async listAnnouncementReadsByUserId(userId) {
      assert.equal(userId, "advisor-1");
      return [];
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

  assert.equal(announcements.length, 2);
  assert.equal(feedback.length, 1);
});

test("student sees global, own-club, and matching role announcements only", async () => {
  const fakeDatabase = {
    async listAnnouncements() {
      return [
        createAnnouncementRecord({ id: "global-1", club_id: null, audience: "all_users" }),
        createAnnouncementRecord({ id: "club-1", club_id: "club-1", audience: "club" }),
        createAnnouncementRecord({ id: "club-2", club_id: "club-2", audience: "club" }),
        createAnnouncementRecord({ id: "role-1", club_id: null, audience: "role", target_role: "student" }),
        createAnnouncementRecord({ id: "role-2", club_id: null, audience: "role", target_role: "executive" })
      ];
    },
    async listAnnouncementReadsByUserId() {
      return [{ announcement_id: "global-1", read_at: "2026-05-02T10:00:00.000Z" }];
    }
  };

  const announcements = await listAnnouncements({
    actor: {
      id: "student-1",
      role: "student",
      clubId: "club-1"
    },
    database: fakeDatabase
  });

  assert.deepEqual(announcements.map((announcement) => announcement.id), ["global-1", "club-1", "role-1"]);
  assert.equal(announcements[0].is_read, true);
});

test("user can mark one announcement and all announcements as read", async () => {
  const marked = [];
  const fakeDatabase = {
    async listAnnouncements() {
      return [
        createAnnouncementRecord({ id: "announcement-1", club_id: null, audience: "all_users" }),
        createAnnouncementRecord({ id: "announcement-2", club_id: "club-1", audience: "club" })
      ];
    },
    async listAnnouncementReadsByUserId() {
      return [];
    },
    async markAnnouncementRead(announcementId, userId) {
      marked.push([announcementId, userId]);
      return {
        announcement_id: announcementId,
        user_id: userId,
        read_at: "2026-05-02T10:00:00.000Z"
      };
    },
    async markAnnouncementsRead(announcementIds, userId) {
      marked.push(...announcementIds.map((announcementId) => [announcementId, userId]));
      return announcementIds.map((announcementId) => ({
        announcement_id: announcementId,
        user_id: userId,
        read_at: "2026-05-02T10:00:00.000Z"
      }));
    }
  };
  const { markAnnouncementRead, markAllAnnouncementsRead } = require("../src/modules/communications/communications.service");
  const actor = { id: "student-1", role: "student", clubId: "club-1" };

  const readAnnouncement = await markAnnouncementRead({
    actor,
    announcementId: "announcement-1",
    database: fakeDatabase
  });
  const readAll = await markAllAnnouncementsRead({ actor, database: fakeDatabase });

  assert.equal(readAnnouncement.is_read, true);
  assert.equal(readAll.marked_read, 2);
  assert.deepEqual(marked, [
    ["announcement-1", "student-1"],
    ["announcement-1", "student-1"],
    ["announcement-2", "student-1"]
  ]);
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
