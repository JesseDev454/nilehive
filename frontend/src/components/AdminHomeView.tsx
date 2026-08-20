import { useState } from "react";
import { Clock, CreditCard, FileCheck2, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminHomeHeader } from "@/components/admin/AdminHomeHeader";
import { AdminAttentionGrid, type AttentionItemData } from "@/components/admin/AdminAttentionGrid";
import { AdminRecentActivity, type RecentActivityItem } from "@/components/admin/AdminRecentActivity";
import { AdminAnnouncementComposer } from "@/components/admin/AdminAnnouncementComposer";
import { AdminRecordDetailModal } from "@/components/admin/AdminRecordDetailModal";
import { Button } from "@/components/ui/button";

export interface ProposalMock {
  id: string;
  title: string;
  club_id: string;
  club_name: string;
  submitted_by_name: string;
  proposed_date: string;
  venue: string;
  budget: number;
  description: string;
  advisor_name: string;
  status: "pending_admin" | "approved" | "revisions_requested" | "rejected";
}

export interface JoinRequestMock {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  club_id: string;
  club_name: string;
  statement: string;
  applied_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface DuesProofMock {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  club_id: string;
  club_name: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  proof_document_url: string;
  status: "submitted" | "verified" | "rejected";
  created_at: string;
}

export interface EventReportMock {
  id: string;
  club_id: string;
  club_name: string;
  event_title: string;
  event_date: string;
  verified_attendees: number;
  budget_spent: number;
  summary: string;
  status: "submitted" | "reviewed";
  created_at: string;
}

export function AdminHomeView() {
  // State for Announcement Composer
  const [isAnnouncementComposerOpen, setIsAnnouncementComposerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Active Record Inspection Modal State
  const [activeModalRecord, setActiveModalRecord] = useState<{
    type: "proposal" | "join_request" | "proof" | "report" | "activity";
    data: any;
  } | null>(null);

  // Deterministic Queues for genuine attention counts (max 4)
  const [proposalsQueue, setProposalsQueue] = useState<ProposalMock[]>([
    {
      id: "prop-01",
      title: "Google Cloud & Generative AI Buildathon 2026",
      club_id: "google-developers",
      club_name: "Nile Google Developers",
      submitted_by_name: "Farouk Aliyu",
      proposed_date: "2026-09-12",
      venue: "Nile Tech Auditorium & Lab 4",
      budget: 150000,
      description: "Hands-on engineering hackathon building solutions on Vertex AI for student teams.",
      advisor_name: "Dr. Aliyu Bello",
      status: "pending_admin"
    },
    {
      id: "prop-02",
      title: "All-Nigeria Inter-Varsity Model UN Simulation",
      club_id: "model-un",
      club_name: "Nile Model United Nations Club",
      submitted_by_name: "Zainab Mukhtar",
      proposed_date: "2026-09-24",
      venue: "Conference Hall A",
      budget: 220000,
      description: "Diplomatic simulation addressing regional climate policies with visiting delegates.",
      advisor_name: "Prof. Halima Yusuf",
      status: "pending_admin"
    }
  ]);

  const [joinRequestsQueue, setJoinRequestsQueue] = useState<JoinRequestMock[]>([
    {
      id: "join-01",
      student_id: "NIL/2023/UG/0491",
      student_name: "Ibrahim Sani",
      student_email: "i.sani@student.nileuniversity.edu.ng",
      club_id: "climate-club",
      club_name: "Nile Climate Initiatives Club",
      statement: "Enthusiastic about environmental engineering and eager to lead the campus recycling drive.",
      applied_at: "2026-08-18T14:30:00Z",
      status: "pending"
    }
  ]);

  const [proofsQueue, setProofsQueue] = useState<DuesProofMock[]>([
    {
      id: "proof-01",
      student_id: "NIL/2024/UG/1029",
      student_name: "Fatima Aliyu",
      student_email: "f.aliyu@student.nileuniversity.edu.ng",
      club_id: "nile-business",
      club_name: "Nile Business Club",
      amount: 10000,
      payment_method: "Bank Transfer",
      reference_number: "REF-NUB-984210",
      proof_document_url: "/oneclub.svg",
      status: "submitted",
      created_at: "2026-08-18T16:15:00Z"
    }
  ]);

  const [reportsQueue, setReportsQueue] = useState<EventReportMock[]>([
    {
      id: "rep-01",
      club_id: "debate-club",
      club_name: "Nile Debate Club",
      event_title: "Inter-Faculty Parliamentary Debate Finals",
      event_date: "2026-08-10",
      verified_attendees: 118,
      budget_spent: 65000,
      summary: "Completed successfully with 14 faculty teams. Attendance confirmed via QR scan.",
      status: "submitted",
      created_at: "2026-08-12T09:00:00Z"
    }
  ]);

  // Recent activity stream (chronological)
  const [activities, setActivities] = useState<RecentActivityItem[]>([
    {
      id: "act-01",
      type: "proposal_approved",
      clubName: "Nile Startup Campus",
      title: "Venture Pitch Day 2026 Authorized",
      actor: "Directorate (Admin)",
      timestamp: "2 hours ago",
      detail: "Approved seed showcase event scheduled for Nile Innovation Pavilion."
    },
    {
      id: "act-02",
      type: "dues_verified",
      clubName: "Nile Google Developers",
      title: "₦10,000 Session Dues Confirmed",
      actor: "Directorate (Admin)",
      timestamp: "4 hours ago",
      detail: "Bank transfer reference REF-GDG-4011 confirmed for Amina Yusuf."
    },
    {
      id: "act-03",
      type: "member_admitted",
      clubName: "Nile Creative Arts Club",
      title: "New Student Admitted",
      actor: "Directorate (Admin)",
      timestamp: "Yesterday",
      detail: "Chinedu Eze enrolled into official club membership."
    },
    {
      id: "act-04",
      type: "report_submitted",
      clubName: "Nile Climate Initiatives Club",
      title: "Tree Planting Drive Report Received",
      actor: "Club Executive",
      timestamp: "2 days ago",
      detail: "74 student participants recorded with reconciled budget of ₦45,000."
    }
  ]);

  // Handle actions from inspection modal
  const handleModalAction = (action: string, id: string) => {
    if (action === "approve") {
      setProposalsQueue((prev) => prev.filter((p) => p.id !== id));
      toast.success("Event proposal authorized and added to campus calendar.");
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "proposal_approved",
          clubName: activeModalRecord?.data.club_name || "Campus Club",
          title: `${activeModalRecord?.data.title || "Proposal"} Authorized`,
          actor: "Directorate (Admin)",
          timestamp: "Just now",
          detail: "Directorate granted final approval for venue and budget."
        },
        ...prev
      ]);
    } else if (action === "reject") {
      setProposalsQueue((prev) => prev.filter((p) => p.id !== id));
      toast.error("Proposal declined.");
    } else if (action === "revisions") {
      setProposalsQueue((prev) => prev.filter((p) => p.id !== id));
      toast.info("Revision notes dispatched to club president and advisor.");
    } else if (action === "approve_join") {
      setJoinRequestsQueue((prev) => prev.filter((r) => r.id !== id));
      toast.success("Student admitted to club membership.");
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "member_admitted",
          clubName: activeModalRecord?.data.club_name || "Club",
          title: `Admitted ${activeModalRecord?.data.student_name}`,
          actor: "Directorate (Admin)",
          timestamp: "Just now"
        },
        ...prev
      ]);
    } else if (action === "reject_join") {
      setJoinRequestsQueue((prev) => prev.filter((r) => r.id !== id));
      toast.info("Join request rejected.");
    } else if (action === "verify_proof") {
      setProofsQueue((prev) => prev.filter((p) => p.id !== id));
      toast.success("Payment proof verified and receipt stamped.");
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "dues_verified",
          clubName: activeModalRecord?.data.club_name || "Club",
          title: `Dues Verified (₦${activeModalRecord?.data.amount?.toLocaleString()})`,
          actor: "Directorate (Admin)",
          timestamp: "Just now"
        },
        ...prev
      ]);
    } else if (action === "reject_proof") {
      setProofsQueue((prev) => prev.filter((p) => p.id !== id));
      toast.error("Payment proof rejected.");
    } else if (action === "archive_report") {
      setReportsQueue((prev) => prev.filter((r) => r.id !== id));
      toast.success("Post-event compliance report acknowledged and archived.");
    }
  };

  // Build the strictly 4 attention cards
  const attentionItems: AttentionItemData[] = [
    {
      id: "proposals",
      count: proposalsQueue.length,
      label: "Proposals waiting",
      whatNext: "Authorize event venue, date, and budget before publishing to campus calendar.",
      actionLabel: "Review next proposal",
      url: "/approvals",
      icon: Clock,
      onInspect: () => {
        if (proposalsQueue[0]) {
          setActiveModalRecord({ type: "proposal", data: proposalsQueue[0] });
        } else {
          toast.info("No proposals waiting for authorization.");
        }
      }
    },
    {
      id: "join_requests",
      count: joinRequestsQueue.length,
      label: "Join requests waiting",
      whatNext: "Review student motivation and admit to official club rosters.",
      actionLabel: "Review join request",
      url: "/user-management",
      icon: UserPlus,
      onInspect: () => {
        if (joinRequestsQueue[0]) {
          setActiveModalRecord({ type: "join_request", data: joinRequestsQueue[0] });
        } else {
          toast.info("No join requests awaiting decision.");
        }
      }
    },
    {
      id: "proofs",
      count: proofsQueue.length,
      label: "Proofs waiting",
      whatNext: "Verify bank transfer receipt reference against dues record.",
      actionLabel: "Verify payment proof",
      url: "/dues",
      icon: CreditCard,
      onInspect: () => {
        if (proofsQueue[0]) {
          setActiveModalRecord({ type: "proof", data: proofsQueue[0] });
        } else {
          toast.info("No dues proofs waiting for review.");
        }
      }
    },
    {
      id: "reports",
      count: reportsQueue.length,
      label: "Reports submitted",
      whatNext: "Audit verified attendee headcount and post-event budget reconciliation.",
      actionLabel: "Audit latest report",
      url: "/archive",
      icon: FileCheck2,
      onInspect: () => {
        if (reportsQueue[0]) {
          setActiveModalRecord({ type: "report", data: reportsQueue[0] });
        } else {
          toast.info("No post-event reports waiting.");
        }
      }
    }
  ];

  const handleAnnouncementPublished = (newAnn: {
    title: string;
    targetClubId: string;
    priority: string;
    content: string;
  }) => {
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        type: "announcement_sent",
        clubName: newAnn.targetClubId === "all" ? "Campus-Wide (14 Clubs)" : "Target Club",
        title: newAnn.title,
        actor: "Directorate (Admin)",
        timestamp: "Just now",
        detail: newAnn.content.slice(0, 100) + "..."
      },
      ...prev
    ]);
  };

  if (hasError) {
    return (
      <div className="mx-auto w-full max-w-4xl py-12 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Could not load campus operations</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          An error occurred while connecting to Nile University Club Services.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHasError(false)}
          className="gap-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 animate-fade-in pb-12">
      {/* PASS 1: Header — Greeting, date, single dominant action */}
      <AdminHomeHeader
        onOpenAnnouncementComposer={() => setIsAnnouncementComposerOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* PASS 1 & 2: At most four attention cards with labels & what to do next */}
      <AdminAttentionGrid items={attentionItems} />

      {/* PASS 1 & 3: Short Recent-Activity List */}
      <AdminRecentActivity
        activities={activities}
        onInspectActivity={(act) => setActiveModalRecord({ type: "activity", data: act })}
      />

      {/* PASS 2 & 4: Announcement Composer Dialog */}
      <AdminAnnouncementComposer
        open={isAnnouncementComposerOpen}
        onOpenChange={setIsAnnouncementComposerOpen}
        onPublished={handleAnnouncementPublished}
      />

      {/* PASS 3 & 4: Detail Inspection Modal for Records */}
      <AdminRecordDetailModal
        record={activeModalRecord}
        open={!!activeModalRecord}
        onOpenChange={(open) => {
          if (!open) setActiveModalRecord(null);
        }}
        onAction={handleModalAction}
      />
    </div>
  );
}
