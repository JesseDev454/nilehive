import { getApiBaseUrl } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export interface HealthCheckResponse {
  status: string;
  service: string;
  database: string;
}

export interface CreateProposalPayload {
  title?: string;
  description?: string | null;
  event_date?: string | null;
  location?: string | null;
  club_id?: string;
  aim_objectives?: string | null;
  proposed_activity?: string | null;
  event_time?: string | null;
  number_of_participants?: number | null;
  budget_estimate?: number | null;
  budget_line_items?: BudgetLineItem[];
  responsible_members?: ResponsibleMember[];
  save_as_draft?: boolean;
}

export interface BudgetLineItem {
  item: string;
  quantity: number;
  description: string;
  amount: number;
}

export interface ResponsibleMember {
  name: string;
  student_id: string;
  phone_number: string;
  position: string;
}

export interface ClubRecord {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  advisor_id: string | null;
  created_at: string;
}

export interface ProfileRecord {
  id: string;
  email?: string | null;
  full_name: string | null;
  role: "executive" | "advisor" | "admin" | "president" | "student";
  club_id: string | null;
  student_id?: string | null;
  requested_role?: "executive" | "advisor" | "admin" | "president" | "student" | null;
  onboarding_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserProfileRecord extends ProfileRecord {
  club?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

export interface ProfileRoleHistoryRecord {
  id: string;
  profile_id: string;
  previous_role: ProfileRecord["role"] | null;
  new_role: ProfileRecord["role"];
  previous_club_id: string | null;
  new_club_id: string | null;
  changed_by: string;
  remarks: string | null;
  created_at: string;
}

export interface AdminRoleChangeResult {
  profile: AdminUserProfileRecord;
  history: ProfileRoleHistoryRecord | null;
}

export interface AdminAdvisorAssignmentResult extends AdminRoleChangeResult {
  club: ClubRecord;
}

export interface ProfileOnboardingPayload {
  full_name: string;
  student_id: string;
  club_id: string;
  requested_role?: "student";
}

export interface ProposalRecord {
  id: string;
  club_id?: string;
  submitted_by?: string;
  title: string;
  description?: string | null;
  event_date?: string | null;
  location?: string | null;
  aim_objectives?: string | null;
  proposed_activity?: string | null;
  event_time?: string | null;
  number_of_participants?: number | null;
  budget_estimate?: number | null;
  budget_line_items?: BudgetLineItem[];
  responsible_members?: ResponsibleMember[];
  status: string;
  current_stage?: string;
  current_owner_role?: string;
  submitted_at?: string;
  resubmitted_at?: string | null;
  revision_count?: number;
  last_edited_at?: string | null;
  last_edited_by?: string | null;
  advisor_remarks?: string | null;
  advisor_decided_at?: string | null;
  admin_remarks?: string | null;
  admin_decided_at?: string | null;
  latest_approval?: {
    reviewer_id: string;
    reviewer_role: string;
    decision: string;
    remarks: string | null;
    decided_at: string;
  } | null;
  approval_history?: Array<{
    reviewer_id: string;
    reviewer_role: string;
    decision: string;
    remarks: string | null;
    decided_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  proposal_id: string | null;
  announcement_id?: string | null;
  type: string;
  message: string;
  delivery_status: string;
  created_at: string;
}

export interface ApprovedEventRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  title: string;
  proposal_title: string;
  description: string;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  number_of_participants?: number | null;
  budget_estimate?: number | null;
  status: string;
  current_stage: string;
  event_lifecycle: "upcoming" | "happening_today" | "past";
  can_rsvp: boolean;
  can_submit_feedback: boolean;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventReminderRecord {
  id: string;
  user_id: string;
  proposal_id: string;
  message: string;
  remind_at: string;
  delivery_status: string;
  created_at: string;
}

export interface DashboardSummary {
  total_proposals: number;
  pending_proposals: number;
  approved_proposals: number;
  rejected_proposals: number;
  approval_rate: number;
  upcoming_events?: number;
  reminders?: number;
  executive_count?: number;
}

export interface DashboardActionItem {
  type: string;
  label: string;
}

export interface DashboardProposalSummary {
  id: string;
  title: string;
  club_id: string;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardActivity {
  id: string;
  proposal_id: string;
  title: string;
  status: string;
  message: string;
  created_at: string;
}

export interface ExecutiveDashboardRecord {
  role: "executive";
  club_id: string;
  summary: {
    total_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    blocked_tasks: number;
    upcoming_events: number;
    reminders: number;
  };
  action_items: DashboardActionItem[];
  assigned_tasks: TaskRecord[];
  upcoming_events: ApprovedEventRecord[];
  reminders: EventReminderRecord[];
  notifications: NotificationRecord[];
}

export interface PresidentDashboardRecord {
  role: "president";
  club: ClubRecord | null;
  club_id: string;
  summary: DashboardSummary;
  recent_activity: DashboardActivity[];
  pending_proposals: DashboardProposalSummary[];
  upcoming_events: ApprovedEventRecord[];
  executive_team: {
    id: string;
    full_name: string | null;
    role: string;
    club_id: string | null;
    created_at: string;
  }[];
  notifications: NotificationRecord[];
}

export interface AdminOperationsDashboardRecord {
  role: "admin";
  generated_at: string;
  summary: {
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
    dues_collected_amount: number;
    event_attendance_count: number;
    event_rsvp_count: number;
    attendance_rate: number;
    feedback_count: number;
    open_tasks: number;
  };
  pending_actions: {
    type: string;
    label: string;
    count: number;
  }[];
  proposal_bottlenecks: {
    status: string;
    label: string;
    count: number;
  }[];
  club_performance: {
    club_id: string;
    club_name: string;
    club_code: string | null;
    total_members: number;
    active_members: number;
    proposal_count: number;
    pending_proposals: number;
    approved_events: number;
    rejected_proposals: number;
    pending_membership_requests: number;
    dues_collection_rate: number;
    dues_collected_amount: number;
    rsvp_count: number;
    attendance_count: number;
    reports_submitted: number;
    feedback_count: number;
    open_tasks: number;
    last_activity_at: string | null;
  }[];
  missing_reports: {
    proposal_id: string;
    club_id: string;
    title: string;
    event_date: string;
    days_since_event: number;
  }[];
  recent_activity: {
    id: string;
    type: string;
    club_id: string;
    title: string;
    message: string;
    created_at: string;
  }[];
}

export interface TaskStatusHistoryRecord {
  id: string;
  task_id: string;
  changed_by: string;
  old_status: string | null;
  new_status: string;
  remarks: string | null;
  created_at: string;
}

export interface TaskRecord {
  id: string;
  club_id: string;
  assigned_by: string;
  assigned_to: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "blocked";
  due_date: string | null;
  created_at: string;
  updated_at: string;
  status_history?: TaskStatusHistoryRecord[] | null;
}

export interface CreateTaskPayload {
  assigned_to: string;
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
}

export interface ClubMemberRecord {
  id: string;
  club_id: string;
  profile_id: string | null;
  full_name: string;
  student_id: string;
  email: string | null;
  phone_number: string | null;
  club_role: "member" | "executive" | "president";
  membership_status: "active" | "inactive" | "alumni";
  club?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClubMemberPayload {
  club_id?: string | null;
  profile_id?: string | null;
  full_name: string;
  student_id: string;
  email?: string | null;
  phone_number?: string | null;
  club_role?: ClubMemberRecord["club_role"];
  membership_status?: ClubMemberRecord["membership_status"];
}

export interface MembershipRequestRecord {
  id: string;
  profile_id: string;
  club_id: string;
  requested_role: ClubMemberRecord["club_role"];
  status: "pending" | "approved_pending_dues" | "active" | "rejected" | "cancelled";
  remarks: string | null;
  decision_remarks: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  member_id: string | null;
  due_payment_id: string | null;
  dues_amount: number | null;
  academic_session: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    student_id: string | null;
    role: ProfileRecord["role"];
  } | null;
  club?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface EventRsvpRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  user_id: string;
  status: "interested" | "going" | "not_going" | "cancelled";
  profile: {
    id: string;
    full_name: string | null;
    student_id: string | null;
    role: ProfileRecord["role"];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface EventAttendanceRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  user_id: string;
  attended: boolean;
  checked_in_by: string;
  checked_in_at: string;
  profile: {
    id: string;
    full_name: string | null;
    student_id: string | null;
    role: ProfileRecord["role"];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface EventEngagementRecord {
  event: ApprovedEventRecord;
  summary: {
    total_rsvps: number;
    going: number;
    interested: number;
    not_going: number;
    cancelled: number;
    attended: number;
  };
  current_user_rsvp: EventRsvpRecord | null;
  current_user_attendance: EventAttendanceRecord | null;
  rsvps: EventRsvpRecord[];
  attendance: EventAttendanceRecord[];
}

export interface DuePaymentRecord {
  id: string;
  club_id: string;
  member_id: string;
  amount: number;
  academic_session: string;
  payment_reference: string | null;
  payment_account_name?: string | null;
  payment_paid_at?: string | null;
  payer_note?: string | null;
  proof_url: string | null;
  submitted_at?: string | null;
  status: "unpaid" | "submitted" | "paid" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubPaymentSettingsRecord {
  id: string;
  club_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  payment_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfirmationPayload {
  payment_account_name: string;
  payment_reference: string;
  payment_paid_at?: string | null;
  proof_url?: string | null;
  payer_note?: string | null;
}

export interface PaymentSettingsPayload {
  club_id?: string | null;
  bank_name: string;
  account_number: string;
  account_name: string;
  payment_instructions?: string | null;
}

export interface MembershipRequestDecisionResult {
  request: MembershipRequestRecord;
  member: ClubMemberRecord | null;
  due_payment: DuePaymentRecord | null;
}

export interface DuesSummary {
  total_records: number;
  paid: number;
  unpaid: number;
  submitted: number;
  rejected: number;
  expected_amount: number;
  collected_amount: number;
  collection_rate: number;
}

export interface DuesResponse {
  summary: DuesSummary;
  payments: DuePaymentRecord[];
}

export interface CreateDuePaymentPayload {
  club_id?: string | null;
  member_id: string;
  amount: number;
  academic_session: string;
  payment_reference?: string | null;
  proof_url?: string | null;
  status?: DuePaymentRecord["status"];
}

export interface EventReportRecord {
  id: string;
  proposal_id: string;
  club_id: string;
  submitted_by: string;
  attendance_count: number;
  summary: string;
  challenges: string | null;
  outcomes: string | null;
  budget_used: number | null;
  media_urls: string[];
  status: "submitted";
  submitted_at: string;
  created_at: string;
  updated_at: string;
  proposal: {
    id: string;
    title: string;
    proposed_activity: string | null;
    event_date: string;
    event_time: string | null;
    location: string | null;
    status: string;
  } | null;
}

export interface CreateEventReportPayload {
  proposal_id: string;
  attendance_count: number;
  summary: string;
  challenges?: string | null;
  outcomes?: string | null;
  budget_used?: number | null;
  media_urls?: string[];
}

export interface AnnouncementRecord {
  id: string;
  club_id: string | null;
  created_by: string;
  title: string;
  message: string;
  audience: "all_users" | "all_clubs" | "club" | "role";
  priority: "low" | "normal" | "high" | "urgent";
  target_role: ProfileRecord["role"] | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadershipApplicationRecord {
  id: string;
  profile_id: string;
  club_id: string;
  current_role: ProfileRecord["role"];
  requested_role: "executive" | "president";
  status: "pending" | "needs_more_info" | "approved" | "rejected" | "cancelled";
  reason: string;
  experience: string | null;
  goals: string | null;
  availability: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_remarks: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    student_id: string | null;
    role: ProfileRecord["role"];
  } | null;
  club?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface LeadershipApplicationDecisionResult {
  application: LeadershipApplicationRecord;
  profile: ProfileRecord | null;
  member: ClubMemberRecord | null;
  history: ProfileRoleHistoryRecord | null;
  demoted_presidents: ProfileRecord[];
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  audience?: AnnouncementRecord["audience"];
  priority?: AnnouncementRecord["priority"];
  club_id?: string | null;
  target_role?: ProfileRecord["role"] | null;
}

export interface FeedbackRecord {
  id: string;
  club_id: string;
  proposal_id: string | null;
  submitted_by: string;
  category: "general" | "event" | "club";
  rating: number | null;
  comment: string;
  status: "open" | "reviewed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackPayload {
  club_id?: string | null;
  proposal_id?: string | null;
  category?: FeedbackRecord["category"];
  rating?: number | null;
  comment: string;
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiRequestOptions {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
}

const TOKEN_REFRESH_BUFFER_SECONDS = 60;
export const SESSION_EXPIRED_EVENT = "nilehive:session-expired";

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options: { status: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

function dispatchSessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

async function getFreshAccessToken(explicitToken?: string, forceRefresh = false) {
  if (explicitToken) {
    return explicitToken;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return "";
  }

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  const shouldRefresh =
    forceRefresh ||
    !expiresAt ||
    expiresAt - Date.now() <= TOKEN_REFRESH_BUFFER_SECONDS * 1000;

  if (!shouldRefresh) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data.session) {
    if (expiresAt && expiresAt > Date.now()) {
      return session.access_token;
    }

    return "";
  }

  return data.session.access_token;
}

async function executeRequest<T>(path: string, options: ApiRequestOptions, accessToken: string) {
  const { method = "GET", body } = options;
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const responseText = await response.text();
  const responseJson = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const apiError = responseJson?.error;

    throw new ApiClientError(apiError?.message || "Request failed", {
      status: response.status,
      code: apiError?.code,
      details: apiError?.details
    });
  }

  return responseJson as T;
}

async function request<T>(path: string, options: ApiRequestOptions = {}) {
  const accessToken = await getFreshAccessToken(options.token);

  try {
    return await executeRequest<T>(path, options, accessToken);
  } catch (error) {
    if (
      options.token ||
      !(error instanceof ApiClientError) ||
      error.status !== 401
    ) {
      throw error;
    }

    const retryToken = await getFreshAccessToken(undefined, true);

    if (!retryToken || retryToken === accessToken) {
      await supabase.auth.signOut();
      dispatchSessionExpired();
      throw error;
    }

    try {
      return await executeRequest<T>(path, options, retryToken);
    } catch (retryError) {
      if (retryError instanceof ApiClientError && retryError.status === 401) {
        await supabase.auth.signOut();
        dispatchSessionExpired();
      }

      throw retryError;
    }
  }
}

export async function getHealth() {
  return request<HealthCheckResponse>("/api/v1/health");
}

export async function createProposal(payload: CreateProposalPayload, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>("/api/v1/proposals", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function updatePresidentProposal(proposalId: string, payload: CreateProposalPayload, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(`/api/v1/proposals/${proposalId}/edit`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function submitPresidentProposalRevision(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(`/api/v1/proposals/${proposalId}/submit`, {
    method: "POST",
    token
  });

  return response.data;
}

export const updateExecutiveProposal = updatePresidentProposal;
export const submitExecutiveProposalRevision = submitPresidentProposalRevision;

export async function getClubs(token?: string) {
  const response = await request<ApiEnvelope<ClubRecord[]>>("/api/v1/clubs", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getPublicClubs() {
  const response = await request<ApiEnvelope<ClubRecord[]>>("/api/v1/clubs/public", {
    method: "GET"
  });

  return response.data;
}

export async function completeProfileOnboarding(payload: ProfileOnboardingPayload, token?: string) {
  const response = await request<ApiEnvelope<ProfileRecord>>("/api/v1/profile/onboarding", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getPendingAdvisorProposals(token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord[]>>(
    "/api/v1/proposals/pending-advisor",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function submitAdvisorDecision(
  proposalId: string,
  payload: { decision: "approve" | "reject"; remarks?: string },
  token?: string
) {
  const response = await request<ApiEnvelope<ProposalRecord>>(
    `/api/v1/proposals/${proposalId}/advisor-decision`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function getPresidentProposals(token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord[]>>("/api/v1/proposals", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getPresidentProposal(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(`/api/v1/proposals/${proposalId}`, {
    method: "GET",
    token
  });

  return response.data;
}

export const getExecutiveProposals = getPresidentProposals;
export const getExecutiveProposal = getPresidentProposal;

export async function getAdvisorProposal(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(`/api/v1/proposals/advisor/${proposalId}`, {
    method: "GET",
    token
  });

  return response.data;
}

export async function getAdminProposals(filters: { status?: string; current_stage?: string } = {}, token?: string) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.current_stage) {
    params.set("current_stage", filters.current_stage);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<ProposalRecord[]>>(
    `/api/v1/proposals/admin${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getAdminProposal(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(
    `/api/v1/proposals/admin/${proposalId}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getAdminUsers(
  filters: { role?: string; club_id?: string; requested_role?: string; q?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.role) {
    params.set("role", filters.role);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  if (filters.requested_role) {
    params.set("requested_role", filters.requested_role);
  }

  if (filters.q) {
    params.set("q", filters.q);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<AdminUserProfileRecord[]>>(
    `/api/v1/admin/users${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function updateAdminUserRole(
  profileId: string,
  payload: {
    role: ProfileRecord["role"];
    club_id?: string | null;
    remarks?: string | null;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<AdminRoleChangeResult>>(
    `/api/v1/admin/users/${profileId}/role`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function assignAdminUserAdvisor(
  profileId: string,
  payload: {
    club_id: string;
    replace_existing?: boolean;
    remarks?: string | null;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<AdminAdvisorAssignmentResult>>(
    `/api/v1/admin/users/${profileId}/advisor-assignment`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function submitAdminDecision(
  proposalId: string,
  payload: { decision: "approve" | "reject"; remarks?: string },
  token?: string
) {
  const response = await request<ApiEnvelope<ProposalRecord>>(
    `/api/v1/proposals/admin/${proposalId}/decision`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function getNotifications(token?: string) {
  const response = await request<ApiEnvelope<NotificationRecord[]>>("/api/v1/notifications", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getApprovedEvents(token?: string) {
  const response = await request<ApiEnvelope<ApprovedEventRecord[]>>("/api/v1/events/approved", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getEventReminders(token?: string) {
  const response = await request<ApiEnvelope<EventReminderRecord[]>>("/api/v1/reminders", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getExecutiveDashboard(token?: string) {
  const response = await request<ApiEnvelope<ExecutiveDashboardRecord>>(
    "/api/v1/dashboard/executive",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getPresidentDashboard(token?: string) {
  const response = await request<ApiEnvelope<PresidentDashboardRecord>>(
    "/api/v1/dashboard/president",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getTasks(filters: { status?: string } = {}, token?: string) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<TaskRecord[]>>(
    `/api/v1/tasks${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function createTask(payload: CreateTaskPayload, token?: string) {
  const response = await request<ApiEnvelope<TaskRecord>>("/api/v1/tasks", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function updateTaskStatus(
  taskId: string,
  payload: { status: TaskRecord["status"]; remarks?: string },
  token?: string
) {
  const response = await request<ApiEnvelope<TaskRecord>>(`/api/v1/tasks/${taskId}/status`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getClubMembers(
  filters: { team?: "executive"; membership_status?: string; club_id?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.team) {
    params.set("team", filters.team);
  }

  if (filters.membership_status) {
    params.set("membership_status", filters.membership_status);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<ClubMemberRecord[]>>(
    `/api/v1/members${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function createClubMember(payload: CreateClubMemberPayload, token?: string) {
  const response = await request<ApiEnvelope<ClubMemberRecord>>("/api/v1/members", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function updateClubMember(
  memberId: string,
  payload: Partial<CreateClubMemberPayload>,
  token?: string
) {
  const response = await request<ApiEnvelope<ClubMemberRecord>>(`/api/v1/members/${memberId}`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getAdminOperationsDashboard(token?: string) {
  const response = await request<ApiEnvelope<AdminOperationsDashboardRecord>>(
    "/api/v1/dashboard/admin-operations",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getEventEngagement(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<EventEngagementRecord>>(`/api/v1/events/${proposalId}/engagement`, {
    method: "GET",
    token
  });

  return response.data;
}

export async function submitEventRsvp(
  proposalId: string,
  payload: { status: EventRsvpRecord["status"] },
  token?: string
) {
  const response = await request<ApiEnvelope<EventRsvpRecord>>(`/api/v1/events/${proposalId}/rsvp`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function submitEventAttendance(
  proposalId: string,
  payload: { user_id: string; attended?: boolean },
  token?: string
) {
  const response = await request<ApiEnvelope<EventAttendanceRecord>>(`/api/v1/events/${proposalId}/attendance`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function createMembershipRequest(
  payload: {
    club_id: string;
    requested_role?: ClubMemberRecord["club_role"];
    remarks?: string;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<MembershipRequestRecord>>("/api/v1/membership-requests", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getMyMembershipRequests(token?: string) {
  const response = await request<ApiEnvelope<MembershipRequestRecord[]>>(
    "/api/v1/membership-requests/me",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getMembershipRequests(
  filters: { status?: string; club_id?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<MembershipRequestRecord[]>>(
    `/api/v1/membership-requests${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function decideMembershipRequest(
  requestId: string,
  payload: {
    decision: "approve" | "reject";
    remarks?: string;
    dues_amount?: number;
    academic_session?: string;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<MembershipRequestDecisionResult>>(
    `/api/v1/membership-requests/${requestId}/decision`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function createLeadershipApplication(
  payload: {
    club_id: string;
    requested_role: LeadershipApplicationRecord["requested_role"];
    reason: string;
    experience?: string | null;
    goals?: string | null;
    availability?: string | null;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<LeadershipApplicationRecord>>("/api/v1/leadership-applications", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getMyLeadershipApplications(token?: string) {
  const response = await request<ApiEnvelope<LeadershipApplicationRecord[]>>(
    "/api/v1/leadership-applications/me",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getLeadershipApplications(
  filters: { status?: string; club_id?: string; requested_role?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  if (filters.requested_role) {
    params.set("requested_role", filters.requested_role);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<LeadershipApplicationRecord[]>>(
    `/api/v1/leadership-applications${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function decideLeadershipApplication(
  applicationId: string,
  payload: {
    decision: "approve" | "reject" | "needs_more_info";
    remarks?: string;
    replace_existing_president?: boolean;
  },
  token?: string
) {
  const response = await request<ApiEnvelope<LeadershipApplicationDecisionResult>>(
    `/api/v1/leadership-applications/${applicationId}/decision`,
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function getDuePayments(
  filters: { status?: string; member_id?: string; club_id?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.member_id) {
    params.set("member_id", filters.member_id);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<DuesResponse>>(
    `/api/v1/dues${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function getMyDuePayments(token?: string) {
  const response = await request<ApiEnvelope<DuesResponse>>("/api/v1/dues/me", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getClubPaymentSettings(clubId?: string, token?: string) {
  const params = new URLSearchParams();

  if (clubId) {
    params.set("club_id", clubId);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<ClubPaymentSettingsRecord | null>>(
    `/api/v1/dues/payment-settings${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function saveClubPaymentSettings(payload: PaymentSettingsPayload, token?: string) {
  const response = await request<ApiEnvelope<ClubPaymentSettingsRecord>>("/api/v1/dues/payment-settings", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function createDuePayment(payload: CreateDuePaymentPayload, token?: string) {
  const response = await request<ApiEnvelope<DuePaymentRecord>>("/api/v1/dues", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function updateDuePayment(
  paymentId: string,
  payload: Partial<CreateDuePaymentPayload>,
  token?: string
) {
  const response = await request<ApiEnvelope<DuePaymentRecord>>(`/api/v1/dues/${paymentId}`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function submitDuePaymentConfirmation(
  paymentId: string,
  payload: PaymentConfirmationPayload,
  token?: string
) {
  const response = await request<ApiEnvelope<DuePaymentRecord>>(`/api/v1/dues/${paymentId}/submit-confirmation`, {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getEventReports(filters: { proposal_id?: string; club_id?: string } = {}, token?: string) {
  const params = new URLSearchParams();

  if (filters.proposal_id) {
    params.set("proposal_id", filters.proposal_id);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<EventReportRecord[]>>(
    `/api/v1/reports${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function createEventReport(payload: CreateEventReportPayload, token?: string) {
  const response = await request<ApiEnvelope<EventReportRecord>>("/api/v1/reports", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getAnnouncements(
  filters: { audience?: string; club_id?: string; priority?: string; unread?: boolean } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.audience) {
    params.set("audience", filters.audience);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.unread) {
    params.set("unread", "true");
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<AnnouncementRecord[]>>(
    `/api/v1/communications/announcements${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function markAnnouncementRead(announcementId: string, token?: string) {
  const response = await request<ApiEnvelope<AnnouncementRecord>>(
    `/api/v1/communications/announcements/${announcementId}/read`,
    {
      method: "POST",
      token
    }
  );

  return response.data;
}

export async function markAllAnnouncementsRead(
  filters: { audience?: string; club_id?: string; priority?: string; unread?: boolean } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.audience) {
    params.set("audience", filters.audience);
  }

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.unread) {
    params.set("unread", "true");
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<{ marked_read: number }>>(
    `/api/v1/communications/announcements/read-all${query ? `?${query}` : ""}`,
    {
      method: "POST",
      token
    }
  );

  return response.data;
}

export async function createAnnouncement(payload: CreateAnnouncementPayload, token?: string) {
  const response = await request<ApiEnvelope<AnnouncementRecord>>(
    "/api/v1/communications/announcements",
    {
      method: "POST",
      token,
      body: payload
    }
  );

  return response.data;
}

export async function getFeedback(
  filters: { club_id?: string; proposal_id?: string; status?: string } = {},
  token?: string
) {
  const params = new URLSearchParams();

  if (filters.club_id) {
    params.set("club_id", filters.club_id);
  }

  if (filters.proposal_id) {
    params.set("proposal_id", filters.proposal_id);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const response = await request<ApiEnvelope<FeedbackRecord[]>>(
    `/api/v1/communications/feedback${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );

  return response.data;
}

export async function createFeedback(payload: CreateFeedbackPayload, token?: string) {
  const response = await request<ApiEnvelope<FeedbackRecord>>("/api/v1/communications/feedback", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}
