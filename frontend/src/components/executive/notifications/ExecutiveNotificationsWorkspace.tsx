import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Filter,
  Info,
  Layers,
  Mail,
  Megaphone,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  User,
  WifiOff,
  X
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";
import { Banner } from "@/shared/components/Banner";
import {
  NotificationDetailSheet,
  type ExecutiveNotificationItem
} from "./NotificationDetailSheet";
import {
  NotificationFilterBar,
  type NotificationCategoryFilter
} from "./NotificationFilterBar";

export const INITIAL_EXECUTIVE_NOTIFICATIONS: ExecutiveNotificationItem[] = [
  {
    id: "notif-01",
    category: "task",
    priority: "Urgent",
    title: "Action Item Assigned: Lab 2 Audio/Visual Setup & HDMI Matrix",
    summary: "President Tariq Ibrahim assigned you to finalize venue HDMI splitters and wireless microphones.",
    details: "President Tariq Ibrahim assigned you to inspect dual HDMI splitters, test wireless roving lapels, and ensure the podium switcher is operational for Nile DevFest 2025. Please coordinate with ICT technician Mr. Bello before 11:00 AM.",
    sender: {
      name: "Tariq Ibrahim",
      role: "Club President",
      email: "tariq.ibrahim@nileuniversity.edu.ng"
    },
    timestamp: "10 mins ago",
    isRead: false,
    relatedRecord: {
      type: "task",
      title: "Finalize Venue Audio/Visual Rig (Lab 2)",
      link: "/executive/work",
      actionLabel: "Open Assigned Action Item"
    }
  },
  {
    id: "notif-02",
    category: "event",
    priority: "Normal",
    title: "Venue Confirmed: Nile DevFest 2025 in Auditorium 1",
    summary: "The Main Campus Auditorium 1 venue request has been approved.",
    details: "The Main Campus Auditorium 1 venue is confirmed. Venue access opens at 7:30 AM on event day for executive booth staging.",
    sender: {
      name: "Oluwaseun Adeleke",
      role: "Logistics & Treasury Officer",
      email: "oluwaseun.adeleke@nileuniversity.edu.ng"
    },
    timestamp: "2 hours ago",
    isRead: false,
    relatedRecord: {
      type: "event",
      title: "Nile DevFest 2025 Main Hall Logistics",
      link: "/executive/events",
      actionLabel: "View Event Schedule"
    }
  },
  {
    id: "notif-03",
    category: "directive",
    priority: "Normal",
    title: "Presidential Directive: Google Cloud Voucher Allocation Criteria",
    summary: "Guidelines ratified for dispersing 100 Google Cloud Skills Boost credits to members.",
    details: "Presidential Directive #2025-08: The 100 Google Cloud Skills Boost voucher codes will be prioritized for students with 80%+ workshop attendance and registered participants of the upcoming Android Bootcamp.",
    sender: {
      name: "Tariq Ibrahim",
      role: "Club President",
      email: "tariq.ibrahim@nileuniversity.edu.ng"
    },
    timestamp: "Yesterday",
    isRead: true,
    relatedRecord: {
      type: "club",
      title: "Google Cloud TechSprint Allotment Roster",
      link: "/executive/club",
      actionLabel: "View Club Bulletins"
    }
  },
  {
    id: "notif-04",
    category: "institutional",
    priority: "Info",
    title: "2025/2026 Academic Session Accreditation Ratified",
    summary: "The club's active status is confirmed for the 2025/2026 academic session.",
    details: "Annual governance compliance review finalized with zero audit flags. Nile Google Developers maintains Tier 1 Accredited Society status for the current academic session with full room booking and grant clearance.",
    sender: {
      name: "Dr. Aminu Galadima",
      role: "Senior Faculty Advisor",
      email: "aminu.galadima@nileuniversity.edu.ng"
    },
    timestamp: "Aug 18, 2025",
    isRead: true,
    relatedRecord: {
      type: "club",
      title: "Constitution & Operational Bylaws (Rev 4.2)",
      link: "/executive/club",
      actionLabel: "View Ratified Charter"
    }
  },
  {
    id: "notif-05",
    category: "task",
    priority: "Normal",
    title: "Progress Update Requested: Android Jetpack Compose Lab Pack",
    summary: "Tech Lead requested status verification for starter code repos and attendee slide decks.",
    details: "Please ensure the starter GitHub repository branch is pushed and the Jetpack Compose codelab handout PDF is reviewed prior to Thursday's dry run.",
    sender: {
      name: "Zainab Mukhtar",
      role: "Vice President & Tech Lead",
      email: "zainab.mukhtar@nileuniversity.edu.ng"
    },
    timestamp: "Aug 15, 2025",
    isRead: true,
    relatedRecord: {
      type: "task",
      title: "Android Jetpack Compose Workshop Lab Prep",
      link: "/executive/work",
      actionLabel: "Open Task Details"
    }
  }
];

