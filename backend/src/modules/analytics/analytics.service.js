const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

const FEATURES = new Set([
  "dashboard_view",
  "club_discovery_view",
  "club_detail_view",
  "event_view",
  "notifications_view",
  "feedback_view",
  "announcements_view"
]);

function requireActor(actor) {
  if (!actor) throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
}

function requireAdmin(actor) {
  requireActor(actor);
  if (actor.role !== "admin") {
    throw new ApiError(403, "Analytics are available only to admins", "FORBIDDEN");
  }
}

function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function inRange(value, from) {
  return Boolean(value) && new Date(value) >= from;
}

async function recordActivity({ actor, feature, database = db }) {
  requireActor(actor);
  if (!FEATURES.has(feature)) {
    throw new ApiError(400, "Unsupported analytics feature", "VALIDATION_ERROR", { field: "feature" });
  }
  await database.recordDailyUsage({
    userId: actor.id,
    role: actor.role,
    feature,
    activityDate: dateOnly(new Date())
  });
}

async function getAnalyticsSummary({ actor, days = 30, database = db }) {
  requireAdmin(actor);
  const range = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - range + 1);
  const fromDate = dateOnly(from);

  const [active, metrics, memberships, dues, rsvps, attendance, feedback] = await Promise.all([
    database.listDailyActiveUsers(fromDate),
    database.listDailyUsageMetrics(fromDate),
    database.listMembershipRequests ? database.listMembershipRequests() : [],
    database.listDuePayments ? database.listDuePayments() : [],
    database.listEventRsvps ? database.listEventRsvps() : [],
    database.listEventAttendance ? database.listEventAttendance() : [],
    database.listFeedback ? database.listFeedback() : []
  ]);
  const uniqueUsers = new Set(active.map((item) => item.user_id));
  const usersByRole = active.reduce((groups, item) => {
    if (!groups[item.role]) groups[item.role] = new Set();
    groups[item.role].add(item.user_id);
    return groups;
  }, {});
  const byRole = Object.fromEntries(
    Object.entries(usersByRole).map(([role, userIds]) => [role, userIds.size])
  );
  const featureCounts = metrics.reduce((counts, item) => {
    counts[item.feature] = (counts[item.feature] || 0) + Number(item.event_count || 0);
    return counts;
  }, {});
  const daily = Array.from({ length: range }, (_, offset) => {
    const date = new Date(from);
    date.setUTCDate(from.getUTCDate() + offset);
    const key = dateOnly(date);
    return {
      date: key,
      active_users: new Set(active.filter((item) => item.activity_date === key).map((item) => item.user_id)).size
    };
  });

  return {
    range_days: range,
    active_users: uniqueUsers.size,
    daily_active_users: daily,
    usage_by_role: byRole,
    features: featureCounts,
    operations: {
      join_requests_started: memberships.filter((item) => inRange(item.created_at, from)).length,
      join_requests_completed: memberships.filter((item) => item.status === "active" && inRange(item.updated_at, from)).length,
      dues_proofs_submitted: dues.filter((item) => inRange(item.submitted_at || item.created_at, from)).length,
      dues_proofs_verified: dues.filter((item) => item.status === "paid" && inRange(item.verified_at, from)).length,
      event_rsvps: rsvps.filter((item) => item.status === "going" && inRange(item.created_at, from)).length,
      event_check_ins: attendance.filter((item) => item.attended && inRange(item.checked_in_at, from)).length,
      feedback_submissions: feedback.filter((item) => inRange(item.created_at, from)).length
    }
  };
}

module.exports = { FEATURES, getAnalyticsSummary, recordActivity };
