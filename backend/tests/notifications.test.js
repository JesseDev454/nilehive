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

  const notifications = [
    {
      id: "notification-2",
      user_id: "executive-1",
      proposal_id: "proposal-2",
      type: "advisor_rejected",
      message: 'Your proposal "Budget Revision" was rejected by the advisor.',
      delivery_status: "stored",
      created_at: "2026-04-08T10:00:00.000Z"
    },
    {
      id: "notification-1",
      user_id: "executive-1",
      proposal_id: "proposal-1",
      type: "advisor_approved",
      message: 'Your proposal "Leadership Summit" was approved by the advisor.',
      delivery_status: "stored",
      created_at: "2026-04-07T10:00:00.000Z"
    },
    {
      id: "notification-3",
      user_id: "advisor-1",
      proposal_id: "proposal-3",
      type: "proposal_submitted",
      message: 'New proposal "New Event" was submitted and is awaiting your review.',
      delivery_status: "stored",
      created_at: "2026-04-09T10:00:00.000Z"
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
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listNotificationsByUserId(userId) {
      return notifications.filter((notification) => notification.user_id === userId);
    },
    async upsertPushSubscription(subscription) {
      return {
        id: "push-subscription-1",
        created_at: "2026-05-07T10:00:00.000Z",
        updated_at: "2026-05-07T10:00:00.000Z",
        last_used_at: null,
        ...subscription
      };
    },
    async deletePushSubscriptionForUser(userId, endpoint) {
      return { userId, endpoint, removed: true };
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

async function getNotifications(baseUrl, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/notifications`, {
    method: "GET",
    headers
  });

  const payload = await response.json();

  return { response, payload };
}

async function postJson(baseUrl, path, body, token = "executive-token") {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json();

  return { response, payload };
}

test("authenticated users can fetch only their own notifications", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getNotifications(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.items.length, 2);
  assert.equal(payload.data.total, 2);
  assert.ok(payload.data.items.every((notification) => notification.user_id === "executive-1"));
});

test("missing-token access is blocked for notifications retrieval", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getNotifications(server.baseUrl);

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("authenticated users can register and remove push subscriptions", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const subscriptionPayload = {
    endpoint: "https://push.example.test/subscription-1",
    keys: {
      p256dh: "public-key",
      auth: "auth-secret"
    }
  };

  const createResult = await postJson(
    server.baseUrl,
    "/api/v1/notifications/push-subscriptions",
    subscriptionPayload
  );

  assert.equal(createResult.response.status, 201);
  assert.equal(createResult.payload.data.user_id, "executive-1");
  assert.equal(createResult.payload.data.endpoint, subscriptionPayload.endpoint);

  const removeResult = await postJson(
    server.baseUrl,
    "/api/v1/notifications/push-subscriptions/remove",
    { endpoint: subscriptionPayload.endpoint }
  );

  assert.equal(removeResult.response.status, 200);
  assert.equal(removeResult.payload.data.removed, true);
});
