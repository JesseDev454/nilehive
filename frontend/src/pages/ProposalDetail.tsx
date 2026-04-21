import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { ApprovalStepper } from "@/components/ApprovalStepper";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  getAdminProposal,
  getAdvisorProposal,
  getPresidentProposal,
  submitPresidentProposalRevision,
  submitAdminDecision,
  type ProposalRecord
} from "@/lib/api";
import {
  getProposalNextAction,
  getProposalOwnerLabel,
  getProposalPrimaryActionLabel,
  getProposalStatusMeta,
  isProposalEditable
} from "@/lib/proposalWorkflow";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load proposal details right now.";
}

function getDateLabel(value?: string) {
  return value ? value.slice(0, 10) : "-";
}

function getDateTimeLabel(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function buildApprovalSteps(proposal: ProposalRecord) {
  const advisorDecision = proposal.approval_history?.find((approval) => approval.reviewer_role === "advisor");
  const adminDecision = proposal.approval_history?.find((approval) => approval.reviewer_role === "admin");
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
      label: "President Submission",
      status: proposal.status === "draft" ? "current" as const : "completed" as const,
      remarks:
        proposal.status === "draft"
          ? "Draft saved; not submitted yet"
          : "Submitted by the club president",
      timestamp: getDateTimeLabel(proposal.submitted_at ?? proposal.created_at)
    },
    {
      label: "Advisor Review",
      status: advisorStepStatus as "completed" | "current" | "pending" | "rejected",
      remarks: advisorDecision?.remarks ?? proposal.advisor_remarks ?? undefined,
      timestamp: getDateTimeLabel(advisorDecision?.decided_at ?? proposal.advisor_decided_at)
    },
    {
      label: "Club Services Final Review",
      status: adminStepStatus as "completed" | "current" | "pending" | "rejected",
      remarks: adminDecision?.remarks ?? proposal.admin_remarks ?? undefined,
      timestamp: getDateTimeLabel(adminDecision?.decided_at ?? proposal.admin_decided_at)
    },
    {
      label: "Approved Event",
      status: proposal.status === "approved" ? "completed" as const : "pending" as const,
      remarks: proposal.status === "approved" ? "Ready to appear in approved events." : undefined
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
  const isUnsupportedRole = role !== "president" && role !== "admin" && role !== "advisor";

  const { data: proposal, isLoading, isError, error } = useQuery({
    queryKey: ["proposal-detail", role, id],
    queryFn: () => {
      if (role === "admin") {
        return getAdminProposal(id);
      }

      if (role === "advisor") {
        return getAdvisorProposal(id);
      }

      return getPresidentProposal(id);
    },
    enabled: !!id && !isUnsupportedRole,
    retry: false
  });

  if (isUnsupportedRole) {
    return (
      <div className="nh-page max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <NeoStateCard
          icon={FileText}
          title="Proposal access is restricted"
          message="Executives use tasks and approved events. Proposal creation and review belong to presidents, advisors, and Club Services."
        />
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
          queryClient.invalidateQueries({ queryKey: ["admin-operations-dashboard"] }),
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
      await submitPresidentProposalRevision(proposal.id);
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
    <div className="nh-page">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {isLoading ? (
        <NeoLoadingState title="Loading proposal" message="We are getting the latest workflow status." />
      ) : isError || !proposal ? (
        <NeoStateCard icon={FileText} title="Proposal not found" message={getErrorMessage(error)} tone="danger" />
      ) : (
        <>
          <NeoPageHeader
            eyebrow={role === "admin" ? "Club Services Final Review" : role === "advisor" ? "Advisor Review" : "Club Proposal"}
            title={proposal.title}
            description={`${
              role === "admin" || role === "advisor"
                ? `Submitted by the club president for club ${proposal.club_id ?? "-"}`
                : "President-owned club proposal"
            } - ${getDateLabel(proposal.created_at)}`}
            actions={<StatusBadge status={proposal.status} />}
          />

          <Card className="nh-card-dark text-white">
            <CardHeader>
              <CardTitle className="nh-panel-title text-white">Workflow Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Current Status</p>
                <p className="mt-1 font-semibold">{getProposalStatusMeta(proposal.status).label}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Currently With</p>
                <p className="mt-1 font-semibold">{getProposalOwnerLabel(proposal.current_owner_role)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Revision Count</p>
                <p className="mt-1 font-semibold">{proposal.revision_count ?? 0}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Last Updated</p>
                <p className="mt-1 font-semibold">{getDateLabel(proposal.updated_at)}</p>
              </div>
              <div className="border-2 border-primary-foreground/30 bg-white/10 p-4 sm:col-span-2 lg:col-span-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#F5B942]">Next Action</p>
                <p className="mt-1 text-white/90">{getProposalNextAction(proposal.status)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {role === "president" && isProposalEditable(proposal.status) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {proposal.status === "draft" ? "Draft Actions" : "Returned Proposal Actions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {proposal.status === "draft"
                          ? "This proposal is saved but has not been submitted."
                          : "This proposal was returned. Review the remarks, edit it, then resubmit."}
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/proposals/new?edit=${proposal.id}`)}
                        >
                          {getProposalPrimaryActionLabel(proposal.status)}
                        </Button>
                        <Button disabled={isResubmitting} onClick={handleResubmit}>
                          {isResubmitting ? "Resubmitting..." : "Submit for Advisor Review"}
                        </Button>
                      </div>
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
                      <p className="font-medium mt-1">{getProposalStatusMeta(proposal.status).label}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Currently With</span>
                      <p className="font-medium mt-1">{getProposalOwnerLabel(proposal.current_owner_role)}</p>
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
                      <div key={`${item.item}-${index}`} className="border-2 border-foreground bg-muted p-3">
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
                      <div key={`${member.student_id}-${index}`} className="border-2 border-foreground bg-muted p-3">
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
                      <Button variant="secondary" disabled={adminDecision !== null} onClick={() => handleAdminDecision("approve")}>
                        {adminDecision === "approve" ? "Approving..." : "Approve Final"}
                      </Button>
                      <Button variant="destructive" disabled={adminDecision !== null} onClick={() => handleAdminDecision("reject")}>
                        {adminDecision === "reject" ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(proposal.advisor_remarks || proposal.admin_remarks || proposal.latest_approval) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Review Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.advisor_remarks && (
                      <div className="border-2 border-foreground bg-muted p-3">
                        <span className="font-medium">Advisor remarks</span>
                        <p className="mt-1">{proposal.advisor_remarks}</p>
                        {proposal.advisor_decided_at && (
                          <p className="mt-2 text-xs text-muted-foreground">{getDateTimeLabel(proposal.advisor_decided_at)}</p>
                        )}
                      </div>
                    )}
                    {proposal.admin_remarks && (
                      <div className="border-2 border-foreground bg-muted p-3">
                        <span className="font-medium">Club Services admin remarks</span>
                        <p className="mt-1">{proposal.admin_remarks}</p>
                        {proposal.admin_decided_at && (
                          <p className="mt-2 text-xs text-muted-foreground">{getDateTimeLabel(proposal.admin_decided_at)}</p>
                        )}
                      </div>
                    )}
                    {proposal.latest_approval && (
                      <div className="border-2 border-foreground p-3">
                        <span className="font-medium">Latest decision</span>
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
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="nh-panel-title">Approval Timeline</CardTitle>
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
