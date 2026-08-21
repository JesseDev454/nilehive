import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { AccessDenied } from "@/components/AccessDenied";
import { ApprovalStepper } from "@/components/ApprovalStepper";
import { ClublyLoadingState, ClublyMetaChip, ClublyPageHeader, ClublyStateCard } from "@/components/OneClub";
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

type ReturnLocationState = {
  returnTo?: string;
  returnLabel?: string;
};

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

function getResubmissionLabel(value?: number | null) {
  const count = value ?? 0;

  if (count === 0) {
    return "None yet";
  }

  return `${count} ${count === 1 ? "time" : "times"}`;
}

function getProposalClubLabel(proposal: ProposalRecord) {
  return proposal.club?.name || "Unknown club";
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
      label: "OneClub Final Review",
      status: adminStepStatus as "completed" | "current" | "pending" | "rejected",
      remarks: adminDecision?.remarks ?? proposal.admin_remarks ?? undefined,
      timestamp: getDateTimeLabel(adminDecision?.decided_at ?? proposal.admin_decided_at)
    },
    {
      label: "Event Held",
      status: getProposalStatusMeta(proposal.status, proposal.event_date).label === "Event Held" ? "completed" as const : "pending" as const,
      remarks: getProposalStatusMeta(proposal.status, proposal.event_date).label === "Event Held"
        ? "This approved event has already been held."
        : undefined
    }
  ];
}

