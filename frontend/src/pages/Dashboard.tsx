import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApiClientError, getAdminProposals, getExecutiveProposals, type ProposalRecord } from "@/lib/api";
import { FileText, Clock, CheckCircle, XCircle, Plus, Bell } from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";

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

function isApprovedStatus(status: string) {
  return status === "approved" || status === "advisor_approved";
}

function isRejectedStatus(status: string) {
  return status === "rejected" || status === "advisor_rejected" || status === "admin_rejected";
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

function ProposalSummaryList({ proposals, showClub }: { proposals: ProposalRecord[]; showClub?: boolean }) {
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

function ExecutiveDashboard() {
  const { data: proposals = [], isLoading, isError, error } = useQuery({
    queryKey: ["executive-dashboard-proposals"],
    queryFn: () => getExecutiveProposals(),
    retry: false
  });
  const pending = proposals.filter((proposal) => isPendingStatus(proposal.status)).length;
  const approved = proposals.filter((proposal) => isApprovedStatus(proposal.status)).length;
  const rejected = proposals.filter((proposal) => isRejectedStatus(proposal.status)).length;

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
        <StatCard title="Pending" value={pending} icon={Clock} variant="warning" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} variant="destructive" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Proposals</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/proposals">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading || isError || proposals.length === 0 ? (
            <ProposalListState isLoading={isLoading} isError={isError} error={error} />
          ) : (
            <ProposalSummaryList proposals={proposals} />
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
  const { data: proposals = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-dashboard-proposals"],
    queryFn: () => getAdminProposals(),
    retry: false
  });
  const pending = proposals.filter((proposal) => isPendingStatus(proposal.status));
  const approved = proposals.filter((proposal) => isApprovedStatus(proposal.status)).length;
  const rejected = proposals.filter((proposal) => isRejectedStatus(proposal.status)).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and manage the approval pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={proposals.length} icon={FileText} />
        <StatCard title="Pending" value={pending.length} icon={Clock} variant="warning" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} variant="destructive" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Reviews</CardTitle>
          <Button asChild variant="outline" size="sm" className="text-warning border-warning/30 hover:bg-warning/10">
            <Link to="/notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading || isError || pending.length === 0 ? (
            <ProposalListState
              isLoading={isLoading}
              isError={isError}
              error={error}
              emptyMessage="No proposals are waiting for admin review."
            />
          ) : (
            <ProposalSummaryList proposals={pending} showClub />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PresidentDashboardPlaceholder() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">President Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          President-specific backend routes are planned for a later stage.
        </p>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Live president metrics are not wired yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Stage 2 is focused on the backend routes that already exist: executive proposals, advisor reviews,
            admin proposal visibility, and notifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { role } = useRole();

  if (role === "advisor") return <AdvisorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "president") return <PresidentDashboardPlaceholder />;
  return <ExecutiveDashboard />;
}
