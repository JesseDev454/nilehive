import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import type { ApprovalsUiError } from "@/lib/approvals/errors";
import {
  AdminApprovalsHeader,
  type ApprovalTab,
} from "./AdminApprovalsHeader";
import { AdminProposalList } from "./AdminProposalList";
import { AdminJoinRequestList } from "./AdminJoinRequestList";
import { AdminPaymentProofList } from "./AdminPaymentProofList";
import {
  AdminDecisionDialog,
  type DecisionType,
} from "./AdminDecisionDialog";
import { useAdminApprovalsData } from "./useAdminApprovalsData";

type PendingDecision = {
  type: DecisionType;
  id: string;
  title: string;
  subtitle?: string;
} | null;

function matchesClub(clubId: string, clubName: string, clubFilter: string): boolean {
  if (clubFilter === "all") return true;
  if (clubId === clubFilter) return true;
  const selected = OFFICIAL_14_CLUBS.find((club) => club.id === clubFilter);
  return selected ? selected.name === clubName : false;
}

export function AdminApprovalsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminApprovalsData(reportAuthFailure);
  const [activeTab, setActiveTab] = useState<ApprovalTab>("proposals");
  const [searchTerm, setSearchTerm] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const query = searchTerm.toLowerCase();
  const filteredProposals = useMemo(
    () =>
      data.proposals.items.filter((item) =>
        `${item.title} ${item.club_name}`.toLowerCase().includes(query) &&
        matchesClub(item.club_id, item.club_name, clubFilter),
      ),
    [clubFilter, data.proposals.items, query],
  );
  const filteredJoins = useMemo(
    () =>
      data.joins.items.filter((item) =>
        `${item.student_name} ${item.club_name}`.toLowerCase().includes(query) &&
        matchesClub(item.club_id, item.club_name, clubFilter),
      ),
    [clubFilter, data.joins.items, query],
  );
  const filteredProofs = useMemo(
    () =>
      data.dues.items.filter((item) =>
        `${item.student_name} ${item.reference_number || ""}`.toLowerCase().includes(query) &&
        matchesClub(item.club_id, item.club_name, clubFilter),
      ),
    [clubFilter, data.dues.items, query],
  );

  const ask = (type: DecisionType, id: string, title: string, subtitle?: string) => {
    if (data.mutation) return;
    setDialogError(null);
    setPendingDecision({ type, id, title, subtitle });
  };

  const handleConfirm = useCallback(async (remarks?: string) => {
    if (!pendingDecision) return;
    const { type, id } = pendingDecision;
    try {
      if (type === "approve_proposal") await data.decideProposal(id, "approve", remarks);
      else if (type === "reject_proposal") await data.decideProposal(id, "reject", remarks);
      else if (type === "override_proposal") await data.decideProposal(id, "approve", remarks);
      else if (type === "approve_join") await data.decideJoin(id, "approve", remarks);
      else if (type === "reject_join") await data.decideJoin(id, "reject", remarks);
      else if (type === "verify_proof") await data.decideDues(id, "paid");
      else if (type === "reject_proof") await data.decideDues(id, "rejected");
      toast.success(data.mockMode ? "Decision recorded in this UI preview." : "Decision saved.");
      setPendingDecision(null);
      setDialogError(null);
    } catch (error) {
      const mapped = error as ApprovalsUiError & { code?: string };
      if (mapped?.code === "DECISION_IN_PROGRESS") return;
      setDialogError(mapped?.message || "This decision could not be saved.");
    }
  }, [data, pendingDecision]);

  const busyId = data.mutation?.id ?? null;

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-16"
      aria-labelledby="admin-approvals-title"
      data-approvals-source={data.source}
    >
      <span id="admin-approvals-title" className="sr-only">Approvals</span>
      <div className="sr-only" aria-live="polite">{data.liveMessage}</div>
      <AdminApprovalsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={data.counts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClubFilter={clubFilter}
        onClubFilterChange={setClubFilter}
      />
      {activeTab === "proposals" ? (
        <AdminProposalList
          queue={data.proposals}
          proposals={filteredProposals}
          busyId={busyId}
          filteredEmpty={data.proposals.status === "ready" && filteredProposals.length === 0}
          onRetry={() => {
            void data.loadProposals(true);
          }}
          onInspect={(proposalId) => {
            void data.inspectProposal(proposalId);
          }}
          onApprove={(item) => ask("approve_proposal", item.id, item.title, item.club_name)}
          onReject={(item) => ask("reject_proposal", item.id, item.title, item.club_name)}
          onOverride={(item) => ask("override_proposal", item.id, item.title, item.club_name)}
        />
      ) : null}
      {activeTab === "join_requests" ? (
        <AdminJoinRequestList
          queue={data.joins}
          joinRequests={filteredJoins}
          busyId={busyId}
          filteredEmpty={data.joins.status === "ready" && filteredJoins.length === 0}
          mockMode={data.mockMode}
          onRetry={() => {
            void data.loadJoins(true);
          }}
          onApprove={(item) => ask("approve_join", item.id, item.student_name, item.club_name)}
          onReject={(item) => ask("reject_join", item.id, item.student_name, item.club_name)}
          onWhatsAppChange={(item, added) => {
            void data.markWhatsApp(item.id, added).catch((error: ApprovalsUiError) => {
              toast.error(error?.message || "WhatsApp status could not be saved.");
            });
          }}
        />
      ) : null}
      {activeTab === "payment_proofs" ? (
        <AdminPaymentProofList
          queue={data.dues}
          proofs={filteredProofs}
          busyId={busyId}
          filteredEmpty={data.dues.status === "ready" && filteredProofs.length === 0}
          onRetry={() => {
            void data.loadDues(true);
          }}
          onVerify={(item) => ask("verify_proof", item.id, item.student_name, item.reference_number || item.id)}
          onReject={(item) => ask("reject_proof", item.id, item.student_name, item.reference_number || item.id)}
        />
      ) : null}
      <AdminDecisionDialog
        open={Boolean(pendingDecision)}
        onOpenChange={(open) => {
          if (!open && !data.mutation) {
            setPendingDecision(null);
            setDialogError(null);
          }
        }}
        decisionType={pendingDecision?.type ?? null}
        itemId={pendingDecision?.id ?? ""}
        itemTitle={pendingDecision?.title ?? ""}
        itemSubtitle={pendingDecision?.subtitle}
        onConfirm={handleConfirm}
        isSubmitting={Boolean(data.mutation && pendingDecision && data.mutation.id === pendingDecision.id)}
        submitError={dialogError}
        remarksPersistKey={pendingDecision ? `${pendingDecision.type}:${pendingDecision.id}` : undefined}
      />
    </section>
  );
}
