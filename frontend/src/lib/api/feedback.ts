import { apiRequest } from "./client";
import { adaptFeedbackList } from "@/lib/feedback/adapters";
import type { FeedbackRecord, ListFeedbackQuery } from "@/lib/feedback/types";

function queryString(filters: ListFeedbackQuery = {}): string {
  const params = new URLSearchParams();
  if (filters.club_id) params.set("club_id", filters.club_id);
  if (filters.proposal_id) params.set("proposal_id", filters.proposal_id);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export async function listAdminFeedback(filters: ListFeedbackQuery = {}): Promise<FeedbackRecord[]> {
  const payload = await apiRequest<{ data: unknown }>(`/communications/feedback${queryString(filters)}`, {
    signal: filters.signal,
  });
  return adaptFeedbackList(payload.data);
}
