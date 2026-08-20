import type { OneClubDuesStatus } from "@/lib/duesStatus";
import type { OneClubMembershipRequestStatus } from "@/lib/membershipStatus";
import type { OneClubProposalStatus } from "@/lib/proposalStatus";

export interface ClubReference {
  id: string;
  name: string;
  code: string | null;
}

export interface PaginatedEnvelope<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface AdminProposalApproval {
  reviewer_id: string | null;
  reviewer_role: string | null;
  decision: string | null;
  remarks: string | null;
  decided_at: string | null;
}

export interface AdminProposalRecord {
  id: string;
  title: string;
  description: string | null;
  club_id: string;
  club: ClubReference | null;
  submitted_by: string | null;
  event_date: string | null;
  location: string | null;
  aim_objectives: string | null;
  proposed_activity: string | null;
  event_time: string | null;
  number_of_participants: number | null;
  budget_estimate: number | null;
  budget_line_items: unknown[];
  responsible_members: unknown[];
  status: string;
  current_stage: string | null;
  current_owner_role: string | null;
  submitted_at: string | null;
  resubmitted_at: string | null;
  revision_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  advisor_remarks: string | null;
  advisor_decided_at: string | null;
  admin_remarks: string | null;
  admin_decided_at: string | null;
  latest_approval: AdminProposalApproval | null;
  approval_history?: AdminProposalApproval[] | null;
}

export interface MembershipProfileRecord {
  id: string;
  full_name: string | null;
  student_id: string | null;
  phone_number?: string | null;
  role: string | null;
}

export interface MembershipDuePaymentRecord {
  id: string;
  club_id: string | null;
  member_id: string | null;
  amount: number | null;
  academic_session: string | null;
  payment_reference: string | null;
  payment_account_name: string | null;
  payment_paid_at: string | null;
  payer_note: string | null;
  proof_url: string | null;
  submitted_at: string | null;
  status: string | null;
  verified_by: string | null;
  verified_at: string | null;
}

export interface MembershipRequestRecord {
  id: string;
  profile_id: string | null;
  club_id: string;
  requested_role: string | null;
  status: string;
  remarks: string | null;
  decision_remarks: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  member_id: string | null;
  due_payment_id: string | null;
  dues_amount: number | null;
  academic_session: string | null;
  profile: MembershipProfileRecord | null;
  club: ClubReference | null;
  due_payment: MembershipDuePaymentRecord | null;
  whatsapp_onboarding_status: string | null;
  whatsapp_added_by: string | null;
  whatsapp_added_at: string | null;
  whatsapp_onboarding_notes?: string | null;
  whatsapp_phone_number?: string | null;
  whatsapp_chat_url?: string | null;
  student_type: string | null;
  join_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MembershipDecisionResult {
  request: MembershipRequestRecord;
  member: unknown;
  due_payment: MembershipDuePaymentRecord | null;
}

export interface DuesMemberRecord {
  id: string;
  full_name: string | null;
  student_id: string | null;
  email: string | null;
  phone_number: string | null;
  club_role: string | null;
  membership_status: string | null;
}

export interface DuesPaymentRecord {
  id: string;
  club_id: string;
  member_id: string | null;
  amount: number | null;
  academic_session: string | null;
  payment_reference: string | null;
  payment_account_name: string | null;
  payment_paid_at: string | null;
  payer_note: string | null;
  proof_url: string | null;
  submitted_at: string | null;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  club: ClubReference | null;
  member: DuesMemberRecord | null;
}

export interface DuesListResult {
  summary: {
    total_records: number;
    paid: number;
    unpaid: number;
    submitted: number;
    rejected: number;
    expected_amount: number;
    collected_amount: number;
    collection_rate: number;
  } | null;
  payments: PaginatedEnvelope<DuesPaymentRecord> | DuesPaymentRecord[];
}

export interface ProposalApprovalView {
  id: string;
  title: string;
  club_id: string;
  club_name: string;
  submitted_by_id: string | null;
  submitted_by_name: string | null;
  proposed_date: string | null;
  venue: string | null;
  budget: number | null;
  description: string | null;
  aim_objectives: string | null;
  proposed_activity: string | null;
  advisor_name: string | null;
  advisor_remarks: string | null;
  admin_remarks: string | null;
  status: OneClubProposalStatus | string;
  submitted_at: string | null;
  approval_history: AdminProposalApproval[];
  can_authorize: boolean;
  can_override: boolean;
}

export interface JoinRequestApprovalView {
  id: string;
  profile_id: string | null;
  student_id: string | null;
  student_name: string;
  student_email: string | null;
  club_id: string;
  club_name: string;
  club_available: boolean;
  statement: string | null;
  applied_at: string | null;
  status: OneClubMembershipRequestStatus | string;
  dues_status: string | null;
  dues_amount: number | null;
  whatsapp_onboarding_status: string | null;
  whatsapp_added: boolean;
  whatsapp_ready: boolean;
  whatsapp_chat_url: string | null;
  profile_removed: boolean;
}

export interface DuesProofApprovalView {
  id: string;
  student_id: string | null;
  student_name: string;
  student_email: string | null;
  club_id: string;
  club_name: string;
  amount: number | null;
  payment_channel: string | null;
  reference_number: string | null;
  proof_document_url: string | null;
  has_proof: boolean;
  status: OneClubDuesStatus | string;
  created_at: string | null;
  payer_note: string | null;
}

export interface AdminProposalDecisionPayload {
  decision: "approve" | "reject";
  remarks?: string;
}

export interface MembershipDecisionPayload {
  decision: "approve" | "reject";
  remarks?: string;
}

export interface DuesDecisionPayload {
  status: "paid" | "rejected";
}

export type ApprovalsDataSource = "mock" | "integrated";
