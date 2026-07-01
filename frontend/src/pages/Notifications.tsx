import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Inbox,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon
} from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { DataPagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiClientError,
  getAnnouncements,
  getNotifications,
  markAnnouncementRead,
  type AnnouncementRecord,
  type NotificationRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import {
  disablePushNotifications,
  enablePushNotifications,
  getCurrentPushSubscription,
  isPushSupported
} from "@/lib/pushNotifications";
import { cn } from "@/lib/utils";

type NotificationCategory = "announcement" | "dues" | "membership" | "event" | "proposal" | "feedback" | "task" | "update";
type NotificationFilter = "all" | "action" | NotificationCategory;

type NotificationMeta = {
  category: NotificationCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  toneClass: string;
};

const notificationFilters: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "action", label: "Action needed" },
  { value: "announcement", label: "Announcements" },
  { value: "dues", label: "Dues" },
  { value: "membership", label: "Membership" },
  { value: "event", label: "Events" },
  { value: "proposal", label: "Proposals" },
  { value: "feedback", label: "Feedback" }
];

const proposalRoles = new Set(["admin", "president", "advisor"]);
const feedbackReviewerRoles = new Set(["admin", "advisor", "president", "executive", "feedback_manager"]);

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load notifications right now.";
}

function getDateLabel(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

function getNotificationLabel(type: string) {
  return type.replace(/_/g, " ");
}

function getNotificationText(notification: NotificationRecord) {
  return `${notification.type} ${notification.message}`.toLowerCase();
}

function getNotificationMeta(notification: NotificationRecord): NotificationMeta {
  const text = getNotificationText(notification);

  if (notification.announcement_id || text.includes("announcement")) {
    return {
      category: "announcement",
      label: "Announcement",
      description: "Club or campus update",
      icon: Megaphone,
      toneClass: "bg-amber-100 text-amber-900"
    };
  }

  if (/\b(dues|payment|proof|receipt|verification)\b/.test(text)) {
    return {
      category: "dues",
      label: "Dues proof update",
      description: "Payment or verification status",
      icon: CreditCard,
      toneClass: "bg-emerald-100 text-emerald-900"
    };
  }

  if (/\b(membership|member|join|joining|approved|rejected|activated)\b/.test(text)) {
    return {
      category: "membership",
      label: "Membership update",
      description: "Club joining status",
      icon: Users,
      toneClass: "bg-sky-100 text-sky-900"
    };
  }

  if (/\b(event|rsvp|check.?in|attendance|reminder|calendar)\b/.test(text)) {
    return {
      category: "event",
      label: "Event update",
      description: "RSVP, reminder, or check-in",
      icon: CalendarDays,
      toneClass: "bg-violet-100 text-violet-900"
    };
  }

  if (/\b(proposal|advisor|review|approval|reject|report)\b/.test(text) || notification.proposal_id) {
    return {
      category: "proposal",
      label: "Proposal update",
      description: "Review or event proposal status",
      icon: FileText,
      toneClass: "bg-orange-100 text-orange-900"
    };
  }

  if (text.includes("feedback")) {
    return {
      category: "feedback",
      label: "Feedback update",
      description: "Club Services feedback",
      icon: MessageSquare,
      toneClass: "bg-fuchsia-100 text-fuchsia-900"
    };
  }

  if (text.includes("task")) {
    return {
      category: "task",
      label: "Task update",
      description: "Assigned club work",
      icon: CheckCircle2,
      toneClass: "bg-lime-100 text-lime-900"
    };
  }

  return {
    category: "update",
    label: getNotificationLabel(notification.type),
    description: "Account update",
    icon: Bell,
    toneClass: "bg-accent text-accent-foreground"
  };
}

function getDeliveryLabel(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("unread")) return "Unread";
  if (normalized.includes("read") || normalized.includes("seen")) return "Read";
  if (normalized.includes("fail") || normalized.includes("error")) return "Failed";
  if (normalized.includes("sent") || normalized.includes("deliver") || normalized.includes("success")) return "Delivered";
  if (normalized.includes("pending") || normalized.includes("queued")) return "Queued";

  return getNotificationLabel(status);
}

function hasReadState(notification: NotificationRecord) {
  const status = notification.delivery_status.toLowerCase();
  return status.includes("read") || status.includes("seen");
}

function isUnreadNotification(notification: NotificationRecord) {
  const status = notification.delivery_status.toLowerCase();
  return status.includes("unread") || status.includes("pending") || status.includes("queued");
}

function isActionNeeded(notification: NotificationRecord) {
  const text = getNotificationText(notification);
  return (
    /\b(upload|reupload|required|rejected|failed|action|complete|pending|verify|review|approve|check.?in|rsvp)\b/.test(text) ||
    ["pending", "queued", "failed"].some((status) => notification.delivery_status.toLowerCase().includes(status))
  );
}

function canOpenProposal(role: string | null) {
  return role ? proposalRoles.has(role) : false;
}

function canOpenFeedback(role: string | null) {
  return role ? feedbackReviewerRoles.has(role) : false;
}

