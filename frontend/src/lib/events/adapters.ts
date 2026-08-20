import { unwrapPaginated } from "@/lib/approvals/adapters";
import type { PaginatedEnvelope } from "@/lib/people/types";
import { buildEventCheckInPath, formatEventTime, getEventLifecycle } from "./lifecycle";
import type {
  AdminEventView,
  ApprovedEventRecord,
  AttendanceRecord,
  EventAttendanceRecord,
  EventEngagementRecord,
  EventEngagementSummary,
  EventProfileSummary,
  EventReportRecord,
  EventRsvpRecord,
  RsvpRosterRecord,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter((item): item is string => Boolean(item));
}

export function adaptEventProfile(value: unknown): EventProfileSummary | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  if (!id) return null;
  return {
    id,
    full_name: asString(record?.full_name),
    student_id: asString(record?.student_id),
    role: asString(record?.role),
  };
}

export function adaptApprovedEvent(value: unknown): ApprovedEventRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id) || asString(record?.proposal_id);
  const clubId = asString(record?.club_id);
  if (!id || !clubId) return null;

  const eventDate = asString(record?.event_date);
  const lifecycleRaw = asString(record?.event_lifecycle);
  const lifecycle =
    lifecycleRaw === "happening_today" || lifecycleRaw === "upcoming" || lifecycleRaw === "past"
      ? lifecycleRaw
      : getEventLifecycle(eventDate);

  return {
    id,
    proposal_id: asString(record?.proposal_id) || id,
    club_id: clubId,
    title: asString(record?.title) || asString(record?.proposed_activity) || asString(record?.proposal_title) || "Untitled event",
    proposal_title: asString(record?.proposal_title) || asString(record?.title),
    description: asString(record?.description),
    event_date: eventDate,
    event_time: asString(record?.event_time),
    location: asString(record?.location),
    number_of_participants: asNumber(record?.number_of_participants),
    budget_estimate: asNumber(record?.budget_estimate),
    status: asString(record?.status) || "approved",
    current_stage: asString(record?.current_stage),
    event_lifecycle: lifecycle,
    can_rsvp: asBoolean(record?.can_rsvp, false),
    approved_at: asString(record?.approved_at),
    created_at: asString(record?.created_at),
    updated_at: asString(record?.updated_at),
  };
}

export function adaptEventRsvp(value: unknown): EventRsvpRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const proposalId = asString(record?.proposal_id);
  const clubId = asString(record?.club_id);
  const userId = asString(record?.user_id);
  if (!id || !proposalId || !clubId || !userId) return null;
  return {
    id,
    proposal_id: proposalId,
    club_id: clubId,
    user_id: userId,
    status: asString(record?.status) || "going",
    profile: adaptEventProfile(record?.profile),
    created_at: asString(record?.created_at),
    updated_at: asString(record?.updated_at),
  };
}

export function adaptEventAttendance(value: unknown): EventAttendanceRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const proposalId = asString(record?.proposal_id);
  const clubId = asString(record?.club_id);
  const userId = asString(record?.user_id);
  if (!id || !proposalId || !clubId || !userId) return null;
  return {
    id,
    proposal_id: proposalId,
    club_id: clubId,
    user_id: userId,
    attended: asBoolean(record?.attended, true),
    checked_in_by: asString(record?.checked_in_by),
    checked_in_at: asString(record?.checked_in_at),
    profile: adaptEventProfile(record?.profile),
    created_at: asString(record?.created_at),
    updated_at: asString(record?.updated_at),
  };
}

export function adaptEngagementSummary(value: unknown): EventEngagementSummary {
  const record = asRecord(value);
  return {
    total_rsvps: asNumber(record?.total_rsvps) ?? 0,
    going: asNumber(record?.going) ?? 0,
    interested: asNumber(record?.interested) ?? 0,
    not_going: asNumber(record?.not_going) ?? 0,
    cancelled: asNumber(record?.cancelled) ?? 0,
    attended: asNumber(record?.attended) ?? 0,
  };
}

export function adaptEventEngagement(value: unknown): EventEngagementRecord | null {
  const record = asRecord(value);
  const event = adaptApprovedEvent(record?.event);
  if (!event) return null;
  return {
    event,
    summary: adaptEngagementSummary(record?.summary),
    rsvps: Array.isArray(record?.rsvps)
      ? record.rsvps.map(adaptEventRsvp).filter((item): item is EventRsvpRecord => Boolean(item))
      : [],
    attendance: Array.isArray(record?.attendance)
      ? record.attendance
          .map(adaptEventAttendance)
          .filter((item): item is EventAttendanceRecord => Boolean(item))
      : [],
  };
}

