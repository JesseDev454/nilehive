import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Banknote, CalendarDays, ClipboardList, FileText, MessageSquare, Users } from "lucide-react";
import { NeoLoadingState, NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getAdminClubDashboard, type TaskRecord } from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load this club dashboard right now.";
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getDateLabel(value?: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function getTaskStatusLabel(status: TaskRecord["status"]) {
  return status.replace(/_/g, " ");
}

function TaskBadge({ status }: { status: TaskRecord["status"] }) {
  const classNames = {
    pending: "bg-warning/15 text-warning hover:bg-warning/15",
    in_progress: "bg-primary/15 text-primary hover:bg-primary/15",
    completed: "bg-success/15 text-success hover:bg-success/15",
    blocked: "bg-destructive/15 text-destructive hover:bg-destructive/15"
  };

  return <Badge className={`${classNames[status]} capitalize`}>{getTaskStatusLabel(status)}</Badge>;
}

function TaskList({ tasks }: { tasks: TaskRecord[] }) {
  if (!tasks.length) {
    return (
      <div className="nh-empty">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No tasks assigned yet</p>
        <p className="mt-1 text-sm text-muted-foreground">President-assigned tasks will appear here for Club Services oversight.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="nh-list-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black uppercase">{task.title}</p>
                <TaskBadge status={task.status} />
                <Badge variant="outline" className="capitalize">{task.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Assigned to {task.assigned_to_profile?.full_name || task.assigned_to}
              </p>
              {task.description ? <p className="mt-2 text-sm">{task.description}</p> : null}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
              Due {getDateLabel(task.due_date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminClubDashboard() {
  const { role } = useRole();
  const { clubId = "" } = useParams();
  const {
    data: dashboard,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["admin-club-dashboard", clubId],
    queryFn: () => getAdminClubDashboard(clubId),
    enabled: role === "admin" && Boolean(clubId),
    retry: false
  });

  if (role !== "admin") {
    return (
      <div className="nh-page">
        <NeoPageHeader eyebrow="Club Services" title="Club dashboard" description="This club operations view is for Club Services admins." />
        <NeoStateCard icon={Users} title="Club dashboard access is restricted" message="Only Club Services admins can inspect all-club progress." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="nh-page">
        <NeoLoadingState title="Loading club progress" message="We are gathering proposals, members, dues, tasks, reports, and feedback for this club." />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="nh-page">
        <NeoPageHeader eyebrow="Club Services" title="Club dashboard" description="We could not load this club operations view." />
        <NeoStateCard icon={Users} title="Unable to load club dashboard" message={getErrorMessage(error)} />
      </div>
    );
  }

  const { club, summary } = dashboard;

  return (
    <div className="nh-page">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <NeoPageHeader
          eyebrow="Club Services Drilldown"
          title={club.name}
          description={`${club.code || "No club code"} - Full operations view for this club.`}
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to matrix
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/tasks?club_id=${club.id}`}>View tasks</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/members?club_id=${club.id}`}>View members</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NeoMetricCard title="Active Members" value={`${summary.active_members}/${summary.total_members}`} icon={Users} tone="green" />
        <NeoMetricCard title="Pending Proposals" value={summary.pending_proposals} icon={FileText} tone="gold" />
        <NeoMetricCard title="Open Tasks" value={summary.open_tasks} icon={ClipboardList} tone="navy" />
        <NeoMetricCard title="Dues Collected" value={formatCurrency(summary.dues_collected_amount)} icon={Banknote} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Accountability</CardTitle>
            <p className="text-sm text-muted-foreground">Read-only task visibility for Club Services oversight.</p>
          </CardHeader>
          <CardContent>
            <TaskList tasks={dashboard.tasks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Club Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="nh-list-card">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Dues collection</p>
              <p className="mt-1 text-2xl font-black">{summary.dues_collection_rate}%</p>
            </div>
            <div className="nh-list-card">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Attendance health</p>
              <p className="mt-1 text-2xl font-black">{summary.attendance_rate}%</p>
              <p className="text-xs text-muted-foreground">{summary.event_attendance_count} attendance marks from {summary.event_rsvp_count} RSVP records.</p>
            </div>
            <div className="nh-list-card">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Feedback</p>
              <p className="mt-1 text-2xl font-black">{summary.feedback_count}</p>
              <p className="text-xs text-muted-foreground">Average rating {summary.average_rating ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proposal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="nh-list-card flex items-center justify-between">
              <span>Total proposals</span>
              <strong>{summary.total_proposals}</strong>
            </div>
            <div className="nh-list-card flex items-center justify-between">
              <span>Approved events</span>
              <strong>{summary.approved_events}</strong>
            </div>
            <div className="nh-list-card flex items-center justify-between">
              <span>Missing reports</span>
              <strong>{summary.missing_reports}</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!dashboard.recent_members.length ? (
              <p className="text-sm text-muted-foreground">No members are recorded yet.</p>
            ) : (
              dashboard.recent_members.map((member) => (
                <div key={member.id} className="nh-list-card">
                  <p className="font-semibold">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">{member.student_id} - {member.club_role} - {member.membership_status}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!dashboard.recent_activity.length ? (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              dashboard.recent_activity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="nh-list-card">
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.message}</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary">{getDateLabel(activity.created_at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Events, Reports, And Feedback</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="nh-list-card">
            <CalendarDays className="mb-2 h-5 w-5 text-primary" />
            <p className="font-black">{summary.approved_events} approved event(s)</p>
            <p className="text-sm text-muted-foreground">Official events for this club.</p>
          </div>
          <div className="nh-list-card">
            <FileText className="mb-2 h-5 w-5 text-primary" />
            <p className="font-black">{summary.reports_submitted} report(s)</p>
            <p className="text-sm text-muted-foreground">Post-event documentation submitted.</p>
          </div>
          <div className="nh-list-card">
            <MessageSquare className="mb-2 h-5 w-5 text-primary" />
            <p className="font-black">{summary.feedback_count} feedback record(s)</p>
            <p className="text-sm text-muted-foreground">Student feedback captured after events.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
