const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

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
    }
  };
  const reminders = [
    {
      id: "reminder-1",
      user_id: "executive-1",
      proposal_id: "proposal-1",
      message: 'Approved event "Leadership Summit" is scheduled for 2026-05-20.',
      remind_at: "2026-05-20T09:00:00.000Z",
      delivery_status: "stored",
      created_at: "2026-04-10T10:00:00.000Z"
    },
    {
      id: "reminder-2",
      user_id: "advisor-1",
      proposal_id: "proposal-2",
      message: 'Approved event "Cultural Night" is scheduled for 2026-05-22.',
      remind_at: "2026-05-22T09:00:00.000Z",
      delivery_status: "stored",
      created_at: "2026-04-11T10:00:00.000Z"
    }
  ];

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "executive-token": "executive-1",
        "advisor-token": "advisor-1"
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
    async listEventRemindersByUserId(userId) {
      return reminders.filter((reminder) => reminder.user_id === userId);
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

async function getReminders(baseUrl, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/reminders`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

test("authenticated users can fetch only their own event reminders", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getReminders(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].user_id, "executive-1");
});

test("missing-token access is blocked for event reminders", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getReminders(server.baseUrl);

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
