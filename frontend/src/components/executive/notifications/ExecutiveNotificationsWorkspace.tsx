import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  Filter,
  Info,
  Layers,
  MessageSquare,
  School,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Banner } from "@/shared/components/Banner";

export interface ExecutiveNotification {
  id: string;
  category: "task" | "event" | "directive" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export const INITIAL_EXECUTIVE_NOTIFICATIONS: ExecutiveNotification[] = [
  {
    id: "notif-01",
    category: "task",
    title: "New Action Item Assigned: Audio/Visual Setup",
    message: "President Tariq Ibrahim assigned you to finalize venue HDMI splitters and wireless microphones for DevFest 2025.",
    timestamp: "2 hours ago",
    isRead: false,
    actionUrl: "/tasks",
    actionLabel: "Open My Work"
  },
  {
    id: "notif-02",
    category: "event",
    title: "Event Date Confirmed: Android Jetpack Bootcamp",
    message: "The date for Android Jetpack Compose Bootcamp has been set for Wednesday, Nov 05 at Innovation Lab 2.",
    timestamp: "Yesterday",
    isRead: false,
    actionUrl: "/events",
    actionLabel: "View Event Agenda"
  },
  {
    id: "notif-03",
    category: "directive",
    title: "Presidential Directive: Lab 2 Key Checkout",
    message: "Tariq Ibrahim updated task instructions: 'Please meet Mr. Bello at ICT Lab before 11 AM to secure the AV matrix.'",
    timestamp: "2 days ago",
    isRead: true,
    actionUrl: "/tasks",
    actionLabel: "View Action Details"
  },
  {
    id: "notif-04",
    category: "system",
    title: "2025/2026 Club Accreditation Renewed",
    message: "Student Affairs confirmed Tier 1 Accredited Society status for Nile Google Developers.",
    timestamp: "4 days ago",
    isRead: true,
    actionUrl: "/clubs",
    actionLabel: "View Club Status"
  }
];

export function ExecutiveNotificationsWorkspace() {
  const [notifications, setNotifications] = useState<ExecutiveNotification[]>(
    INITIAL_EXECUTIVE_NOTIFICATIONS
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setToastMessage("All notifications marked as read.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = notifications.filter((n) => {
    if (filterCategory === "all") return true;
    return n.category === filterCategory;
  });

  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-notifications-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="executive-notifications-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/NOTIFICATIONS
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <h1
            id="executive-notifications-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            Executive Notification Alerts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Task assignments from the Club President, event schedule alerts, and administrative updates.
          </p>
        </div>

      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Updated"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* FILTER CATEGORY PILLS */}
      <div className="flex items-center gap-1.5 text-xs border-b border-border/80 pb-2">
        {[
          { id: "all", label: "All Alerts" },
          { id: "task", label: "Task Assignments" },
          { id: "event", label: "Club Events" },
          { id: "directive", label: "Directives" },
          { id: "system", label: "System" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterCategory === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card p-10 text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Bell className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Notifications</h3>
          <p className="text-xs text-muted-foreground">
            You are completely up to date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`border-border/80 shadow-xs transition-all ${
                !item.isRead ? "border-primary/40 bg-primary/5" : "bg-card"
              }`}
            >
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div>
                    {item.actionUrl && (
                      <Link
                        to={item.actionUrl}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{item.actionLabel || "Open Record"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
