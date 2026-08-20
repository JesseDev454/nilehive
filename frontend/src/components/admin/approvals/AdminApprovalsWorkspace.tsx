import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
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
import type {
  DuesProofMock,
  JoinRequestMock,
  ProposalMock,
} from "@/components/AdminHomeView";

const INITIAL_PROPOSALS: ProposalMock[] = [
  {
    id: "proposal-1",
    title: "Google Cloud and Generative AI Buildathon",
    club_id: "nile-google-developers",
    club_name: "Nile Google Developers",
    submitted_by_name: "Farouk Aliyu",
    proposed_date: "2026-09-12",
    venue: "Technology Auditorium",
    budget: 150000,
    description: "A practical buildathon for student teams working with responsible AI tools.",
    advisor_name: "Dr. Aliyu Bello",
    status: "pending_admin_review",
  },
  {
    id: "proposal-2",
    title: "Inter-Faculty Debate Finals",
    club_id: "nile-debate-club",
    club_name: "Nile Debate Club",
    submitted_by_name: "Tariq Ibrahim",
    proposed_date: "2026-09-20",
    venue: "Main Auditorium",
    budget: 85000,
    description: "The final round of the university's inter-faculty debate series.",
    advisor_name: "Prof. Halima Yusuf",
    status: "pending_admin_review",
  },
];

const INITIAL_JOINS: JoinRequestMock[] = [
  {
    id: "join-1",
    student_id: "NIL/2023/UG/0491",
    student_name: "Ibrahim Sani",
    student_email: "ibrahim.sani@nileuniversity.edu.ng",
    club_id: "nile-climate-initiatives-club",
    club_name: "Nile Climate Initiatives Club",
    statement: "I want to support practical sustainability projects on campus.",
    applied_at: "2026-08-18T14:30:00Z",
    status: "pending",
  },
];

const INITIAL_PROOFS: DuesProofMock[] = [
  {
    id: "proof-1",
    student_id: "NIL/2024/UG/1029",
    student_name: "Fatima Aliyu",
    student_email: "fatima.aliyu@nileuniversity.edu.ng",
    club_id: "nile-business-club",
    club_name: "Nile Business Club",
    amount: 10000,
    payment_method: "Bank transfer",
    reference_number: "REF-NUB-984210",
    proof_document_url: "/oneclub.svg",
    status: "submitted",
    created_at: "2026-08-18T16:15:00Z",
  },
];

type PendingDecision = {
  type: DecisionType;
  id: string;
  title: string;
  subtitle?: string;
} | null;

export function AdminApprovalsWorkspace() {
  const [activeTab, setActiveTab] = useState<ApprovalTab>("proposals");
  const [searchTerm, setSearchTerm] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [joins, setJoins] = useState(INITIAL_JOINS);
  const [proofs, setProofs] = useState(INITIAL_PROOFS);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null);

  const matches = useCallback((text: string, clubId: string) =>
    text.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (clubFilter === "all" || clubId === clubFilter), [clubFilter, searchTerm]);

  const filteredProposals = useMemo(
    () => proposals.filter((item) => matches(`${item.title} ${item.club_name}`, item.club_id)),
    [proposals, matches],
  );
  const filteredJoins = useMemo(
    () => joins.filter((item) => matches(`${item.student_name} ${item.club_name}`, item.club_id)),
    [joins, matches],
  );
  const filteredProofs = useMemo(
    () => proofs.filter((item) => matches(`${item.student_name} ${item.reference_number}`, item.club_id)),
    [proofs, matches],
  );

  const ask = (type: DecisionType, id: string, title: string, subtitle?: string) =>
    setPendingDecision({ type, id, title, subtitle });

  const confirmDecision = () => {
    if (!pendingDecision) return;
    const { type, id } = pendingDecision;
    if (type.includes("proposal")) setProposals((items) => items.filter((item) => item.id !== id));
    if (type.includes("join")) setJoins((items) => items.filter((item) => item.id !== id));
    if (type.includes("proof")) setProofs((items) => items.filter((item) => item.id !== id));
    toast.success("Decision recorded in this UI preview.");
    setPendingDecision(null);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 pb-16" aria-labelledby="admin-approvals-title">
      <span id="admin-approvals-title" className="sr-only">Approvals</span>
      <AdminApprovalsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{ proposals: proposals.length, join_requests: joins.length, payment_proofs: proofs.length }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClubFilter={clubFilter}
        onClubFilterChange={setClubFilter}
      />
      {activeTab === "proposals" ? (
        <AdminProposalList
          proposals={filteredProposals}
          onApprove={(item) => ask("approve_proposal", item.id, item.title, item.club_name)}
          onReject={(item) => ask("reject_proposal", item.id, item.title, item.club_name)}
          onOverride={(item) => ask("override_proposal", item.id, item.title, item.club_name)}
        />
      ) : null}
      {activeTab === "join_requests" ? (
        <AdminJoinRequestList
          joinRequests={filteredJoins}
          onApprove={(item) => ask("approve_join", item.id, item.student_name, item.club_name)}
          onReject={(item) => ask("reject_join", item.id, item.student_name, item.club_name)}
        />
      ) : null}
      {activeTab === "payment_proofs" ? (
        <AdminPaymentProofList
          proofs={filteredProofs}
          onVerify={(item) => ask("verify_proof", item.id, item.student_name, item.reference_number)}
          onReject={(item) => ask("reject_proof", item.id, item.student_name, item.reference_number)}
        />
      ) : null}
      <AdminDecisionDialog
        open={Boolean(pendingDecision)}
        onOpenChange={(open) => !open && setPendingDecision(null)}
        decisionType={pendingDecision?.type ?? null}
        itemTitle={pendingDecision?.title ?? ""}
        itemSubtitle={pendingDecision?.subtitle}
        onConfirm={confirmDecision}
      />
    </section>
  );
}
