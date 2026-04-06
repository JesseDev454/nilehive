import { useRole } from "@/contexts/RoleContext";
import { mockProposals } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, XCircle, Plus, Bell } from "lucide-react";
import { Link } from "react-router-dom";
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
  icon: React.ElementType;
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

function ExecutiveDashboard() {
  const pending = mockProposals.filter((p) => p.status === "pending").length;
  const approved = mockProposals.filter((p) => p.status === "approved").length;
  const rejected = mockProposals.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your club event proposals</p>
        </div>
        <Link to="/proposals/new">
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending" value={pending} icon={Clock} variant="warning" />
        <StatCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} variant="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProposals.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.club} · {p.eventDate}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
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
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
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
              {pending.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {proposal.location} · Event {proposal.eventDate}
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
  const pending = mockProposals.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and manage the approval pipeline</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={mockProposals.length} icon={FileText} />
        <StatCard title="Pending" value={pending.length} icon={Clock} variant="warning" />
        <StatCard
          title="Approved"
          value={mockProposals.filter((p) => p.status === "approved").length}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Rejected"
          value={mockProposals.filter((p) => p.status === "rejected").length}
          icon={XCircle}
          variant="destructive"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Reviews</CardTitle>
          <Button variant="outline" size="sm" className="text-warning border-warning/30 hover:bg-warning/10">
            <Bell className="h-4 w-4 mr-2" />
            Trigger Reminders
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pending.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.submittedBy} · Submitted {p.submittedAt}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { role } = useRole();

  if (role === "advisor") return <AdvisorDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "president") return <AdminDashboard />;
  return <ExecutiveDashboard />;
}
