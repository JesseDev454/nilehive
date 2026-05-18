const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createMember,
  listMembers,
  updateMember
} = require("../src/modules/members/members.service");

function createMemberRecord(overrides = {}) {
  return {
    id: "member-1",
    club_id: "club-1",
    profile_id: null,
    full_name: "Amina Member",
    student_id: "020232255",
    email: "amina@nileuniversity.edu.ng",
    phone_number: "08000000000",
    club_role: "member",
    membership_status: "active",
    club: {
      id: "club-1",
      name: "Nile Innovators Club",
      code: "NIC"
    },
    created_at: "2026-04-12T10:00:00.000Z",
    updated_at: "2026-04-12T10:00:00.000Z",
    ...overrides
  };
}

function createProfileRecord(overrides = {}) {
  return {
    id: "profile-1",
    full_name: "Amina Member",
    student_id: "020232255",
    role: "student",
    club_id: "club-1",
    ...overrides
  };
}

test("president can add a member to their club", async () => {
  let createdMember;
  const fakeDatabase = {
    async createClubMember(member) {
      createdMember = member;
      return createMemberRecord(member);
    }
  };

  const member = await createMember({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: {
      full_name: "Amina Member",
      student_id: "020232255",
      email: "amina@nileuniversity.edu.ng",
      phone_number: "08000000000",
      club_role: "member"
    },
    database: fakeDatabase
  });

  assert.equal(createdMember.club_id, "club-1");
  assert.equal(createdMember.club_role, "member");
  assert.equal(createdMember.membership_status, "inactive");
  assert.equal(member.full_name, "Amina Member");
});

test("president cannot add members to another club", async () => {
  await assert.rejects(
    () =>
      createMember({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-2",
          full_name: "Wrong Club Member",
          student_id: "020303344"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("member creation rejects student IDs that are not exactly 9 digits", async () => {
  await assert.rejects(
    () =>
      createMember({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: {
          full_name: "Invalid ID Member",
          student_id: "NILE-001"
        },
        database: {}
      }),
    (error) => error.statusCode === 400 && error.code === "VALIDATION_ERROR"
  );
});

test("executive can list members in their club", async () => {
  const fakeDatabase = {
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        clubId: "club-1",
        clubRoles: undefined,
        membershipStatus: undefined,
        excludeMembershipStatuses: ["alumni"]
      });
      return [createMemberRecord()];
    }
  };

  const members = await listMembers({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    database: fakeDatabase
  });

  assert.equal(members.length, 1);
  assert.equal(members[0].club_id, "club-1");
});

test("admin can list all members with club details", async () => {
  const fakeDatabase = {
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        clubId: null,
        clubRoles: undefined,
        membershipStatus: undefined,
        excludeMembershipStatuses: ["alumni"]
      });
      return [
        createMemberRecord(),
        createMemberRecord({
          id: "member-2",
          club_id: "club-2",
          full_name: "Bala Member",
          student_id: "020303344",
          club: {
            id: "club-2",
            name: "Nile Business Club",
            code: "NBC"
          }
        })
      ];
    }
  };

  const members = await listMembers({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    database: fakeDatabase
  });

  assert.equal(members.length, 2);
  assert.equal(members[0].club.name, "Nile Innovators Club");
  assert.equal(members[1].club.name, "Nile Business Club");
});

test("president can list executive team members", async () => {
  const fakeDatabase = {
    async listClubMembers(filters) {
      assert.deepEqual(filters, {
        clubId: "club-1",
        clubRoles: ["executive", "president"],
        membershipStatus: undefined,
        excludeMembershipStatuses: ["alumni"]
      });
      return [
        createMemberRecord({
          club_role: "executive"
        })
      ];
    }
  };

  const members = await listMembers({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    filters: {
      team: "executive"
    },
    database: fakeDatabase
  });

  assert.equal(members.length, 1);
  assert.equal(members[0].club_role, "executive");
});

test("president can update member role and status", async () => {
  const fakeDatabase = {
    async getClubMemberById(memberId) {
      assert.equal(memberId, "member-1");
      return createMemberRecord();
    },
    async updateClubMember(memberId, update) {
      assert.equal(memberId, "member-1");
      assert.deepEqual(update, {
        club_role: "executive",
        membership_status: "active"
      });
      return createMemberRecord(update);
    },
    async listDuePayments(filters) {
      assert.deepEqual(filters, {
        memberId: "member-1",
        status: "paid"
      });
      return [
        {
          academic_session: "2025/2026",
          status: "paid"
        }
      ];
    }
  };

  const member = await updateMember({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    memberId: "member-1",
    payload: {
      club_role: "executive",
      membership_status: "active"
    },
    database: fakeDatabase
  });

  assert.equal(member.club_role, "executive");
});

test("admin gets a structured conflict before replacing an existing president", async () => {
  let updateCalled = false;
  const fakeDatabase = {
    async getClubMemberById() {
      return createMemberRecord({
        profile_id: "profile-2",
        membership_status: "active"
      });
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-1"
      });

      return [
        createProfileRecord({
          id: "profile-president",
          full_name: "Current President",
          student_id: "020200001",
          role: "president"
        })
      ];
    },
    async updateClubMember() {
      updateCalled = true;
      return createMemberRecord();
    }
  };

  await assert.rejects(
    () =>
      updateMember({
        actor: {
          id: "admin-1",
          role: "admin",
          clubId: null
        },
        memberId: "member-1",
        payload: {
          club_role: "president"
        },
        database: fakeDatabase
      }),
    (error) =>
      error.statusCode === 409 &&
      error.code === "PRESIDENT_ALREADY_EXISTS" &&
      error.details?.current_president?.id === "profile-president"
  );

  assert.equal(updateCalled, false);
});

