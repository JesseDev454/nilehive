import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  School,
  ShieldCheck,
  RotateCw,
  X,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  WifiOff,
  Sparkles,
  Inbox,
  Info
} from "lucide-react";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { AdvisorNotificationCard } from "./AdvisorNotificationCard";
import { AdvisorNotificationDetailSheet } from "./AdvisorNotificationDetailSheet";
import {
  INITIAL_ADVISOR_NOTIFICATIONS,
  ADVISOR_NOTIFICATION_FILTER_TABS,
  AdvisorNotificationRecord,
  AdvisorNotificationCategory
} from "./advisorNotificationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/shared/components/TextField";
import { Skeleton } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { toast } from "sonner";

const ASSIGNED_CLUBS = [
  { id: "club-8", name: "Nile Google Developers", code: "NGD" },
  { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
  { id: "club-11", name: "Nile Startup Campus", code: "NSC" }
];

export function AdvisorNotificationsWorkspace() {
  const [notifications, setNotifications] = useState<AdvisorNotificationRecord[]>(
    () => INITIAL_ADVISOR_NOTIFICATIONS
  );
  const [activeCategory, setActiveCategory] = useState<AdvisorNotificationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<AdvisorNotificationRecord | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Compute unread and pending counts for Advisor
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const actionNeededCount = useMemo(
    () => notifications.filter((n) => n.isActionRequired && !n.isRead).length,
    [notifications]
  );

  // Filter and search logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (activeCategory === "action" && !item.isActionRequired) {
        return false;
      }
      if (
        activeCategory !== "all" &&
        activeCategory !== "action" &&
        item.category !== activeCategory
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesSender = item.sender.toLowerCase().includes(q);
        const matchesClub = (item.clubCode || "").toLowerCase().includes(q);
        const matchesRef = (item.metadata?.referenceId || "").toLowerCase().includes(q);
        return matchesTitle || matchesSummary || matchesSender || matchesClub || matchesRef;
      }

      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  // Handle individual notification selection & auto-marking as read
  const handleSelectNotification = (notification: AdvisorNotificationRecord) => {
    setSelectedNotification(notification);
    setIsDetailSheetOpen(true);

    // Auto mark individual notification as read on inspection
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }
  };

  // Toggle read state for single item (No mark-all-read)
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.isRead;
          if (nextState) {
            toast.success("Notification marked as read");
          } else {
            toast.info("Notification marked as unread");
          }
          return { ...n, isRead: nextState };
        }
        return n;
      })
    );

    // Update selected item in sheet if open
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification((prev) => (prev ? { ...prev, isRead: !prev.isRead } : null));
    }
  };

  // Simulate background refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date());
      toast.success("Alert feed synchronized with Campus One server.");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      {/* Advisor Role Header */}
      <AdvisorRoleHeader
        title="Advisor Notification Feed"
        subtitle="See proposal updates and post-event reports for your assigned clubs."
        pendingCount={actionNeededCount}
        assignedClubs={ASSIGNED_CLUBS}
      />

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You are currently offline. Showing cached notification alerts.</span>
        </div>
      )}

      {/* Top Metrics & Sync Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-border/80 bg-card">
          <CardContent className="p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Alerts
            </span>
            <p className="text-xl sm:text-2xl font-black text-foreground font-display">
              {notifications.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Unread
            </span>
            <p className="text-xl sm:text-2xl font-black text-primary font-display">
              {unreadCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card">
          <CardContent className="p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Action Required
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-display">
              {actionNeededCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card flex flex-col justify-center p-3.5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                Sync Status
              </span>
              <span className="text-[11px] text-muted-foreground truncate block">
                {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 shrink-0"
              title="Refresh alerts feed"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search alerts by title, sender, club code (NGD, NCIC, NSC), or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm bg-card border border-border/80 rounded-xl focus:outline-hidden focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {ADVISOR_NOTIFICATION_FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            let count = 0;
            if (tab.id === "all") count = notifications.length;
            else if (tab.id === "action") count = notifications.filter((n) => n.isActionRequired).length;
            else count = notifications.filter((n) => n.category === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-card/60">
            <CardContent className="p-8 sm:p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/80 text-muted-foreground mx-auto flex items-center justify-center">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">No alerts matching filter</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? `No notification transmissions found containing "${searchQuery}".`
                    : `There are currently no alerts in the "${activeCategory}" filter category.`}
                </p>
              </div>

              {(searchQuery || activeCategory !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="text-xs mt-2"
                >
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notification) => (
              <AdvisorNotificationCard
                key={notification.id}
                notification={notification}
                onSelect={handleSelectNotification}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Institutional Delivery Notice */}
      <div className="p-4 rounded-2xl border border-border/70 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>
            Staff notifications are delivered via <strong>Campus One SSO</strong> and faculty email: <strong>kalu.okonkwo@nileuniversity.edu.ng</strong>
          </span>
        </div>

        <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-medium shrink-0 h-auto p-0 hover:underline">
          <Link to="/advisor/more">Notification Boundaries &rarr;</Link>
        </Button>
      </div>

      {/* Record Details Sheet */}
      <AdvisorNotificationDetailSheet
        notification={selectedNotification}
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setSelectedNotification(null);
        }}
        onToggleRead={handleToggleRead}
      />
    </div>
  );
}
