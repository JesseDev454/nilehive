export type AdminFeedbackCategory =
  | "general"
  | "club"
  | "onboarding"
  | "joining"
  | "dues"
  | "login_access"
  | "event";

export type FeedbackAuthorRole = "student" | "executive" | "president" | "advisor" | "admin";
export type FeedbackStatus = "open" | "reviewed" | "archived";
export type ApiFeedbackCategory =
  | "general"
  | "event"
  | "club"
  | "onboarding"
  | "club_joining"
  | "dues_payment"
  | "login_access";

export interface FeedbackSubmitter {
  id: string;
  full_name: string | null;
  role: string | null;
  student_id: string | null;
}

export interface FeedbackClubRef {
  id: string;
  name: string;
  code: string | null;
}

export interface FeedbackProposalRef {
  id: string;
  title: string | null;
  proposed_activity: string | null;
  event_date: string | null;
}

export interface FeedbackRecord {
  id: string;
  club_id: string | null;
  proposal_id: string | null;
  submitted_by: string | null;
  category: ApiFeedbackCategory | string;
  rating: number | null;
  comment: string;
  status: FeedbackStatus | string;
  proposal: FeedbackProposalRef | null;
  club: FeedbackClubRef | null;
  submitter: FeedbackSubmitter | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ListFeedbackQuery {
  club_id?: string;
  proposal_id?: string;
  category?: string;
  status?: string;
  signal?: AbortSignal;
}

export interface AdminFeedbackView {
  id: string;
  category: AdminFeedbackCategory;
  title: string;
  message: string;
  authorName: string;
  authorRole: FeedbackAuthorRole;
  studentId?: string;
  clubName?: string;
  submittedAt: string;
  rating?: number;
  status: FeedbackStatus | string;
  identityAvailable: boolean;
}

export type { AdminFeedbackView as AdminFeedbackItem };