export default function ProposalDetail() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminRemarksError, setAdminRemarksError] = useState("");
  const [adminDecision, setAdminDecision] = useState<"approve" | "reject" | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const isUnsupportedRole = role !== "president" && role !== "admin" && role !== "advisor";
  const returnState = location.state as ReturnLocationState | null;
  const safeReturnTo = returnState?.returnTo?.startsWith("/") ? returnState.returnTo : null;
  const fallbackReturn =
    role === "advisor"
      ? { to: "/approvals", label: "Back to Approvals" }
      : role === "admin"
        ? { to: "/proposals?status=pending_admin_review", label: "Back to Final Review" }
        : { to: "/proposals", label: "Back to Proposals" };
  const backLink = {
    to: safeReturnTo || fallbackReturn.to,
    label: returnState?.returnLabel || fallbackReturn.label
  };

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
      <div className="clb-screen max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link to="/proposals">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Proposals
          </Link>
        </Button>
        <AccessDenied
          icon={FileText}
          title="Proposal access is restricted"
          reason="This area is for club presidents, advisors, and OneClub reviewers. Executives can keep up with club work through tasks and events."
        />
      </div>
    );
  }

  async function handleAdminDecision(decision: "approve" | "reject") {
    if (!proposal) {
      return;
    }

    const trimmedRemarks = adminRemarks.trim();
    const isRejectedOverride = decision === "approve" && ["advisor_rejected", "admin_rejected"].includes(proposal.status);

    if (decision === "reject" && !trimmedRemarks) {
      setAdminRemarksError("Add rejection remarks before rejecting this proposal.");
      return;
    }

    if (isRejectedOverride && !trimmedRemarks) {
      setAdminRemarksError("Explain why OneClub is approving this rejected proposal.");
      toast.error("Add override remarks", {
        description: "Explain why OneClub is approving this rejected proposal."
      });
      return;
    }

    if (isRejectedOverride && !window.confirm("Approve this rejected proposal and record the override?")) {
      return;
    }

    setAdminDecision(decision);

    try {
      await submitAdminDecision(proposal.id, {
        decision,
        remarks: trimmedRemarks || undefined
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
          queryClient.invalidateQueries({ queryKey: ["navigation-counts"] }),
          queryClient.invalidateQueries({ queryKey: ["approved-events"] }),
          queryClient.invalidateQueries({ queryKey: ["event-reminders"] })
        ]);
      setAdminRemarks("");
      setAdminRemarksError("");
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
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["navigation-counts"] })
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
    <div className="clb-screen">
      <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
        <Link to={backLink.to}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {backLink.label}
        </Link>
      </Button>

      {isLoading ? (
        <ClublyLoadingState title="Loading proposal" message="We are getting the latest workflow status." />
      ) : isError || !proposal ? (
        <ClublyStateCard icon={FileText} title="Proposal not found" message={getErrorMessage(error)} tone="danger" />
      ) : (
        <>
          <ClublyPageHeader
            eyebrow={role === "admin" ? "OneClub Review" : role === "advisor" ? "Advisor Review" : "Club Proposal"}
            title={proposal.title}
            description={`${
              role === "admin" || role === "advisor"
                ? `Submitted by the club president for ${getProposalClubLabel(proposal)}`
                : "Created for your club"
            }. Added ${getDateLabel(proposal.created_at)}.`}
            actions={<StatusBadge status={proposal.status} eventDate={proposal.event_date} />}
          />

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <ClublyMetaChip label="Status" value={getProposalStatusMeta(proposal.status, proposal.event_date).label} />
                <ClublyMetaChip label="Waiting on" value={getProposalOwnerLabel(proposal.current_owner_role)} />
                <ClublyMetaChip label="Updated" value={getDateLabel(proposal.updated_at)} />
                <ClublyMetaChip label="Resubmissions" value={getResubmissionLabel(proposal.revision_count)} />
              </div>
              <div className="rounded-[18px] border border-primary/15 bg-primary/5 p-4">
                <p className="clb-eyebrow text-primary">Next action</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{getProposalNextAction(proposal.status, proposal.event_date)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {role === "president" && isProposalEditable(proposal.status) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {proposal.status === "draft" ? "Draft Actions" : "Rejected Proposal Actions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {proposal.status === "draft"
                          ? "This proposal is saved but has not been submitted."
                          : "This proposal was rejected. Review the remarks, edit it, then resubmit."}
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
                  <div className="flex flex-wrap gap-2">
                    <ClublyMetaChip label="Date" value={getDateLabel(proposal.event_date)} />
                    {proposal.event_time ? <ClublyMetaChip label="Time" value={proposal.event_time.slice(0, 5)} /> : null}
                    <ClublyMetaChip label="Venue" value={proposal.location ?? "-"} />
                    <ClublyMetaChip label="Participants" value={proposal.number_of_participants ?? "-"} />
                    <ClublyMetaChip label="Budget" value={formatCurrency(proposal.budget_estimate)} />
                    {proposal.resubmitted_at ? <ClublyMetaChip label="Resubmitted" value={getDateLabel(proposal.resubmitted_at)} /> : null}
                    {proposal.advisor_decided_at ? <ClublyMetaChip label="Advisor decision" value={getDateLabel(proposal.advisor_decided_at)} /> : null}
                  </div>
                </CardContent>
              </Card>

              {(proposal.aim_objectives || proposal.proposed_activity) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Proposal Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {proposal.proposed_activity && (
                      <div>
                        <span className="text-muted-foreground">Event Name</span>
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

              {role === "admin" && ["pending_admin_review", "advisor_rejected", "admin_rejected"].includes(proposal.status) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {proposal.status === "pending_admin_review" ? "OneClub Decision" : "Approve Rejected Proposal"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {proposal.status !== "pending_admin_review" ? (
                      <p className="text-sm text-muted-foreground">
                        This bypasses the previous rejection. Add a clear explanation so the override remains auditable.
                      </p>
                    ) : null}
                    <Textarea
                      placeholder={proposal.status === "pending_admin_review" ? "Add notes for the club president or advisor..." : "Required: explain why this rejected proposal should now be approved..."}
                      rows={3}
                      value={adminRemarks}
                      onChange={(event) => {
                        setAdminRemarks(event.target.value);
                        setAdminRemarksError("");
                      }}
                    />
                    {adminRemarksError ? (
                      <p className="text-sm font-medium text-destructive">{adminRemarksError}</p>
                    ) : null}
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button variant="secondary" disabled={adminDecision !== null} onClick={() => handleAdminDecision("approve")}>
                        {adminDecision === "approve" ? "Approving..." : proposal.status === "pending_admin_review" ? "Approve Proposal" : "Approve Rejected Proposal"}
                      </Button>
                      {proposal.status === "pending_admin_review" ? (
                        <Button variant="destructive" disabled={adminDecision !== null} onClick={() => handleAdminDecision("reject")}>
                          {adminDecision === "reject" ? "Rejecting..." : "Reject"}
                        </Button>
                      ) : null}
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
                        <span className="font-medium">OneClub admin remarks</span>
                        <p className="mt-1">{proposal.admin_remarks}</p>
                        {proposal.admin_decided_at && (
                          <p className="mt-2 text-xs text-muted-foreground">{getDateTimeLabel(proposal.admin_decided_at)}</p>
                        )}
                      </div>
                    )}
                    {proposal.latest_approval && (
                      <div className="border-2 border-foreground p-3">
                        <span className="font-medium">Most recent decision</span>
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
                  <CardTitle className="clb-panel-title">Review Timeline</CardTitle>
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

