import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataPagination } from "@/components/DataPagination";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { StitchPageHeader } from "@/components/StitchPageHeader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  OneClubEmptyState,
  OneClubErrorState,
  OneClubLoadingState,
  OneClubMetaChip,
  OneClubSectionHeader
} from "@/components/OneClub";
import {
  getAdminOperationsDashboard,
  getAnnouncements,
  getApprovedEvents,
  getEventEngagement,
  getEventReminders,
  getClubMembers,
  getDuePayments,
  getEventReports,
  getExecutiveDashboard,
  getFeedback,
  getUserFacingErrorMessage,
  getMyDuePayments,
  getMyMembershipRequests,
  getNotifications,
  getPresidentDashboard,
  getTasks,
  type AdminOperationsDashboardRecord,
  type AnnouncementRecord,
  type ApprovedEventRecord,
  type ClubMemberRecord,
  type DashboardActivity,
  type DashboardProposalSummary,
  type DuePaymentRecord,
  type EventReportRecord,
  type EventReminderRecord,
  type EventRsvpRecord,
  type MembershipRequestRecord,
  type NotificationRecord,
  type ProposalRecord,
  type TaskRecord
} from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle,
  ClipboardList,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Gauge,
  Inbox,
  Instagram,
  ListChecks,
  MapPin,
  MessageCircle,
  MessageSquare,
  Plus,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  School,
  Smartphone,
  TrendingUp,
  UserPlus,
  Users,
  XCircle
} from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";
import { isAttendableEvent } from "@/lib/eventLifecycle";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import { canViewProposalDetails } from "@/lib/roleAccess";
import { downloadAdminPerformanceMatrixCsv } from "@/lib/exports";
import { getStudentNextAction, type StudentNextActionKind } from "@/lib/studentActivation";
import { formatStudentGreeting, getStudentDisplayName } from "@/lib/studentDisplayName";
import { buildAppUrl, shareOrCopy } from "@/lib/share";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";

const ADMIN_HEALTH_PAGE_SIZE = 8;

function StatCard({
  title,
  value,
  icon: Icon,
  variant
}: {
  title: string;
  value: number;
  icon: ElementType;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const colors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive"
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <QuestSticker tone={variant === "success" ? "green" : variant === "destructive" ? "red" : variant === "warning" ? "blue" : "muted"}>
              {title}
            </QuestSticker>
            <p className="mt-8 text-5xl font-bold tracking-tight text-primary">{value}</p>
          </div>
          <Icon className={`h-12 w-12 ${colors[variant || "default"]} opacity-15`} />
        </div>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: unknown) {
  return getUserFacingErrorMessage(error, "We couldn't load this section. Please try again.");
}

function getDateLabel(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

function isPendingStatus(status: string) {
  return status === "pending_advisor_review" || status === "pending_admin_review";
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("en-NG").format(value ?? 0);
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

function QuestProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`h-3 overflow-hidden rounded-full bg-muted ${className}`}>
      <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

function QuestSticker({
  children,
  tone = "blue"
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "red" | "navy" | "muted";
}) {
  const toneClass = {
    blue: "border-primary/15 bg-accent text-accent-foreground",
    green: "border-secondary/15 bg-secondary/10 text-secondary",
    red: "bg-destructive/15 text-destructive",
    navy: "border-primary/15 bg-primary text-primary-foreground",
    muted: "border-border bg-muted text-muted-foreground"
  }[tone];

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${toneClass}`}>
      {children}
    </span>
  );
}

function QuestIconBadge({
  icon: Icon,
  tone = "blue"
}: {
  icon: ElementType;
  tone?: "blue" | "green" | "red" | "navy" | "muted";
}) {
  const toneClass = {
    blue: "bg-accent text-accent-foreground",
    green: "bg-secondary/10 text-secondary",
    red: "bg-destructive/15 text-destructive",
    navy: "bg-primary text-primary-foreground",
    muted: "bg-muted text-foreground"
  }[tone];

  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] shadow-soft-sm ${toneClass}`}>
      <Icon className="h-7 w-7" />
    </div>
  );
}

function ProposalListState({
  isLoading,
  isError,
  error,
  emptyMessage
}: {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  emptyMessage?: string;
}) {
  if (isLoading) {
    return <OneClubLoadingState title="Loading proposal records" message="We are checking the latest workflow state." compact />;
  }

  if (isError) {
    return <OneClubErrorState title="Unable to load proposals" message={getErrorMessage(error)} />;
  }

  return <OneClubEmptyState title="No proposals found yet" message={emptyMessage || "Proposal records will appear here once work starts."} />;
}

