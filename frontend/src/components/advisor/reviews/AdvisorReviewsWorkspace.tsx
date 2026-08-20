import { useState, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  Filter,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { AdvisorProposalInspectorModal } from "./AdvisorProposalInspectorModal";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ADVISOR_MOCK_PROPOSALS, type Proposal } from "@/data/advisorMockData";
import { applyAdvisorMockDecision, isReturnedProposalStatus } from "@/lib/proposalStatus";

const ASSIGNED_CLUBS = [
  { id: "club-8", name: "Nile Google Developers", code: "NGD" },
  { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
  { id: "club-11", name: "Nile Startup Campus", code: "NSC" }
];

export function AdvisorReviewsWorkspace() {
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    // Return proposals for the assigned clubs
    return ADVISOR_MOCK_PROPOSALS.filter((p) =>
      ["club-8", "club-4", "club-11", "google-developers", "startup-campus", "climate-club"].includes(p.clubId)
    );
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Quick review modal state
  const [quickActionModal, setQuickActionModal] = useState<{
    proposal: Proposal;
    type: "approve" | "return";
  } | null>(null);
  const [quickRemarks, setQuickRemarks] = useState("");
  const [quickRemarksError, setQuickRemarksError] = useState<string | null>(null);

  const pendingCount = useMemo(() => {
    return proposals.filter((p) => p.status === "pending_advisor_review").length;
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch =
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && proposal.status === "pending_advisor_review") ||
        (statusFilter === "endorsed" && (proposal.status === "pending_admin_review" || proposal.status === "approved")) ||
        (statusFilter === "returned" && isReturnedProposalStatus(proposal.status));

      const matchesClub =
        clubFilter === "all" ||
        proposal.clubId === clubFilter ||
        (clubFilter === "club-8" && proposal.clubName.includes("Google")) ||
        (clubFilter === "club-4" && proposal.clubName.includes("Climate")) ||
        (clubFilter === "club-11" && proposal.clubName.includes("Startup"));

      return matchesSearch && matchesStatus && matchesClub;
    });
  }, [proposals, searchTerm, statusFilter, clubFilter]);

  const handleOpenInspector = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsInspectorOpen(true);
  };

  const handleApproveProposal = (proposalId: string, remarks?: string) => {
    setProposals((current) =>
        current.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: applyAdvisorMockDecision(p.status, "approve"),
                advisorRemarks: remarks || "Approved by Dr. Kalu Okonkwo and sent to Admin for the final decision."
              }
            : p
        )
      );

    toast.success("Proposal approved", { description: "Sent to Admin for the final decision." });
  };

  const handleReturnProposal = (proposalId: string, mandatoryRemarks: string) => {
    setProposals((current) =>
        current.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: applyAdvisorMockDecision(p.status, "reject"),
                advisorRemarks: mandatoryRemarks
              }
            : p
        )
      );

    toast.success("Returned for changes", { description: "Your remarks were saved for the Club President." });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      <AdvisorRoleHeader
        title="Proposal Review Queue"
        subtitle="Review proposals from your assigned clubs. Approve to send to Admin, or return with mandatory remarks."
        pendingCount={pendingCount}
        assignedClubs={ASSIGNED_CLUBS}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search proposals by title, president, venue, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Club Filter */}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
            className="h-9 w-full min-w-0 px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-auto"
            aria-label="Filter proposals by club"
          >
            <option value="all">All Assigned Clubs</option>
            <option value="club-8">Nile Google Developers</option>
            <option value="club-4">Nile Climate Initiatives</option>
            <option value="club-11">Nile Startup Campus</option>
          </select>

          {/* Status Tabs */}
          <div className="grid min-w-0 grid-cols-2 items-center rounded-xl bg-muted p-1 text-xs sm:flex">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({proposals.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                statusFilter === "pending" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("endorsed")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "endorsed" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("returned")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "returned" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Returned
            </button>
          </div>
        </div>
      </div>

      {/* Proposals List / Grid */}
      {filteredProposals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50 space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground text-base">No proposals found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {statusFilter === "pending"
              ? "There are no pending proposals waiting for your review from your assigned clubs."
              : "No proposals match your current search and filter selections."}
          </p>
          {(searchTerm || statusFilter !== "all" || clubFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setClubFilter("all");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProposals.map((proposal) => {
            const isPending = proposal.status === "pending_advisor_review";
            const formattedBudget = new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0
            }).format(proposal.budgetEstimate || 0);

            return (
              <Card
                key={proposal.id}
                className={`overflow-hidden border transition-all duration-200 ${
                  isPending
                    ? "border-primary/40 bg-card shadow-sm hover:border-primary"
                    : "border-border/80 bg-card/60"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block text-[11px] font-bold tracking-wider text-primary uppercase">
                        {proposal.clubName}
                      </span>
                      <h2 className="font-bold text-foreground text-base line-clamp-2 leading-snug">
                        {proposal.title}
                      </h2>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {proposal.description}
                  </p>

                  {/* Chips Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{proposal.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{proposal.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{proposal.expectedParticipants} RSVPs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Coins className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{formattedBudget}</span>
                    </div>
                  </div>

                  {/* Remarks summary if any */}
                  {proposal.advisorRemarks && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-xs text-blue-900 dark:text-blue-200">
                      <p className="font-semibold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        Advisor Feedback:
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-muted-foreground">{proposal.advisorRemarks}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInspector(proposal)}
                      className="text-xs gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect Read-Only Body
                    </Button>

                    {isPending ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInspector(proposal)}
                          className="text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          Return...
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenInspector(proposal)}
                          className="text-xs bg-primary text-primary-foreground font-semibold"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Review complete
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Read-Only Proposal Inspector Modal */}
      <AdvisorProposalInspectorModal
        proposal={selectedProposal}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setSelectedProposal(null);
        }}
        onApprove={handleApproveProposal}
        onReturnForChanges={handleReturnProposal}
      />
    </div>
  );
}
