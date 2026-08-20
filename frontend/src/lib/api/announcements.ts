import { apiRequest } from "./client";
import { adaptAnnouncementPage, adaptAnnouncementRecord } from "@/lib/announcements/adapters";
import type {
  AnnouncementRecord,
  CreateAnnouncementPayload,
  ListAnnouncementsQuery,
} from "@/lib/announcements/types";
import type { PaginatedEnvelope } from "@/lib/people/types";

function queryString(filters: ListAnnouncementsQuery = {}): string {
  const params = new URLSearchParams();
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.club_id) params.set("club_id", filters.club_id);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.unread) params.set("unread", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  params.set("sort", filters.sort ?? "created_at");
  params.set("order", filters.order ?? "desc");
  return `?${params.toString()}`;
}

export async function listAnnouncements(
  filters: ListAnnouncementsQuery = {},
): Promise<PaginatedEnvelope<AnnouncementRecord>> {
  const payload = await apiRequest<{ data: unknown }>(
    `/communications/announcements${queryString(filters)}`,
    { signal: filters.signal },
  );
  return adaptAnnouncementPage(payload.data);
}

export async function listAllAnnouncements(
  filters: Omit<ListAnnouncementsQuery, "page" | "page_size"> = {},
): Promise<AnnouncementRecord[]> {
  const items: AnnouncementRecord[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await listAnnouncements({
      ...filters,
      page,
      page_size: 100,
    });
    items.push(...result.items);
    hasNext = result.has_next;
    page += 1;
    if (page > 20) break;
  }
  return items;
}

export async function publishAdminAnnouncement(
  body: CreateAnnouncementPayload,
  signal?: AbortSignal,
): Promise<AnnouncementRecord> {
  const payload = await apiRequest<{ data: unknown }>(`/communications/announcements`, {
    method: "POST",
    body,
    signal,
  });
  const announcement = adaptAnnouncementRecord(payload.data);
  if (!announcement) {
    throw new Error("Announcement payload was missing required fields");
  }
  return announcement;
}