function getNotificationLink(notification: NotificationRecord, role: string | null, meta: NotificationMeta) {
  if (meta.category === "announcement") {
    return "/communications";
  }

  if (meta.category === "dues" || meta.category === "membership") {
    return role === "admin" && meta.category === "dues" ? "/dues" : "/membership";
  }

  if (meta.category === "event") {
    return "/events";
  }

  if (meta.category === "proposal" && notification.proposal_id && canOpenProposal(role)) {
    return `/proposals/${notification.proposal_id}`;
  }

  if (meta.category === "feedback") {
    return canOpenFeedback(role) ? "/feedback" : "/feedback";
  }

  if (meta.category === "task" && role !== "student") {
    return "/tasks";
  }

  return "/notifications";
}

function isVisibleForRole(notification: NotificationRecord, role: string | null, meta: NotificationMeta) {
  if (role !== "student") {
    return true;
  }

  return !["proposal", "task"].includes(meta.category);
}

function getFilteredEmptyMessage(filter: NotificationFilter) {
  if (filter === "action") {
    return "Nothing needs your attention right now.";
  }

  if (filter === "announcement") {
    return "New club announcements will appear here.";
  }

  if (filter === "dues") {
    return "Dues proof updates will appear here after you join a club that requires dues.";
  }

  if (filter === "membership") {
    return "Membership approval and joining updates will appear here.";
  }

  if (filter === "event") {
    return "Event reminders, RSVP updates, and check-in alerts will appear here.";
  }

  if (filter === "proposal") {
    return "Proposal updates for your role will appear here.";
  }

  if (filter === "feedback") {
    return "Feedback updates will appear here when they are available.";
  }

  return "Important workflow and announcement updates will appear here.";
}

