const test = require("node:test");
const assert = require("node:assert/strict");
const { getAnalyticsSummary, recordActivity } = require("../src/modules/analytics/analytics.service");

test("analytics records only approved aggregate feature names", async () => {
  let recorded;
  await recordActivity({
    actor: { id: "student-1", role: "student" },
    feature: "club_detail_view",
    database: { async recordDailyUsage(value) { recorded = value; } }
  });
  assert.equal(recorded.userId, "student-1");
  assert.equal(recorded.feature, "club_detail_view");
  assert.equal(Object.prototype.hasOwnProperty.call(recorded, "url"), false);
});

test("admin analytics returns aggregate counts and rejects non-admin access", async () => {
  const database = {
    async listDailyActiveUsers() {
      return [
        { activity_date: "2026-06-24", user_id: "student-1", role: "student" },
        { activity_date: "2026-06-25", user_id: "student-1", role: "student" }
      ];
    },
    async listDailyUsageMetrics() {
      return [{ activity_date: "2026-06-25", feature: "club_detail_view", event_count: 3 }];
    },
    async listMembershipRequests() { return []; },
    async listDuePayments() { return []; },
    async listEventRsvps() { return []; },
    async listEventAttendance() { return []; },
    async listFeedback() { return []; }
  };
  const result = await getAnalyticsSummary({
    actor: { id: "admin-1", role: "admin" },
    days: 7,
    database
  });
  assert.equal(result.active_users, 1);
  assert.equal(result.usage_by_role.student, 1);
  assert.equal(result.features.club_detail_view, 3);

  await assert.rejects(
    () => getAnalyticsSummary({ actor: { id: "student-1", role: "student" }, database }),
    (error) => error.statusCode === 403
  );
});

test("unsupported analytics ranges fall back to 30 days and zeros stay zeros", async () => {
  const database = {
    async listDailyActiveUsers() { return []; },
    async listDailyUsageMetrics() { return []; },
    async listMembershipRequests() { return []; },
    async listDuePayments() { return []; },
    async listEventRsvps() { return []; },
    async listEventAttendance() { return []; },
    async listFeedback() { return []; }
  };

  const result = await getAnalyticsSummary({
    actor: { id: "admin-1", role: "admin" },
    days: 14,
    database
  });

  assert.equal(result.range_days, 30);
  assert.equal(result.active_users, 0);
  assert.equal(result.operations.join_requests_started, 0);
  assert.equal(result.operations.event_check_ins, 0);
  assert.equal(result.daily_active_users.length, 30);
  assert.ok(result.daily_active_users.every((day) => day.active_users === 0));
});

test("admin analytics HTTP is admin-only and accepts 7/30/90", async (t) => {
  const { createApp } = require("../src/app");
  const profiles = {
    "admin-1": { id: "admin-1", full_name: "Zainab Admin", role: "admin", club_id: null },
    "student-1": { id: "student-1", full_name: "Amina Student", role: "student", club_id: "club-1" }
  };
  const tokens = {
    "admin-token": { id: "admin-1", email: "admin@nilehive.test" },
    "student-token": { id: "student-1", email: "student@nilehive.test" }
  };
  const database = {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listDailyActiveUsers() { return []; },
    async listDailyUsageMetrics() { return []; },
    async listMembershipRequests() { return []; },
    async listDuePayments() { return []; },
    async listEventRsvps() { return []; },
    async listEventAttendance() { return []; },
    async listFeedback() { return []; }
  };

  const app = createApp({ database });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  t.after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const unauthenticated = await fetch(`${baseUrl}/api/v1/analytics/admin?days=7`);
  assert.equal(unauthenticated.status, 401);

  const student = await fetch(`${baseUrl}/api/v1/analytics/admin?days=7`, {
    headers: { Authorization: "Bearer student-token" }
  });
  assert.equal(student.status, 403);

  const admin = await fetch(`${baseUrl}/api/v1/analytics/admin?days=7`, {
    headers: { Authorization: "Bearer admin-token" }
  });
  const payload = await admin.json();
  assert.equal(admin.status, 200);
  assert.equal(payload.data.range_days, 7);
  assert.equal(payload.data.active_users, 0);
  assert.equal(payload.data.operations.feedback_submissions, 0);
  assert.equal(JSON.stringify(payload).includes("email"), false);
});
