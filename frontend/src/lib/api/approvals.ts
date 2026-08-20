import { apiRequest } from "./client";
import {
  adaptAdminProposal,
  adaptDuesPayment,
  adaptMembershipRequest,
  unwrapDuesPayments,
  unwrapPaginated,
} from "@/lib/approvals/adapters";
import type {
  AdminProposalDecisionPayload,
  AdminProposalRecord,
  DuesDecisionPayload,
  DuesListResult,
  DuesPaymentRecord,
  DuesProofApprovalView,
  JoinRequestApprovalView,
  MembershipDecisionPayload,
  MembershipDecisionResult,
  MembershipRequestRecord,
  PaginatedEnvelope,
  ProposalApprovalView,
} from "@/lib/approvals/types";

export interface ListQuery {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  club_id?: string;
  current_stage?: string;
  requested_role?: string;
  member_id?: string;
  signal?: AbortSignal;
}

function queryString(filters: ListQuery): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.status) params.set("status", filters.status);
  if (filters.club_id) params.set("club_id", filters.club_id);
  if (filters.current_stage) params.set("current_stage", filters.current_stage);
  if (filters.requested_role) params.set("requested_role", filters.requested_role);
  if (filters.member_id) params.set("member_id", filters.member_id);
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export async function listAdminProposals(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<AdminProposalRecord>> {
  const payload = await apiRequest<{ data: PaginatedEnvelope<AdminProposalRecord> | AdminProposalRecord[] }>(
    `/proposals/admin${queryString(filters)}`,
    { signal: filters.signal },
  );
  return unwrapPaginated<AdminProposalRecord>(payload.data);
}

export async function getAdminProposal(
  proposalId: string,
  signal?: AbortSignal,
): Promise<AdminProposalRecord> {
  const payload = await apiRequest<{ data: AdminProposalRecord }>(
    `/proposals/admin/${encodeURIComponent(proposalId)}`,
    { signal },
  );
  return payload.data;
}

export async function submitAdminProposalDecision(
  proposalId: string,
  body: AdminProposalDecisionPayload,
  signal?: AbortSignal,
): Promise<AdminProposalRecord> {
  const payload = await apiRequest<{ data: AdminProposalRecord }>(
    `/proposals/admin/${encodeURIComponent(proposalId)}/decision`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function listMembershipRequests(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<MembershipRequestRecord>> {
  const payload = await apiRequest<{ data: PaginatedEnvelope<MembershipRequestRecord> | MembershipRequestRecord[] }>(
    `/membership-requests${queryString(filters)}`,
    { signal: filters.signal },
  );
  return unwrapPaginated<MembershipRequestRecord>(payload.data);
}

export async function submitMembershipDecision(
  requestId: string,
  body: MembershipDecisionPayload,
  signal?: AbortSignal,
): Promise<MembershipDecisionResult> {
  const payload = await apiRequest<{ data: MembershipDecisionResult }>(
    `/membership-requests/${encodeURIComponent(requestId)}/decision`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function markMembershipWhatsAppAdded(
  requestId: string,
  body: { notes?: string } = {},
  signal?: AbortSignal,
): Promise<MembershipRequestRecord> {
  const payload = await apiRequest<{ data: MembershipRequestRecord }>(
    `/membership-requests/${encodeURIComponent(requestId)}/whatsapp-added`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function listAdminDues(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<DuesPaymentRecord>> {
  const payload = await apiRequest<{ data: DuesListResult | PaginatedEnvelope<DuesPaymentRecord> }>(
    `/dues${queryString(filters)}`,
    { signal: filters.signal },
  );
  return unwrapDuesPayments(payload.data);
}

export async function getAdminDuePayment(
  paymentId: string,
  signal?: AbortSignal,
): Promise<DuesPaymentRecord> {
  const payload = await apiRequest<{ data: DuesPaymentRecord }>(
    `/dues/${encodeURIComponent(paymentId)}`,
    { signal },
  );
  return payload.data;
}

export async function submitDuesDecision(
  dueId: string,
  body: DuesDecisionPayload,
  signal?: AbortSignal,
): Promise<DuesPaymentRecord> {
  const payload = await apiRequest<{ data: DuesPaymentRecord }>(
    `/dues/${encodeURIComponent(dueId)}`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function listAdminProposalViews(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<ProposalApprovalView>> {
  const page = await listAdminProposals(filters);
  return { ...page, items: page.items.map(adaptAdminProposal) };
}

export async function listMembershipRequestViews(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<JoinRequestApprovalView>> {
  const page = await listMembershipRequests(filters);
  return { ...page, items: page.items.map(adaptMembershipRequest) };
}

export async function listAdminDuesViews(
  filters: ListQuery = {},
): Promise<PaginatedEnvelope<DuesProofApprovalView>> {
  const page = await listAdminDues(filters);
  return { ...page, items: page.items.map(adaptDuesPayment) };
}