function getAnnouncementPriorityClass(priority: AnnouncementRecord["priority"]) {
  if (priority === "urgent") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "high") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (priority === "low") {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function Notifications() {
  useUsageTracking("notifications_view");
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const { data: notificationsPage = emptyPaginatedResponse<NotificationRecord>(), isLoading, isError, error } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotifications({ page, page_size: DEFAULT_PAGE_SIZE }),
    retry: false
  });
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: isLoadingAnnouncements,
    isError: isAnnouncementsError
  } = useQuery({
    queryKey: ["notifications", "announcement-preview"],
    queryFn: () => getAnnouncements({ page: 1, page_size: 5 }),
    retry: false
  });
  const notifications = useMemo(
    () =>
      notificationsPage.items
        .map((notification) => ({
          notification,
          meta: getNotificationMeta(notification)
        }))
        .filter(({ notification, meta }) => isVisibleForRole(notification, role, meta)),
    [notificationsPage.items, role]
  );
  const filteredNotifications = useMemo(
    () =>
      notifications.filter(({ notification, meta }) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "action") return isActionNeeded(notification);
        return meta.category === activeFilter;
      }),
    [activeFilter, notifications]
  );
  const supportsReadLabels = notifications.some(({ notification }) => hasReadState(notification));
  const unreadCount = supportsReadLabels
    ? notifications.filter(({ notification }) => isUnreadNotification(notification)).length
    : announcementsPage.items.filter((announcement) => !announcement.is_read).length;
  const actionCount = notifications.filter(({ notification }) => isActionNeeded(notification)).length;
  const announcementCount = notifications.filter(({ meta }) => meta.category === "announcement").length;
  const eventCount = notifications.filter(({ meta }) => meta.category === "event").length;
  const enablePushMutation = useMutation({
    mutationFn: enablePushNotifications,
    onSuccess: () => {
      setPushEnabled(true);
      actionSuccess("Browser alerts enabled", "This browser can now receive optional Club Services device alerts.");
    },
    onError: (mutationError) => {
      actionError("Could not enable notifications", mutationError, getErrorMessage(mutationError));
    }
  });
  const disablePushMutation = useMutation({
    mutationFn: disablePushNotifications,
    onSuccess: () => {
      setPushEnabled(false);
      actionSuccess("Browser alerts disabled", "This browser will no longer receive optional device alerts.");
    },
    onError: (mutationError) => {
      actionError("Could not disable notifications", mutationError, getErrorMessage(mutationError));
    }
  });
  const markAnnouncementReadMutation = useMutation({
    mutationFn: (announcementId: string) => markAnnouncementRead(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (mutationError) => {
      actionError("Could not mark announcement as read", mutationError, getErrorMessage(mutationError));
    }
  });

  useEffect(() => {
    let isMounted = true;

    if (!isPushSupported()) {
      setPushSupported(false);
      setPushEnabled(false);
      return;
    }

    getCurrentPushSubscription()
      .then((subscription) => {
        if (isMounted) {
          setPushEnabled(Boolean(subscription));
        }
      })
      .catch(() => {
        if (isMounted) {
          setPushEnabled(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Inbox"
        title="Notification Center"
        description={
          role === "student"
            ? "Club updates, dues status, events, and announcements relevant to you."
            : "Workflow updates filtered to the actions and clubs your role can access."
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
              {pushEnabled ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold">Optional browser/device alerts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pushSupported
                  ? pushEnabled
                    ? "Enabled on this device. These are not SMS or WhatsApp messages."
                    : "Enable optional browser/device alerts for important Club Services updates. These are not SMS or WhatsApp messages."
                  : "This browser does not support web push notifications. You will still receive in-app updates."}
              </p>
            </div>
          </div>
          {pushSupported ? (
            <Button
              type="button"
              variant={pushEnabled ? "outline" : "default"}
              onClick={() => {
                if (pushEnabled) {
                  disablePushMutation.mutate();
                  return;
                }

                enablePushMutation.mutate();
              }}
              disabled={enablePushMutation.isPending || disablePushMutation.isPending}
            >
              {pushEnabled ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disable on this device
                </>
              ) : (
                <>
                  <BellRing className="mr-2 h-4 w-4" />
                  Enable on this device
                </>
              )}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{notifications.length}</p>
              <p className="text-xs text-muted-foreground">Relevant updates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">{supportsReadLabels ? "Unread" : "Unread announcements"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-warning text-warning-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{actionCount}</p>
              <p className="text-xs text-muted-foreground">Need action</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{eventCount}</p>
              <p className="text-xs text-muted-foreground">Event updates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <NeoLoadingState title="Loading notifications" message="We are getting your latest updates." />
      ) : isError ? (
        <NeoStateCard icon={Bell} title="Unable to load notifications" message={getErrorMessage(error)} tone="danger" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {notificationFilters
                .filter((filter) => filter.value !== "proposal" || role !== "student")
                .map((filter) => {
                  const count =
                    filter.value === "all"
                      ? notifications.length
                      : filter.value === "action"
                        ? actionCount
                        : filter.value === "announcement"
                          ? announcementCount
                          : notifications.filter(({ meta }) => meta.category === filter.value).length;

                  return (
                    <Button
                      key={filter.value}
                      type="button"
                      size="sm"
                      variant={activeFilter === filter.value ? "default" : "outline"}
                      onClick={() => setActiveFilter(filter.value)}
                    >
                      {filter.label}
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
            </div>

            {filteredNotifications.length === 0 ? (
              <NeoStateCard
                icon={Bell}
                title={activeFilter === "all" ? "No notifications yet" : "Nothing in this view"}
                message={getFilteredEmptyMessage(activeFilter)}
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(({ notification, meta }) => {
                  const Icon = meta.icon;
                  const target = getNotificationLink(notification, role, meta);
                  const isLinked = target !== "/notifications";
                  const deliveryLabel = getDeliveryLabel(notification.delivery_status);
                  const needsAction = isActionNeeded(notification);

                  const card = (
                    <Card className={cn("transition hover:-translate-y-0.5", needsAction && "border-primary bg-primary/5")}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground", meta.toneClass)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium capitalize">{meta.label}</p>
                                {needsAction ? <Badge>Action needed</Badge> : null}
                                <Badge variant="outline" className="capitalize">
                                  {deliveryLabel}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                              <p className="mt-2 text-xs text-muted-foreground">{meta.description}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                            <p className="whitespace-nowrap text-xs text-muted-foreground">
                              {getDateLabel(notification.created_at)}
                            </p>
                            {isLinked ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );

                  return isLinked ? (
                    <Link key={notification.id} to={target} className="block">
                      {card}
                    </Link>
                  ) : (
                    <div key={notification.id}>{card}</div>
                  );
                })}
              </div>
            )}

            {filteredNotifications.length > 0 ? (
              <DataPagination
                page={notificationsPage.page}
                pageSize={notificationsPage.page_size}
                total={notificationsPage.total}
                hasNext={notificationsPage.has_next}
                onPageChange={setPage}
              />
            ) : null}
          </div>

          <Card className="h-fit">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black">Latest announcements</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recent club and role updates your account can see.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/communications">Open</Link>
                </Button>
              </div>

              {isLoadingAnnouncements ? (
                <NeoLoadingState title="Loading announcements" message="Checking recent club updates." compact />
              ) : isAnnouncementsError ? (
                <p className="text-sm text-destructive">Unable to load announcements right now.</p>
              ) : announcementsPage.items.length === 0 ? (
                <div className="nh-empty">
                  <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No announcements yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updates from clubs and Club Services will show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcementsPage.items.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={cn("nh-list-card", announcement.is_read ? "bg-card" : "border-primary bg-primary/5")}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{announcement.title}</p>
                        {!announcement.is_read ? <Badge>Unread</Badge> : null}
                        <Badge variant="outline" className={getAnnouncementPriorityClass(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{announcement.message}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">{getDateLabel(announcement.created_at)}</p>
                        {!announcement.is_read ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => markAnnouncementReadMutation.mutate(announcement.id)}
                            disabled={markAnnouncementReadMutation.isPending}
                          >
                            Mark read
                          </Button>
                        ) : (
                          <Badge variant="secondary">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Read
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
