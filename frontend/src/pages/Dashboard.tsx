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
  type ApprovedEventRecord,
  type DashboardActivity,
  type DashboardProposalSummary,
  type ProposalRecord
} from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Plus,
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
  activity: {
    id: string;
    type: string;
    club_id: string;
    title: string;
    message: string;
    created_at: string;
  }[];
}) {
  return (
    <div className="space-y-3">
      {activity.slice(0, 6).map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Club {item.club_id} - {getDateLabel(item.created_at)}
            </p>
          </div>
        </div>
      ))}
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
  if (role === "admin") return <AdminDashboard />;
  if (role === "president") return <PresidentDashboard />;
  if (role === "student") return <EventCalendar />;
  return <ExecutiveDashboard />;
}
