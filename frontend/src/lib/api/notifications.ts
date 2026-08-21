import { apiRequest } from "./client";
import { adaptNotificationPage, adaptNotificationRecord } from "@/lib/notifications/adapters";
import type { ListNotificationsQuery, NotificationRecord } from "@/lib/notifications/types";
import type { PaginatedEnvelope } from "@/lib/people/types";

function queryString(filters: ListNotificationsQuery = {}): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  params.set("sort", filters.sort ?? "created_at");
  params.set("order", filters.order ?? "desc");
  return `?${params.toString()}`;
}

export async function listNotifications(
  filters: ListNotificationsQuery = {},
): Promise<PaginatedEnvelope<NotificationRecord>> {
  const payload = await apiRequest<{ data: unknown }>(`/notifications${queryString(filters)}`, {
    signal: filters.signal,
  });
  return adaptNotificationPage(payload.data);
}

export async function listAllNotifications(signal?: AbortSignal): Promise<NotificationRecord[]> {
  const items: NotificationRecord[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await listNotifications({
      page,
      page_size: 100,
      sort: "created_at",
      order: "desc",
      signal,
    });
    items.push(...result.items);
    hasNext = result.has_next;
    page += 1;
    if (page > 20) break;
  }
  return items;
}

export async function markNotificationRead(
  notificationId: string,
  signal?: AbortSignal,
): Promise<NotificationRecord> {
  const payload = await apiRequest<{ data: unknown }>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH", signal },
  );
  const notification = adaptNotificationRecord(payload.data);
  if (!notification) {
    throw new Error("Notification payload was missing required fields");
  }
  return notification;
}
