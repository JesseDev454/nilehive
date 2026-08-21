export interface DashboardSummaryCounts {
  total_clubs: number;
  total_members: number;
  active_members: number;
  pending_proposals: number;
  pending_admin_proposals: number;
  pending_membership_requests: number;
  submitted_dues_payments: number;
  approved_events: number;
  reports_submitted: number;
  missing_reports: number;
  event_attendance_count: number;
  event_rsvp_count: number;
  attendance_rate: number;
  feedback_count: number;
}

export interface DashboardPendingAction {
  type: string;
  label: string;
  count: number;
}

export interface DashboardMissingReport {
  proposal_id: string;
  club_id: string | null;
  title: string | null;
  event_date: string | null;
  days_since_event: number;
}

export interface DashboardRecentActivity {
  id: string;
  type: string;
  club_id: string | null;
  club_name: string | null;
  title: string;
  message: string;
  created_at: string;
  destinationUrl: string;
}

export type AttentionQueueId = "proposals" | "join_requests" | "proofs" | "reports";

export interface AdminAttentionCard {
  id: AttentionQueueId;
  count: number;
  label: string;
  whatNext: string;
  actionLabel: string;
  url: string;
}

export interface AdminHomeViewModel {
  generatedAt: string | null;
  greetingName: string | null;
  totalClubs: number;
  attention: AdminAttentionCard[];
  recentActivity: DashboardRecentActivity[];
  missingReports: DashboardMissingReport[];
}

export interface AdminNavCountsRecord {
  role: string;
  generated_at: string | null;
  counts: {
    notifications: number;
    final_review: number;
    membership_requests: number;
    events: number;
    reports_archive: number;
    dues: number;
  };
}