export function ExecutiveNotificationsWorkspace() {
  const executiveName = "Fatima Al-Hassan";
  const executiveRole = "Workshops Coordinator";
  const clubName = "Nile Google Developers";

  const notifications = INITIAL_EXECUTIVE_NOTIFICATIONS;
  const [activeFilter, setActiveFilter] = useState<NotificationCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<ExecutiveNotificationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Notification feed synchronized with club dispatch server.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 450);
  };

  const handleOpenNotification = (item: ExecutiveNotificationItem) => {
    setSelectedNotification(item);
  };

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      task: notifications.filter((n) => n.category === "task").length,
      event: notifications.filter((n) => n.category === "event").length,
      directive: notifications.filter((n) => n.category === "directive").length,
      institutional: notifications.filter((n) => n.category === "institutional").length
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category / unread filter
      let matchesCategory = true;
      if (activeFilter === "unread") {
        matchesCategory = !item.isRead;
      } else if (activeFilter !== "all") {
        matchesCategory = item.category === activeFilter;
      }

      // Search filter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sender.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [notifications, activeFilter, searchQuery]);

  const getCategoryBadge = (category: ExecutiveNotificationItem["category"]) => {
    switch (category) {
      case "task":
        return { label: "Action Task", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20" };
      case "event":
        return { label: "Event Alert", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" };
      case "directive":
        return { label: "Directive", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" };
      case "institutional":
        return { label: "Institutional", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" };
    }
  };

  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-notifications-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-notifications-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/NOTIFICATIONS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border/60 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {executiveName} &bull; {executiveRole}
            </span>
            {counts.unread > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {counts.unread} Unread
              </span>
            )}
          </div>

          <h1
            id="executive-notifications-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            Personal Executive Notifications
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Task dispatches, presidential directives, event logistics notices, and institutional compliance alerts for {clubName}.
          </p>
        </div>

        {/* Sync Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold gap-1.5 h-8.5 px-3"
            aria-label="Refresh notification feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Sync Alerts</span>
          </Button>

          <Button asChild size="sm" variant="outline" className="text-xs font-bold gap-1.5 h-8.5 bg-card hover:bg-muted">
            <Link to="/executive/work">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Assigned Work</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* OFFLINE STATUS NOTIFICATION */}
      {isOffline && (
        <Banner
          variant="warning"
          title="Offline Mode"
          description="Displaying cached notification dispatches from your previous session."
        />
      )}

      {/* FEEDBACK BANNER */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Notice"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* PRIVACY & AUDIT NOTICE */}
      <div className="rounded-2xl border border-border/80 bg-muted/25 p-3.5 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-foreground text-xs">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Role-Scoped Officer Notification Log</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11px]">
          Notifications in this view are routed specifically to you as Workshops Coordinator. Directives and task updates logged here reflect formal Nile University student society governance records.
        </p>
      </div>

      {/* CONTROLS: CATEGORY PILLS & SEARCH BAR */}
      <NotificationFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* LOADING SKELETONS */}
      {isRefreshing && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 rounded-2xl border border-border/60 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY RESULTS (NO SEARCH MATCHES) */}
      {!isRefreshing && filteredNotifications.length === 0 && (
        <Card className="border-border/80 bg-card p-10 text-center space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Bell className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Notifications Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No alerts matched "${searchQuery}" under the ${activeFilter} filter.`
              : `You have no notifications in the ${activeFilter} category.`}
          </p>
          {(searchQuery || activeFilter !== "all") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="text-xs font-semibold gap-1.5 mx-auto"
            >
              <span>Reset Filter</span>
            </Button>
          )}
        </Card>
      )}

      {/* NOTIFICATIONS LIST */}
      {!isRefreshing && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <Card
                key={item.id}
                className={`border-border/80 shadow-xs transition-all ${
                  !item.isRead
                    ? "border-primary/40 bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                    : "bg-card hover:bg-muted/20"
                }`}
              >
                <CardContent className="p-4 space-y-3 text-xs">
                  {/* Top Bar: Category, Priority, Unread dot, Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {item.priority === "Urgent" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-mono">
                          Urgent
                        </span>
                      )}
                      {!item.isRead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          Unread
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Sender & Contextual Action Bar */}
                  <div className="pt-2.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <User className="h-3 w-3 text-primary shrink-0" />
                      <span>
                        From: <strong className="text-foreground font-semibold">{item.sender.name}</strong> ({item.sender.role})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenNotification(item)}
                        className="text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/10 h-7.5 px-2.5 gap-1"
                        aria-label={`View dispatch details for ${item.title}`}
                      >
                        <span>View Briefing</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* NOTIFICATION DETAIL SLIDE-OVER SHEET */}
      <NotificationDetailSheet
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </main>
  );
}

export default ExecutiveNotificationsWorkspace;
