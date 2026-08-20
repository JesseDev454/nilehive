import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Layers,
  Megaphone,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";

export type NotificationType = "dues" | "membership" | "event" | "announcement" | "system";

export interface StudentNotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  sourceClub?: string;
  clubCode?: string;
  isActionRequired?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: {
    referenceCode?: string;
    amount?: number;
    venue?: string;
    date?: string;
  };
}

const INITIAL_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: "notif-01",
    type: "event",
    title: "Event Today: Google Cloud & Flutter Bootcamp",
    message: "The hands-on workshop is scheduled for 2:00 PM today in Computer Lab 4. Self-check-in opens 15 minutes before start.",
    timestamp: "1 hour ago",
    sourceClub: "Nile Google Developers",
    clubCode: "NGD",
    isActionRequired: true,
    actionLabel: "Open QR Check-In",
    actionUrl: "/check-in",
    isRead: false,
    metadata: {
      venue: "Engineering Complex, Lab 4",
      date: "Today at 2:00 PM"
    }
  },
  {
    id: "notif-02",
    type: "dues",
    title: "Payment Proof Verified: Nile Google Developers",
    message: "Your session dues proof (₦10,000) has been cleared by Nile Student Affairs Treasury Desk. You are in good standing.",
    timestamp: "Yesterday at 4:10 PM",
    sourceClub: "Nile Google Developers",
    clubCode: "NGD",
    isActionRequired: false,
    actionLabel: "View Dues Record",
    actionUrl: "/dues",
    isRead: false,
    metadata: {
      referenceCode: "TXN-NGD-2025-0814",
      amount: 10000
    }
  },
  {
    id: "notif-03",
    type: "dues",
    title: "Action Required: Re-upload Proof for Nile Debate Club",
    message: "Your uploaded bank receipt was blurred. Please re-upload a clear Providus Bank transaction slip to complete membership.",
    timestamp: "2 days ago",
    sourceClub: "Nile Debate Club",
    clubCode: "NDC",
    isActionRequired: true,
    actionLabel: "Resubmit Bank Proof",
    actionUrl: "/dues",
    isRead: false,
    metadata: {
      referenceCode: "TXN-NDC-77210",
      amount: 10000
    }
  },
  {
    id: "notif-04",
    type: "membership",
    title: "Join Application Received: Women in Tech Club",
    message: "Your membership request and proof reference (TXN-WIT-2025-9941) are in the Nile Accounting review queue.",
    timestamp: "3 days ago",
    sourceClub: "Women in Tech Club",
    clubCode: "WIT",
    isActionRequired: false,
    actionLabel: "Track Application",
    actionUrl: "/membership?tab=my-clubs",
    isRead: true,
    metadata: {
      referenceCode: "TXN-WIT-2025-9941",
      amount: 10000
    }
  },
  {
    id: "notif-05",
    type: "announcement",
    title: "New Bulletin: DevFest 2025 Speaker Call",
    message: "Proposals for 15-minute lightning talks on Web, Cloud, AI, and Flutter are now open for student submissions.",
    timestamp: "Nov 12, 2025",
    sourceClub: "Nile Google Developers",
    clubCode: "NGD",
    isActionRequired: false,
    actionLabel: "Read Announcement",
    actionUrl: "/communications",
    isRead: true
  }
];