export function adaptEventReport(value: unknown): EventReportRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const proposalId = asString(record?.proposal_id);
  const clubId = asString(record?.club_id);
  if (!id || !proposalId || !clubId) return null;
  return {
    id,
    proposal_id: proposalId,
    club_id: clubId,
    submitted_by: asString(record?.submitted_by),
    attendance_count: asNumber(record?.attendance_count),
    summary: asString(record?.summary),
    challenges: asString(record?.challenges),
    outcomes: asString(record?.outcomes),
    budget_used: asNumber(record?.budget_used),
    media_urls: asStringArray(record?.media_urls),
    status: asString(record?.status) || "submitted",
    submitted_at: asString(record?.submitted_at),
  };
}

export function adaptApprovedEventPage(value: unknown): PaginatedEnvelope<ApprovedEventRecord> {
  const page = unwrapPaginated<unknown>(value);
  return {
    ...page,
    items: page.items.map(adaptApprovedEvent).filter((item): item is ApprovedEventRecord => Boolean(item)),
  };
}

export function adaptEventReportPage(value: unknown): PaginatedEnvelope<EventReportRecord> {
  const page = unwrapPaginated<unknown>(value);
  return {
    ...page,
    items: page.items.map(adaptEventReport).filter((item): item is EventReportRecord => Boolean(item)),
  };
}

function toRsvpRoster(rsvp: EventRsvpRecord): RsvpRosterRecord {
  return {
    id: rsvp.id,
    userId: rsvp.user_id,
    studentId: rsvp.profile?.student_id || "Not provided",
    studentName: rsvp.profile?.full_name || "Campus One student",
    status: rsvp.status,
  };
}

function toAttendanceRoster(record: EventAttendanceRecord): AttendanceRecord {
  const selfCheckedIn = record.checked_in_by === record.user_id;
  return {
    id: record.id,
    userId: record.user_id,
    studentId: record.profile?.student_id || "Not provided",
    studentName: record.profile?.full_name || "Campus One student",
    studentEmail: null,
    checkedInAt: record.checked_in_at,
    checkInMethod: selfCheckedIn ? "qr_scan" : record.checked_in_by ? "manual_fallback" : "recorded",
    verifiedBy: selfCheckedIn ? null : record.checked_in_by,
  };
}

export function toAdminEventView(
  event: ApprovedEventRecord,
  options: {
    clubName?: string | null;
    report?: EventReportRecord | null;
    reportsLoaded?: boolean;
    engagement?: EventEngagementRecord | null;
  } = {},
): AdminEventView {
  const engagement = options.engagement;
  const report = options.report ?? null;
  const attended = engagement
    ? engagement.attendance.filter((item) => item.attended)
    : [];

  return {
    id: event.id,
    proposalId: event.proposal_id,
    title: event.title,
    clubId: event.club_id,
    clubName: options.clubName || "Club unavailable",
    eventDate: event.event_date || "Date not provided",
    startTime: formatEventTime(event.event_time) || "Not provided",
    endTime: null,
    venue: event.location || "Venue not provided",
    capacity: event.number_of_participants,
    rsvpsCount: engagement ? engagement.summary.total_rsvps : null,
    attendeesCount: engagement ? engagement.summary.attended : null,
    goingCount: engagement ? engagement.summary.going : null,
    organizerName: null,
    organizerEmail: null,
    description: event.description,
    checkInPath: buildEventCheckInPath(event.proposal_id),
    eventLifecycle: event.event_lifecycle,
    engagementLoaded: Boolean(engagement),
    postEventReport: report
      ? {
          status: "submitted",
          submittedAt: report.submitted_at,
          verifiedAttendees: report.attendance_count,
          budgetReconciled: report.budget_used,
          summary: report.summary,
        }
      : {
          status: options.reportsLoaded === false ? "unavailable" : "missing",
        },
    rsvpRoster: engagement ? engagement.rsvps.map(toRsvpRoster) : [],
    attendanceRoster: attended.map(toAttendanceRoster),
  };
}

export function mergeEventEngagement(view: AdminEventView, engagement: EventEngagementRecord): AdminEventView {
  return toAdminEventView(engagement.event, {
    clubName: view.clubName,
    report:
      view.postEventReport.status === "submitted"
        ? {
            id: "loaded",
            proposal_id: view.proposalId,
            club_id: view.clubId,
            submitted_by: null,
            attendance_count: view.postEventReport.verifiedAttendees ?? null,
            summary: view.postEventReport.summary ?? null,
            challenges: null,
            outcomes: null,
            budget_used: view.postEventReport.budgetReconciled ?? null,
            media_urls: [],
            status: "submitted",
            submitted_at: view.postEventReport.submittedAt ?? null,
          }
        : null,
    reportsLoaded: view.postEventReport.status !== "unavailable",
    engagement,
  });
}
