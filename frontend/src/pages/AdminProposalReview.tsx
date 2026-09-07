import { StatusBadge } from "@/components/StatusBadge";
import { OneClubLoadingState, OneClubMetaChip, OneClubPageHeader, OneClubStateCard } from "@/components/OneClub";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiClientError, submitAdminDecision, getAdminProposals } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { actionError, actionSuccess } from "@/lib/notify";

function getDecisionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to submit admin decision right now.";
}

export default function AdminProposalReview() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-pending-proposals"],
    queryFn: () => getAdminProposals({
      current_stage: "admin_review",
      page: 1,
      page_size: 100,
    }),
  });
  const pending = data?.items || [];
  const queryClient = useQueryClient();
  const [remarksByProposalId, setRemarksByProposalId] = useState<Record<string, string>>({});
  const [remarksErrorsByProposalId, setRemarksErrorsByProposalId] = useState<Record<string, string>>({});
  const [decidingProposalId, setDecidingProposalId] = useState<string | null>(null);

  async function handleDecision(proposalId: string, decision: "approve" | "reject") {
    const remarks = remarksByProposalId[proposalId]?.trim() || "";

    if (decision === "reject" && !remarks) {
      setRemarksErrorsByProposalId((current) => ({
        ...current,
        [proposalId]: "Add rejection remarks before rejecting this proposal."
      }));
      return;
    }

    setDecidingProposalId(proposalId);

    try {
      await submitAdminDecision(proposalId, {
        decision,
        remarks: remarks || undefined
      });

      actionSuccess(decision === "approve" ? "Proposal approved" : "Proposal rejected", "The proposal queue has been updated.");
      setRemarksErrorsByProposalId((current) => {
        const next = { ...current };
        delete next[proposalId];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-proposals"] });
      await queryClient.invalidateQueries({ queryKey: ["navigation-counts"] });
    } catch (decisionError) {
      actionError("Decision failed", decisionError, getDecisionErrorMessage(decisionError));
    } finally {
      setDecidingProposalId(null);
    }
  }

  return (
    <div className="clb-screen">
      <OneClubPageHeader
        eyebrow="Admin Review"
        title="Final Proposal Review"
        description={`${pending.length} proposal${pending.length !== 1 ? "s" : ""} awaiting your final decision.`}
      />

      {isLoading ? (
        <OneClubLoadingState title="Loading proposals" message="We are retrieving proposals pending final review." />
      ) : isError ? (
        <OneClubStateCard
          icon={Clock}
          title="Unable to load proposals"
          message={error instanceof Error ? error.message : "An error occurred."}
          tone="danger"
        />
      ) : pending.length === 0 ? (
        <OneClubStateCard icon={Clock} title="No pending proposals" message="All proposals requiring admin review have been processed." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {pending.map((proposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">{proposal.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <OneClubMetaChip label="Event" value={proposal.event_date} />
                      <OneClubMetaChip label="Venue" value={proposal.location || "TBC"} />
                      <OneClubMetaChip label="Submitted" value={proposal.submitted_at} />
                    </div>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add admin remarks before approving or rejecting..."
                    rows={2}
                    value={remarksByProposalId[proposal.id] ?? ""}
                    onChange={(event) => {
                      setRemarksErrorsByProposalId((current) => {
                        if (!current[proposal.id]) {
                          return current;
                        }

                        const next = { ...current };
                        delete next[proposal.id];
                        return next;
                      });
                      setRemarksByProposalId((current) => ({
                        ...current,
                        [proposal.id]: event.target.value
                      }));
                    }}
                  />
                  {remarksErrorsByProposalId[proposal.id] ? (
                    <p className="text-sm font-medium text-destructive">{remarksErrorsByProposalId[proposal.id]}</p>
                  ) : null}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button asChild variant="outline">
                      <Link to={`/proposals/${proposal.id}`} state={{ returnTo: "/admin/proposals/review", returnLabel: "Back to Review" }}>
                        View details
                      </Link>
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