test("admin can confirm president replacement from members flow", async () => {
  const memberUpdates = [];
  const profileUpdates = [];
  const roleHistoryEntries = [];

  const fakeDatabase = {
    async getClubMemberById(memberId) {
      assert.equal(memberId, "member-2");
      return createMemberRecord({
        id: "member-2",
        profile_id: "profile-new-president",
        full_name: "New President",
        club_role: "member",
        membership_status: "active"
      });
    },
    async listProfiles(filters) {
      assert.deepEqual(filters, {
        role: "president",
        clubId: "club-1"
      });

      return [
        createProfileRecord({
          id: "profile-old-president",
          full_name: "Current President",
          student_id: "020200001",
          role: "president"
        })
      ];
    },
    async updateClubMember(memberId, update) {
      memberUpdates.push({ memberId, update });

      if (memberId === "member-2") {
        return createMemberRecord({
          id: "member-2",
          profile_id: "profile-new-president",
          full_name: "New President",
          club_role: update.club_role ?? "member",
          membership_status: update.membership_status ?? "active"
        });
      }

      if (memberId === "member-old-president") {
        return createMemberRecord({
          id: "member-old-president",
          profile_id: "profile-old-president",
          full_name: "Current President",
          club_role: update.club_role ?? "president",
          membership_status: "active"
        });
      }

      throw new Error(`Unexpected member update: ${memberId}`);
    },
    async getProfileById(profileId) {
      if (profileId === "profile-new-president") {
        return createProfileRecord({
          id: "profile-new-president",
          full_name: "New President",
          student_id: "020200099",
          role: "student"
        });
      }

      return null;
    },
    async updateProfile(profileId, update) {
      profileUpdates.push({ profileId, update });

      return createProfileRecord({
        id: profileId,
        full_name: profileId === "profile-old-president" ? "Current President" : "New President",
        student_id: profileId === "profile-old-president" ? "020200001" : "020200099",
        role: update.role,
        club_id: update.club_id
      });
    },
    async getClubMemberByProfileAndClub(profileId, clubId) {
      assert.equal(clubId, "club-1");

      if (profileId === "profile-old-president") {
        return createMemberRecord({
          id: "member-old-president",
          profile_id: "profile-old-president",
          full_name: "Current President",
          club_role: "president",
          membership_status: "active"
        });
      }

      return null;
    },
    async createProfileRoleHistory(entry) {
      roleHistoryEntries.push(entry);
      return entry;
    }
  };

  const member = await updateMember({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    memberId: "member-2",
    payload: {
      club_role: "president",
      replace_existing_president: true
    },
    database: fakeDatabase
  });

  assert.equal(member.club_role, "president");
  assert.deepEqual(memberUpdates, [
    {
      memberId: "member-2",
      update: {
        club_role: "president"
      }
    },
    {
      memberId: "member-old-president",
      update: {
        club_role: "member"
      }
    }
  ]);
  assert.deepEqual(profileUpdates, [
    {
      profileId: "profile-old-president",
      update: {
        role: "student",
        club_id: "club-1"
      }
    },
    {
      profileId: "profile-new-president",
      update: {
        role: "president",
        club_id: "club-1"
      }
    }
  ]);
  assert.equal(roleHistoryEntries.length, 2);
  assert.equal(roleHistoryEntries[0].profile_id, "profile-old-president");
  assert.equal(roleHistoryEntries[0].new_role, "student");
  assert.equal(roleHistoryEntries[1].profile_id, "profile-new-president");
  assert.equal(roleHistoryEntries[1].new_role, "president");
});

test("president still cannot assign another president from members flow", async () => {
  const fakeDatabase = {
    async getClubMemberById() {
      return createMemberRecord({
        membership_status: "active"
      });
    }
  };

  await assert.rejects(
    () =>
      updateMember({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        memberId: "member-1",
        payload: {
          club_role: "president"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("president cannot mark a member active without current-session paid dues", async () => {
  const fakeDatabase = {
    async getClubMemberById() {
      return createMemberRecord({
        membership_status: "inactive"
      });
    },
    async listDuePayments() {
      return [];
    }
  };

  await assert.rejects(
    () =>
      updateMember({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        memberId: "member-1",
        payload: {
          membership_status: "active"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "DUES_NOT_VERIFIED"
  );
});

test("only admin can mark a member as alumni", async () => {
  const presidentDatabase = {
    async getClubMemberById() {
      return createMemberRecord();
    }
  };

  await assert.rejects(
    () =>
      updateMember({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        memberId: "member-1",
        payload: {
          membership_status: "alumni"
        },
        database: presidentDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );

  let historyEntry;
  const adminDatabase = {
    async getClubMemberById() {
      return createMemberRecord();
    },
    async updateClubMember(memberId, update) {
      assert.equal(memberId, "member-1");
      return createMemberRecord(update);
    },
    async createClubMemberStatusHistory(entry) {
      historyEntry = entry;
      return entry;
    }
  };

  const member = await updateMember({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    memberId: "member-1",
    payload: {
      membership_status: "alumni",
      status_change_reason: "Graduated"
    },
    database: adminDatabase
  });

  assert.equal(member.membership_status, "alumni");
  assert.equal(historyEntry.previous_status, "active");
  assert.equal(historyEntry.new_status, "alumni");
  assert.equal(historyEntry.reason, "Graduated");
});

test("advisor cannot manage club members", async () => {
  await assert.rejects(
    () =>
      listMembers({
        actor: {
          id: "advisor-1",
          role: "advisor"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

function createRouteDatabase() {
  const profiles = {
    "president-1": {
      id: "president-1",
      full_name: "Tomi President",
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
    async listClubMembers() {
      return [createMemberRecord()];
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

test("missing-token access is blocked for members", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/members`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
