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
        membershipStatus: undefined
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
        membershipStatus: undefined
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
        membershipStatus: undefined
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
