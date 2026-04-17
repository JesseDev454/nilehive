const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  assignAdvisorToClub,
  updateAdminUserRole
} = require("../src/modules/admin-users/admin-users.service");

function createProfile(overrides = {}) {
  return {
    id: "student-1",
    full_name: "Ada Student",
    role: "student",
    club_id: "club-1",
    student_id: "NUN-001",
    requested_role: "president",
    onboarding_status: "complete",
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createClub(overrides = {}) {
  return {
    id: "club-1",
    name: "Nile Innovators Club",
    code: "NIC",
    advisor_id: null,
    created_at: "2026-04-05T10:00:00.000Z",
    ...overrides
  };
}

test("admin can promote a user and role history is recorded", async () => {
  let profileUpdate;
  let historyEntry;
  const fakeDatabase = {
    async getProfileById(profileId) {
      assert.equal(profileId, "student-1");
      return createProfile();
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return createClub();
    },
    async updateProfile(profileId, update) {
      profileUpdate = update;
      return createProfile({ id: profileId, ...update });
    },
    async createProfileRoleHistory(entry) {
      historyEntry = entry;
      return { id: "history-1", created_at: "2026-04-17T10:00:00.000Z", ...entry };
    }
  };

  const result = await updateAdminUserRole({
    actor: { id: "admin-1", role: "admin" },
    profileId: "student-1",
    payload: {
      role: "president",
      club_id: "club-1",
      remarks: "Approved by Club Services."
    },
    database: fakeDatabase
  });

  assert.equal(profileUpdate.role, "president");
  assert.equal(profileUpdate.club_id, "club-1");
  assert.equal(historyEntry.previous_role, "student");
  assert.equal(historyEntry.new_role, "president");
  assert.equal(historyEntry.changed_by, "admin-1");
  assert.equal(result.profile.role, "president");
});

test("non-admin cannot promote users", async () => {
  await assert.rejects(
    () =>
      updateAdminUserRole({
        actor: { id: "president-1", role: "president" },
        profileId: "student-1",
        payload: { role: "admin" },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("admin can assign an advisor to a club", async () => {
  let clearedAdvisorId;
  let updatedAdvisorClub;
  let profileUpdate;
  let historyEntry;
  const fakeDatabase = {
    async getProfileById(profileId) {
      assert.equal(profileId, "advisor-1");
      return createProfile({
        id: "advisor-1",
        role: "student",
        club_id: null,
        requested_role: "student"
      });
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return createClub();
    },
    async clearClubAdvisorAssignments(advisorId) {
      clearedAdvisorId = advisorId;
      return [];
    },
    async updateProfile(profileId, update) {
      profileUpdate = update;
      return createProfile({ id: profileId, ...update });
    },
    async updateClubAdvisor(clubId, advisorId) {
      updatedAdvisorClub = { clubId, advisorId };
      return createClub({ id: clubId, advisor_id: advisorId });
    },
    async createProfileRoleHistory(entry) {
      historyEntry = entry;
      return { id: "history-1", created_at: "2026-04-17T10:00:00.000Z", ...entry };
    }
  };

  const result = await assignAdvisorToClub({
    actor: { id: "admin-1", role: "admin" },
    profileId: "advisor-1",
    payload: {
      club_id: "club-1",
      remarks: "Assigned as club advisor."
    },
    database: fakeDatabase
  });

  assert.equal(clearedAdvisorId, "advisor-1");
  assert.deepEqual(profileUpdate, { role: "advisor", club_id: "club-1" });
  assert.deepEqual(updatedAdvisorClub, { clubId: "club-1", advisorId: "advisor-1" });
  assert.equal(historyEntry.new_role, "advisor");
  assert.equal(result.club.advisor_id, "advisor-1");
});

test("advisor assignment rejects occupied club unless replacement is confirmed", async () => {
  const fakeDatabase = {
    async getProfileById() {
      return createProfile({ id: "advisor-2", role: "student", club_id: null });
    },
    async getClubById() {
      return createClub({ advisor_id: "advisor-1" });
    }
  };

  await assert.rejects(
    () =>
      assignAdvisorToClub({
        actor: { id: "admin-1", role: "admin" },
        profileId: "advisor-2",
        payload: { club_id: "club-1" },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "ADVISOR_ALREADY_ASSIGNED"
  );
});

function createRouteDatabase() {
  const profiles = {
    "admin-1": createProfile({
      id: "admin-1",
      role: "admin",
      club_id: null,
      requested_role: "student"
    }),
    "student-1": createProfile(),
    "executive-1": createProfile({
      id: "executive-1",
      role: "executive",
      requested_role: "executive"
    })
  };

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "admin-token": "admin-1",
        "executive-token": "executive-1"
      };
      const profileId = tokenProfiles[accessToken];

      return profileId
        ? {
            id: profileId,
            email: `${profileId}@nilehive.test`
          }
        : null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listProfiles() {
      return Object.values(profiles);
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

test("admin can list users through the route", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/admin/users`, {
    headers: { Authorization: "Bearer admin-token" }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 3);
});

test("non-admin cannot list users through the route", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/admin/users`, {
    headers: { Authorization: "Bearer executive-token" }
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});
