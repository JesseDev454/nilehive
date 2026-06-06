const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  assignAdvisorToClub,
  listAdminUsers,
  updateAdminUserRole
} = require("../src/modules/admin-users/admin-users.service");

function createProfile(overrides = {}) {
  return {
    id: "student-1",
    full_name: "Ada Student",
    role: "student",
    club_id: "club-1",
    student_id: "020232255",
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

function createMemberRecord(overrides = {}) {
  return {
    id: "member-1",
    club_id: "club-1",
    profile_id: "student-1",
    full_name: "Ada Student",
    student_id: "020232255",
    email: "ada@nileuniversity.edu.ng",
    phone_number: "08000000000",
    club_role: "member",
    membership_status: "active",
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
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
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-1"
      });

      return [];
    },
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        profileId: "student-1",
        excludeMembershipStatuses: ["alumni"]
      });
      return [];
    },
    async createClubMember(member) {
      return createMemberRecord({
        id: "member-new",
        club_id: member.club_id,
        profile_id: member.profile_id,
        club_role: member.club_role,
        membership_status: member.membership_status
      });
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

test("admin role reassignment keeps old club history and creates a new active club member record", async () => {
  const memberUpdates = [];
  let createdMember = null;
  let profileUpdate = null;

  const fakeDatabase = {
    async getProfileById(profileId) {
      assert.equal(profileId, "student-1");
      return createProfile({
        club_id: "club-1",
        role: "student"
      });
    },
    async getClubById(clubId) {
      return createClub({
        id: clubId,
        name: clubId === "club-2" ? "Debate Union" : "Nile Innovators Club",
        code: clubId === "club-2" ? "DBU" : "NIC"
      });
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-2"
      });
      return [];
    },
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        profileId: "student-1",
        excludeMembershipStatuses: ["alumni"]
      });

      return [
        createMemberRecord({
          id: "member-club-1",
          club_id: "club-1",
          club_role: "member",
          membership_status: "active"
        })
      ];
    },
    async getClubMemberByProfileAndClub(profileId, clubId) {
      assert.equal(profileId, "student-1");
      assert.equal(clubId, "club-2");
      return null;
    },
    async updateClubMember(memberId, update) {
      memberUpdates.push({ memberId, update });
      return createMemberRecord({
        id: memberId,
        club_id: "club-1",
        membership_status: update.membership_status ?? "active",
        club_role: update.club_role ?? "member"
      });
    },
    async createClubMember(member) {
      createdMember = member;
      return createMemberRecord({
        id: "member-club-2",
        club_id: member.club_id,
        profile_id: member.profile_id,
        full_name: member.full_name,
        student_id: member.student_id,
        phone_number: member.phone_number,
        club_role: member.club_role,
        membership_status: member.membership_status
      });
    },
    async updateProfile(profileId, update) {
      profileUpdate = { profileId, update };
      return createProfile({ id: profileId, ...update });
    },
    async createProfileRoleHistory(entry) {
      return entry;
    }
  };

  const result = await updateAdminUserRole({
    actor: { id: "admin-1", role: "admin" },
    profileId: "student-1",
    payload: {
      role: "president",
      club_id: "club-2",
      remarks: "Moved to another club leadership team."
    },
    database: fakeDatabase
  });

  assert.equal(result.profile.role, "president");
  assert.deepEqual(memberUpdates, [
    {
      memberId: "member-club-1",
      update: {
        membership_status: "alumni"
      }
    }
  ]);
  assert.deepEqual(createdMember, {
    club_id: "club-2",
    profile_id: "student-1",
    full_name: "Ada Student",
    student_id: "020232255",
    email: null,
    phone_number: null,
    club_role: "president",
    membership_status: "active"
  });
  assert.deepEqual(profileUpdate, {
    profileId: "student-1",
    update: {
      role: "president",
      club_id: "club-2"
    }
  });
});

test("admin user list shows the signed-in user's effective Campus One admin access", async () => {
  const actor = {
    id: "student-1",
    role: "admin",
    appRole: "student",
    portalRole: "staff",
    customRoles: ["club_services_admin"]
  };
  const fakeDatabase = {
    async listProfiles() {
      return [createProfile({
        id: "student-1",
        role: "student",
        club_id: null
      })];
    }
  };

  const users = await listAdminUsers({
    actor,
    database: fakeDatabase
  });

  assert.equal(users[0].role, "student");
  assert.equal(users[0].app_role, "student");
  assert.equal(users[0].portal_role, "staff");
  assert.deepEqual(users[0].custom_roles, ["club_services_admin"]);
  assert.equal(users[0].effective_role, "admin");
});

