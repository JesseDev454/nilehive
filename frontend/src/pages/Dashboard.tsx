import { useMemo } from "react";
import type { ElementType } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { NeoEmptyState, NeoErrorState, NeoLoadingState } from "@/components/NeoBrutal";
import {
  ApiClientError,
  getAdminOperationsDashboard,
  getApprovedEvents,
  getEventEngagement,
  getEventReminders,
  getMyDuePayments,
  getMyMembershipRequests,
  getNotifications,
  getPresidentDashboard,
  getTasks,
  type AdminOperationsDashboardRecord,
  type ApprovedEventRecord,
  type DashboardActivity,
  type DashboardProposalSummary,
  type DuePaymentRecord,
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
  Bell,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Gauge,
  ListChecks,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  XCircle
} from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";
import { canViewProposalDetails } from "@/lib/roleAccess";

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
        <div className="flex items-center justify-between">
          <div>
            <p className="nh-panel-title text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${colors[variant || "default"]} opacity-80`} />
        </div>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load dashboard data right now.";
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
    return <NeoLoadingState title="Loading proposal records" message="We are checking the latest workflow state." compact />;
  }

  if (isError) {
    return <NeoErrorState title="Unable to load proposals" message={getErrorMessage(error)} />;
  }

  return <NeoEmptyState title="No proposals found yet" message={emptyMessage || "Proposal records will appear here once work starts."} />;
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
          <div className="nh-list-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{proposal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {showClub ? `Club ${proposal.club_id ?? "-"}` : `Event ${getDateLabel(proposal.event_date)}`}
                </p>
              </div>
            </div>
            <StatusBadge status={proposal.status} />
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
          <div className="nh-list-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CalendarDays className="h-4 w-4 text-success shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getDateLabel(event.event_date)} - {event.location || "Venue TBC"}
                </p>
              </div>
            </div>
            <StatusBadge status="approved" />
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
          <div className="nh-list-card flex items-start gap-3">
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
              Club record {item.club_id} - {getDateLabel(item.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getAdminActionLink(type: string) {
  const links: Record<string, string> = {
    pending_admin_review: "/proposals",
    pending_advisor_review: "/proposals",
    membership_requests: "/membership",
    dues_verification: "/dues",
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
    .join("") || "NH";
}

function getClubPulse(club: AdminOperationsDashboardRecord["club_performance"][number]) {
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
  variant = "blue"
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ElementType;
  variant?: "blue" | "green" | "gold" | "red" | "navy";
}) {
  const variants = {
    blue: "bg-primary/10 text-primary",
    green: "bg-success/10 text-success",
    gold: "bg-warning/15 text-warning",
    red: "bg-destructive/10 text-destructive",
    navy: "bg-primary text-primary-foreground"
  };

  return (
    <Card className="overflow-hidden transition-all hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-primary">{value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
          </div>
          <div className={`border-2 border-foreground p-3 shadow-[3px_3px_0_hsl(var(--foreground))] ${variants[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminLoadingSkeleton() {
  return (
    <NeoLoadingState
      title="Loading Club Services controls"
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
    <div className="nh-empty">
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
  const nextEvent = events.length > 0
    ? [...events].sort((first, second) => new Date(first.event_date).getTime() - new Date(second.event_date).getTime())[0]
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
          {daysUntilNext === null ? events.length : daysUntilNext}
          <span className="text-sm font-normal text-muted-foreground">
            {daysUntilNext === null ? " events" : ` ${daysUntilNext === 1 ? "day" : "days"}`}
          </span>
        </h3>
        <div className="mt-auto pt-4">
          <p className="text-xs font-medium italic text-muted-foreground">
            {nextEvent ? `Next: ${nextEvent.title}` : "No approved events yet"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutiveDashboard() {
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
    error: tasksError
  } = useQuery({
    queryKey: ["executive-dashboard", "tasks"],
    queryFn: () => getTasks(),
    retry: false
  });

  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    error: notificationsError
  } = useQuery({
    queryKey: ["executive-dashboard", "notifications"],
    queryFn: () => getNotifications(),
    retry: false
  });

  const {
    data: approvedEvents = [],
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError
  } = useQuery({
    queryKey: ["executive-dashboard", "approved-events"],
    queryFn: () => getApprovedEvents(),
    retry: false
  });

  const isLoading = isTasksLoading || isNotificationsLoading || isEventsLoading;
  const isError = isTasksError || isNotificationsError || isEventsError;
  const error = tasksError || notificationsError || eventsError;

  const summary = useMemo(() => {
    const pending = tasks.filter((task) => task.status === "pending").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const completed = tasks.filter((task) => task.status === "completed").length;

    return {
      totalTasks: tasks.length,
      pending,
      inProgress,
      completed,
      upcomingEvents: approvedEvents.length
    };
  }, [approvedEvents.length, tasks]);

  const prioritizedTasks = useMemo(
    () =>
      [...tasks]
        .sort((first, second) => {
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
    <div className="space-y-6 animate-slide-up">
      <div className="relative overflow-hidden border-2 border-foreground bg-primary p-8 text-primary-foreground shadow-[8px_8px_0_hsl(var(--foreground))]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 border-2 border-primary-foreground/20 bg-warning opacity-20" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black tracking-tight">Executive Dashboard</h1>
            <p className="max-w-md text-white/80">
              Welcome back. You have {summary.pending === 0 ? "no" : summary.pending} open{" "}
              {summary.pending === 1 ? "task" : "tasks"} requiring action and {summary.upcomingEvents === 0 ? "no" : summary.upcomingEvents} approved{" "}
              {summary.upcomingEvents === 1 ? "event" : "events"} to support.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary" className="px-6 py-6 font-bold">
              <Link to="/events">
                <CalendarDays className="mr-2 h-5 w-5" />
                View Events
              </Link>
            </Button>
            <Button asChild className="px-6 py-6 font-bold">
              <Link to="/tasks">
                <ClipboardList className="mr-2 h-5 w-5" />
                Open Tasks
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AssignedTasksProgressCard total={summary.totalTasks} completed={summary.completed} />
        <PendingTasksCard value={summary.pending} />
        <InProgressTasksCard total={summary.totalTasks} inProgress={summary.inProgress} />
        <CompletedTasksProgressCard total={summary.totalTasks} completed={summary.completed} />
        <UpcomingEventsCard events={approvedEvents} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Priority Tasks</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/tasks">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <NeoLoadingState title="Preparing task board" message="We are loading assigned work." compact />
            ) : isError ? (
              <div className="space-y-2">
                <p className="font-medium">Unable to load tasks</p>
                <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
              </div>
            ) : prioritizedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assigned tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {prioritizedTasks.map((task) => (
                  <div key={task.id} className="nh-list-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.due_date ? `Due ${getDateLabel(task.due_date)}` : "No due date"}
                        </p>
                      </div>
                      <Badge className={`${statusClassNameByTaskStatus[task.status]} capitalize`}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Approved Events</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/events">Calendar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading || isError || !approvedEvents.length ? (
              <ProposalListState
                isLoading={isLoading}
                isError={isError}
                error={error}
                emptyMessage="No approved events yet."
              />
            ) : (
              <UpcomingEventsList events={approvedEvents} canOpenProposal={canViewProposalDetails("executive")} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <NeoLoadingState title="Loading notifications" message="We are checking your latest updates." compact />
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="nh-list-card">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{getDateLabel(notification.created_at)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdvisorDashboard() {
  const { data: pending = [], isLoading, isError, error } = useAdvisorPendingProposals();

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Advisor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve proposals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 max-w-sm">
        <StatCard title="Pending Reviews" value={pending.length} icon={Clock} variant="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/approvals">Review queue</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NeoLoadingState title="Loading advisor review queue" message="We are getting proposals assigned to your club." compact />
          ) : isError ? (
            <div className="space-y-2">
              <p className="font-medium">Unable to load advisor queue</p>
              <p className="text-sm text-muted-foreground">
                {getAdvisorPendingProposalsErrorMessage(error)}
              </p>
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals right now.</p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 4).map((proposal) => (
                <div key={proposal.id} className="nh-list-card flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {proposal.location} - Event {proposal.eventDate}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
          Club Services control tower for approvals, memberships, dues, reports, and club health
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
            <StatCard title="Club Services Reviews" value={pendingAdminCount} icon={Clock} variant="warning" />
            <StatCard title="Missing Reports" value={summary?.missing_reports ?? 0} icon={AlertTriangle} variant="destructive" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Approved Events" value={summary?.approved_events ?? 0} icon={CheckCircle} variant="success" />
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
                  <NeoLoadingState title="Loading operations queue" message="We are checking pending Club Services actions." compact />
                ) : !dashboard?.pending_actions.length ? (
                  <p className="text-sm text-muted-foreground">No pending operational actions right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboard.pending_actions.map((action) => (
                      <div key={action.type} className="nh-list-card">
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
                  <NeoLoadingState title="Loading proposal states" message="We are checking workflow bottlenecks." compact />
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
                  <NeoLoadingState title="Loading club performance" message="We are calculating club activity health." compact />
                ) : !dashboard?.club_performance.length ? (
                  <p className="text-sm text-muted-foreground">No club records available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.club_performance.slice(0, 6).map((club) => (
                      <div key={club.club_id} className="nh-list-card">
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
                  <NeoLoadingState title="Loading institution snapshot" message="We are preparing the latest totals." compact />
                ) : (
                  <>
                    <div className="nh-card-soft p-3">
                      <p className="text-xs text-muted-foreground">Dues collected</p>
                      <p className="text-xl font-bold">{formatCurrency(summary?.dues_collected_amount)}</p>
                    </div>
                    <div className="nh-card-soft p-3">
                      <p className="text-xs text-muted-foreground">Attendance rate</p>
                      <p className="text-xl font-bold">{formatNumber(summary?.attendance_rate)}%</p>
                    </div>
                    <div className="nh-card-soft p-3">
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
                  <NeoLoadingState title="Checking report gaps" message="We are finding approved events that need documentation." compact />
                ) : !dashboard?.missing_reports.length ? (
                  <p className="text-sm text-muted-foreground">No past approved events are missing reports.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.missing_reports.map((report) => (
                      <Link key={report.proposal_id} to={`/proposals/${report.proposal_id}`} className="block">
                        <div className="nh-list-card transition-colors hover:bg-accent">
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
                  <NeoLoadingState title="Loading recent movement" message="We are checking the latest operations activity." compact />
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
  const summary = dashboard?.summary;
  const totalPending =
    (summary?.pending_admin_proposals ?? 0) +
    (summary?.pending_membership_requests ?? 0) +
    (summary?.submitted_dues_payments ?? 0) +
    (summary?.missing_reports ?? 0);
  const totalProposalBottlenecks =
    dashboard?.proposal_bottlenecks.reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <div className="space-y-7 animate-slide-up">
      <section className="relative overflow-hidden border-2 border-foreground bg-primary p-6 text-primary-foreground shadow-[8px_8px_0_hsl(var(--foreground))] md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 border-2 border-primary-foreground/20 bg-warning/20" />
        <div className="absolute bottom-0 right-10 h-24 w-24 border-2 border-primary-foreground/10 bg-success/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              <Gauge className="h-3.5 w-3.5 text-warning" />
              Club Services Control Tower
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Admin Operations</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              One calm place to see what needs attention across clubs, proposals, dues,
              reports, events, and student membership activity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
            <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4">
              <p className="text-xs text-white/60">Needs attention</p>
              <p className="mt-2 text-2xl font-black">{formatNumber(totalPending)}</p>
            </div>
            <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4">
              <p className="text-xs text-white/60">Attendance rate</p>
              <p className="mt-2 text-2xl font-black">{formatNumber(summary?.attendance_rate)}%</p>
            </div>
            <div className="col-span-2 border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4 sm:col-span-1">
              <p className="text-xs text-white/60">Dues collected</p>
              <p className="mt-2 text-2xl font-black">{formatCurrency(summary?.dues_collected_amount)}</p>
            </div>
          </div>
        </div>
      </section>

      {isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">We could not load the operations dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              {getErrorMessage(error)} Try refreshing the page, and confirm the backend is running.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <AdminLoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Clubs"
              value={formatNumber(summary?.total_clubs)}
              detail={`${formatNumber(summary?.active_members)} active member records are currently tracked.`}
              icon={Users}
              variant="blue"
            />
            <AdminMetricCard
              title="Club Services Reviews"
              value={formatNumber(summary?.pending_admin_proposals)}
              detail="Proposal decisions waiting for Club Services final verification."
              icon={Clock}
              variant="gold"
            />
            <AdminMetricCard
              title="Dues Queue"
              value={formatNumber(summary?.submitted_dues_payments)}
              detail="Payment confirmations that still need a human check."
              icon={CreditCard}
              variant="green"
            />
            <AdminMetricCard
              title="Report Gaps"
              value={formatNumber(summary?.missing_reports)}
              detail="Approved past events that still need documentation."
              icon={AlertTriangle}
              variant={(summary?.missing_reports ?? 0) > 0 ? "red" : "navy"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">What needs attention</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The quickest way to know what Club Services should handle next.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/proposals">
                    View proposals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!dashboard?.pending_actions.length ? (
                  <AdminEmptyState
                    icon={CheckCircle}
                    title="Everything is calm for now"
                    message="No urgent proposal, dues, membership, task, or report follow-up is waiting."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboard.pending_actions.map((action) => (
                      <Link key={action.type} to={getAdminActionLink(action.type)} className="group block">
                        <div className="nh-list-card flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 hover:bg-accent">
                          <div className="flex items-center gap-4">
                            <div className="border-2 border-foreground bg-background p-3 text-primary shadow-[3px_3px_0_hsl(var(--foreground))]">
                              {(() => {
                                const Icon = getAdminActionIcon(action.type);
                                return <Icon className="h-5 w-5" />;
                              })()}
                            </div>
                            <div>
                              <p className="font-semibold">{action.label}</p>
                              <p className="text-xs text-muted-foreground">Open the related workspace</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-primary">{action.count}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposal bottlenecks</CardTitle>
                <p className="text-sm text-muted-foreground">Where proposals are sitting right now.</p>
              </CardHeader>
              <CardContent>
                {dashboard?.proposal_bottlenecks.length ? (
                  <div className="space-y-3">
                    {dashboard.proposal_bottlenecks.map((item) => (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <StatusBadge status={item.status} />
                          <span className="text-sm font-semibold">{item.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden border border-foreground bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${totalProposalBottlenecks > 0 ? Math.max(6, (item.count / totalProposalBottlenecks) * 100) : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState
                    icon={FileText}
                    title="No proposal data yet"
                    message="Once clubs start submitting proposals, this panel will show where delays are happening."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 overflow-hidden">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Club performance matrix</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A quick read on activity, dues, reports, and accountability.
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                    Showing {dashboard?.club_performance.length ?? 0} of {summary?.total_clubs ?? dashboard?.club_performance.length ?? 0} clubs
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/members">Members</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {!dashboard?.club_performance.length ? (
                  <div className="p-6">
                    <AdminEmptyState
                      icon={Users}
                      title="No clubs are available yet"
                      message="Club performance will appear after club records, proposals, and members are added."
                    />
                  </div>
                ) : (
                  <div className="nh-table-wrap">
                    <table className="nh-table text-left">
                      <thead>
                        <tr>
                          <th>Club</th>
                          <th>Members</th>
                          <th>Pending</th>
                          <th>Dues</th>
                          <th>Reports</th>
                          <th>Pulse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.club_performance.map((club) => {
                          const pulse = getClubPulse(club);
                          return (
                            <tr key={club.club_id} className="transition-colors hover:bg-muted/40">
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-xs font-black text-primary-foreground">
                                    {getClubInitials(club.club_name)}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{club.club_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {club.club_code || "No code"} - Last activity {getDateLabel(club.last_activity_at ?? undefined)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="font-semibold">{club.active_members}/{club.total_members}</p>
                                <p className="text-xs text-muted-foreground">active</p>
                              </td>
                              <td>
                                <p className="font-semibold">{club.pending_proposals}</p>
                                <p className="text-xs text-muted-foreground">{club.open_tasks} open task(s)</p>
                              </td>
                              <td>
                                <div className="min-w-24">
                                  <div className="mb-1 flex justify-between text-xs">
                                    <span>{club.dues_collection_rate}%</span>
                                    <span>{formatCurrency(club.dues_collected_amount)}</span>
                                  </div>
                                  <div className="h-2 overflow-hidden border border-foreground bg-muted">
                                    <div
                                      className="h-full bg-success"
                                      style={{ width: `${Math.min(100, club.dues_collection_rate)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="font-semibold">{club.reports_submitted}</p>
                                <p className="text-xs text-muted-foreground">{club.feedback_count} feedback</p>
                              </td>
                              <td>
                                <span className={`nh-status ${pulse.className}`}>
                                  {pulse.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Institution snapshot</CardTitle>
                <p className="text-sm text-muted-foreground">Numbers that help you sense the system at a glance.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="nh-card-soft p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    Dues collected
                  </div>
                  <p className="text-2xl font-black text-primary">{formatCurrency(summary?.dues_collected_amount)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Across all tracked club payment records.</p>
                </div>
                <div className="nh-card-soft p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Attendance health
                  </div>
                  <p className="text-2xl font-black text-primary">{formatNumber(summary?.attendance_rate)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(summary?.event_attendance_count)} attendance marks from {formatNumber(summary?.event_rsvp_count)} RSVP records.
                  </p>
                </div>
                <div className="nh-card-soft p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Student feedback
                  </div>
                  <p className="text-2xl font-black text-primary">{formatNumber(summary?.feedback_count)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Feedback records are ready for sentiment review.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="overflow-hidden bg-primary text-primary-foreground">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-primary-foreground">Reports to chase</CardTitle>
                  <p className="mt-1 text-sm text-primary-foreground/70">
                    Approved events should not disappear after the day ends.
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/archive">Archive</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {!dashboard?.missing_reports.length ? (
                  <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-6 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-success" />
                    <p className="mt-3 font-semibold">No missing reports right now</p>
                    <p className="mt-1 text-sm text-primary-foreground/70">
                      Every past approved event currently has its documentation covered.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboard.missing_reports.map((report) => (
                      <Link key={report.proposal_id} to={`/proposals/${report.proposal_id}`} className="block">
                        <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4 transition-colors hover:bg-primary-foreground/15">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{report.title}</p>
                              <p className="mt-1 text-xs text-primary-foreground/65">
                                Event date {getDateLabel(report.event_date)}
                              </p>
                            </div>
                            <span className="border-2 border-foreground bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                              {report.days_since_event}d overdue
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent movement</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">A living trail of what has changed recently.</p>
                </div>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {!dashboard?.recent_activity.length ? (
                  <AdminEmptyState
                    icon={Activity}
                    title="No recent movement yet"
                    message="Proposal updates, membership requests, dues, reports, feedback, and tasks will appear here."
                  />
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

function getMembershipStatusLabel(status: MembershipRequestRecord["status"]) {
  return {
    pending: "Under review",
    approved_pending_dues: "Dues required",
    active: "Active member",
    rejected: "Rejected",
    cancelled: "Cancelled"
  }[status];
}

function MembershipStatusPill({ status }: { status: MembershipRequestRecord["status"] }) {
  const className = {
    pending: "bg-warning/15 text-warning",
    approved_pending_dues: "bg-primary/15 text-primary",
    active: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
    cancelled: "bg-muted text-muted-foreground"
  }[status];

  return <Badge className={className}>{getMembershipStatusLabel(status)}</Badge>;
}

function StudentQuickLink({
  title,
  description,
  to,
  icon: Icon
}: {
  title: string;
  description: string;
  to: string;
  icon: ElementType;
}) {
  return (
    <Link to={to} className="group block">
      <div className="flex h-full items-start gap-4 border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4 text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/15">
        <div className="border-2 border-primary-foreground/25 bg-primary-foreground/15 p-3">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-5 text-primary-foreground/70">{description}</p>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function StudentEventCard({
  event,
  rsvp
}: {
  event: ApprovedEventRecord;
  rsvp?: EventRsvpRecord | null;
}) {
  return (
    <Link to="/events" className="block">
      <div className="nh-list-card transition-all hover:-translate-y-0.5 hover:bg-accent">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold">{event.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          </div>
          <Badge className="w-fit bg-success/15 text-success hover:bg-success/15">Approved</Badge>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
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
        <div className="mt-4 flex items-center justify-between gap-3 border-2 border-foreground bg-muted/70 p-3">
          <p className="text-xs text-muted-foreground">Your RSVP</p>
          <Badge variant={rsvp?.status ? "default" : "outline"} className={rsvp?.status ? "capitalize" : ""}>
            {rsvp?.status ? rsvp.status.replace("_", " ") : "Not selected"}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

function StudentDashboard() {
  const { profile } = useAuth();
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
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsFailed,
    error: eventsError
  } = useQuery({
    queryKey: ["approved-events"],
    queryFn: () => getApprovedEvents(),
    retry: false
  });
  const { data: reminders = [] } = useQuery({
    queryKey: ["event-reminders"],
    queryFn: () => getEventReminders(),
    retry: false
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    retry: false
  });
  const upcomingEvents = events.slice(0, 3);
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
  const duePayments = duesData?.payments || [];
  const activeMemberships = membershipRequests.filter((request) => request.status === "active");
  const pendingRequests = membershipRequests.filter((request) => request.status === "pending");
  const duesRequiredRequests = membershipRequests.filter((request) => request.status === "approved_pending_dues");
  const submittedDues = duePayments.filter((payment) => payment.status === "submitted");
  const unpaidDues = duePayments.filter((payment) => payment.status === "unpaid" || payment.status === "rejected");
  const duesById = useMemo(
    () => new Map(duePayments.map((payment) => [payment.id, payment] as const)),
    [duePayments]
  );
  const firstDuesRequest = duesRequiredRequests[0];
  const firstDuesPayment = firstDuesRequest?.due_payment_id ? duesById.get(firstDuesRequest.due_payment_id) : undefined;

  return (
    <div className="space-y-7 animate-slide-up">
      <section className="relative overflow-hidden border-2 border-foreground bg-primary p-6 text-primary-foreground shadow-[8px_8px_0_hsl(var(--foreground))] md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 border-2 border-primary-foreground/20 bg-warning/20" />
        <div className="absolute -bottom-16 left-1/2 h-40 w-40 border-2 border-primary-foreground/10 bg-success/10" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <Badge className="mb-4 bg-white/15 text-white hover:bg-white/15">Student Home</Badge>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Welcome back, {profile?.full_name?.split(" ")[0] || "student"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              Track your club membership, dues, approved events, RSVP choices, and reminders from one simple home base.
            </p>
          </div>
          <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Student profile</p>
            <p className="mt-2 font-semibold">{profile?.full_name || "Student"}</p>
            <p className="text-sm text-white/70">{profile?.student_id || "Student ID not set"}</p>
          </div>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StudentQuickLink title="Find clubs" description="Discover clubs and request to join." to="/membership" icon={UserPlus} />
          <StudentQuickLink title="Approved events" description="See official events and RSVP." to="/events" icon={CalendarDays} />
          <StudentQuickLink title="Announcements" description="Catch updates from clubs and admins." to="/communications" icon={MessageSquare} />
          <StudentQuickLink title="Notifications" description="Review your latest Club Services alerts." to="/notifications" icon={Bell} />
        </div>
      </section>

      {(membershipsFailed || duesFailed || eventsFailed) ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Some student dashboard data could not load</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getErrorMessage(membershipsError || duesError || eventsError)}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title="Active Clubs"
          value={formatNumber(activeMemberships.length)}
          detail="Clubs where your membership is officially active."
          icon={ShieldCheck}
          variant="green"
        />
        <AdminMetricCard
          title="Requests"
          value={formatNumber(pendingRequests.length)}
          detail="Club membership requests waiting for review."
          icon={UserPlus}
          variant="gold"
        />
        <AdminMetricCard
          title="Dues Alerts"
          value={formatNumber(duesRequiredRequests.length + unpaidDues.length)}
          detail="Payments you may need to complete or resubmit."
          icon={WalletCards}
          variant={(duesRequiredRequests.length + unpaidDues.length) > 0 ? "red" : "blue"}
        />
        <AdminMetricCard
          title="Upcoming Events"
          value={formatNumber(events.length)}
          detail="Approved events currently visible to students."
          icon={CalendarDays}
          variant="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Membership journey</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  You become an official club member after approval and verified dues payment.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/membership">Manage membership</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {membershipsLoading ? (
                <AdminLoadingSkeleton />
              ) : membershipRequests.length === 0 ? (
                <AdminEmptyState
                  icon={UserPlus}
                  title="You have not requested a club yet"
                  message="Start by choosing a club you care about. Your request will go to the right club leadership."
                  action={{ label: "Discover clubs", to: "/membership" }}
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {membershipRequests.slice(0, 4).map((request) => {
                    const payment = request.due_payment_id ? duesById.get(request.due_payment_id) : undefined;

                    return (
                      <div key={request.id} className="nh-list-card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{request.club?.name || "Selected club"}</p>
                            <p className="text-sm capitalize text-muted-foreground">Requested as {request.requested_role}</p>
                          </div>
                          <MembershipStatusPill status={request.status} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="border-2 border-foreground bg-success/10 p-2 text-success">Submitted</div>
                          <div className={`border-2 border-foreground p-2 ${request.status === "pending" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"}`}>
                            Reviewed
                          </div>
                          <div className={`border-2 border-foreground p-2 ${request.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                            Active
                          </div>
                        </div>
                        {request.status === "approved_pending_dues" ? (
                          <div className="mt-4 border-2 border-foreground bg-primary/5 p-3 text-sm">
                            <p className="font-medium text-primary">Dues payment is the next step.</p>
                            <p className="mt-1 text-muted-foreground">
                              {request.dues_amount ? formatCurrency(request.dues_amount) : "Dues amount pending"} for {request.academic_session || "this session"}.
                            </p>
                            {payment?.status === "submitted" ? (
                              <p className="mt-2 font-medium text-primary">Your confirmation is waiting for review.</p>
                            ) : (
                              <Button asChild size="sm" className="mt-3">
                                <Link to="/membership">I have paid</Link>
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Approved events for you</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Only final admin-approved events show here.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/events">Open events</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <NeoLoadingState title="Loading approved events" message="We are preparing the student event feed." compact />
              ) : upcomingEvents.length === 0 ? (
                <AdminEmptyState
                  icon={CalendarDays}
                  title="No approved events yet"
                  message="When Club Services gives final approval, events will appear here for students."
                />
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <StudentEventCard
                      key={event.id}
                      event={event}
                      rsvp={engagementByProposalId.get(event.proposal_id)?.current_user_rsvp}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg text-primary-foreground">Dues and activation</CardTitle>
              <p className="text-sm text-primary-foreground/70">Paying dues is what turns approval into official membership.</p>
            </CardHeader>
            <CardContent>
              {duesLoading ? (
                <NeoLoadingState title="Checking dues records" message="We are checking your membership payment status." compact />
              ) : firstDuesRequest ? (
                <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4">
                  <p className="font-semibold">{firstDuesRequest.club?.name || "Selected club"}</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">
                    {firstDuesRequest.dues_amount ? formatCurrency(firstDuesRequest.dues_amount) : "Dues amount pending"}
                    {" "}for {firstDuesRequest.academic_session || "this session"}
                  </p>
                  <p className="mt-3 text-sm">
                    {firstDuesPayment?.status === "submitted"
                      ? "Your payment confirmation is in review."
                      : "Open membership to submit the name on the account used, reference, and proof if available."}
                  </p>
                  <Button asChild variant="secondary" size="sm" className="mt-4">
                    <Link to="/membership">{firstDuesPayment?.status === "submitted" ? "View status" : "I have paid"}</Link>
                  </Button>
                </div>
              ) : submittedDues.length > 0 ? (
                <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4">
                  <p className="font-semibold">Payment confirmation submitted</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Your club leadership or admin can now verify it.</p>
                </div>
              ) : (
                <div className="border-2 border-primary-foreground/25 bg-primary-foreground/10 p-4 text-sm text-primary-foreground/75">
                  No dues action is waiting from you right now.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No event reminders yet.</p>
              ) : (
                reminders.slice(0, 3).map((reminder: EventReminderRecord) => (
                  <div key={reminder.id} className="nh-list-card">
                    <p className="text-sm font-medium">{reminder.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Reminder date {getDateLabel(reminder.remind_at)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Latest notifications</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/notifications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                notifications.slice(0, 4).map((notification: NotificationRecord) => (
                  <div key={notification.id} className="nh-list-card">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{getDateLabel(notification.created_at)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
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
  const summary = dashboard?.summary;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">President Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {dashboard?.club?.name ? `${dashboard.club.name} control tower` : "Club oversight and performance view"}
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Unable to load president dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Proposals" value={summary?.total_proposals ?? 0} icon={FileText} />
            <StatCard title="Pending" value={summary?.pending_proposals ?? 0} icon={Clock} variant="warning" />
            <StatCard title="Approved Events" value={summary?.upcoming_events ?? 0} icon={CalendarDays} variant="success" />
            <StatCard title="Executives" value={summary?.executive_count ?? 0} icon={Users} />
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
                <CardTitle className="text-lg">Upcoming Approved Events</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !dashboard?.upcoming_events.length ? (
                  <ProposalListState
                    isLoading={isLoading}
                    isError={false}
                    error={null}
                    emptyMessage="No approved events yet."
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
                    <NeoLoadingState title="Loading executive team" message="We are checking club leadership records." compact />
                  ) : (
                    <NeoEmptyState title="No executives linked yet" message="Executives connected to this club will appear here." />
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
                    <NeoLoadingState title="Loading recent movement" message="We are checking proposal activity." compact />
                  ) : (
                    <NeoEmptyState title="No proposal activity yet" message="Proposal updates will appear here once the club starts submitting." />
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
  const { role } = useRole();

  if (role === "advisor") return <AdvisorDashboard />;
  if (role === "admin") return <PolishedAdminDashboard />;
  if (role === "executive") return <ExecutiveDashboard />;
  if (role === "president") return <PresidentDashboard />;
  if (role === "student") return <StudentDashboard />;
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <NeoLoadingState title="Opening your Club Services workspace" message="We are loading your profile and dashboard access." />
    </div>
  );
}
