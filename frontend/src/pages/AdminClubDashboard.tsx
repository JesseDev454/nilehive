import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Banknote, CalendarDays, ClipboardList, FileText, MessageSquare, Users } from "lucide-react";
import { ClublyLoadingState, ClublyMetricCard, ClublyPageHeader, ClublyStateCard } from "@/components/Clubly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getAdminClubDashboard, type TaskRecord } from "@/lib/api";
import { downloadAdminClubPerformancePdf } from "@/lib/exports";
import { actionError, actionSuccess } from "@/lib/notify";

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
      <div className="clb-empty">
        <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No tasks assigned yet</p>
        <p className="mt-1 text-sm text-muted-foreground">President-assigned tasks will appear here for Club Services oversight.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="clb-list-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{task.title}</p>
                <TaskBadge status={task.status} />
                <Badge variant="outline" className="capitalize">{task.priority}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Assigned to {task.assigned_to_profile?.full_name || task.assigned_to}
              </p>
              {task.description ? <p className="mt-2 text-sm">{task.description}</p> : null}
            </div>
            <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground">
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
  const [isDownloadingPerformance, setIsDownloadingPerformance] = useState(false);
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
      <div className="clb-screen">
        <ClublyPageHeader eyebrow="Club Services" title="Club dashboard" description="This club operations view is for Club Services admins." />
        <ClublyStateCard icon={Users} title="Club dashboard access is restricted" message="Only Club Services admins can inspect all-club progress." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="clb-screen">
        <ClublyLoadingState title="Loading club progress" message="We are gathering proposals, members, dues, tasks, reports, and feedback for this club." />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="clb-screen">
        <ClublyPageHeader eyebrow="Club Services" title="Club dashboard" description="We could not load this club operations view." />
        <ClublyStateCard icon={Users} title="Unable to load club dashboard" message={getErrorMessage(error)} />
      </div>
    );
  }

  const { club, summary } = dashboard;
  const visibleRecentMembers = dashboard.recent_members.filter((member) => member.membership_status !== "alumni");

  async function handleDownloadPerformance() {
    setIsDownloadingPerformance(true);

    try {
      await downloadAdminClubPerformancePdf(dashboard);
      actionSuccess("Club performance download ready", "The club performance PDF has been prepared for your device.");
    } catch (downloadError) {
      actionError("Could not download club performance", downloadError, getErrorMessage(downloadError));
    } finally {
      setIsDownloadingPerformance(false);
    }
  }

  return (
    <div className="clb-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ClublyPageHeader
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
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadPerformance} disabled={isDownloadingPerformance}>
            {isDownloadingPerformance ? "Preparing PDF..." : "Download Performance"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ClublyMetricCard title="Active Members" value={`${summary.active_members}/${summary.total_members}`} icon={Users} tone="green" />
        <ClublyMetricCard title="Pending Proposals" value={summary.pending_proposals} icon={FileText} tone="gold" />
        <ClublyMetricCard title="Open Tasks" value={summary.open_tasks} icon={ClipboardList} tone="navy" />
        <ClublyMetricCard title="Dues Collected" value={formatCurrency(summary.dues_collected_amount)} icon={Banknote} tone="green" />
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
            <div className="clb-list-card bg-primary text-primary-foreground">
              <p className="text-xs font-bold tracking-[0.12em] opacity-80">Overall health score</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="text-5xl font-bold tracking-[-0.06em]">{summary.club_health_score}</p>
                <p className="rounded-full border border-primary-foreground px-3 py-1 text-xs font-bold tracking-[0.08em]">
                  {summary.club_health_label}
                </p>
              </div>
            </div>
            <div className="clb-list-card">
              <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground">Dues collection</p>
              <p className="mt-1 text-2xl font-bold">{summary.dues_collection_rate}%</p>
            </div>
            <div className="clb-list-card">
              <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground">Attendance health</p>
              <p className="mt-1 text-2xl font-bold">{summary.attendance_rate}%</p>
              <p className="text-xs text-muted-foreground">{summary.event_attendance_count} attendance marks from {summary.event_rsvp_count} RSVP records.</p>
            </div>
            <div className="clb-list-card">
              <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground">Feedback</p>
              <p className="mt-1 text-2xl font-bold">{summary.feedback_count}</p>
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
            <div className="clb-list-card flex items-center justify-between">
              <span>Total proposals</span>
              <strong>{summary.total_proposals}</strong>
            </div>
            <div className="clb-list-card flex items-center justify-between">
              <span>Events</span>
              <strong>{summary.approved_events}</strong>
            </div>
            <div className="clb-list-card flex items-center justify-between">
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
            {!visibleRecentMembers.length ? (
              <p className="text-sm text-muted-foreground">No members are recorded yet.</p>
            ) : (
              visibleRecentMembers.map((member) => (
                <div key={member.id} className="clb-list-card">
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
                <div key={activity.id} className="clb-list-card">
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.message}</p>
                  <p className="mt-1 text-[11px] font-bold tracking-[0.12em] text-primary">{getDateLabel(activity.created_at)}</p>
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
          <div className="clb-list-card">
            <CalendarDays className="mb-2 h-5 w-5 text-primary" />
            <p className="font-bold">{summary.approved_events} event(s)</p>
            <p className="text-sm text-muted-foreground">Official events for this club.</p>
          </div>
          <div className="clb-list-card">
            <FileText className="mb-2 h-5 w-5 text-primary" />
            <p className="font-bold">{summary.reports_submitted} report(s)</p>
            <p className="text-sm text-muted-foreground">Post-event documentation submitted.</p>
          </div>
          <div className="clb-list-card">
            <MessageSquare className="mb-2 h-5 w-5 text-primary" />
            <p className="font-bold">{summary.feedback_count} feedback record(s)</p>
            <p className="text-sm text-muted-foreground">Student feedback captured after events.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
