import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getAdminProposals, getPresidentProposals, type ProposalRecord } from "@/lib/api";
import {
  getProposalOwnerLabel,
  getProposalPrimaryActionLabel,
  isProposalEditable
} from "@/lib/proposalWorkflow";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load proposals right now.";
}

function getDateLabel(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

function getProposalClubLabel(proposal: ProposalRecord) {
  return proposal.club?.name || "Unknown club";
}

export default function Proposals() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const isAdmin = role === "admin";
  const isPresident = role === "president";
  const canFetch = isAdmin || isPresident;
  useEffect(() => {
    setPage(1);
  }, [statusFilter, role]);

  const { data: proposalsPage = emptyPaginatedResponse<ProposalRecord>(), isLoading, isError, error } = useQuery({
    queryKey: ["proposals", role, statusFilter, page],
    queryFn: async () => {
      if (isAdmin) {
        return getAdminProposals({
          status: statusFilter === "all" ? undefined : statusFilter,
          page,
          page_size: DEFAULT_PAGE_SIZE
        });
      }

      return getPresidentProposals({
        page,
        page_size: DEFAULT_PAGE_SIZE
      });
    },
    enabled: canFetch,
    retry: false
  });
  const proposals = proposalsPage.items;

  const pageCopy = useMemo(() => {
    if (isAdmin) {
      return {
        eyebrow: "Club Services Review",
        title: "Final Review",
        description: "Review proposal movement across clubs without changing president-owned proposal access."
      };
    }

    if (isPresident) {
      return {
        eyebrow: "Club Leadership",
        title: "Club Proposals",
        description: "Create, continue, resubmit, and track proposals submitted by the club president."
      };
    }

    return {
      eyebrow: "Restricted",
      title: "Proposals",
      description: "Proposal list access is not available for this role yet"
    };
  }, [isAdmin, isPresident]);

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow={pageCopy.eyebrow}
        title={pageCopy.title}
        description={pageCopy.description}
        actions={
          isPresident ? (
            <Button asChild>
              <Link to="/proposals/new">
                <Plus className="h-4 w-4" />
                Create Proposal
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex justify-end">
        {isAdmin && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_advisor_review">Pending advisor review</SelectItem>
              <SelectItem value="pending_admin_review">Awaiting Club Services final review</SelectItem>
              <SelectItem value="advisor_rejected">Advisor rejected</SelectItem>
              <SelectItem value="admin_rejected">Admin rejected</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {!canFetch ? (
        <NeoStateCard
          icon={FileText}
          title="Proposal access is restricted"
          message="Executives use tasks and approved events. Proposal creation and review belong to presidents, advisors, and Club Services."
        />
      ) : isLoading ? (
        <NeoLoadingState title="Loading proposal records" message="We are getting the latest proposal records." />
      ) : isError ? (
        <NeoStateCard icon={FileText} title="Unable to load proposals" message={getErrorMessage(error)} tone="danger" />
      ) : proposals.length === 0 ? (
        <NeoStateCard icon={FileText} title="No proposals found" message="Proposal records will appear here once the club president starts a proposal." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground bg-primary text-primary-foreground">
                    <th className="p-4 text-left text-xs font-black uppercase tracking-[0.14em]">Title</th>
                    <th className="hidden p-4 text-left text-xs font-black uppercase tracking-[0.14em] md:table-cell">
                      {isAdmin ? "Club" : "Currently With"}
                    </th>
                    <th className="hidden p-4 text-left text-xs font-black uppercase tracking-[0.14em] sm:table-cell">Date</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-[0.14em]">Status</th>
                    <th className="p-4 text-left text-xs font-black uppercase tracking-[0.14em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal: ProposalRecord) => (
                    <tr key={proposal.id} className="border-b-2 border-foreground transition-colors hover:bg-accent/25">
                      <td className="p-4">
                        <Link to={`/proposals/${proposal.id}`} className="font-black hover:underline">
                          {proposal.title}
                        </Link>
                      </td>
                      <td className="hidden p-4 text-muted-foreground md:table-cell">
                        {isAdmin ? getProposalClubLabel(proposal) : getProposalOwnerLabel(proposal.current_owner_role)}
                      </td>
                      <td className="hidden p-4 text-muted-foreground sm:table-cell">
                        {getDateLabel(proposal.event_date)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="p-4">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 p-4 md:hidden">
              {proposals.map((proposal: ProposalRecord) => (
                <div key={proposal.id} className="nh-mobile-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                        {getDateLabel(proposal.event_date)}
                      </p>
                      <Link to={`/proposals/${proposal.id}`} className="mt-2 block text-lg font-black hover:underline">
                        {proposal.title}
                      </Link>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {isAdmin ? getProposalClubLabel(proposal) : getProposalOwnerLabel(proposal.current_owner_role)}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
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
                </div>
              ))}
            </div>
            <DataPagination
              page={proposalsPage.page}
              pageSize={proposalsPage.page_size}
              total={proposalsPage.total}
              hasNext={proposalsPage.has_next}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
