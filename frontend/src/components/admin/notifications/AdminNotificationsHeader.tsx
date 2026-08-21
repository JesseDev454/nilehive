import { Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type AdminNotificationCategory } from "@/data/adminNotificationsData";

export type NotificationCategoryFilter = "all" | "unread" | AdminNotificationCategory;

interface AdminNotificationsHeaderProps {
  selectedCategory: NotificationCategoryFilter;
  onCategoryChange: (category: NotificationCategoryFilter) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  unreadCount: number;
}

export function AdminNotificationsHeader({
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  unreadCount
}: AdminNotificationsHeaderProps) {
  const categoryFilters: Array<{ id: NotificationCategoryFilter; label: string }> = [
    { id: "all", label: "All Notifications" },
    { id: "unread", label: "Unread" },
    { id: "proposal", label: "Proposals" },
    { id: "join_request", label: "Join Requests" },
    { id: "dues_proof", label: "Dues Proofs" },
    { id: "event", label: "Campus Events" },
    { id: "announcement", label: "Broadcasts" },
    { id: "system", label: "System Alerts" }
  ];

  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Directorate Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Review administrative submission alerts, club requests, and event updates. Selecting an item opens the related record for review.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1" role="tablist" aria-label="Notification category">
        {categoryFilters.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onCategoryChange(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-180 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs scale-[1.01]"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search notifications"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>
      </div>
    </div>
  );
}
