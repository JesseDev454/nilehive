import { isWhatsAppOnboardingReady } from "@/lib/membershipStatus";
import type {
  AdminProposalRecord,
  DuesPaymentRecord,
  DuesProofApprovalView,
  JoinRequestApprovalView,
  MembershipRequestRecord,
  PaginatedEnvelope,
  ProposalApprovalView,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clubName(club: unknown, fallbackId: string | null): string {
  const record = asRecord(club);
  return asString(record?.name) || fallbackId || "Club unavailable";
}

export function unwrapPaginated<T>(value: unknown): PaginatedEnvelope<T> {
  const record = asRecord(value);
  if (record && Array.isArray(record.items)) {
    return {
      items: record.items as T[],
      page: asNumber(record.page) || 1,
      page_size: asNumber(record.page_size) || record.items.length,
      total: asNumber(record.total) ?? record.items.length,
      has_next: Boolean(record.has_next),
    };
  }
  const items = Array.isArray(value) ? (value as T[]) : [];
  return {
    items,
    page: 1,
    page_size: items.length,
    total: items.length,
    has_next: false,
  };
}

export function unwrapDuesPayments(value: unknown): PaginatedEnvelope<DuesPaymentRecord> {
  const record = asRecord(value);
  if (record && (record.payments || record.summary)) {
    return unwrapPaginated<DuesPaymentRecord>(record.payments);
  }
  return unwrapPaginated<DuesPaymentRecord>(value);
}

export function adaptAdminProposal(record: AdminProposalRecord): ProposalApprovalView {
  const status = asString(record.status) || "unknown";
  return {
    id: record.id,
    title: asString(record.title) || "Untitled proposal",
    club_id: asString(record.club_id) || asString(record.club?.id) || "",
    club_name: clubName(record.club, asString(record.club_id)),
    submitted_by_id: asString(record.submitted_by),
    submitted_by_name: null,
    proposed_date: asString(record.event_date),
    venue: asString(record.location),
    budget: asNumber(record.budget_estimate),
    description: asString(record.description),
    aim_objectives: asString(record.aim_objectives),
    proposed_activity: asString(record.proposed_activity),
    advisor_name: null,
    advisor_remarks: asString(record.advisor_remarks),
    admin_remarks: asString(record.admin_remarks),
    status,
    submitted_at: asString(record.submitted_at) || asString(record.created_at),
    approval_history: Array.isArray(record.approval_history) ? record.approval_history : [],
    can_authorize: status === "pending_admin_review",
    can_override: status === "advisor_rejected" || status === "admin_rejected",
  };
}

export function adaptMembershipRequest(record: MembershipRequestRecord): JoinRequestApprovalView {
  const profile = record.profile;
  const status = asString(record.status) || "unknown";
  const duesStatus = asString(record.due_payment?.status);
  const onboarding = asString(record.whatsapp_onboarding_status);
  return {
    id: record.id,
    profile_id: asString(record.profile_id) || asString(profile?.id),
    student_id: asString(profile?.student_id),
    student_name: asString(profile?.full_name) || "Student record unavailable",
    student_email: null,
    club_id: asString(record.club_id) || asString(record.club?.id) || "",
    club_name: clubName(record.club, asString(record.club_id)),
    club_available: Boolean(record.club?.name),
    statement: asString(record.join_reason) || asString(record.remarks),
    applied_at: asString(record.created_at),
    status,
    dues_status: duesStatus,
    dues_amount: asNumber(record.dues_amount) ?? asNumber(record.due_payment?.amount),
    whatsapp_onboarding_status: onboarding,
    whatsapp_added: onboarding === "added",
    whatsapp_ready: isWhatsAppOnboardingReady(status, duesStatus, onboarding),
    whatsapp_chat_url: asString(record.whatsapp_chat_url),
    profile_removed: !profile,
  };
}

export function adaptDuesPayment(record: DuesPaymentRecord): DuesProofApprovalView {
  const proofUrl = asString(record.proof_url);
  return {
    id: record.id,
    student_id: asString(record.member?.student_id),
    student_name: asString(record.member?.full_name) || "Member record unavailable",
    student_email: asString(record.member?.email),
    club_id: asString(record.club_id) || asString(record.club?.id) || "",
    club_name: clubName(record.club, asString(record.club_id)),
    amount: asNumber(record.amount),
    payment_channel: asString(record.payment_account_name),
    reference_number: asString(record.payment_reference),
    proof_document_url: proofUrl,
    has_proof: Boolean(proofUrl),
    status: asString(record.status) || "unknown",
    created_at: asString(record.submitted_at) || asString(record.created_at),
    payer_note: asString(record.payer_note),
  };
}

export function displayValue(value: string | number | null | undefined, fallback = "Not provided"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "Not provided";
  return `₦${amount.toLocaleString()}`;
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
