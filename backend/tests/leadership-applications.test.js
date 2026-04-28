const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createLeadershipApplication,
  decideLeadershipApplication
} = require("../src/modules/leadership-applications/leadership-applications.service");

function createApplication(overrides = {}) {
  return {
    id: "application-1",
    profile_id: "student-1",
    club_id: "club-1",
    current_role: "student",
    requested_role: "executive",
    status: "pending",
    reason: "I have supported events and want to serve the club officially.",
    experience: "I helped organize two approved events.",
    goals: "Improve member onboarding.",
    availability: "Weekdays after 4pm.",
    reviewed_by: null,
    reviewed_at: null,
    decision_remarks: null,
    created_at: "2026-04-20T10:00:00.000Z",
    updated_at: "2026-04-20T10:00:00.000Z",
    ...overrides
  };
}

function createProfile(overrides = {}) {
  return {
    id: "student-1",
    full_name: "Ada Student",
    role: "student",
    club_id: "club-1",
    student_id: "020232255",
    requested_role: "student",
    created_at: "2026-04-20T10:00:00.000Z",
    updated_at: "2026-04-20T10:00:00.000Z",
    ...overrides
  };
}

function createMember(overrides = {}) {
  return {
    id: "member-1",
    club_id: "club-1",
    profile_id: "student-1",
    full_name: "Ada Student",
    student_id: "020232255",
    email: null,
    phone_number: null,
    club_role: "member",
    membership_status: "active",
    created_at: "2026-04-20T10:00:00.000Z",
    updated_at: "2026-04-20T10:00:00.000Z",
    ...overrides
  };
}

test("students can no longer self-submit leadership applications", async () => {
  await assert.rejects(
    () =>
      createLeadershipApplication({
        actor: {
          id: "student-1",
          role: "student",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-1",
          requested_role: "executive",
          reason: "I have supported events and want to serve the club officially.",
          experience: "I helped organize two approved events."
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "LEADERSHIP_SELF_SERVICE_DISABLED"
  );
});

test("executives can no longer self-submit president applications", async () => {
  await assert.rejects(
    () =>
      createLeadershipApplication({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-1",
          requested_role: "president",
          reason: "I have supported events and want to serve the club officially."
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "LEADERSHIP_SELF_SERVICE_DISABLED"
  );
});

test("leadership self-service stays disabled even if there is already an open request", async () => {
  await assert.rejects(
    () =>
      createLeadershipApplication({
        actor: {
          id: "student-1",
          role: "student",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-1",
          requested_role: "executive",
          reason: "I have supported events and want to serve the club officially."
        },
        database: {
          async getOpenLeadershipApplication() {
            return createApplication();
          }
        }
      }),
    (error) => error.statusCode === 403 && error.code === "LEADERSHIP_SELF_SERVICE_DISABLED"
  );
});

test("leadership self-service stays disabled even for cooldown scenarios", async () => {
  await assert.rejects(
    () =>
      createLeadershipApplication({
        actor: {
          id: "student-1",
          role: "student",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-1",
          requested_role: "executive",
          reason: "I have supported events and want to serve the club officially."
        },
        database: {
          async getLatestRejectedLeadershipApplication() {
            return createApplication({
              status: "rejected",
              reviewed_at: new Date().toISOString()
            });
          }
        }
      }),
    (error) => error.statusCode === 403 && error.code === "LEADERSHIP_SELF_SERVICE_DISABLED"
  );
});

test("admin approval activates executive role and writes role history", async () => {
  let profileUpdate;
  let memberUpdate;
  let historyEntry;
  const fakeDatabase = {
    async getLeadershipApplicationById() {
      return createApplication();
    },
    async getProfileById() {
      return createProfile();
    },
    async getClubMemberByProfileAndClub() {
      return createMember();
    },
    async updateProfile(profileId, update) {
      profileUpdate = update;
      return createProfile({ id: profileId, ...update });
    },
    async updateClubMember(memberId, update) {
      memberUpdate = update;
      return createMember({ id: memberId, ...update });
    },
    async updateLeadershipApplication(applicationId, update) {
      return createApplication({ id: applicationId, ...update });
    },
    async createProfileRoleHistory(entry) {
      historyEntry = entry;
      return { id: "history-1", ...entry };
    }
  };

  const result = await decideLeadershipApplication({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    applicationId: "application-1",
    payload: {
      decision: "approve",
      remarks: "Approved for leadership service."
    },
    database: fakeDatabase
  });

  assert.equal(profileUpdate.role, "executive");
  assert.equal(profileUpdate.club_id, "club-1");
  assert.equal(memberUpdate.club_role, "executive");
  assert.equal(historyEntry.new_role, "executive");
  assert.equal(result.application.status, "approved");
});

test("non-admin cannot review leadership applications", async () => {
  await assert.rejects(
    () =>
      decideLeadershipApplication({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        applicationId: "application-1",
        payload: {
          decision: "approve"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("president approval requires explicit replacement confirmation", async () => {
  const fakeDatabase = {
    async getLeadershipApplicationById() {
      return createApplication({
        requested_role: "president"
      });
    },
    async getProfileById() {
      return createProfile();
    },
    async getClubMemberByProfileAndClub() {
      return createMember();
    },
    async listProfiles() {
      return [createProfile({ id: "existing-president", role: "president" })];
    }
  };

  await assert.rejects(
    () =>
      decideLeadershipApplication({
        actor: {
          id: "admin-1",
          role: "admin",
          clubId: null
        },
        applicationId: "application-1",
        payload: {
          decision: "approve"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "PRESIDENT_ALREADY_EXISTS"
  );
});
