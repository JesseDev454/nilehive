import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { ApprovalStepper } from "@/components/ApprovalStepper";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  getAdminProposal,
  getAdvisorProposal,
  getExecutiveProposal,
  submitExecutiveProposalRevision,
  submitAdminDecision,
  type ProposalRecord
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load proposal details right now.";
}

function getDateLabel(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function buildApprovalSteps(proposal: ProposalRecord) {
  const advisorStepStatus =
    proposal.status === "draft"
      ? "pending"
      : proposal.status === "advisor_rejected"
      ? "rejected"
      : proposal.status === "pending_advisor_review"
        ? "current"
        : "completed";

  const adminStepStatus =
    proposal.status === "admin_rejected"
      ? "rejected"
      : proposal.status === "pending_admin_review"
      ? "current"
      : proposal.status === "advisor_rejected"
        ? "pending"
        : proposal.status === "approved"
          ? "completed"
          : "pending";

  return [
    {
      label: "Executive Submission",
      status: proposal.status === "draft" ? "current" as const : "completed" as const,
      remarks:
        proposal.status === "draft"
          ? "Draft saved; not submitted yet"
          : `Submitted ${getDateLabel(proposal.submitted_at ?? proposal.created_at)}`
    },
    {
      label: "Advisor Review",
      status: advisorStepStatus as "completed" | "current" | "pending" | "rejected",
      remarks: proposal.advisor_remarks ?? undefined
    },
    {
      label: "Admin Review",
      status: adminStepStatus as "completed" | "current" | "pending" | "rejected"
    }
  ];
}

export default function ProposalDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminDecision, setAdminDecision] = useState<"approve" | "reject" | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const isUnsupportedRole = role !== "executive" && role !== "admin" && role !== "advisor";

  const { data: proposal, isLoading, isError, error } = useQuery({
    queryKey: ["proposal-detail", role, id],
    queryFn: () => {
      if (role === "admin") {
        return getAdminProposal(id);
      }

      if (role === "advisor") {
        return getAdvisorProposal(id);
      }

      return getExecutiveProposal(id);
    },
    enabled: !!id && !isUnsupportedRole,
    retry: false
  });

  if (isUnsupportedRole) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Proposal detail is not available for this role yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              This proposal detail route is currently available for executives, advisors, and admins.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleAdminDecision(decision: "approve" | "reject") {
    if (!proposal) {
      return;
    }

    setAdminDecision(decision);

    try {
      await submitAdminDecision(proposal.id, {
        decision,
        remarks: adminRemarks.trim() || undefined
      });

      toast.success(decision === "approve" ? "Proposal approved" : "Proposal rejected", {
        description: "The final admin decision has been saved."
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["proposal-detail", role, id] }),
        queryClient.invalidateQueries({ queryKey: ["proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["approved-events"] }),
        queryClient.invalidateQueries({ queryKey: ["event-reminders"] })
      ]);
      setAdminRemarks("");
    } catch (decisionError) {
      toast.error("Admin decision failed", {
        description: getErrorMessage(decisionError)
      });
    } finally {
      setAdminDecision(null);
    }
  }

  async function handleResubmit() {
    if (!proposal) {
      return;
    }

    setIsResubmitting(true);

    try {
      await submitExecutiveProposalRevision(proposal.id);
      toast.success("Proposal resubmitted", {
        description: "Your proposal has been sent back to advisor review."
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["proposal-detail", role, id] }),
        queryClient.invalidateQueries({ queryKey: ["proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
      ]);
    } catch (resubmitError) {
      toast.error("Resubmission failed", {
        description: getErrorMessage(resubmitError)
      });
    } finally {
      setIsResubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading proposal details...</p>
          </CardContent>
        </Card>
      ) : isError || !proposal ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Proposal not found</p>
            <p className="text-sm text-muted-foreground mt-2">{getErrorMessage(error)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{proposal.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {role === "admin" || role === "advisor" ? `Club ${proposal.club_id ?? "-"}` : "Submitted proposal"} -{" "}
                {getDateLabel(proposal.created_at)}
              </p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {role === "executive" &&
                ["draft", "advisor_rejected", "admin_rejected"].includes(proposal.status) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Revision Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/proposals/new?edit=${proposal.id}`)}
                      >
                        Edit Proposal
                      </Button>
                      <Button
                        className="bg-[#0d5bbc] hover:bg-[#004493] text-white"
                        disabled={isResubmitting}
                        onClick={handleResubmit}
                      >
                        {isResubmitting ? "Resubmitting..." : "Submit for Advisor Review"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proposal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Description</span>
                    <p className="mt-1">{proposal.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Event Date</span>
                      <p className="font-medium mt-1">{getDateLabel(proposal.event_date)}</p>
                    </div>
                    {proposal.event_time && (
                      <div>
                        <span className="text-muted-foreground">Event Time</span>
                        <p className="font-medium mt-1">{proposal.event_time.slice(0, 5)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Venue</span>
                      <p className="font-medium mt-1">{proposal.location ?? "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Participants</span>
                      <p className="font-medium mt-1">{proposal.number_of_participants ?? "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget Estimate</span>
                      <p className="font-medium mt-1">{formatCurrency(proposal.budget_estimate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Stage</span>
                      <p className="font-medium mt-1">{proposal.current_stage ?? proposal.status}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Currently With</span>
                      <p className="font-medium mt-1">{proposal.current_owner_role ?? "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revision Count</span>
                      <p className="font-medium mt-1">{proposal.revision_count ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated</span>
                      <p className="font-medium mt-1">{getDateLabel(proposal.updated_at)}</p>
                    </div>
                    {proposal.resubmitted_at && (
                      <div>
                        <span className="text-muted-foreground">Last Resubmitted</span>
                        <p className="font-medium mt-1">{getDateLabel(proposal.resubmitted_at)}</p>
                      </div>
                    )}
                    {proposal.advisor_decided_at && (
                      <div>
                        <span className="text-muted-foreground">Advisor Decision</span>
                        <p className="font-medium mt-1">{getDateLabel(proposal.advisor_decided_at)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(proposal.aim_objectives || proposal.proposed_activity) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Proposal Form 2.0 Context</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.proposed_activity && (
                      <div>
                        <span className="text-muted-foreground">Proposed Activity</span>
                        <p className="mt-1">{proposal.proposed_activity}</p>
                      </div>
                    )}
                    {proposal.aim_objectives && (
                      <div>
                        <span className="text-muted-foreground">Aim and Objectives</span>
                        <p className="mt-1">{proposal.aim_objectives}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!!proposal.budget_line_items?.length && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Line Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.budget_line_items.map((item, index) => (
                      <div key={`${item.item}-${index}`} className="rounded-xl bg-muted p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{item.item}</p>
                          <p className="font-mono font-semibold">{formatCurrency(item.amount)}</p>
                        </div>
                        <p className="text-muted-foreground mt-1">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">Quantity: {item.quantity}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!!proposal.responsible_members?.length && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Responsible Club Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.responsible_members.map((member, index) => (
                      <div key={`${member.student_id}-${index}`} className="rounded-xl bg-muted p-3">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-muted-foreground mt-1">
                          {member.position} - {member.student_id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">{member.phone_number}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {role === "admin" && proposal.status === "pending_admin_review" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Final Admin Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add admin verification remarks..."
                      rows={3}
                      value={adminRemarks}
                      onChange={(event) => setAdminRemarks(event.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        disabled={adminDecision !== null}
                        onClick={() => handleAdminDecision("approve")}
                      >
                        {adminDecision === "approve" ? "Approving..." : "Approve Final"}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={adminDecision !== null}
                        onClick={() => handleAdminDecision("reject")}
                      >
                        {adminDecision === "reject" ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(proposal.advisor_remarks || proposal.admin_remarks || proposal.latest_approval) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Latest Decision Context</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.advisor_remarks && (
                      <div>
                        <span className="text-muted-foreground">Advisor Remarks</span>
                        <p className="mt-1">{proposal.advisor_remarks}</p>
                      </div>
                    )}
                    {proposal.admin_remarks && (
                      <div>
                        <span className="text-muted-foreground">Admin Remarks</span>
                        <p className="mt-1">{proposal.admin_remarks}</p>
                      </div>
                    )}
                    {proposal.latest_approval && (
                      <div>
                        <span className="text-muted-foreground">Latest Approval</span>
                        <p className="mt-1">
                          {proposal.latest_approval.reviewer_role} {proposal.latest_approval.decision} on{" "}
                          {getDateLabel(proposal.latest_approval.decided_at)}
                        </p>
                        {proposal.latest_approval.remarks && (
                          <p className="mt-1 text-muted-foreground">{proposal.latest_approval.remarks}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Approval Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApprovalStepper steps={buildApprovalSteps(proposal)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
