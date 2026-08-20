import { apiRequest } from "./client";
import {
  adaptApprovedEventPage,
  adaptEventAttendance,
  adaptEventEngagement,
  adaptEventReportPage,
} from "@/lib/events/adapters";
import type {
  EventAttendanceRecord,
  EventEngagementRecord,
  ListApprovedEventsQuery,
  SubmitAttendancePayload,
} from "@/lib/events/types";
import type { PaginatedEnvelope } from "@/lib/people/types";
import type { ApprovedEventRecord, EventReportRecord } from "@/lib/events/types";

function eventsQuery(filters: ListApprovedEventsQuery = {}): string {
  const params = new URLSearchParams();
  if (filters.lifecycle) params.set("lifecycle", filters.lifecycle);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  params.set("sort", filters.sort ?? "event_date");
  params.set("order", filters.order ?? "asc");
  return `?${params.toString()}`;
}

export async function listApprovedEvents(
  filters: ListApprovedEventsQuery = {},
): Promise<PaginatedEnvelope<ApprovedEventRecord>> {
  const payload = await apiRequest<{ data: unknown }>(`/events/approved${eventsQuery(filters)}`, {
    signal: filters.signal,
  });
  return adaptApprovedEventPage(payload.data);
}

export async function listAllApprovedEvents(signal?: AbortSignal): Promise<ApprovedEventRecord[]> {
  const items: ApprovedEventRecord[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await listApprovedEvents({
      page,
      page_size: 100,
      sort: "event_date",
      order: "asc",
      signal,
    });
    items.push(...result.items);
    hasNext = result.has_next;
    page += 1;
    if (page > 20) break;
  }
  return items;
}

export async function getEventEngagement(
  proposalId: string,
  signal?: AbortSignal,
): Promise<EventEngagementRecord> {
  const payload = await apiRequest<{ data: unknown }>(
    `/events/${encodeURIComponent(proposalId)}/engagement`,
    { signal },
  );
  const engagement = adaptEventEngagement(payload.data);
  if (!engagement) {
    throw new Error("Event engagement payload was missing required fields");
  }
  return engagement;
}

export async function submitEventAttendance(
  proposalId: string,
  body: SubmitAttendancePayload,
  signal?: AbortSignal,
): Promise<EventAttendanceRecord> {
  const payload = await apiRequest<{ data: unknown }>(
    `/events/${encodeURIComponent(proposalId)}/attendance`,
    { method: "POST", body, signal },
  );
  const attendance = adaptEventAttendance(payload.data);
  if (!attendance) {
    throw new Error("Attendance payload was missing required fields");
  }
  return attendance;
}

export async function listEventReports(options: {
  proposal_id?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
} = {}): Promise<PaginatedEnvelope<EventReportRecord>> {
  const params = new URLSearchParams();
  if (options.proposal_id) params.set("proposal_id", options.proposal_id);
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  params.set("sort", "submitted_at");
  params.set("order", "desc");
  const encoded = params.toString();
  const payload = await apiRequest<{ data: unknown }>(`/reports${encoded ? `?${encoded}` : ""}`, {
    signal: options.signal,
  });
  return adaptEventReportPage(payload.data);
}
