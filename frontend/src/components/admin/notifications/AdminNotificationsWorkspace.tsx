import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AdminNotificationsHeader,
  type NotificationCategoryFilter,
} from "@/components/admin/notifications/AdminNotificationsHeader";
import { AdminNotificationCard } from "@/components/admin/notifications/AdminNotificationCard";
import { AdminNotificationDetailModal } from "@/components/admin/notifications/AdminNotificationDetailModal";
import { NotificationsDirectoryStatus } from "@/components/admin/notifications/NotificationsDirectoryStatus";
import { useAdminNotificationsData } from "@/components/admin/notifications/useAdminNotificationsData";
import type { AdminNotificationView } from "@/lib/notifications/types";

export function AdminNotificationsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminNotificationsData(reportAuthFailure);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategoryFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingItem, setInspectingItem] = useState<AdminNotificationView | null>(null);

  const unreadCount = useMemo(
    () => data.directory.items.filter((item) => !item.isRead).length,
    [data.directory.items],
  );

  const filteredNotifications = useMemo(() => {
    return data.directory.items.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "unread" && !item.isRead) ||
        item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.directory.items, selectedCategory, searchTerm]);

  const filteredEmpty =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    data.directory.items.length > 0 &&
    filteredNotifications.length === 0;
  const showGrid =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    filteredNotifications.length > 0;

  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in pb-16"
      data-notifications-source={data.source}
    >
      <AdminNotificationsHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        unreadCount={unreadCount}
      />

      <div className="sr-only" aria-live="polite">
        {data.liveMessage}
      </div>

      <NotificationsDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
        onResetFilters={() => {
          setSelectedCategory("all");
          setSearchTerm("");
        }}
      />

      {showGrid ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredNotifications.map((notif) => (
            <AdminNotificationCard
              key={notif.id}
              notification={notif}
              onInspect={(item) => setInspectingItem(item)}
              onSelect={(item) => void data.markRead(item)}
            />
          ))}
        </div>
      ) : null}

      <AdminNotificationDetailModal
        notification={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
        onNavigate={(item) => void data.markRead(item)}
      />
    </div>
  );
}
