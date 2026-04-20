import { StatusBadge } from "@/components/StatusBadge";
import { NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";
import { ApiClientError, submitAdvisorDecision } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { actionError, actionSuccess } from "@/lib/notify";

function getDecisionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to submit advisor decision right now.";
}

export default function Approvals() {
  const { data: pending = [], isLoading, isError, error } = useAdvisorPendingProposals();
  const queryClient = useQueryClient();
  const [remarksByProposalId, setRemarksByProposalId] = useState<Record<string, string>>({});
  const [decidingProposalId, setDecidingProposalId] = useState<string | null>(null);

  async function handleDecision(proposalId: string, decision: "approve" | "reject") {
    setDecidingProposalId(proposalId);

    try {
      await submitAdvisorDecision(proposalId, {
        decision,
        remarks: remarksByProposalId[proposalId]?.trim() || undefined
      });

      actionSuccess(decision === "approve" ? "Proposal approved" : "Proposal returned", "The proposal queue has been updated.");
      await queryClient.invalidateQueries({ queryKey: ["advisor-pending-proposals"] });
    } catch (decisionError) {
      actionError("Decision failed", decisionError, getDecisionErrorMessage(decisionError));
    } finally {
      setDecidingProposalId(null);
    }
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Advisor Review"
        title="Pending Approvals"
        description={`${pending.length} proposal${pending.length !== 1 ? "s" : ""} awaiting your review.`}
      />

      {isLoading ? (
        <NeoStateCard icon={Clock} title="Loading approvals" message="We are getting proposals assigned to your club." />
      ) : isError ? (
        <NeoStateCard
          icon={Clock}
          title="Unable to load pending approvals"
          message={getAdvisorPendingProposalsErrorMessage(error)}
          tone="danger"
        />
      ) : pending.length === 0 ? (
        <NeoStateCard icon={Clock} title="No pending approvals" message="New president-submitted proposals will appear here." />
      ) : (
        <div className="space-y-3">
          {pending.map((proposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black uppercase">{proposal.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {proposal.location} - Event {proposal.eventDate} - Submitted {proposal.submittedAt}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add advisor remarks before approving or rejecting..."
                    rows={2}
                    value={remarksByProposalId[proposal.id] ?? ""}
                    onChange={(event) =>
                      setRemarksByProposalId((current) => ({
                        ...current,
                        [proposal.id]: event.target.value
                      }))
                    }
                  />
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button asChild variant="outline">
                      <Link to={`/proposals/${proposal.id}`}>View details</Link>
                    </Button>
                    <Button
                      className="bg-success hover:bg-success/90 text-success-foreground"
                      disabled={decidingProposalId === proposal.id}
                      onClick={() => handleDecision(proposal.id, "approve")}
                    >
                      {decidingProposalId === proposal.id ? "Submitting..." : "Approve"}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={decidingProposalId === proposal.id}
                      onClick={() => handleDecision(proposal.id, "reject")}
                    >
                      {decidingProposalId === proposal.id ? "Submitting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