function ProposalSummaryList({
  proposals,
  showClub
}: {
  proposals: Array<ProposalRecord | DashboardProposalSummary>;
  showClub?: boolean;
}) {
  return (
    <div className="space-y-3">
      {proposals.slice(0, 4).map((proposal) => (
        <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="block">
          <div className="clb-list-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{proposal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {showClub
                    ? ("club_name" in proposal && proposal.club_name ? proposal.club_name : "Unknown club")
                    : `Event ${getDateLabel(proposal.event_date)}`}
                </p>
              </div>
            </div>
            <StatusBadge status={proposal.status} eventDate={proposal.event_date} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function UpcomingEventsList({
  events,
  canOpenProposal
}: {
  events: ApprovedEventRecord[];
  canOpenProposal: boolean;
}) {
  return (
    <div className="space-y-3">
      {events.slice(0, 4).map((event) => {
        const content = (
          <div className="clb-list-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CalendarDays className="h-4 w-4 text-success shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getDateLabel(event.event_date)} - {event.location || "Venue TBC"}
                </p>
              </div>
            </div>
            <StatusBadge status="approved" eventDate={event.event_date} />
          </div>
        );

        return canOpenProposal ? (
          <Link key={event.id} to={`/proposals/${event.proposal_id}`} className="block">
            {content}
          </Link>
        ) : (
          <div key={event.id}>{content}</div>
        );
      })}
    </div>
  );
}

function RecentActivityList({ activity }: { activity: DashboardActivity[] }) {
  return (
    <div className="space-y-3">
      {activity.slice(0, 5).map((item) => (
        <Link key={item.id} to={`/proposals/${item.proposal_id}`} className="block">
          <div className="clb-list-card flex items-start gap-3">
            <Activity className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PresidentActionCard({
  title,
  value,
  detail,
  icon: Icon,
  to,
  tone = "blue"
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ElementType;
  to: string;
  tone?: "blue" | "green" | "red" | "navy" | "muted";
}) {
  return (
    <Link to={to} className="block">
      <Card className="h-full transition-all hover:translate-x-1 hover:translate-y-1">
        <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <QuestIconBadge icon={Icon} tone={tone} />
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">{value}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PresidentQuickActions() {
  const actions = [
    { label: "Track Proposal Status", to: "/proposals", icon: FileText },
    { label: "Assign Tasks", to: "/tasks", icon: ClipboardList },
    { label: "Manage Members", to: "/members", icon: Users },
    { label: "Submit Event Report", to: "/archive", icon: FileText }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button key={action.label} asChild variant="outline" className="justify-start">
              <Link to={action.to}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PresidentAnnouncementsPreview({
  announcements,
  notifications,
  isLoading
}: {
  announcements: AnnouncementRecord[];
  notifications: NotificationRecord[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <OneClubLoadingState title="Loading updates" message="We are checking club announcements and notices." compact />
        ) : announcements.length === 0 && notifications.length === 0 ? (
          <OneClubEmptyState title="No recent updates yet" message="Announcements and role-specific notices will appear here." />
        ) : (
          <>
            {announcements.slice(0, 3).map((announcement) => (
              <Link key={announcement.id} to="/communications" className="block">
                <div className="clb-list-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{announcement.title}</p>
                    {!announcement.is_read ? <Badge>Unread</Badge> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.message}</p>
                </div>
              </Link>
            ))}
            {notifications.slice(0, 2).map((notification) => (
              <Link key={notification.id} to="/notifications" className="block">
                <div className="clb-list-card">
                  <p className="font-semibold capitalize">{notification.type.replace(/_/g, " ")}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </Link>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AdminActivityList({
  activity
}: {
  activity: AdminOperationsDashboardRecord["recent_activity"];
}) {
  const activityIcons: Record<string, ElementType> = {
    proposal: FileText,
    membership_request: UserPlus,
    dues: CreditCard,
    event_report: ClipboardList,
    feedback: MessageSquare,
    task: ClipboardList
  };

  return (
    <div className="relative space-y-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-0.5 before:bg-foreground">
      {activity.slice(0, 6).map((item) => (
        <div key={item.id} className="relative flex items-start gap-3 pl-10">
          <div className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
            {(() => {
              const Icon = activityIcons[item.type] || Activity;
              return <Icon className="h-4 w-4" />;
            })()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {(item.club_name || "Unknown club")} - {getDateLabel(item.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getAdminActionLink(type: string) {
  const links: Record<string, string> = {
    pending_admin_review: "/proposals?status=pending_admin_review",
    pending_advisor_review: "/proposals?status=pending_advisor_review",
    membership_requests: "/membership?status=pending",
    dues_verification: "/dues?status=submitted",
    missing_reports: "/archive",
    open_tasks: "/tasks"
  };

  return links[type] || "/";
}

function getAdminActionIcon(type: string) {
  const icons: Record<string, ElementType> = {
    pending_admin_review: FileText,
    pending_advisor_review: Clock,
    membership_requests: UserPlus,
    dues_verification: CreditCard,
    missing_reports: AlertTriangle,
    open_tasks: ClipboardList
  };

  return icons[type] || Activity;
}

function getClubInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CS";
}

function getClubPulse(club: AdminOperationsDashboardRecord["club_performance"][number]) {
  if (club.club_health_score >= 90) {
    return {
      label: club.club_health_label,
      className: "bg-success/15 text-success"
    };
  }

  if (club.club_health_score >= 75) {
    return {
      label: club.club_health_label,
      className: "bg-secondary/15 text-secondary"
    };
  }

  if (club.club_health_score >= 60) {
    return {
      label: club.club_health_label,
      className: "bg-primary/15 text-primary"
    };
  }

  if (club.club_health_score >= 40) {
    return {
      label: club.club_health_label,
      className: "bg-warning/15 text-warning"
    };
  }

  if (Number.isFinite(club.club_health_score)) {
    return {
      label: club.club_health_label,
      className: "bg-destructive/15 text-destructive"
    };
  }

  if (club.pending_proposals > 0 || club.open_tasks > 0) {
    return {
      label: "Needs attention",
      className: "bg-warning/15 text-warning"
    };
  }

  if (club.approved_events > 0 || club.active_members > 0) {
    return {
      label: "Active",
      className: "bg-success/15 text-success"
    };
  }

  return {
    label: "Quiet",
    className: "bg-muted text-muted-foreground"
  };
}

function AdminMetricCard({
  title,
  value,
  detail,
  icon: Icon,
  variant = "blue",
  to
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ElementType;
  variant?: "blue" | "green" | "gold" | "red" | "navy";
  to?: string;
}) {
  const variants = {
    blue: "bg-primary/10 text-primary",
    green: "bg-success/10 text-success",
    gold: "bg-warning/15 text-warning",
    red: "bg-destructive/10 text-destructive",
    navy: "bg-primary text-primary-foreground"
  };

  const content = (
    <Card className="min-h-[180px] overflow-hidden transition-all hover:translate-x-1 hover:translate-y-1">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <QuestSticker tone={variant === "green" ? "green" : variant === "red" ? "red" : variant === "navy" ? "navy" : "blue"}>
              {title}
            </QuestSticker>
            <p className="mt-8 text-5xl font-black tracking-[-0.06em] text-primary">{value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
          </div>
          <div className={`rounded-[18px] border border-border p-3 shadow-soft-sm ${variants[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {to ? (
          <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
            Open queue
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : content;
}

function getQueueUrgency(count: number) {
  if (count >= 10) {
    return { label: "High", tone: "red" as const };
  }

  if (count > 0) {
    return { label: "Needs review", tone: "blue" as const };
  }

  return { label: "Clear", tone: "green" as const };
}

function isQuietClub(club: AdminOperationsDashboardRecord["club_performance"][number]) {
  if (!club.last_activity_at) {
    return true;
  }

  const lastActivity = new Date(club.last_activity_at);
  if (Number.isNaN(lastActivity.getTime())) {
    return false;
  }

  const quietCutoff = new Date();
  quietCutoff.setDate(quietCutoff.getDate() - 30);
  return lastActivity < quietCutoff;
}

function AdminReviewQueueCard({
  title,
  count,
  detail,
  to,
  icon: Icon
}: {
  title: string;
  count: number;
  detail: string;
  to: string;
  icon: ElementType;
}) {
  const urgency = getQueueUrgency(count);

  return (
    <Link to={to} className="group block">
      <div className={`clb-list-card flex h-full flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${
        count > 0 ? "border-primary bg-primary/5" : "bg-card"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-background text-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </div>
          </div>
          <QuestSticker tone={urgency.tone}>{urgency.label}</QuestSticker>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-4xl font-black tracking-[-0.05em] text-primary">{formatNumber(count)}</p>
          <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function AdminTodayQueueCard({
  title,
  count,
  detail,
  actionLabel,
  to,
  icon: Icon
}: {
  title: string;
  count: number;
  detail: string;
  actionLabel: string;
  to: string;
  icon: ElementType;
}) {
  return (
    <Card className={count > 0 ? "border-primary bg-primary/5" : undefined}>
      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-background text-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight">{formatNumber(count)} {title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
        <Button asChild variant={count > 0 ? "default" : "outline"} className="w-full justify-center">
          <Link to={to}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AdminLoadingSkeleton() {
  return (
    <OneClubLoadingState
      title="Loading OneClub controls"
      message="We are preparing dashboards, queues, dues records, and club health data."
    />
  );
}

function AdminEmptyState({
  icon: Icon,
  title,
  message,
  action
}: {
  icon: ElementType;
  title: string;
  message: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="clb-empty">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-black uppercase">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function AssignedTasksProgressCard({ total, completed }: { total: number; completed: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="animate-fade-in transition-all hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary/10 text-secondary shadow-[3px_3px_0_hsl(var(--foreground))]">
            <ListChecks className="h-6 w-6" />
          </div>
          <div className="border-2 border-foreground bg-success/15 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-success">
            Active
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Assigned Tasks</p>
        <h3 className="mt-1 text-2xl font-bold text-primary">
          {completed} <span className="text-sm font-normal text-muted-foreground">/ {total}</span>
        </h3>
        <div className="mt-4 h-1.5 w-full overflow-hidden border border-foreground bg-secondary/15">
          <div className="h-full bg-secondary transition-all duration-500 ease-in-out" style={{ width: `${percentage}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

function PendingTasksCard({ value }: { value: number }) {
  return (
    <Card className="animate-fade-in transition-all hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-warning/15 text-warning shadow-[3px_3px_0_hsl(var(--foreground))]">
            <Clock className="h-6 w-6" />
          </div>
          <div className="border-2 border-foreground bg-warning/15 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-warning">
            Open
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
        <h3 className="mt-1 text-2xl font-bold text-primary">{value}</h3>
        <div className="mt-auto pt-4">
          <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Awaiting action
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InProgressTasksCard({ total, inProgress }: { total: number; inProgress: number }) {
  const percentage = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  return (
    <Card className="h-full animate-fade-in transition-all hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10 text-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">In Progress</p>
          <h3 className="mt-1 text-2xl font-bold text-primary">{percentage}%</h3>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden border border-foreground bg-primary/10">
          <div className="h-full bg-primary transition-all duration-500 ease-in-out" style={{ width: `${percentage}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

function CompletedTasksProgressCard({ total, completed }: { total: number; completed: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="h-full animate-fade-in transition-all hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-success/15 text-success shadow-[3px_3px_0_hsl(var(--foreground))]">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <h3 className="mt-1 text-2xl font-bold text-success">{percentage}%</h3>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {completed} {completed === 1 ? "task" : "tasks"} out of {total} {total === 1 ? "task" : "tasks"} completed
          </p>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden border border-foreground bg-success/15">
          <div className="h-full bg-success transition-all duration-500 ease-in-out" style={{ width: `${percentage}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingEventsCard({ events }: { events: ApprovedEventRecord[] }) {
  const upcomingEvents = useMemo(
    () => events.filter((event) => isAttendableEvent(event)),
    [events]
  );
  const nextEvent = upcomingEvents.length > 0
    ? [...upcomingEvents].sort((first, second) => new Date(first.event_date).getTime() - new Date(second.event_date).getTime())[0]
    : null;

  const daysUntilNext = nextEvent
    ? Math.max(0, Math.ceil((new Date(nextEvent.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Card className="h-full animate-fade-in transition-all hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10 text-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
        <h3 className="mt-1 text-2xl font-bold text-primary">
          {daysUntilNext === null ? upcomingEvents.length : daysUntilNext}
          <span className="text-sm font-normal text-muted-foreground">
            {daysUntilNext === null ? " events" : ` ${daysUntilNext === 1 ? "day" : "days"}`}
          </span>
        </h3>
        <div className="mt-auto pt-4">
          <p className="text-xs font-medium italic text-muted-foreground">
            {nextEvent ? `Next: ${nextEvent.title}` : "No events yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutiveDashboard() {
  const {
    data: dashboard,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["executive-dashboard"],
    queryFn: () => getExecutiveDashboard(),
    retry: false
  });
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: isAnnouncementsLoading,
    isError: isAnnouncementsError,
    error: announcementsError
  } = useQuery({
    queryKey: ["executive-dashboard", "announcements", dashboard?.club_id],
    queryFn: () => getAnnouncements({ club_id: dashboard?.club_id, page: 1, page_size: 5 }),
    enabled: Boolean(dashboard?.club_id),
    retry: false
  });
  const tasks = dashboard?.assigned_tasks ?? [];
  const notifications = dashboard?.notifications ?? [];
  const approvedEvents = dashboard?.upcoming_events ?? [];
  const supportableApprovedEvents = useMemo(
    () => approvedEvents.filter((event) => isAttendableEvent(event)),
    [approvedEvents]
  );

  const summary = useMemo(() => {
    return {
      totalTasks: dashboard?.summary.total_tasks ?? tasks.length,
      pending: dashboard?.summary.pending_tasks ?? tasks.filter((task) => task.status === "pending").length,
      inProgress: dashboard?.summary.in_progress_tasks ?? tasks.filter((task) => task.status === "in_progress").length,
      completed: dashboard?.summary.completed_tasks ?? tasks.filter((task) => task.status === "completed").length,
      blocked: dashboard?.summary.blocked_tasks ?? tasks.filter((task) => task.status === "blocked").length,
      upcomingEvents: supportableApprovedEvents.length
    };
  }, [dashboard?.summary, supportableApprovedEvents.length, tasks]);

  const prioritizedTasks = useMemo(
    () =>
      [...tasks]
        .sort((first, second) => {
          const statusWeight: Record<TaskRecord["status"], number> = {
            blocked: 0,
            pending: 1,
            in_progress: 2,
            completed: 3
          };
          const statusDifference = statusWeight[first.status] - statusWeight[second.status];
          if (statusDifference !== 0) {
            return statusDifference;
          }

          const firstDue = first.due_date ? new Date(first.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          const secondDue = second.due_date ? new Date(second.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          return firstDue - secondDue;
        })
        .slice(0, 5),
    [tasks]
  );

  const statusClassNameByTaskStatus: Record<TaskRecord["status"], string> = {
    pending: "bg-warning/15 text-warning",
    in_progress: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
    blocked: "bg-destructive/15 text-destructive"
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8 animate-slide-up">
      <StitchPageHeader
        eyebrow="Club leadership"
        title="Executive Home"
        description="Your assigned tasks, club updates, and upcoming events in one focused workspace."
        actions={<>
            <Button asChild className="px-6 py-6 font-bold">
              <Link to="/tasks">
                <ClipboardList className="mr-2 h-5 w-5" />
                Open Tasks
              </Link>
            </Button>
            <Button asChild variant="secondary" className="px-6 py-6 font-bold">
              <Link to="/feedback">
                <MessageSquare className="mr-2 h-5 w-5" />
                Send Feedback
              </Link>
            </Button>
          </>}
      />

      {isError ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load executive workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AssignedTasksProgressCard total={summary.totalTasks} completed={summary.completed} />
        <PendingTasksCard value={summary.pending} />
        <InProgressTasksCard total={summary.totalTasks} inProgress={summary.inProgress} />
        <CompletedTasksProgressCard total={summary.totalTasks} completed={summary.completed} />
        <UpcomingEventsCard events={supportableApprovedEvents} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Assigned Tasks</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Update task status from the task board when work changes.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/tasks">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <OneClubLoadingState title="Preparing task board" message="We are loading assigned work." compact />
            ) : isError ? (
              <OneClubErrorState title="Unable to load tasks" message={getErrorMessage(error)} />
            ) : prioritizedTasks.length === 0 ? (
              <OneClubEmptyState title="No assigned tasks" message="Tasks assigned by your president will appear here." />
            ) : (
              <div className="space-y-3">
                {prioritizedTasks.map((task) => (
                  <Link key={task.id} to="/tasks" className="block">
                  <div className={`clb-list-card ${task.status === "blocked" ? "border-destructive bg-destructive/5" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.due_date ? `Due ${getDateLabel(task.due_date)}` : "No due date"}
                        </p>
                        {task.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
                        ) : null}
                      </div>
                      <Badge className={`${statusClassNameByTaskStatus[task.status]} capitalize`}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Task Status</CardTitle>
              <QuestSticker tone={summary.blocked ? "red" : summary.pending ? "blue" : "green"}>
                {summary.blocked ? `${summary.blocked} blocked` : summary.pending ? `${summary.pending} open` : "clear"}
              </QuestSticker>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                ["Pending", summary.pending, "bg-warning"],
                ["In progress", summary.inProgress, "bg-primary"],
                ["Completed", summary.completed, "bg-success"],
                ["Blocked", summary.blocked, "bg-destructive"]
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                  <span className="font-semibold">{label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black text-white ${color}`}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-primary-foreground/70">Feedback</p>
                <p className="mt-1 text-lg font-black tracking-[-0.03em]">Tell OneClub what would help your club work better.</p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/feedback">Submit feedback</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/events">Calendar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading || isError || !supportableApprovedEvents.length ? (
              <ProposalListState
                isLoading={isLoading}
                isError={isError}
                error={error}
                emptyMessage="No events yet."
              />
            ) : (
              <UpcomingEventsList events={supportableApprovedEvents} canOpenProposal={canViewProposalDetails("executive")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Club Announcements</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/communications">Open</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isAnnouncementsLoading ? (
              <OneClubLoadingState title="Loading announcements" message="We are checking club updates." compact />
            ) : isAnnouncementsError ? (
              <OneClubErrorState title="Unable to load announcements" message={getErrorMessage(announcementsError)} />
            ) : announcementsPage.items.length === 0 ? (
              <OneClubEmptyState title="No announcements yet" message="Club announcements for your role will appear here." />
            ) : (
              announcementsPage.items.slice(0, 4).map((announcement) => (
                <Link key={announcement.id} to="/communications" className="block">
                  <div className="clb-list-card">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{announcement.title}</p>
                      {!announcement.is_read ? <Badge>Unread</Badge> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.message}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/notifications">Inbox</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <OneClubLoadingState title="Loading notifications" message="We are checking your latest updates." compact />
            ) : notifications.length === 0 ? (
              <OneClubEmptyState title="No notifications" message="Task, event, and club notices will appear here." />
            ) : (
              notifications.slice(0, 4).map((notification) => (
                <Link key={notification.id} to="/notifications" className="block">
                  <div className="clb-list-card">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getDateLabel(notification.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdvisorDashboard() {
  const { data: pending = [] } = useAdvisorPendingProposals();
  const { data: reportsPage = emptyPaginatedResponse<EventReportRecord>() } = useQuery({
    queryKey: ["advisor-dashboard", "reports"],
    queryFn: () => getEventReports({ page: 1, page_size: 5 }),
    retry: false
  });
  const { data: upcomingEventsPage = emptyPaginatedResponse<ApprovedEventRecord>() } = useQuery({
    queryKey: ["advisor-dashboard", "upcoming-events"],
    queryFn: () => getApprovedEvents({ lifecycle: "upcoming", page: 1, page_size: 5 }),
    retry: false
  });
  const reports = reportsPage.items;
  const upcomingEvents = upcomingEventsPage.items.filter((event) => isAttendableEvent(event));

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 animate-slide-up">
      <StitchPageHeader
        eyebrow="Advisor Portal"
        title="Advisor Home"
        description="Review the proposals, reports, and events that need your attention."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <QuestSticker tone={pending.length ? "blue" : "green"}>Decisions</QuestSticker>
            <p className="mt-6 text-4xl font-black text-primary">{formatNumber(pending.length)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Assigned proposals waiting for your decision.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <QuestSticker tone={reports.length ? "navy" : "muted"}>Reports</QuestSticker>
            <p className="mt-6 text-4xl font-black text-primary">{formatNumber(reports.length)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Recent event reports available to check.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <QuestSticker tone={upcomingEvents.length ? "blue" : "muted"}>Events</QuestSticker>
            <p className="mt-6 text-4xl font-black text-primary">{formatNumber(upcomingEvents.length)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Upcoming events from assigned clubs.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/approvals"
          className="flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft transition duration-200 hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/20">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-extrabold">Review proposals</span>
            <span className="block text-sm text-primary-foreground/80">{formatNumber(pending.length)} waiting for your decision</span>
          </span>
        </Link>
        <Link
          to="/archive"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition duration-200 hover:-translate-y-0.5"
        >
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary">
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-extrabold text-foreground">Check reports</span>
            <span className="block text-sm text-muted-foreground">{formatNumber(reports.length)} recent event reports</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ["admin-operations-dashboard"],
    queryFn: () => getAdminOperationsDashboard(),
    retry: false
  });
  const summary = dashboard?.summary;
  const pendingAdminCount = summary?.pending_admin_proposals ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Admin Operations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          OneClub control tower for approvals, memberships, dues, reports, and club health
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Unable to load admin operations dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Clubs" value={summary?.total_clubs ?? 0} icon={Users} />
            <StatCard title="Members" value={summary?.total_members ?? 0} icon={UserPlus} />
            <StatCard title="OneClub Reviews" value={pendingAdminCount} icon={Clock} variant="warning" />
            <StatCard title="Missing Reports" value={summary?.missing_reports ?? 0} icon={AlertTriangle} variant="destructive" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Events" value={summary?.approved_events ?? 0} icon={CheckCircle} variant="success" />
            <StatCard title="Dues Submitted" value={summary?.submitted_dues_payments ?? 0} icon={CreditCard} variant="warning" />
            <StatCard title="Attendance" value={summary?.event_attendance_count ?? 0} icon={BarChart3} />
            <StatCard title="Open Tasks" value={summary?.open_tasks ?? 0} icon={FileText} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pending Actions</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/proposals">All proposals</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <OneClubLoadingState title="Loading operations queue" message="We are checking pending OneClub actions." compact />
                ) : !dashboard?.pending_actions.length ? (
                  <p className="text-sm text-muted-foreground">No pending operational actions right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboard.pending_actions.map((action) => (
                      <div key={action.type} className="clb-list-card">
                        <p className="text-2xl font-bold">{action.count}</p>
                        <p className="text-sm text-muted-foreground mt-1">{action.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposal Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <OneClubLoadingState title="Loading proposal states" message="We are checking workflow bottlenecks." compact />
                ) : (
                  <div className="space-y-3">
                    {dashboard?.proposal_bottlenecks.map((item) => (
                      <div key={item.status} className="flex items-center justify-between gap-3">
                        <StatusBadge status={item.status} />
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Club Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <OneClubLoadingState title="Loading club performance" message="We are calculating club activity health." compact />
                ) : !dashboard?.club_performance.length ? (
                  <p className="text-sm text-muted-foreground">No club records available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.club_performance.slice(0, 6).map((club) => (
                      <div key={club.club_id} className="clb-list-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-semibold">{club.club_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {club.club_code || "No code"} - Last activity {getDateLabel(club.last_activity_at ?? undefined)}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="font-semibold">{club.active_members}/{club.total_members}</p>
                              <p className="text-xs text-muted-foreground">Members</p>
                            </div>
                            <div>
                              <p className="font-semibold">{club.pending_proposals}</p>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div>
                              <p className="font-semibold">{club.dues_collection_rate}%</p>
                              <p className="text-xs text-muted-foreground">Dues</p>
                            </div>
                            <div>
                              <p className="font-semibold">{club.reports_submitted}</p>
                              <p className="text-xs text-muted-foreground">Reports</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Institution Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <OneClubLoadingState title="Loading institution snapshot" message="We are preparing the latest totals." compact />
                ) : (
                  <>
                    <div className="clb-card-soft p-3">
                      <p className="text-xs text-muted-foreground">Dues collected</p>
                      <p className="text-xl font-bold">{formatCurrency(summary?.dues_collected_amount)}</p>
                    </div>
                    <div className="clb-card-soft p-3">
                      <p className="text-xs text-muted-foreground">Attendance rate</p>
                      <p className="text-xl font-bold">{formatNumber(summary?.attendance_rate)}%</p>
                    </div>
                    <div className="clb-card-soft p-3">
                      <p className="text-xs text-muted-foreground">Feedback received</p>
                      <p className="text-xl font-bold">{formatNumber(summary?.feedback_count)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Missing Reports</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/archive">Archive</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <OneClubLoadingState title="Checking report gaps" message="We are finding events that still need documentation." compact />
                ) : !dashboard?.missing_reports.length ? (
                  <p className="text-sm text-muted-foreground">No past events are missing reports.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.missing_reports.map((report) => (
                      <Link key={report.proposal_id} to={`/proposals/${report.proposal_id}`} className="block">
                        <div className="clb-list-card transition-colors hover:bg-accent">
                          <p className="text-sm font-medium">{report.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Event {getDateLabel(report.event_date)} - {report.days_since_event} day(s) overdue
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <OneClubLoadingState title="Loading recent movement" message="We are checking the latest operations activity." compact />
                ) : !dashboard?.recent_activity.length ? (
                  <p className="text-sm text-muted-foreground">No recent operations activity yet.</p>
                ) : (
                  <AdminActivityList activity={dashboard.recent_activity} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function PolishedAdminDashboard() {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ["admin-operations-dashboard"],
    queryFn: () => getAdminOperationsDashboard(),
    retry: false
  });
  const { data: openFeedback = [] } = useQuery({
    queryKey: ["admin-dashboard", "feedback", "open"],
    queryFn: () => getFeedback({ status: "open" }),
    retry: false
  });
  const summary = dashboard?.summary;
  const todayQueueTotal =
    (summary?.pending_admin_proposals ?? 0) +
    (summary?.pending_membership_requests ?? 0) +
    (summary?.submitted_dues_payments ?? 0) +
    (summary?.missing_reports ?? 0) +
    openFeedback.length;

  function handleDownloadMatrix() {
    if (!dashboard) {
      return;
    }

    try {
      downloadAdminPerformanceMatrixCsv(dashboard);
      toast.success("Matrix download ready", {
        description: "The club performance matrix has been prepared for your device."
      });
    } catch (error) {
      toast.error("Could not download matrix", {
        description: getErrorMessage(error)
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 animate-slide-up">
      <StitchPageHeader
        eyebrow="OneClub Administration"
        title="Operations Queue"
        description="A calm overview of the work that needs attention across campus clubs."
        actions={<Button type="button" variant="outline" onClick={handleDownloadMatrix} disabled={!dashboard}>
          <BarChart3 className="h-4 w-4" />
          Export report
        </Button>}
      />

      {isError ? (
        <OneClubErrorState title="We couldn't load the operations dashboard" message={getErrorMessage(error)} />
      ) : isLoading ? (
        <AdminLoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminMetricCard title="Open items" value={formatNumber(todayQueueTotal)} detail="Across proposals, dues, membership, reports, and feedback." icon={Inbox} variant={todayQueueTotal > 0 ? "red" : "green"} to="/approvals" />
            <AdminMetricCard title="Active Clubs" value={formatNumber(summary?.total_clubs)} detail={`${formatNumber(summary?.active_members)} active members tracked.`} icon={Users} variant="blue" to="/clubs" />
            <AdminMetricCard title="Dues Proofs" value={formatNumber(summary?.submitted_dues_payments)} detail="Payment proofs to verify." icon={CreditCard} variant="green" to="/dues?status=submitted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/approvals"
              className="flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft transition duration-200 hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/20">
                <Inbox className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-extrabold">Open operations queue</span>
                <span className="block text-sm text-primary-foreground/80">{formatNumber(todayQueueTotal)} items need administrative review</span>
              </span>
            </Link>
            <Link
              to="/clubs"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition duration-200 hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary">
                <Users className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-extrabold text-foreground">Clubs &amp; people</span>
                <span className="block text-sm text-muted-foreground">{formatNumber(summary?.total_clubs)} active clubs</span>
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

type StudentMembershipStatus =
  | "under_review"
  | "payment_under_review"
  | "pending_payment"
  | "active"
  | "needs_new_payment_details"
  | "rejected"
  | "cancelled";

function resolveStudentMembershipStatus(
  request: MembershipRequestRecord,
  payment?: DuePaymentRecord
): StudentMembershipStatus {
  if (request.status === "cancelled") {
    return "cancelled";
  }

  if (request.status === "active" || payment?.status === "paid") {
    return "active";
  }

  if (payment?.status === "submitted") {
    return "payment_under_review";
  }

  if (payment?.status === "rejected") {
    return "needs_new_payment_details";
  }

  if (payment?.status === "unpaid" || request.status === "approved_pending_dues") {
    return "pending_payment";
  }

  if (request.status === "rejected") {
    return "rejected";
  }

  return "under_review";
}

function getMembershipStatusLabel(status: StudentMembershipStatus) {
  return {
    under_review: "Under review",
    payment_under_review: "Payment under review",
    pending_payment: "Pending payment",
    active: "Active",
    needs_new_payment_details: "New payment details needed",
    rejected: "Rejected",
    cancelled: "Cancelled"
  }[status];
}

function isMembershipActive(request: MembershipRequestRecord, payment?: DuePaymentRecord) {
  return resolveStudentMembershipStatus(request, payment) === "active";
}

function getMembershipStatusSummary(request: MembershipRequestRecord, payment?: DuePaymentRecord) {
  const status = resolveStudentMembershipStatus(request, payment);

  if (status === "active") {
    return "Your dues have been confirmed by OneClub. This membership is now active.";
  }

  if (status === "payment_under_review") {
    return "Your payment confirmation is in review. Once it is confirmed, this membership will switch to active.";
  }

  if (status === "pending_payment") {
    return `Upload proof for ${formatCurrency(request.dues_amount ?? 0)} in ${request.academic_session || "this session"} to finish activation.`;
  }

  if (status === "needs_new_payment_details") {
    return "Your payment details need attention. Update them from the membership page to keep this request moving.";
  }

  if (status === "under_review") {
    return "Your club is still reviewing your request.";
  }

  if (status === "rejected") {
    return "This request was rejected. Check the membership page for the next step.";
  }

  if (status === "cancelled") {
    return "This request has been cancelled.";
  }

  return "This membership is not active yet.";
}

function MembershipStatusPill({
  request,
  payment
}: {
  request: MembershipRequestRecord;
  payment?: DuePaymentRecord;
}) {
  const status = resolveStudentMembershipStatus(request, payment);
  const className = {
    under_review: "bg-warning/15 text-warning",
    payment_under_review: "bg-warning/15 text-warning",
    pending_payment: "bg-primary/15 text-primary",
    active: "bg-success/15 text-success",
    needs_new_payment_details: "bg-destructive/15 text-destructive",
    rejected: "bg-destructive/15 text-destructive",
    cancelled: "bg-muted text-muted-foreground"
  }[status];

  return <Badge className={className}>{getMembershipStatusLabel(status)}</Badge>;
}

function isStudentProfileComplete(profile: {
  full_name?: string | null;
  student_id?: string | null;
  phone_number?: string | null;
  department?: string | null;
} | null | undefined) {
  return Boolean(profile?.full_name?.trim() && profile?.student_id?.trim() && profile?.phone_number?.trim() && profile?.department?.trim());
}

function isEventThisWeek(event: ApprovedEventRecord) {
  const eventDate = new Date(`${event.event_date}T00:00:00`);

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return eventDate >= today && eventDate <= weekEnd;
}

function getEventTimingLabel(event: ApprovedEventRecord) {
  if (event.event_lifecycle === "happening_today") {
    return "Today";
  }

  return isEventThisWeek(event) ? "This week" : "Upcoming";
}

function getStudentEventActionLabel({
  event,
  rsvpStatus,
  attended
}: {
  event: ApprovedEventRecord;
  rsvpStatus?: string | null;
  attended?: boolean;
}) {
  if (event.event_lifecycle === "happening_today" && !attended) {
    return "Check in";
  }

  if (attended) {
    return "Checked in";
  }

  if (rsvpStatus) {
    return `RSVP: ${rsvpStatus.replace("_", " ")}`;
  }

  if (event.can_rsvp) {
    return "RSVP needed";
  }

  return "View event";
}

function getStudentMembershipPendingAction(status: StudentMembershipStatus) {
  return {
    under_review: "Wait for club review",
    payment_under_review: "Wait for verification",
    pending_payment: "Upload dues proof",
    active: "You are active",
    needs_new_payment_details: "Update dues proof",
    rejected: "Review decision",
    cancelled: "Request cancelled"
  }[status];
}

function getStudentDueStateLabel(payment?: DuePaymentRecord) {
  if (!payment) {
    return "Not started";
  }

  return {
    unpaid: "Unpaid",
    submitted: "Submitted",
    paid: "Paid",
    rejected: "Needs update"
  }[payment.status];
}

function getAnnouncementPriorityClass(priority: AnnouncementRecord["priority"]) {
  return {
    low: "bg-muted text-muted-foreground",
    normal: "bg-accent text-foreground",
    high: "bg-warning/15 text-warning",
    urgent: "bg-destructive/15 text-destructive"
  }[priority];
}

function StudentQuickLink({
  title,
  description,
  to,
  icon: Icon,
  featured = false
}: {
  title: string;
  description: string;
  to: string;
  icon: ElementType;
  featured?: boolean;
}) {
  return (
    <Link to={to} className="group block">
      <div className={`flex h-full items-center gap-4 rounded-[24px] border border-border p-5 shadow-soft transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-soft-sm ${
        featured ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground"
      }`}>
        <div className={`rounded-full border border-border p-3 ${featured ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-black tracking-[-0.03em]">{title}</p>
          <p className="mt-1 text-xs leading-5 opacity-70">{description}</p>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function StudentEventCard({
  event,
  rsvp,
  attended
}: {
  event: ApprovedEventRecord;
  rsvp?: EventRsvpRecord | null;
  attended?: boolean;
}) {
  const actionLabel = getStudentEventActionLabel({
    event,
    rsvpStatus: rsvp?.status,
    attended
  });

  return (
    <Link to="/events" className="block">
      <div className="clb-card overflow-hidden transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-soft-sm">
        <div className="relative h-40 border-b-3 border-foreground bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--primary)/0.88))]">
          <div className="absolute left-5 top-5 rounded-[14px] border border-border bg-card px-4 py-2 text-sm font-black shadow-soft-sm">
            {getDateLabel(event.event_date).slice(5)}
          </div>
          <div className="absolute bottom-4 right-4 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-black uppercase shadow-soft-sm">
            {getEventTimingLabel(event)}
          </div>
        </div>
        <div className="p-6">
          <QuestSticker tone="green">Campus Quest</QuestSticker>
          <p className="mt-4 text-2xl font-black tracking-[-0.04em]">{event.title}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
          <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {getDateLabel(event.event_date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {event.event_time ? event.event_time.slice(0, 5) : "Time TBC"}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location || "Venue TBC"}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-[18px] border border-border bg-muted/70 p-3">
            <p className="text-xs text-muted-foreground">Your event step</p>
            <Badge variant={rsvp?.status || attended ? "default" : "outline"} className="capitalize">
              {actionLabel}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}

const STUDENT_NEXT_ACTION_ICONS: Record<StudentNextActionKind, ElementType> = {
  complete_profile: UserPlus,
  discover_clubs: UserPlus,
  update_payment: CreditCard,
  payment_review: ShieldCheck,
  check_in: QrCode,
  rsvp_event: CalendarDays,
  read_announcement: Bell,
  see_updates: MessageSquare,
  track_request: ListChecks
};

function StudentDashboard() {
  const { profile, user } = useAuth();
  const studentDisplayName = getStudentDisplayName(profile, user);
  const [dashboardShareOpen, setDashboardShareOpen] = useState(false);
  const {
    data: membershipRequests = [],
    isLoading: membershipsLoading,
    isError: membershipsFailed,
    error: membershipsError
  } = useQuery({
    queryKey: ["my-membership-requests"],
    queryFn: () => getMyMembershipRequests(),
    retry: false
  });
  const {
    data: duesData,
    isLoading: duesLoading,
    isError: duesFailed,
    error: duesError
  } = useQuery({
    queryKey: ["my-dues"],
    queryFn: () => getMyDuePayments(),
    retry: false
  });
  const {
    data: eventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: eventsLoading,
    isError: eventsFailed,
    error: eventsError
  } = useQuery({
    queryKey: ["approved-events"],
    queryFn: () => getApprovedEvents({ page: 1, page_size: 100 }),
    retry: false
  });
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: announcementsLoading,
    isError: announcementsFailed,
    error: announcementsError
  } = useQuery({
    queryKey: ["student-dashboard-announcements"],
    queryFn: () => getAnnouncements({ page: 1, page_size: 8 }),
    retry: false
  });
  const { data: publicClubs = [], isLoading: publicClubsLoading } = useQuery(publicClubsQueryOptions);
  const events = eventsPage.items;
  const { data: reminders = [] } = useQuery({
    queryKey: ["event-reminders"],
    queryFn: () => getEventReminders(),
    retry: false
  });
  const duePayments = useMemo(() => duesData?.payments ?? [], [duesData?.payments]);
  const activeMemberships = useMemo(
    () => membershipRequests.filter((request) => request.status === "active"),
    [membershipRequests]
  );
  const joinedClubIds = useMemo(
    () => new Set(activeMemberships.map((request) => request.club_id)),
    [activeMemberships]
  );
  const upcomingApprovedEvents = events.filter(isAttendableEvent);
  const joinedClubEvents = upcomingApprovedEvents.filter((event) => joinedClubIds.has(event.club_id));
  const todayEvents = joinedClubEvents.filter((event) => event.event_lifecycle === "happening_today");
  const thisWeekEvents = joinedClubEvents.filter((event) => event.event_lifecycle !== "happening_today" && isEventThisWeek(event));
  const upcomingEvents = [...todayEvents, ...thisWeekEvents, ...joinedClubEvents.filter((event) => event.event_lifecycle !== "happening_today" && !isEventThisWeek(event))].slice(0, 6);
  const engagementQueries = useQueries({
    queries: upcomingEvents.map((event) => ({
      queryKey: ["event-engagement", event.proposal_id],
      queryFn: () => getEventEngagement(event.proposal_id),
      retry: false
    }))
  });
  const engagementByProposalId = useMemo(
    () =>
      new Map(
        engagementQueries
          .map((query) => query.data)
          .filter(Boolean)
          .map((engagement) => [engagement!.event.proposal_id, engagement!])
      ),
    [engagementQueries]
  );
  const duesById = useMemo(
    () => new Map(duePayments.map((payment) => [payment.id, payment] as const)),
    [duePayments]
  );
  const announcementPreview = announcementsPage.items
    .filter((announcement) => {
      if (announcement.audience === "all_users" || announcement.audience === "all_clubs") {
        return true;
      }

      if (announcement.audience === "role" && announcement.target_role === "student") {
        return true;
      }

      return Boolean(announcement.club_id && joinedClubIds.has(announcement.club_id));
    })
    .slice(0, 5);
  const paidDuesCount = duePayments.filter((payment) => payment.status === "paid").length;
  const duesProgress = duePayments.length > 0 ? Math.round((paidDuesCount / duePayments.length) * 100) : 0;
  const featuredMembership = activeMemberships[0] || membershipRequests[0];
  const featuredPayment = featuredMembership?.due_payment ?? (featuredMembership?.due_payment_id ? duesById.get(featuredMembership.due_payment_id) : duePayments[0]);
  const hasRsvp = Array.from(engagementByProposalId.values()).some((engagement) => Boolean(engagement.current_user_rsvp?.status));
  const hasTodayCheckIn = todayEvents.some((event) => {
    const engagement = engagementByProposalId.get(event.proposal_id);

    return !engagement?.current_user_attendance?.attended;
  });
  const hasUnreadAnnouncement = announcementPreview.some((announcement) => !announcement.is_read);
  const isProfileComplete = isStudentProfileComplete(profile);
  const nextAction = getStudentNextAction({
    membershipRequests,
    duePayments,
    upcomingEvents,
    hasRsvp,
    isProfileComplete,
    hasTodayCheckIn,
    hasUnreadAnnouncement
  });
  const NextActionIcon = STUDENT_NEXT_ACTION_ICONS[nextAction.kind];

  const dashboardInviteUrl = buildAppUrl("/membership");
  const dashboardInviteText = "Hey, join Campus One OneClub and find a Nile University club that fits you.";
  const dashboardWhatsAppShareUrl = `https://wa.me/?text=${encodeURIComponent(`${dashboardInviteText}\n${dashboardInviteUrl}`)}`;

  async function handleDashboardShare(successTitle = "Invite ready", fallbackTitle = "Invite copied") {
    await shareOrCopy({
      title: "Discover Nile University clubs",
      text: dashboardInviteText,
      url: dashboardInviteUrl,
      successTitle,
      fallbackTitle
    });
    setDashboardShareOpen(false);
  }

  async function handleCopyInviteLink() {
    try {
      await navigator.clipboard.writeText(`${dashboardInviteText}\n${dashboardInviteUrl}`);
      toast.success("Invite link copied", {
        description: "Share it with a friend so they can discover clubs too."
      });
      setDashboardShareOpen(false);
    } catch {
      toast.error("Couldn't copy link", {
        description: dashboardInviteUrl
      });
    }
  }

  const nextEvent = upcomingEvents[0];
  const clubPreview = activeMemberships.slice(0, 2);
  const discoveryPreview = publicClubs
    .filter((club) => !joinedClubIds.has(club.id))
    .slice(0, 4);

  return (
    <StudentStitchHome
      displayName={studentDisplayName}
      nextAction={nextAction}
      nextActionIcon={NextActionIcon}
      membershipStatus={featuredMembership ? resolveStudentMembershipStatus(featuredMembership, featuredPayment) : "under_review"}
      events={upcomingEvents.slice(0, 3)}
      announcements={announcementPreview.slice(0, 3)}
      eventsLoading={eventsLoading}
      eventsError={eventsFailed ? eventsError : null}
      announcementsLoading={announcementsLoading}
      announcementsError={announcementsFailed ? announcementsError : null}
      error={membershipsFailed || duesFailed ? getErrorMessage(membershipsError || duesError) : null}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[940px] space-y-7 animate-slide-up">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">Hello, {firstName}</h1>
            {paidDuesCount > 0 ? <QuestSticker tone="green">Dues cleared</QuestSticker> : null}
          </div>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {activeMemberships.length
              ? `You are in ${activeMemberships.length} club${activeMemberships.length === 1 ? "" : "s"}. Your next useful step is below.`
              : "Start with one club that fits your interests, then OneClub will guide the join flow."}
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/membership">Discover Clubs</Link>
        </Button>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <QuestIconBadge icon={nextEvent ? CalendarDays : NextActionIcon} tone={nextEvent ? "blue" : "navy"} />
            <div className="min-w-0">
              <p className="clb-eyebrow">{nextEvent ? "Your next event" : "Next best action"}</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
                {nextEvent ? nextEvent.title : nextAction.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {nextEvent
                  ? `${getDateLabel(nextEvent.event_date)} - ${nextEvent.location || "Venue TBC"}`
                  : nextAction.description}
              </p>
            </div>
          </div>
          <Button asChild variant={nextEvent ? "outline" : "default"} className="w-full md:w-auto">
            <Link to={nextEvent ? "/events" : nextAction.to}>{nextEvent ? "View event" : nextAction.label}</Link>
          </Button>
        </CardContent>
      </Card>

      {(membershipsFailed || duesFailed || eventsFailed || announcementsFailed) ? (
        <OneClubErrorState title="Some student data could not load" message={getErrorMessage(membershipsError || duesError || eventsError || announcementsError)} />
      ) : null}

      <section className="space-y-4">
        <OneClubSectionHeader
          title="My clubs"
          description="A compact view of your current club memberships."
          action={<Button asChild variant="outline" size="sm"><Link to="/membership">Manage</Link></Button>}
        />
        {(membershipsLoading || duesLoading) ? (
          <AdminLoadingSkeleton />
        ) : clubPreview.length === 0 ? (
          <OneClubEmptyState icon={UserPlus} title="No club yet" message="Choose a club to start your membership request." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {clubPreview.map((request) => {
              const payment = request.due_payment ?? (request.due_payment_id ? duesById.get(request.due_payment_id) : undefined);
              return (
                <Link key={request.id} to={`/membership/clubs/${request.club_id}`} className="clb-list-card flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{request.club?.name || "Selected club"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{getMembershipStatusSummary(request, payment)}</p>
                  </div>
                  <MembershipStatusPill request={request} payment={payment} />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <OneClubSectionHeader
          title="Discover clubs"
          description="A few clubs to explore. Open the full directory when you are ready."
          action={<Button asChild variant="outline" size="sm"><Link to="/membership">Browse all</Link></Button>}
        />
        {publicClubsLoading ? (
          <OneClubLoadingState title="Loading club discovery" message="We are gathering public clubs." compact />
        ) : discoveryPreview.length === 0 ? (
          <OneClubEmptyState icon={School} title="No new clubs to show" message="Your full directory is still available from Discover Clubs." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {discoveryPreview.map((club) => (
              <Link key={club.id} to={`/membership/clubs/${club.id}`} className="clb-list-card flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-accent text-sm font-bold text-accent-foreground">
                  {getClubInitials(club.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{club.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{club.description || "Open this club profile to learn more."}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <Card className="rounded-[24px]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-lg">Announcements Preview</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Recent updates from your clubs and OneClub.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
              <Link to="/communications">View Announcements</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcementsLoading ? (
              <OneClubLoadingState title="Loading announcements" message="Checking your latest club updates." compact />
            ) : announcementPreview.length === 0 ? (
              <p className="text-sm text-muted-foreground">Updates from your active clubs and public OneClub posts will appear here.</p>
            ) : (
              announcementPreview.slice(0, 2).map((announcement) => (
                <Link key={announcement.id} to="/communications" className="clb-list-card block">
                  <p className="font-semibold leading-5">{announcement.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{announcement.message}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Dialog open={dashboardShareOpen} onOpenChange={setDashboardShareOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="h-auto justify-start rounded-[24px] p-5 text-left lg:w-[260px]">
              <Users className="mr-3 h-5 w-5" />
              Invite a friend to discover clubs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-testid="dashboard-share-sheet">
            <DialogHeader>
              <DialogTitle>Invite a friend</DialogTitle>
              <DialogDescription>Share the OneClub directory with a classmate so they can find clubs faster.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-auto justify-start gap-3 rounded-[18px] p-4 text-left" onClick={() => void handleDashboardShare()}>
                <Smartphone className="h-5 w-5 shrink-0" />
                <span><span className="block font-semibold">Share to apps</span><span className="block text-xs text-muted-foreground">Use your device menu</span></span>
              </Button>
              <Button asChild type="button" variant="outline" className="h-auto justify-start gap-3 rounded-[18px] p-4 text-left">
                <a href={dashboardWhatsAppShareUrl} target="_blank" rel="noreferrer" onClick={() => {
                  toast.success("WhatsApp invite ready", { description: "Choose the friend or group you want to send it to." });
                  setDashboardShareOpen(false);
                }}>
                  <MessageCircle className="h-5 w-5 shrink-0" />
                  <span><span className="block font-semibold">WhatsApp</span><span className="block text-xs text-muted-foreground">Send as a chat invite</span></span>
                </a>
              </Button>
              <Button type="button" variant="outline" className="h-auto justify-start gap-3 rounded-[18px] p-4 text-left" onClick={() => void handleDashboardShare("Snapchat invite ready", "Snapchat invite copied")}>
                <Camera className="h-5 w-5 shrink-0" />
                <span><span className="block font-semibold">Snapchat</span><span className="block text-xs text-muted-foreground">Share or copy for Snap</span></span>
              </Button>
              <Button type="button" variant="outline" className="h-auto justify-start gap-3 rounded-[18px] p-4 text-left" onClick={() => void handleDashboardShare("Instagram invite ready", "Instagram invite copied")}>
                <Instagram className="h-5 w-5 shrink-0" />
                <span><span className="block font-semibold">Instagram</span><span className="block text-xs text-muted-foreground">Use share sheet or copy</span></span>
              </Button>
              <Button type="button" variant="outline" className="h-auto justify-start gap-3 rounded-[18px] p-4 text-left sm:col-span-2" onClick={() => void handleCopyInviteLink()}>
                <Copy className="h-5 w-5 shrink-0" />
                <span><span className="block font-semibold">Copy Link</span><span className="block text-xs text-muted-foreground">Paste anywhere</span></span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );

}

function StudentStitchHome({
  displayName,
  nextAction,
  nextActionIcon: NextActionIcon,
  membershipStatus,
  events,
  announcements,
  eventsLoading,
  eventsError,
  announcementsLoading,
  announcementsError,
  error
}: {
  displayName: string | null;
  nextAction: ReturnType<typeof getStudentNextAction>;
  nextActionIcon: ElementType;
  membershipStatus: StudentMembershipStatus;
  events: ApprovedEventRecord[];
  announcements: AnnouncementRecord[];
  eventsLoading: boolean;
  eventsError: unknown;
  announcementsLoading: boolean;
  announcementsError: unknown;
  error: string | null;
}) {
  const stepIndex = membershipStatus === "active" ? 5 : membershipStatus === "payment_under_review" ? 4 : membershipStatus === "pending_payment" || membershipStatus === "needs_new_payment_details" ? 3 : membershipStatus === "under_review" ? 2 : 1;
  const steps = [
    { label: "Choose a club", icon: UserPlus },
    { label: "Send application", icon: ArrowRight },
    { label: "Pay dues", icon: CreditCard },
    { label: "Upload proof", icon: FileText },
    { label: "Await decision", icon: Clock }
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] animate-slide-up">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-primary md:text-3xl lg:text-[34px]">{formatStudentGreeting(displayName)}</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Let's continue your campus journey.</p>
      </header>

      {error ? <OneClubErrorState title="We couldn't load your full workspace" message={error} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <section className="relative overflow-hidden rounded-xl bg-primary px-6 py-7 text-primary-foreground shadow-soft md:px-10 md:py-10">
            <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Your next step</span>
                <h2 className="mt-5 text-2xl font-semibold leading-tight md:text-[32px]">{nextAction.title}</h2>
                <p className="mt-3 text-base leading-8 text-primary-foreground/75">{nextAction.description}</p>
              </div>
              <Button asChild className="shrink-0 bg-secondary px-6 text-secondary-foreground hover:bg-secondary/90">
                <Link to={nextAction.to}>{nextAction.label}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold tracking-[-0.02em] text-primary">Membership Journey</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-card p-5 shadow-soft-sm">
              <div className="flex min-w-[620px] items-start">
                {steps.map(({ label, icon: Icon }, index) => {
                  const completed = index + 1 < stepIndex;
                  const current = index + 1 === stepIndex;
                  return (
                    <div key={label} className="relative flex w-32 shrink-0 flex-col items-center text-center">
                      {index < steps.length - 1 ? <span className="absolute left-1/2 top-5 h-0.5 w-full bg-border" aria-hidden="true" /> : null}
                      <span className={`z-10 mb-3 grid h-10 w-10 place-items-center rounded-full border-2 border-background ${completed || current ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className={current || completed ? "text-xs font-semibold text-primary" : "text-xs font-medium text-muted-foreground"}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-8 lg:col-span-4">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-primary">Upcoming Events</h2>
              <Link to="/events" aria-label="View all events" className="text-xs font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft-sm">
              {eventsLoading ? <OneClubLoadingState title="Loading events" message="Checking approved campus events." compact /> : eventsError ? (
                <div className="p-4 text-center"><p className="text-xs text-destructive">{getErrorMessage(eventsError)}</p></div>
              ) : events.length ? events.map((event) => {
                const date = new Date(`${event.event_date}T00:00:00`);
                return <Link key={event.proposal_id} to="/events" className="flex gap-4 border-b border-border p-4 last:border-0 hover:bg-muted/40">
                  <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-primary"><span className="text-[10px] font-semibold uppercase">{date.toLocaleString("en-NG", { month: "short" })}</span><span className="text-xl font-bold leading-none">{date.getDate()}</span></span>
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-primary">{event.title}</span><span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location || "Venue to be confirmed"}</span></span>
                </Link>;
              }) : <div className="p-5 text-sm text-muted-foreground">No approved events are available yet.</div>}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-primary">Recent Updates</h2>
              <Link to="/communications" aria-label="View all updates" className="text-xs font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {announcementsLoading ? <OneClubLoadingState title="Loading updates" message="Checking OneClub updates." compact /> : announcementsError ? (
                <div className="rounded-xl border border-border bg-card p-4 text-center"><p className="text-xs text-destructive">{getErrorMessage(announcementsError)}</p></div>
              ) : announcements.length ? announcements.map((announcement, index) => (
                <Link key={announcement.id} to="/communications" className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft-sm hover:bg-muted/40">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}><MessageSquare className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block text-sm leading-6 text-foreground">{announcement.title || announcement.message}</span><span className="mt-2 block text-xs text-muted-foreground">{getDateLabel(announcement.created_at)}</span></span>
                </Link>
              )) : <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">OneClub updates will appear here.</div>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PresidentDashboard() {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ["president-dashboard"],
    queryFn: () => getPresidentDashboard(),
    retry: false
  });
  const {
    data: tasksPage = emptyPaginatedResponse<TaskRecord>(),
    isLoading: isLoadingTasks
  } = useQuery({
    queryKey: ["president-dashboard", "tasks", dashboard?.club_id],
    queryFn: () => getTasks({ club_id: dashboard?.club_id, page: 1, page_size: 100 }),
    enabled: Boolean(dashboard?.club_id),
    retry: false
  });
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: isLoadingAnnouncements
  } = useQuery({
    queryKey: ["president-dashboard", "announcements", dashboard?.club_id],
    queryFn: () => getAnnouncements({ club_id: dashboard?.club_id, page: 1, page_size: 5 }),
    enabled: Boolean(dashboard?.club_id),
    retry: false
  });
  const {
    data: membersPage = emptyPaginatedResponse<ClubMemberRecord>(),
    isLoading: isLoadingMembers
  } = useQuery({
    queryKey: ["president-dashboard", "members", dashboard?.club_id],
    queryFn: () => getClubMembers({ club_id: dashboard?.club_id, membership_status: "active", page: 1, page_size: 1 }),
    enabled: Boolean(dashboard?.club_id),
    retry: false
  });
  const summary = dashboard?.summary;
  const pendingCount = summary?.pending_proposals ?? 0;
  const upcomingCount = summary?.upcoming_events ?? 0;
  const clubHealthScore = Math.max(0, Math.min(100, summary?.club_health_score ?? 50));
  const clubHealthLabel = summary?.club_health_label ?? "Getting Started";
  const tasks = tasksPage.items;
  const openTaskCount = tasks.filter((task) => task.status !== "completed").length;
  const highPriorityTaskCount = tasks.filter((task) => task.priority === "high" && task.status !== "completed").length;
  const memberCount = membersPage.total;
  const executiveCount = dashboard?.executive_team.length ?? summary?.executive_count ?? 0;
  const announcementCount = announcementsPage.total;
  const hasClub = Boolean(dashboard?.club);
  const hasClubDescription = Boolean(dashboard?.club?.description?.trim());
  const hasWhatsAppOnboarding = Boolean(
    dashboard?.club?.whatsapp_onboarding_notes?.trim() || dashboard?.club?.whatsapp_group_name?.trim()
  );
  const hasProposal = (summary?.total_proposals ?? 0) > 0;
  const hasEvent = dashboard?.upcoming_events.length ? true : (summary?.approved_proposals ?? 0) > 0;
  const setupItems = [
    {
      label: "Complete club profile",
      done: hasClub,
      detail: hasClub ? "Your president account is linked to a club." : "OneClub needs to link your account to a club.",
      to: "/"
    },
    {
      label: "Add club description",
      done: hasClubDescription,
      detail: hasClubDescription ? "Students can understand what your club offers." : "Add a useful description from OneClub club setup.",
      to: "/"
    },
    {
      label: "Set dues amount if needed",
      done: hasClub,
      detail: dashboard?.club?.dues_amount ? `${formatCurrency(dashboard.club.dues_amount)} is configured.` : "No dues are currently shown for this club.",
      to: "/members"
    },
    {
      label: "Add WhatsApp onboarding note",
      done: hasWhatsAppOnboarding,
      detail: hasWhatsAppOnboarding ? "New members have onboarding guidance." : "Add group or onboarding instructions so approved members know where to go.",
      to: "/members"
    },
    {
      label: "Create first announcement",
      done: announcementCount > 0,
      detail: announcementCount > 0 ? `${formatNumber(announcementCount)} announcement${announcementCount === 1 ? "" : "s"} published.` : "Post a welcome or weekly update for members.",
      to: "/communications"
    },
    {
      label: "Create first event proposal",
      done: hasEvent,
      detail: hasEvent ? "Your club has event activity in the system." : "Start with an event proposal so students have a reason to return.",
      to: "/proposals/new"
    },
    {
      label: "Invite or activate members",
      done: memberCount > 1 || executiveCount > 0,
      detail: memberCount > 0 ? `${formatNumber(memberCount)} active member${memberCount === 1 ? "" : "s"} visible.` : "Use members and club sharing to grow the club.",
      to: "/members"
    }
  ];
  const attentionCount = setupItems.filter((item) => !item.done).length + openTaskCount + pendingCount;
  const openTasks = tasks.filter((task) => task.status !== "completed").slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 animate-slide-up">
      <StitchPageHeader
        eyebrow={attentionCount ? `${formatNumber(attentionCount)} items need attention` : "Club leadership"}
        title={dashboard?.club?.name || "President Home"}
        description="Focus on pending proposals, open tasks, and the next useful action for your club."
        actions={<Button asChild>
          <Link to="/proposals/new">
            <Plus className="h-4 w-4" />
            Create Event Proposal
          </Link>
        </Button>}
      />

      {isError ? (
        <OneClubErrorState title="We couldn't load the president dashboard" message={getErrorMessage(error)} />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Link to={openTaskCount ? "/tasks" : "/proposals"} className="clb-list-card block">
              <p className="clb-eyebrow">Needs Attention</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(attentionCount)}</p>
            </Link>
            <Link to="/events" className="clb-list-card block">
              <p className="clb-eyebrow">Upcoming Events</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(upcomingCount)}</p>
            </Link>
            <Link to="/members" className="clb-list-card block">
              <p className="clb-eyebrow">Members</p>
              <p className="mt-1 text-2xl font-bold">{isLoadingMembers ? "..." : formatNumber(memberCount)}</p>
            </Link>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <OneClubSectionHeader
                  title="Pending proposals"
                  description={`${formatNumber(pendingCount)} proposal${pendingCount === 1 ? "" : "s"} currently need review or follow-up.`}
                  action={<Button asChild variant="outline" size="sm"><Link to="/proposals">View all</Link></Button>}
                />
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.pending_proposals.length ? (
                  <ProposalListState isLoading={isLoading} isError={false} error={null} emptyMessage="No pending proposals for this club right now." />
                ) : (
                  <ProposalSummaryList proposals={dashboard.pending_proposals} />
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <OneClubSectionHeader
                  title="Next tasks"
                  description={`${formatNumber(openTaskCount)} open task${openTaskCount === 1 ? "" : "s"} in the club workspace.`}
                  action={<Button asChild variant="outline" size="sm"><Link to="/tasks">Open tasks</Link></Button>}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingTasks ? (
                  <OneClubLoadingState title="Loading tasks" message="Checking open task work." compact />
                ) : openTasks.length === 0 ? (
                  <OneClubEmptyState icon={ClipboardList} title="No open tasks" message="Completed tasks stay out of the dashboard so your team can focus." />
                ) : (
                  openTasks.map((task) => (
                    <Link key={task.id} to="/tasks" className="clb-list-card block">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{task.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{task.due_date ? `Due ${getDateLabel(task.due_date)}` : "No due date"}</p>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Club Health Score</h2>
                <p className="text-sm text-muted-foreground">A compact pulse check for setup, events, members, and team activity.</p>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold tracking-tight">{clubHealthScore}</p>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">{clubHealthLabel}</p>
                </div>
                <QuestProgressBar value={clubHealthScore} className="w-36" />
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <OneClubSectionHeader title="Quick actions" description="Common actions kept as compact links." />
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: "Track Proposal Status", to: "/proposals", icon: FileText },
                { label: "Assign Tasks", to: "/tasks", icon: ClipboardList },
                { label: "Manage Members", to: "/members", icon: Users },
                { label: "Submit Event Report", to: "/archive", icon: FileText }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.label} asChild variant="outline" className="h-auto justify-start rounded-[18px] p-4">
                    <Link to={action.to}>
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
            {!isLoading && executiveCount === 0 ? (
              <Card>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">No executives linked yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Assign an executive from Members before creating tasks for your team.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/members">Manage Members</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
              {dashboard?.club?.name || "President Dashboard"}
            </h1>
            <QuestSticker tone="green">President</QuestSticker>
          </div>
          <p className="mt-2 text-base font-medium text-muted-foreground">
            Welcome back. Here is what needs attention, what is set up, and where to move next.
          </p>
        </div>
      </section>

      {isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">We couldn't load the president dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PresidentActionCard
              title="Needs Attention"
              value={formatNumber(attentionCount)}
              detail={`${formatNumber(openTaskCount)} open task${openTaskCount === 1 ? "" : "s"}, ${formatNumber(pendingCount)} pending proposal${pendingCount === 1 ? "" : "s"}.`}
              icon={AlertTriangle}
              to={openTaskCount ? "/tasks" : "/proposals"}
              tone={attentionCount ? "red" : "green"}
            />
            <PresidentActionCard
              title="Upcoming Events"
              value={formatNumber(upcomingCount)}
              detail={upcomingCount ? "Events are coming up for your club." : "Create an event proposal to get students returning."}
              icon={CalendarDays}
              to="/events"
              tone="blue"
            />
            <PresidentActionCard
              title="Members"
              value={isLoadingMembers ? "..." : formatNumber(memberCount)}
              detail={`${formatNumber(executiveCount)} executive${executiveCount === 1 ? "" : "s"} linked. Manage your club team from members.`}
              icon={Users}
              to="/members"
              tone="green"
            />
            <PresidentActionCard
              title="Reports"
              value="Open"
              detail="Check post-event reports and media archive after completed events."
              icon={ClipboardList}
              to="/archive"
              tone="navy"
            />
          </div>

          <PresidentQuickActions />

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <Card className="relative min-h-[340px] overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.22),transparent_62%)]" />
              <CardContent className="relative flex h-full flex-col justify-between p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <QuestSticker tone="blue">Core Metric</QuestSticker>
                    <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] md:text-5xl">Club Health Score</h2>
                  </div>
                  <div className="rotate-2 rounded-[24px] border border-border bg-primary px-7 py-5 text-6xl font-black text-primary-foreground shadow-soft">
                    {clubHealthScore}
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em]">
                    <span>Overall health</span>
                    <span>{clubHealthLabel}</span>
                  </div>
                  <QuestProgressBar value={clubHealthScore} />
                </div>
              </CardContent>
            </Card>

            <PresidentAnnouncementsPreview
              announcements={announcementsPage.items}
              notifications={dashboard?.notifications ?? []}
              isLoading={isLoading || isLoadingAnnouncements}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-7">
                <div className="mb-6 flex items-center gap-4">
                  <QuestIconBadge icon={ClipboardList} tone={highPriorityTaskCount ? "red" : "blue"} />
                  <h2 className="text-2xl font-black tracking-[-0.05em]">Task Focus</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[20px] border border-border bg-muted p-4 shadow-soft-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-black">Open Tasks</p>
                      <QuestSticker tone={openTaskCount ? "navy" : "green"}>{isLoadingTasks ? "..." : formatNumber(openTaskCount)}</QuestSticker>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link to="/tasks">Assign Task</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-7">
                <div className="mb-6 flex items-center gap-4">
                  <QuestIconBadge icon={FileText} tone={pendingCount ? "red" : "green"} />
                  <h2 className="text-2xl font-black tracking-[-0.05em]">Proposals</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[20px] border border-border bg-muted p-4 shadow-soft-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-black">Pending Workflow</p>
                      <QuestSticker tone={pendingCount ? "navy" : "green"}>{formatNumber(pendingCount)}</QuestSticker>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link to="/proposals">Open Proposals</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-7">
                <div className="mb-6 flex items-center gap-4">
                  <QuestIconBadge icon={MessageSquare} tone={announcementCount ? "green" : "blue"} />
                  <h2 className="text-2xl font-black tracking-[-0.05em]">Communication</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[20px] border border-border bg-muted p-4 shadow-soft-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-black">Announcements</p>
                      <QuestSticker tone={announcementCount ? "navy" : "muted"}>{isLoadingAnnouncements ? "..." : formatNumber(announcementCount)}</QuestSticker>
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full">
                      <Link to="/communications">Create Announcement</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Proposal Oversight</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.pending_proposals.length ? (
                  <ProposalListState
                    isLoading={isLoading}
                    isError={false}
                    error={null}
                    emptyMessage="No pending proposals for this club right now."
                  />
                ) : (
                  <ProposalSummaryList proposals={dashboard.pending_proposals} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.upcoming_events.length ? (
                  <ProposalListState
                    isLoading={isLoading}
                    isError={false}
                    error={null}
                    emptyMessage="No events yet."
                  />
                ) : (
                  <UpcomingEventsList events={dashboard.upcoming_events} canOpenProposal={canViewProposalDetails("president")} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Executive Team</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.executive_team.length ? (
                  isLoading ? (
                    <OneClubLoadingState title="Loading executive team" message="We are checking club leadership records." compact />
                  ) : (
                    <OneClubEmptyState title="No executives linked yet" message="Executives connected to this club will appear here." />
                  )
                ) : (
                  <div className="space-y-3">
                    {dashboard.executive_team.map((executive) => (
                      <div key={executive.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div>
                          <p className="text-sm font-medium">{executive.full_name || "Unnamed executive"}</p>
                          <p className="text-xs text-muted-foreground capitalize">{executive.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.recent_activity.length ? (
                  isLoading ? (
                    <OneClubLoadingState title="Loading recent movement" message="We are checking proposal activity." compact />
                  ) : (
                    <OneClubEmptyState title="No proposal activity yet" message="Proposal updates will appear here once the club starts submitting." />
                  )
                ) : (
                  <RecentActivityList activity={dashboard.recent_activity} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  useUsageTracking("dashboard_view");
  const { role } = useRole();

  if (role === "advisor") return <AdvisorDashboard />;
  if (role === "admin") return <PolishedAdminDashboard />;
  if (role === "executive") return <ExecutiveDashboard />;
  if (role === "president") return <PresidentDashboard />;
  if (role === "student") return <StudentDashboard />;
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <OneClubLoadingState title="Opening your OneClub workspace" message="We are loading your profile and dashboard access." />
    </div>
  );
}
