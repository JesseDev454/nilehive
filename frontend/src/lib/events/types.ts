import type { EventLifecycle } from "./lifecycle";

export type { EventLifecycle };

export interface ApprovedEventRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  title: string;
  proposal_title: string | null;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  number_of_participants: number | null;
  budget_estimate: number | null;
  status: string;
  current_stage: string | null;
  event_lifecycle: EventLifecycle;
  can_rsvp: boolean;
  approved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventProfileSummary {
  id: string;
  full_name: string | null;
  student_id: string | null;
  role: string | null;
}

export type EventRsvpStatus = "interested" | "going" | "not_going" | "cancelled";

export interface EventRsvpRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  user_id: string;
  status: EventRsvpStatus | string;
  profile: EventProfileSummary | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventAttendanceRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  user_id: string;
  attended: boolean;
  checked_in_by: string | null;
  checked_in_at: string | null;
  profile: EventProfileSummary | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventEngagementSummary {
  total_rsvps: number;
  going: number;
  interested: number;
  not_going: number;
  cancelled: number;
  attended: number;
}

export interface EventEngagementRecord {
  event: ApprovedEventRecord;
  summary: EventEngagementSummary;
  rsvps: EventRsvpRecord[];
  attendance: EventAttendanceRecord[];
}

export interface EventReportRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  submitted_by: string | null;
  attendance_count: number | null;
  summary: string | null;
  challenges: string | null;
  outcomes: string | null;
  budget_used: number | null;
  media_urls: string[];
  status: string;
  submitted_at: string | null;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  checkedInAt: string | null;
  checkInMethod: "qr_scan" | "manual_fallback" | "recorded";
  verifiedBy?: string | null;
}

export interface RsvpRosterRecord {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  status: string;
}

export type PostEventReportStatus = "submitted" | "missing" | "unavailable";

export interface AdminEventView {
  id: string;
  proposalId: string;
  title: string;
  clubId: string;
  clubName: string;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  venue: string;
  capacity: number | null;
  rsvpsCount: number | null;
  attendeesCount: number | null;
  goingCount: number | null;
  organizerName: string | null;
  organizerEmail: string | null;
  description: string | null;
  checkInPath: string;
  eventLifecycle: EventLifecycle;
  engagementLoaded: boolean;
  postEventReport: {
    status: PostEventReportStatus;
    submittedAt?: string | null;
    verifiedAttendees?: number | null;
    budgetReconciled?: number | null;
    summary?: string | null;
  };
  rsvpRoster: RsvpRosterRecord[];
  attendanceRoster: AttendanceRecord[];
}

export interface ListApprovedEventsQuery {
  lifecycle?: "upcoming" | "past";
  page?: number;
  page_size?: number;
  sort?: "event_date" | "created_at";
  order?: "asc" | "desc";
  signal?: AbortSignal;
}

export interface SubmitAttendancePayload {
  user_id: string;
  attended?: boolean;
}
