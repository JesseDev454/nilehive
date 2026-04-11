import { getApiBaseUrl } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export interface HealthCheckResponse {
  status: string;
  service: string;
  database: string;
}

export interface CreateProposalPayload {
  title: string;
  description: string;
  event_date: string;
  location: string;
  club_id?: string;
  aim_objectives: string;
  proposed_activity: string;
  event_time?: string | null;
  number_of_participants: number;
  budget_estimate?: number | null;
  budget_line_items: BudgetLineItem[];
  responsible_members: ResponsibleMember[];
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
  code: string | null;
  advisor_id: string | null;
  created_at: string;
}

export interface ProposalRecord {
  id: string;
  club_id?: string;
  submitted_by?: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  aim_objectives?: string | null;
  proposed_activity?: string | null;
  event_time?: string | null;
  number_of_participants?: number | null;
  budget_estimate?: number | null;
  budget_line_items?: BudgetLineItem[];
  responsible_members?: ResponsibleMember[];
  status: string;
  current_stage?: string;
  submitted_at?: string;
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
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  proposal_id: string;
  type: string;
  message: string;
  delivery_status: string;
  created_at: string;
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiRequestOptions {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
}

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

async function request<T>(path: string, options: ApiRequestOptions = {}) {
  const { method = "GET", token, body } = options;
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  const accessToken =
    token ||
    (await supabase.auth.getSession()).data.session?.access_token ||
    "";

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

export async function getClubs(token?: string) {
  const response = await request<ApiEnvelope<ClubRecord[]>>("/api/v1/clubs", {
    method: "GET",
    token
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

export async function getExecutiveProposals(token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord[]>>("/api/v1/proposals", {
    method: "GET",
    token
  });

  return response.data;
}

export async function getExecutiveProposal(proposalId: string, token?: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>(`/api/v1/proposals/${proposalId}`, {
    method: "GET",
    token
  });

  return response.data;
}

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
