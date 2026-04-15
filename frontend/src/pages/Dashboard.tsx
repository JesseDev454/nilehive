import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  ApiClientError,
  getAdminOperationsDashboard,
  getExecutiveDashboard,
  getPresidentDashboard,
  type AdminOperationsDashboardRecord,
  type ApprovedEventRecord,
  type DashboardActivity,
  type DashboardProposalSummary,
  type ProposalRecord
} from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Gauge,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  XCircle
} from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";
import EventCalendar from "@/pages/EventCalendar";

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
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
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
    return <p className="text-sm text-muted-foreground">Loading proposals...</p>;
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="font-medium">Unable to load proposals</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">{emptyMessage || "No proposals found yet."}</p>;
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
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors gap-3">
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

function UpcomingEventsList({ events }: { events: ApprovedEventRecord[] }) {
  return (
    <div className="space-y-3">
      {events.slice(0, 4).map((event) => (
        <Link key={event.id} to={`/proposals/${event.proposal_id}`} className="block">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors gap-3">
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
        </Link>
      ))}
    </div>
  );
}

function RecentActivityList({ activity }: { activity: DashboardActivity[] }) {
  return (
    <div className="space-y-3">
      {activity.slice(0, 5).map((item) => (
        <Link key={item.id} to={`/proposals/${item.proposal_id}`} className="block">
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
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
    <div className="relative space-y-5 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
      {activity.slice(0, 6).map((item) => (
        <div key={item.id} className="relative flex items-start gap-3 pl-10">
          <div className="absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
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
    <Card className="overflow-hidden border-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-black tracking-tight text-primary">{value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
          </div>
          <div className={`rounded-2xl p-3 ${variants[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 rounded-[2rem] bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-80 rounded-2xl bg-muted" />
        <div className="h-80 rounded-2xl bg-muted" />
      </div>
    </div>
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
    <div className="rounded-2xl bg-muted/60 p-6 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function ExecutiveDashboard() {
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ["executive-dashboard"],
    queryFn: () => getExecutiveDashboard(),
    retry: false
  });
  const summary = dashboard?.summary;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your club event proposals</p>
        </div>
        <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Link to="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending" value={summary?.pending_proposals ?? 0} icon={Clock} variant="warning" />
        <StatCard title="Approved" value={summary?.approved_proposals ?? 0} icon={CheckCircle} variant="success" />
        <StatCard title="Rejected" value={summary?.rejected_proposals ?? 0} icon={XCircle} variant="destructive" />
      </div>

      {dashboard?.action_items?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.action_items.map((item) => (
              <div key={item.type} className="rounded-lg bg-muted p-3 text-sm">
                {item.label}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Proposals</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/proposals">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading || isError || !dashboard?.recent_proposals.length ? (
              <ProposalListState isLoading={isLoading} isError={isError} error={error} />
            ) : (
              <ProposalSummaryList proposals={dashboard.recent_proposals} />
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
            {isLoading || isError || !dashboard?.upcoming_events.length ? (
              <ProposalListState
                isLoading={isLoading}
                isError={isError}
                error={error}
                emptyMessage="No approved events yet."
              />
            ) : (
              <UpcomingEventsList events={dashboard.upcoming_events} />
            )}
          </CardContent>
        </Card>
      </div>
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
            <p className="text-sm text-muted-foreground">Loading advisor queue...</p>
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
                <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg gap-3">
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
            <StatCard title="Admin Reviews" value={pendingAdminCount} icon={Clock} variant="warning" />
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
                  <p className="text-sm text-muted-foreground">Loading operations queue...</p>
                ) : !dashboard?.pending_actions.length ? (
                  <p className="text-sm text-muted-foreground">No pending operational actions right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboard.pending_actions.map((action) => (
                      <div key={action.type} className="rounded-xl border bg-card p-4">
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
                  <p className="text-sm text-muted-foreground">Loading proposal states...</p>
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
                  <p className="text-sm text-muted-foreground">Loading club performance...</p>
                ) : !dashboard?.club_performance.length ? (
                  <p className="text-sm text-muted-foreground">No club records available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.club_performance.slice(0, 6).map((club) => (
                      <div key={club.club_id} className="rounded-xl border p-4">
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
                  <p className="text-sm text-muted-foreground">Loading snapshot...</p>
                ) : (
                  <>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Dues collected</p>
                      <p className="text-xl font-bold">{formatCurrency(summary?.dues_collected_amount)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Attendance rate</p>
                      <p className="text-xl font-bold">{formatNumber(summary?.attendance_rate)}%</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
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
                  <p className="text-sm text-muted-foreground">Checking report gaps...</p>
                ) : !dashboard?.missing_reports.length ? (
                  <p className="text-sm text-muted-foreground">No past approved events are missing reports.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.missing_reports.map((report) => (
                      <Link key={report.proposal_id} to={`/proposals/${report.proposal_id}`} className="block">
                        <div className="rounded-lg border p-3 hover:bg-accent transition-colors">
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
                  <p className="text-sm text-muted-foreground">Loading recent activity...</p>
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
      <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-warning/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-24 w-24 rounded-full bg-success/10 blur-2xl" />
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
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-white/60">Needs attention</p>
              <p className="mt-2 text-2xl font-black">{formatNumber(totalPending)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-white/60">Attendance rate</p>
              <p className="mt-2 text-2xl font-black">{formatNumber(summary?.attendance_rate)}%</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-white/10 p-4 backdrop-blur sm:col-span-1">
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
              title="Admin Reviews"
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
            <Card className="xl:col-span-2 border-0 shadow-sm">
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
                        <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4 transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-background p-3 text-primary shadow-sm">
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

            <Card className="border-0 shadow-sm">
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
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
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
            <Card className="xl:col-span-2 overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Club performance matrix</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A quick read on activity, dues, reports, and accountability.
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/70 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Club</th>
                          <th className="px-4 py-4 font-semibold">Members</th>
                          <th className="px-4 py-4 font-semibold">Pending</th>
                          <th className="px-4 py-4 font-semibold">Dues</th>
                          <th className="px-4 py-4 font-semibold">Reports</th>
                          <th className="px-6 py-4 font-semibold">Pulse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.club_performance.slice(0, 7).map((club) => {
                          const pulse = getClubPulse(club);
                          return (
                            <tr key={club.club_id} className="border-t transition-colors hover:bg-muted/40">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-xs font-black text-primary-foreground">
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
                              <td className="px-4 py-4">
                                <p className="font-semibold">{club.active_members}/{club.total_members}</p>
                                <p className="text-xs text-muted-foreground">active</p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold">{club.pending_proposals}</p>
                                <p className="text-xs text-muted-foreground">{club.open_tasks} open task(s)</p>
                              </td>
                              <td className="px-4 py-4">
                                <div className="min-w-24">
                                  <div className="mb-1 flex justify-between text-xs">
                                    <span>{club.dues_collection_rate}%</span>
                                    <span>{formatCurrency(club.dues_collected_amount)}</span>
                                  </div>
                                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-success"
                                      style={{ width: `${Math.min(100, club.dues_collection_rate)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold">{club.reports_submitted}</p>
                                <p className="text-xs text-muted-foreground">{club.feedback_count} feedback</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pulse.className}`}>
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

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Institution snapshot</CardTitle>
                <p className="text-sm text-muted-foreground">Numbers that help you sense the system at a glance.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl bg-muted/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    Dues collected
                  </div>
                  <p className="text-2xl font-black text-primary">{formatCurrency(summary?.dues_collected_amount)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Across all tracked club payment records.</p>
                </div>
                <div className="rounded-2xl bg-muted/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Attendance health
                  </div>
                  <p className="text-2xl font-black text-primary">{formatNumber(summary?.attendance_rate)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNumber(summary?.event_attendance_count)} attendance marks from {formatNumber(summary?.event_rsvp_count)} RSVP records.
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/70 p-4">
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
            <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-xl">
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
                  <div className="rounded-2xl bg-white/10 p-6 text-center">
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
                        <div className="rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{report.title}</p>
                              <p className="mt-1 text-xs text-primary-foreground/65">
                                Event date {getDateLabel(report.event_date)}
                              </p>
                            </div>
                            <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
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

            <Card className="border-0 shadow-sm">
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
                  <UpcomingEventsList events={dashboard.upcoming_events} />
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
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading executive team..." : "No executives are linked to this club yet."}
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Loading activity..." : "No proposal activity yet."}
                  </p>
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
  if (role === "president") return <PresidentDashboard />;
  if (role === "student") return <EventCalendar />;
  return <ExecutiveDashboard />;
}