for (const role of ["student", "executive", "president"]) {
  test(`admin can assign ${role} club access when the user has no University ID`, async () => {
    let listProfilesCalled = false;
    let createdMember = null;
    let profileUpdate = null;

    const fakeDatabase = {
      async getProfileById(profileId) {
        assert.equal(profileId, "student-1");
        return createProfile({
          student_id: null,
          role: "student",
          club_id: null
        });
      },
      async getClubById(clubId) {
        assert.equal(clubId, "club-1");
        return createClub();
      },
      async listProfiles() {
        listProfilesCalled = true;
        return [];
      },
      async createClubMember(payload) {
        createdMember = payload;
        return { id: "member-1", ...payload };
      },
      async updateProfile(profileId, update) {
        profileUpdate = { profileId, update };
        return createProfile({ role, club_id: update.club_id });
      }
    };

    await updateAdminUserRole({
      actor: { id: "admin-1", role: "admin" },
      profileId: "student-1",
      payload: {
        role,
        club_id: "club-1"
      },
      database: fakeDatabase
    });

    assert.equal(listProfilesCalled, role === "president");
    assert.equal(createdMember, null);
    assert.deepEqual(profileUpdate, {
      profileId: "student-1",
      update: {
        role,
        club_id: "club-1"
      }
    });
  });
}

test("admin role update returns a structured conflict before replacing an existing president", async () => {
  let updateCalled = false;
  const fakeDatabase = {
    async getProfileById(profileId) {
      assert.equal(profileId, "student-1");
      return createProfile();
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return createClub();
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-1"
      });

      return [
        createProfile({
          id: "current-president",
          full_name: "Current President",
          role: "president",
          student_id: "020200001"
        })
      ];
    },
    async updateProfile() {
      updateCalled = true;
      return createProfile({ role: "president" });
    }
  };

  await assert.rejects(
    () =>
      updateAdminUserRole({
        actor: { id: "admin-1", role: "admin" },
        profileId: "student-1",
        payload: {
          role: "president",
          club_id: "club-1"
        },
        database: fakeDatabase
      }),
    (error) =>
      error.statusCode === 409 &&
      error.code === "PRESIDENT_ALREADY_EXISTS" &&
      error.details?.current_president?.id === "current-president"
  );

  assert.equal(updateCalled, false);
});

test("admin can confirm president replacement from user management", async () => {
  const profileUpdates = [];
  const memberUpdates = [];
  const roleHistoryEntries = [];

  const fakeDatabase = {
    async getProfileById(profileId) {
      if (profileId === "student-1") {
        return createProfile();
      }

      return null;
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return createClub();
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-1"
      });

      return [
        createProfile({
          id: "current-president",
          full_name: "Current President",
          role: "president",
          student_id: "020200001"
        })
      ];
    },
    async updateProfile(profileId, update) {
      profileUpdates.push({ profileId, update });
      return createProfile({
        id: profileId,
        full_name: profileId === "current-president" ? "Current President" : "Ada Student",
        student_id: profileId === "current-president" ? "020200001" : "020232255",
        role: update.role,
        club_id: update.club_id
      });
    },
    async getClubMemberByProfileAndClub(profileId, clubId) {
      assert.equal(clubId, "club-1");

      if (profileId === "current-president") {
        return createMemberRecord({
          id: "member-current-president",
          profile_id: "current-president",
          full_name: "Current President",
          student_id: "020200001",
          club_role: "president"
        });
      }

      if (profileId === "student-1") {
        return createMemberRecord({
          id: "member-student-1",
          profile_id: "student-1",
          full_name: "Ada Student",
          student_id: "020232255",
          club_role: "member"
        });
      }

      return null;
    },
    async updateClubMember(memberId, update) {
      memberUpdates.push({ memberId, update });
      return createMemberRecord({
        id: memberId,
        profile_id: memberId === "member-current-president" ? "current-president" : "student-1",
        full_name: memberId === "member-current-president" ? "Current President" : "Ada Student",
        student_id: memberId === "member-current-president" ? "020200001" : "020232255",
        club_role: update.club_role ?? "member"
      });
    },
    async createProfileRoleHistory(entry) {
      roleHistoryEntries.push(entry);
      return entry;
    }
  };

  const result = await updateAdminUserRole({
    actor: { id: "admin-1", role: "admin" },
    profileId: "student-1",
    payload: {
      role: "president",
      club_id: "club-1",
      remarks: "Replacing outgoing president.",
      replace_existing_president: true
    },
    database: fakeDatabase
  });

  assert.equal(result.profile.role, "president");
  assert.deepEqual(profileUpdates, [
    {
      profileId: "current-president",
      update: {
        role: "student",
        club_id: "club-1"
      }
    },
    {
      profileId: "student-1",
      update: {
        role: "president",
        club_id: "club-1"
      }
    }
  ]);
  assert.deepEqual(memberUpdates, [
    {
      memberId: "member-current-president",
      update: {
        club_role: "member"
      }
    },
    {
      memberId: "member-student-1",
      update: {
        full_name: "Ada Student",
        student_id: "020232255",
        email: "ada@nileuniversity.edu.ng",
        phone_number: "08000000000",
        club_role: "president",
        membership_status: "active"
      }
    }
  ]);
  assert.equal(roleHistoryEntries.length, 2);
  assert.equal(roleHistoryEntries[0].profile_id, "current-president");
  assert.equal(roleHistoryEntries[0].new_role, "student");
  assert.equal(roleHistoryEntries[1].profile_id, "student-1");
  assert.equal(roleHistoryEntries[1].new_role, "president");
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
  let profileUpdate;
  let assignmentInput;
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
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        profileId: "advisor-1",
        excludeMembershipStatuses: ["alumni"]
      });
      return [];
    },
    async listClubAdvisorAssignments() {
      return [];
    },
    async updateProfile(profileId, update) {
      profileUpdate = update;
      return createProfile({ id: profileId, ...update });
    },
    async createClubAdvisorAssignment(input) {
      assignmentInput = input;
      return {
        id: "assignment-1",
        club_id: "club-1",
        advisor_profile_id: "advisor-1",
        assigned_by: "admin-1",
        remarks: "Assigned as club advisor.",
        created_at: "2026-04-17T10:00:00.000Z",
        club: createClub(),
        advisor: createProfile({ id: "advisor-1", role: "advisor", club_id: "club-1" })
      };
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

  assert.deepEqual(profileUpdate, { role: "advisor", club_id: "club-1" });
  assert.deepEqual(assignmentInput, {
    club_id: "club-1",
    advisor_profile_id: "advisor-1",
    assigned_by: "admin-1",
    remarks: "Assigned as club advisor."
  });
  assert.equal(historyEntry.new_role, "advisor");
  assert.equal(result.club.id, "club-1");
});

