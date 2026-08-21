import { apiRequest } from "./client";
import { adaptAuditLogPage } from "@/lib/audit/adapters";
import type { ListAuditLogsQuery } from "@/lib/audit/types";
import type { PaginatedEnvelope } from "@/lib/people/types";
import type { AuditLogRecord } from "@/lib/audit/types";

function queryString(filters: ListAuditLogsQuery = {}): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.page_size ?? 20));
  params.set("sort", filters.sort ?? "created_at");
  params.set("order", filters.order ?? "desc");
  if (filters.q) params.set("q", filters.q);
  if (filters.actor_id) params.set("actor_id", filters.actor_id);
  if (filters.action) params.set("action", filters.action);
  if (filters.entity_type) params.set("entity_type", filters.entity_type);
  if (filters.entity_id) params.set("entity_id", filters.entity_id);
  if (filters.club_id) params.set("club_id", filters.club_id);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  return `?${params.toString()}`;
}

export async function listAdminAuditLogs(
  filters: ListAuditLogsQuery = {},
): Promise<PaginatedEnvelope<AuditLogRecord>> {
  const payload = await apiRequest<{ data: unknown }>(`/admin/audit-logs${queryString(filters)}`, {
    signal: filters.signal,
  });
  return adaptAuditLogPage(payload.data);
}
