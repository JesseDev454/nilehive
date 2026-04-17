import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getAdminProposals, getPresidentProposals, type ProposalRecord } from "@/lib/api";
import {
  getProposalOwnerLabel,
  getProposalPrimaryActionLabel,
  getProposalStatusMeta,
  isProposalEditable
} from "@/lib/proposalWorkflow";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load proposals right now.";
}

function getDateLabel(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

export default function Proposals() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState("all");
  const isAdmin = role === "admin";
  const isPresident = role === "president";
  const canFetch = isAdmin || isPresident;

  const { data: proposals = [], isLoading, isError, error } = useQuery({
    queryKey: ["proposals", role, statusFilter],
    queryFn: async () => {
      if (isAdmin) {
        return getAdminProposals({
          status: statusFilter === "all" ? undefined : statusFilter
        });
      }

      return getPresidentProposals();
    },
    enabled: canFetch,
    retry: false
  });

  const pageCopy = useMemo(() => {
    if (isAdmin) {
      return {
        title: "All Proposals",
        description: "Review real proposal data across clubs"
      };
    }

    if (isPresident) {
      return {
        title: "Club Proposals",
        description: "Track proposals submitted by the club president"
      };
    }

    return {
      title: "Proposals",
      description: "Proposal list access is not available for this role yet"
    };
  }, [isAdmin, isPresident]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{pageCopy.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{pageCopy.description}</p>
        </div>
        {isAdmin && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_advisor_review">Pending advisor review</SelectItem>
              <SelectItem value="pending_admin_review">Pending admin review</SelectItem>
              <SelectItem value="advisor_rejected">Advisor rejected</SelectItem>
              <SelectItem value="admin_rejected">Admin rejected</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {!canFetch ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Use the advisor approvals queue or the role dashboard for this account.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading proposals...</p>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Unable to load proposals</p>
            <p className="text-sm text-muted-foreground mt-2">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No proposals found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">
                      {isAdmin ? "Club ID" : "Currently With"}
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal: ProposalRecord) => (
                    <tr key={proposal.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <Link to={`/proposals/${proposal.id}`} className="font-medium hover:underline">
                          {proposal.title}
                        </Link>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {isAdmin ? proposal.club_id ?? "-" : getProposalOwnerLabel(proposal.current_owner_role)}
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {getDateLabel(proposal.event_date)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="p-3">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to={
                              isPresident && isProposalEditable(proposal.status)
                                ? `/proposals/new?edit=${proposal.id}`
                                : `/proposals/${proposal.id}`
                            }
                          >
                            {isPresident ? getProposalPrimaryActionLabel(proposal.status) : "View"}
                          </Link>
                        </Button>
                        <p className="mt-1 text-xs text-muted-foreground hidden lg:block">
                          {getProposalStatusMeta(proposal.status).label}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
