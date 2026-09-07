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
