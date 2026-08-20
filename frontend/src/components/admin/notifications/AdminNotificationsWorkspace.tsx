import { useState, useMemo } from "react";
import {
  INITIAL_ADMIN_NOTIFICATIONS,
  type AdminNotificationRecord
} from "@/data/adminNotificationsData";
import {
  AdminNotificationsHeader,
  type NotificationCategoryFilter
} from "@/components/admin/notifications/AdminNotificationsHeader";
import { AdminNotificationCard } from "@/components/admin/notifications/AdminNotificationCard";
import { AdminNotificationDetailModal } from "@/components/admin/notifications/AdminNotificationDetailModal";
import { BellOff, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminNotificationsWorkspace() {
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>(
    INITIAL_ADMIN_NOTIFICATIONS
  );
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategoryFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingItem, setInspectingItem] = useState<AdminNotificationRecord | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [notifications, selectedCategory, searchTerm]);

  const markAsRead = (item: AdminNotificationRecord) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in pb-16">
      {/* Header & Filter Controls */}
      <AdminNotificationsHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        unreadCount={unreadCount}
      />

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No notifications found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are no notifications matching your current category filter or search query.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
            }}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredNotifications.map((notif) => (
            <AdminNotificationCard
              key={notif.id}
              notification={notif}
              onInspect={(item) => setInspectingItem(item)}
              onSelect={(item) => markAsRead(item)}
            />
          ))}
        </div>
      )}

      {/* Inspection Modal */}
      <AdminNotificationDetailModal
        notification={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
        onNavigate={(item) => markAsRead(item)}
      />
    </div>
  );
}
