const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { createClub, updateClub, updateClubProfile } = require("../src/modules/clubs/clubs.service");

function createFakeDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    },
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    },
    "admin-1": {
      id: "admin-1",
      full_name: "Club Services Admin",
      role: "admin",
      club_id: null
    },
    "student-1": {
      id: "student-1",
      full_name: "Ada Student",
      role: "student",
      club_id: "club-1"
    }
  };

  const clubs = [
    {
      id: "club-1",
      name: "Nile Innovators Club",
      code: "NIC",
      advisor_id: "advisor-1",
      created_at: "2026-04-05T10:00:00.000Z",
      is_public_signup: false
    },
    {
      id: "club-2",
      name: "Robotics Club",
      code: "ROB",
      advisor_id: null,
      created_at: "2026-04-05T10:00:00.000Z",
      is_public_signup: true
    }
  ];

  const tokens = {
    "executive-token": {
      id: "executive-1",
      email: "executive@nilehive.test"
    },
    "advisor-token": {
      id: "advisor-1",
      email: "advisor@nilehive.test"
    },
    "admin-token": {
      id: "admin-1",
      email: "admin@nilehive.test"
    },
    "student-token": {
      id: "student-1",
      email: "student@nilehive.test"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listClubs(filters = {}) {
      return clubs.filter((club) => {
        if (filters.ids?.length && !filters.ids.includes(club.id)) {
          return false;
        }

        if (filters.advisorId && club.advisor_id !== filters.advisorId) {
          return false;
        }

        return true;
      });
    },
    async listPublicClubs() {
      return clubs.filter((club) => club.is_public_signup !== false);
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

async function getClubs(baseUrl, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/clubs`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

async function getPublicClubs(baseUrl) {
  const response = await fetch(`${baseUrl}/api/v1/clubs/public`, {
    method: "GET"
  });
  const payload = await response.json();

  return { response, payload };
}

test("public club list supports signup and profile onboarding", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getPublicClubs(server.baseUrl);

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].name, "Robotics Club");
});

test("public club list falls back to the current directory when no clubs are flagged public yet", async (t) => {
  const database = createFakeDatabase();
  database.listPublicClubs = async () => [];
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getPublicClubs(server.baseUrl);

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].name, "Robotics Club");
});

test("executive can fetch only their linked club for the proposal dropdown", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getClubs(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].id, "club-1");
});

test("advisor can fetch clubs assigned to them", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getClubs(server.baseUrl, "advisor-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].advisor_id, "advisor-1");
});

test("admin can fetch all clubs", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getClubs(server.baseUrl, "admin-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 2);
});

test("student can fetch club list after onboarding", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getClubs(server.baseUrl, "student-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 2);
});

test("missing-token access is blocked for clubs", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getClubs(server.baseUrl);

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("admin creates a public club with 10000 naira dues and shared payment settings", async () => {
  let createdClub;
  let savedSettings;
  const database = {
    async listClubs() {
      return [{ id: "existing-club" }];
    },
    async getClubPaymentSettings() {
      return {
        bank_name: "Providus Bank",
        account_number: "1305861314",
        account_name: "Club Services",
        payment_instructions: "Submit your receipt."
      };
    },
    async createClub(payload) {
      createdClub = payload;
      return { id: "club-new", created_at: "2026-06-01T10:00:00.000Z", ...payload };
    },
    async upsertClubPaymentSettings(payload) {
      savedSettings = payload;
      return payload;
    }
  };

  const club = await createClub({
    actor: { id: "admin-1", role: "admin" },
    payload: {
      name: "Robotics Club",
      code: "rob",
      description: "Build robots and learn together.",
      is_public_signup: true
    },
    database
  });

  assert.equal(createdClub.dues_amount, 10000);
  assert.equal(club.code, "ROB");
  assert.equal(savedSettings.returning_student_dues_amount, 10000);
});

test("non-admin cannot edit clubs", async () => {
  await assert.rejects(
    () =>
      updateClub({
        actor: { id: "president-1", role: "president" },
        clubId: "club-1",
        payload: { name: "Changed" },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("assigned president can update club content without changing operational fields", async () => {
  let savedUpdate;
  const database = {
    async getClubById() {
      return { id: "club-1", name: "Robotics Club" };
    },
    async updateClub(clubId, update) {
      savedUpdate = update;
      return { id: clubId, name: "Robotics Club", ...update };
    },
    async createAuditLog() {}
  };

  const club = await updateClubProfile({
    actor: { id: "president-1", role: "president", clubId: "club-1" },
    clubId: "club-1",
    payload: {
      description: "Build practical robotics projects.",
      categories: ["Tech", "Academics"],
      website_url: "https://robotics.example.com"
    },
    database
  });

  assert.deepEqual(savedUpdate.categories, ["Tech", "Academics"]);
  assert.equal(club.website_url, "https://robotics.example.com/");
});

test("president cannot update another club profile", async () => {
  await assert.rejects(
    () => updateClubProfile({
      actor: { id: "president-1", role: "president", clubId: "club-1" },
      clubId: "club-2",
      payload: { description: "Not allowed" },
      database: {}
    }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});
