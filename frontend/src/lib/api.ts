import { getApiBaseUrl } from "@/lib/env";

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
}

export interface ProposalRecord {
  id: string;
  club_id: string;
  submitted_by: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
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

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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

export async function createProposal(payload: CreateProposalPayload, token: string) {
  const response = await request<ApiEnvelope<ProposalRecord>>("/api/v1/proposals", {
    method: "POST",
    token,
    body: payload
  });

  return response.data;
}

export async function getPendingAdvisorProposals(token: string) {
  const response = await request<ApiEnvelope<ProposalRecord[]>>(
    "/api/v1/proposals/pending-advisor",
    {
      method: "GET",
      token
    }
  );

  return response.data;
}