test("advisor reassignment aligns the active club even if the user had a previous club", async () => {
  let profileUpdate;

  const fakeDatabase = {
    async getProfileById() {
      return createProfile({
        id: "advisor-1",
        role: "student",
        club_id: "club-1",
        requested_role: "student"
      });
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-2");
      return createClub({
        id: "club-2",
        name: "Debate Union",
        code: "DBU"
      });
    },
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        profileId: "advisor-1",
        excludeMembershipStatuses: ["alumni"]
      });
      return [
        createMemberRecord({
          id: "member-club-1",
          profile_id: "advisor-1",
          club_id: "club-1",
          membership_status: "active"
        })
      ];
    },
    async updateClubMember() {
      return createMemberRecord({
        id: "member-club-1",
        profile_id: "advisor-1",
        club_id: "club-1",
        membership_status: "alumni"
      });
    },
    async listClubAdvisorAssignments() {
      return [];
    },
    async updateProfile(profileId, update) {
      profileUpdate = { profileId, update };
      return createProfile({ id: profileId, ...update });
    },
    async createClubAdvisorAssignment(input) {
      return {
        id: "assignment-2",
        club_id: input.club_id,
        advisor_profile_id: input.advisor_profile_id,
        assigned_by: input.assigned_by,
        remarks: input.remarks,
        created_at: "2026-04-17T10:00:00.000Z",
        club: createClub({
          id: "club-2",
          name: "Debate Union",
          code: "DBU"
        }),
        advisor: createProfile({ id: "advisor-1", role: "advisor", club_id: "club-2" })
      };
    },
    async createProfileRoleHistory(entry) {
      return entry;
    }
  };

  await assignAdvisorToClub({
    actor: { id: "admin-1", role: "admin" },
    profileId: "advisor-1",
    payload: {
      club_id: "club-2",
      remarks: "Moved to the new advisor assignment."
    },
    database: fakeDatabase
  });

  assert.deepEqual(profileUpdate, {
    profileId: "advisor-1",
    update: {
      role: "advisor",
      club_id: "club-2"
    }
  });
});

test("advisor assignment rejects duplicate advisor-club links", async () => {
  const fakeDatabase = {
    async getProfileById() {
      return createProfile({ id: "advisor-1", role: "advisor", club_id: "club-1" });
    },
    async getClubById() {
      return createClub();
    },
    async listClubAdvisorAssignments() {
      return [
        {
          id: "assignment-1",
          club_id: "club-1",
          advisor_profile_id: "advisor-1",
          assigned_by: "admin-1",
          remarks: null,
          created_at: "2026-04-17T10:00:00.000Z",
          club: createClub()
        }
      ];
    }
  };

  await assert.rejects(
    () =>
      assignAdvisorToClub({
        actor: { id: "admin-1", role: "admin" },
        profileId: "advisor-1",
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
  assert.equal(payload.data.items.length, 3);
  assert.equal(payload.data.total, 3);
  assert.equal(payload.data.page, 1);
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

test("invalid pagination params are rejected for admin users route", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/admin/users?page=0`, {
    headers: { Authorization: "Bearer admin-token" }
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
});
