import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";
import { ApiClientError, submitAdvisorDecision } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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

      toast.success(decision === "approve" ? "Proposal approved" : "Proposal rejected");
      await queryClient.invalidateQueries({ queryKey: ["advisor-pending-proposals"] });
    } catch (decisionError) {
      toast.error("Decision failed", {
        description: getDecisionErrorMessage(decisionError)
      });
    } finally {
      setDecidingProposalId(null);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {pending.length} proposal{pending.length !== 1 ? "s" : ""} awaiting your review
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading pending approvals...</p>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Unable to load pending approvals</p>
            <p className="text-sm text-muted-foreground mt-2">
              {getAdvisorPendingProposalsErrorMessage(error)}
            </p>
          </CardContent>
        </Card>
      ) : pending.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{proposal.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {proposal.location} · Event {proposal.eventDate} · Submitted {proposal.submittedAt}
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
