import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  FileText,
  Lock,
  MapPin,
  School,
  Send,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  XCircle
} from "lucide-react";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { AdvisorProposalInspectorModal } from "../reviews/AdvisorProposalInspectorModal";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ADVISOR_MOCK_PROPOSALS, type Proposal } from "@/data/advisorMockData";
import { OFFICIAL_14_CLUBS_DATA } from "@/data/official14ClubsData";
import { toast } from "sonner";
import { applyAdvisorMockDecision } from "@/lib/proposalStatus";

const ASSIGNED_CLUBS = [
  { id: "club-8", name: "Nile Google Developers", code: "NGD" },
  { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
  { id: "club-11", name: "Nile Startup Campus", code: "NSC" }
];

export function AdvisorHomeWorkspace() {
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    return ADVISOR_MOCK_PROPOSALS.filter((p) =>
      ["club-8", "club-4", "club-11", "google-developers", "startup-campus", "climate-club"].includes(p.clubId)
    );
  });

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const pendingProposals = proposals.filter((p) => p.status === "pending_advisor_review");
  const assignedClubsData = OFFICIAL_14_CLUBS_DATA.filter((c) =>
    ["NGDG", "NCIC", "NSC"].includes(c.code)
  );

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
    <div className="space-y-7 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      <AdvisorRoleHeader
        title="Advisor Home"
        subtitle="Review proposals for assigned clubs and read recent event reports."
        pendingCount={pendingProposals.length}
        assignedClubs={ASSIGNED_CLUBS}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/advisor/reviews" className="block group">
          <Card className="border border-border/80 bg-card hover:border-primary/50 transition-all">
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Decisions</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground font-display">
                {pendingProposals.length}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                <span>Open review queue</span>
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/advisor/clubs" className="block group">
          <Card className="border border-border/80 bg-card hover:border-primary/50 transition-all">
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Assigned Clubs</span>
                <School className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground font-display">
                {assignedClubsData.length}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                <span>View portfolio</span>
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/advisor/reports" className="block group">
          <Card className="border border-border/80 bg-card hover:border-primary/50 transition-all">
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Concluded Reports</span>
                <FileText className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground font-display">
                3
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                <span>Read audits</span>
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/advisor/clubs" className="block group">
          <Card className="border border-border/80 bg-card hover:border-primary/50 transition-all">
            <CardContent className="p-5 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Events</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground font-display">
                2
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                <span>View calendar</span>
                <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Priority Proposal Review Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Proposal Review Queue
            </h2>
            <p className="text-xs text-muted-foreground">
              Proposals submitted by presidents of your assigned clubs awaiting advisor decision.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/advisor/reviews">View All ({proposals.length})</Link>
          </Button>
        </div>

        {pendingProposals.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-card/60">
            <CardContent className="p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-foreground">Review Queue Cleared</p>
              <p className="text-xs text-muted-foreground">
                All submitted proposals from your assigned clubs have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingProposals.map((proposal) => {
              const formattedBudget = new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0
              }).format(proposal.budgetEstimate || 0);

              return (
                <Card
                  key={proposal.id}
                  className="overflow-hidden border border-primary/30 bg-card shadow-sm hover:border-primary transition-all"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                          {proposal.clubName}
                        </span>
                        <h3 className="font-bold text-base text-foreground leading-snug">
                          {proposal.title}
                        </h3>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {proposal.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{proposal.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{proposal.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{proposal.expectedParticipants} RSVPs</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Coins className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{formattedBudget}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInspector(proposal)}
                        className="text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect Body
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInspector(proposal)}
                          className="text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800"
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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Clubs Portfolio Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground font-display flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Assigned Clubs Portfolio (3 Clubs)
            </h2>
            <p className="text-xs text-muted-foreground">
              Official student chapters under faculty advisory mentorship.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/advisor/clubs">View All Details</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {assignedClubsData.map((club) => (
            <Card key={club.id} className="border border-border/80 bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="font-bold text-primary bg-primary/10">
                  {club.code}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{club.memberCount} members</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{club.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">President: {club.presidentName}</p>
              </div>
              <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>{club.meetingSchedule}</span>
                <Link to="/advisor/clubs" className="text-primary font-semibold hover:underline">
                  Details &rarr;
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

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