export function StudentNotificationsWorkspace() {
  const { profile } = useAuth();
  const studentId = profile?.student_id || "2021/0458";

  const [notifications, setNotifications] = useState<StudentNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<"all" | "action" | "dues" | "event" | "membership">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifForDetail, setSelectedNotifForDetail] = useState<StudentNotificationItem | null>(null);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab Filter
      if (activeFilter === "action" && !item.isActionRequired) return false;
      if (activeFilter === "dues" && item.type !== "dues") return false;
      if (activeFilter === "event" && item.type !== "event") return false;
      if (activeFilter === "membership" && item.type !== "membership") return false;

      // Text Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q === "") return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        (item.sourceClub && item.sourceClub.toLowerCase().includes(q)) ||
        (item.clubCode && item.clubCode.toLowerCase().includes(q)) ||
        (item.metadata?.referenceCode && item.metadata.referenceCode.toLowerCase().includes(q))
      );
    });
  }, [notifications, activeFilter, searchQuery]);

  // Action Count
  const actionCount = useMemo(() => {
    return notifications.filter((n) => n.isActionRequired).length;
  }, [notifications]);

  // Get icon for notification type
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "dues":
        return CreditCard;
      case "event":
        return CalendarDays;
      case "membership":
        return UserCheck;
      case "announcement":
        return Megaphone;
      default:
        return Bell;
    }
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="notifications-heading">
      {/* Header & Visual Cue (Strictly NO mark-all-read) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-notifications-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/NOTIFICATIONS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Direct Activity Feed &bull; {studentId}
            </span>
          </div>
          <h1 id="notifications-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Personal Notification Feed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Real-time status updates on your club dues clearances, event check-in reminders, and membership applications.
          </p>
        </div>

        {/* Back to More or Status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {actionCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-xl px-2.5 py-1.5 border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5" />
              {actionCount} Action{actionCount > 1 ? "s" : ""} Needed
            </span>
          )}

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/student/more">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              More
            </Link>
          </Button>
        </div>
      </header>

      {/* FILTER & SEARCH CONTROLS */}
      <section aria-label="Notification filters" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("action")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === "action"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Action Needed</span>
              {actionCount > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                  {actionCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("dues")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "dues"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dues &amp; Clearances
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("event")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "event"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Events &amp; Check-In
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("membership")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "membership"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Membership
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* NOTIFICATION FEED CARDS */}
      <section aria-label="Student notifications list" className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const Icon = getTypeIcon(notif.type);
            const isAction = notif.isActionRequired;

            return (
              <Card
                key={notif.id}
                hoverable
                className={`border-border/80 text-left transition-all ${
                  isAction
                    ? "border-amber-500/40 bg-amber-500/3 dark:bg-amber-500/5"
                    : "bg-card/70"
                }`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Icon & Message Block */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isAction
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {notif.clubCode && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                            {notif.clubCode}
                          </span>
                        )}

                        <span className="font-bold text-xs text-foreground">
                          {notif.title}
                        </span>

                        {isAction ? (
                          <StatusBadge variant="warning" dot label="Action Required" />
                        ) : (
                          <StatusBadge variant="neutral" label="Information" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Metadata Chips if present */}
                      {notif.metadata && (
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5 flex-wrap">
                          {notif.metadata.referenceCode && (
                            <span>Ref: <strong className="font-mono text-foreground">{notif.metadata.referenceCode}</strong></span>
                          )}
                          {notif.metadata.amount && (
                            <span>Amount: <strong className="text-foreground">₦{notif.metadata.amount.toLocaleString()}</strong></span>
                          )}
                          {notif.metadata.venue && (
                            <span>Venue: <strong className="text-foreground">{notif.metadata.venue}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <span className="text-[11px] text-muted-foreground">
                      {notif.timestamp}
                    </span>

                    {notif.actionUrl && (
                      <Button asChild size="sm" variant={isAction ? "default" : "outline"} className="text-xs gap-1 font-semibold">
                        <Link to={notif.actionUrl}>
                          <span>{notif.actionLabel || "View Details"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          /* EMPTY STATE */
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
              <BellOff className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No notifications found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You have no active notifications matching this filter. New activity alerts will appear here automatically.
              </p>
            </div>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs mt-2"
              >
                Show All Notifications
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Institutional Privacy & SSO Notice */}
      <footer className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>Authenticated via Nile University Campus One SSO &bull; Single-user private feed</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
          Nile ID: {studentId}
        </span>
      </footer>
    </main>
  );
}
