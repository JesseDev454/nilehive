import type {
  AdminAttentionCard,
  AdminHomeViewModel,
  AdminNavCountsRecord,
  DashboardMissingReport,
  DashboardPendingAction,
  DashboardRecentActivity,
  DashboardSummaryCounts,
} from "./types";
import { sanitizeAdminDeepLink } from "@/lib/notifications/deepLinks";

export function formatLagosDateTime(iso: string | null | undefined): string {
  if (!iso) return "Not provided.";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Not provided.";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function formatLagosDate(iso: string | null | undefined): string {
  if (!iso) return "Not provided.";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
  }).format(parsed);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }
  return 0;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function emptyDashboardSummary(): DashboardSummaryCounts {
  return {
    total_clubs: 0,
    total_members: 0,
    active_members: 0,
    pending_proposals: 0,
    pending_admin_proposals: 0,
    pending_membership_requests: 0,
    submitted_dues_payments: 0,
    approved_events: 0,
    reports_submitted: 0,
    missing_reports: 0,
    event_attendance_count: 0,
    event_rsvp_count: 0,
    attendance_rate: 0,
    feedback_count: 0,
  };
}

function adaptSummary(value: unknown): DashboardSummaryCounts {
  const record = asRecord(value) ?? {};
  const empty = emptyDashboardSummary();
  return {
    total_clubs: asNumber(record.total_clubs),
    total_members: asNumber(record.total_members),
    active_members: asNumber(record.active_members),
    pending_proposals: asNumber(record.pending_proposals),
    pending_admin_proposals: asNumber(record.pending_admin_proposals),
    pending_membership_requests: asNumber(record.pending_membership_requests),
    submitted_dues_payments: asNumber(record.submitted_dues_payments),
    approved_events: asNumber(record.approved_events),
    reports_submitted: asNumber(record.reports_submitted),
    missing_reports: asNumber(record.missing_reports),
    event_attendance_count: asNumber(record.event_attendance_count),
    event_rsvp_count: asNumber(record.event_rsvp_count),
    attendance_rate: asNumber(record.attendance_rate),
    feedback_count: asNumber(record.feedback_count),
  };
}

export function destinationForActivityType(type: string): string {
  switch (type) {
    case "membership_request":
      return "/admin/approvals";
    case "dues":
      return "/admin/approvals";
    case "event_report":
      return "/admin/events";
    case "feedback":
      return "/admin/feedback";
    case "proposal":
      return "/admin/approvals";
    default:
      return "/admin/activity";
  }
}

function adaptRecentActivity(value: unknown): DashboardRecentActivity | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const createdAt = asString(record?.created_at);
  if (!record || !id || !createdAt) return null;
  const type = asString(record.type) || "unknown";
  if (type === "task") return null;
  const destinationUrl = sanitizeAdminDeepLink(destinationForActivityType(type)) || "/admin/home";
  return {
    id,
    type,
    club_id: asString(record.club_id),
    club_name: asString(record.club_name),
    title: asString(record.title) || "Campus update",
    message: asString(record.message) || "",
    created_at: createdAt,
    destinationUrl,
  };
}

function adaptMissingReport(value: unknown): DashboardMissingReport | null {
  const record = asRecord(value);
  const proposalId = asString(record?.proposal_id);
  if (!record || !proposalId) return null;
  return {
    proposal_id: proposalId,
    club_id: asString(record.club_id),
    title: asString(record.title),
    event_date: asString(record.event_date),
    days_since_event: asNumber(record.days_since_event),
  };
}

export function buildAttentionCards(summary: DashboardSummaryCounts): AdminAttentionCard[] {
  return [
    {
      id: "proposals",
      count: summary.pending_admin_proposals,
      label: "Proposals waiting",
      whatNext: "Authorize event venue, date, and budget before publishing to campus calendar.",
      actionLabel: "Review next proposal",
      url: "/admin/approvals",
    },
    {
      id: "join_requests",
      count: summary.pending_membership_requests,
      label: "Join requests waiting",
      whatNext: "Review student motivation and admit to official club rosters.",
      actionLabel: "Review join request",
      url: "/admin/approvals",
    },
    {
      id: "proofs",
      count: summary.submitted_dues_payments,
      label: "Proofs waiting",
      whatNext: "Verify bank transfer receipt reference against dues record.",
      actionLabel: "Verify payment proof",
      url: "/admin/approvals",
    },
    {
      id: "reports",
      count: summary.missing_reports,
      label: "Reports submitted",
      whatNext: "Audit verified attendee headcount and post-event budget reconciliation.",
      actionLabel: "Audit latest report",
      url: "/admin/events",
    },
  ];
}

export function adaptAdminOperationsDashboard(value: unknown): AdminHomeViewModel {
  const record = asRecord(value);
  const summary = adaptSummary(record?.summary);
  const recentActivity = Array.isArray(record?.recent_activity)
    ? record.recent_activity.map(adaptRecentActivity).filter((item): item is DashboardRecentActivity => Boolean(item))
    : [];
  const missingReports = Array.isArray(record?.missing_reports)
    ? record.missing_reports.map(adaptMissingReport).filter((item): item is DashboardMissingReport => Boolean(item))
    : [];

  return {
    generatedAt: asString(record?.generated_at),
    greetingName: null,
    totalClubs: summary.total_clubs,
    attention: buildAttentionCards(summary),
    recentActivity,
    missingReports,
  };
}

export function emptyAdminHomeView(): AdminHomeViewModel {
  return {
    generatedAt: null,
    greetingName: null,
    totalClubs: 0,
    attention: buildAttentionCards(emptyDashboardSummary()),
    recentActivity: [],
    missingReports: [],
  };
}

export function adaptNavCounts(value: unknown): AdminNavCountsRecord {
  const record = asRecord(value);
  const counts = asRecord(record?.counts) ?? {};
  return {
    role: asString(record?.role) || "admin",
    generated_at: asString(record?.generated_at),
    counts: {
      notifications: asNumber(counts.notifications),
      final_review: asNumber(counts.final_review),
      membership_requests: asNumber(counts.membership_requests),
      events: asNumber(counts.events),
      reports_archive: asNumber(counts.reports_archive),
      dues: asNumber(counts.dues),
    },
  };
}

export function approvalsBadgeFromNavCounts(counts: AdminNavCountsRecord["counts"]): number {
  return counts.final_review + counts.membership_requests + counts.dues;
}

export function pendingActionTypes(actions: unknown): DashboardPendingAction[] {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((item) => {
      const record = asRecord(item);
      const type = asString(record?.type);
      if (!type || type === "open_tasks") return null;
      return {
        type,
        label: asString(record?.label) || type,
        count: asNumber(record?.count),
      };
    })
    .filter((item): item is DashboardPendingAction => Boolean(item))
    .filter((item) => item.count > 0);
}
