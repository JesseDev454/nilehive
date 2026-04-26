const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createFakeDatabase() {
  const clubs = [
    {
      id: "club-1",
      name: "Nile Innovators Club",
      code: "NIC",
      advisor_id: null,
      created_at: "2026-04-05T10:00:00.000Z"
    }
  ];
  const profiles = {
    "student-1": {
      id: "student-1",
      full_name: "Ada Student",
      role: "student",
      club_id: "club-1",
      student_id: "020232255",
      requested_role: "student",
      onboarding_status: "complete",
      account_status: "active",
      created_at: "2026-04-15T10:00:00.000Z",
      updated_at: "2026-04-15T10:00:00.000Z"
    }
  };
  const tokens = {
    "new-user-token": {
      id: "new-user-1",
      email: "newstudent@nileuniversity.edu.ng",
      user_metadata: {}
    },
    "student-token": {
      id: "student-1",
      email: "student@nileuniversity.edu.ng",
      user_metadata: {}
    },
    "external-user-token": {
      id: "external-user-1",
      email: "external@example.com",
      user_metadata: {}
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async getClubById(clubId) {
      return clubs.find((club) => club.id === clubId) ?? null;
    },
    async createProfile(profile) {
      const createdProfile = {
        ...profile,
        created_at: "2026-04-15T10:00:00.000Z",
        updated_at: "2026-04-15T10:00:00.000Z"
      };
      profiles[profile.id] = createdProfile;
      return createdProfile;
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

async function requestJson(baseUrl, path, token, body = null) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();

  return { response, payload };
}

test("authenticated user without profile can inspect onboarding state", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/me",
    "new-user-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.requires_profile_setup, true);
  assert.equal(payload.data.profile, null);
});

test("new user can complete student profile onboarding", async (t) => {
  const database = createFakeDatabase();
  let createdMembershipRequest = null;
  database.getOpenMembershipRequest = async () => null;
  database.createMembershipRequest = async (request) => {
    createdMembershipRequest = request;
    return request;
  };
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "new-user-token",
    {
      full_name: "New Student",
      student_id: "020303344",
      club_id: "club-1",
      requested_role: "student"
    }
  );

  assert.equal(response.status, 201);
  assert.equal(payload.data.role, "student");
  assert.equal(payload.data.requested_role, "student");
  assert.equal(payload.data.club_id, "club-1");
  assert.equal(payload.data.account_status, "active");
  assert.deepEqual(createdMembershipRequest, {
    profile_id: "new-user-1",
    club_id: "club-1",
    requested_role: "member",
    status: "pending",
    remarks: "Created during profile onboarding."
  });
});

test("advisor can complete profile onboarding without a student ID", async (t) => {
  const database = createFakeDatabase();
  database.getUserByAccessToken = async (accessToken) => {
    if (accessToken === "advisor-token") {
      return {
        id: "advisor-1",
        email: "advisor@nileuniversity.edu.ng",
        user_metadata: {}
      };
    }

    return null;
  };
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "advisor-token",
    {
      full_name: "Daniel Advisor",
      student_id: null,
      club_id: "club-1",
      requested_role: "advisor"
    }
  );

  assert.equal(response.status, 201);
  assert.equal(payload.data.role, "advisor");
  assert.equal(payload.data.requested_role, "advisor");
  assert.equal(payload.data.student_id, null);
  assert.equal(payload.data.club_id, "club-1");
});

test("profile onboarding rejects leadership self-service roles", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "new-user-token",
    {
      full_name: "New Admin",
      student_id: "242124563",
      club_id: "club-1",
      requested_role: "executive"
    }
  );

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
});

test("profile onboarding rejects student IDs that are not exactly 9 digits", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "new-user-token",
    {
      full_name: "New Student",
      student_id: "NUN-2026-001",
      club_id: "club-1",
      requested_role: "student"
    }
  );

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
  assert.equal(payload.error.message, "Student ID must be exactly 9 digits");
});

test("profile onboarding rejects non-Nile email domains", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "external-user-token",
    {
      full_name: "External User",
      student_id: "020303345",
      club_id: "club-1",
      requested_role: "student"
    }
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "UNSUPPORTED_EMAIL_DOMAIN");
});

test("profile onboarding is blocked when profile already exists", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/onboarding",
    "student-token",
    {
      full_name: "Ada Student",
      student_id: "020232255",
      club_id: "club-1",
      requested_role: "student"
    }
  );

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "PROFILE_ALREADY_EXISTS");
});

test("suspended profiles are blocked before entering the app shell", async (t) => {
  const database = createFakeDatabase();
  database.getProfileById = async (profileId) => {
    if (profileId === "student-1") {
      return {
        id: "student-1",
        full_name: "Ada Student",
        role: "student",
        club_id: "club-1",
        student_id: "020232255",
        requested_role: "student",
        onboarding_status: "complete",
        account_status: "suspended",
        created_at: "2026-04-15T10:00:00.000Z",
        updated_at: "2026-04-15T10:00:00.000Z"
      };
    }

    return null;
  };
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await requestJson(
    server.baseUrl,
    "/api/v1/profile/me",
    "student-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "ACCOUNT_SUSPENDED");
});
