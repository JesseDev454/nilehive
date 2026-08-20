import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Eye,
  FileCheck,
  FileEdit,
  FilePlus2,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";
import {
  isOneClubProposalStatus,
  isReturnedProposalStatus,
  isUnderReviewProposalStatus,
  proposalStatusLabel,
  type OneClubProposalStatus,
} from "@/lib/proposalStatus";

export type ProposalStatus = OneClubProposalStatus;

export interface BudgetItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  fundingSource: "Club Dues Fund" | "Department Grant" | "Corporate Sponsor";
}

export interface ProposalRecord {
  id: string;
  title: string;
  category: string;
  clubName: string;
  clubCode: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  step1: {
    eventTitle: string;
    category: string;
    expectedAttendance: number;
    targetAudience: string;
    eventFormat: "Physical In-Person" | "Hybrid" | "Virtual Workshop";
  };
  step2: {
    proposedDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    objectives: string;
    keynoteSpeaker?: string;
  };
  step3: {
    budgetItems: BudgetItem[];
  };
  step4: {
    leadOrganizer: string;
    logisticsLead: string;
    mediaLead: string;
    equipmentNeeds: string;
    safetyPrecautions: string;
  };
  remarks?: {
    reviewerName: string;
    reviewerRole: "Staff Advisor" | "Student Affairs Admin";
    date: string;
    comment: string;
  };
}

const INITIAL_PROPOSALS: ProposalRecord[] = [
  {
    id: "prop-102",
    title: "AI Agent Hackathon & Tech Expo 2025",
    category: "Hackathon & Competition",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    status: "advisor_rejected",
    createdAt: "Oct 12, 2025",
    updatedAt: "Yesterday, 3:45 PM",
    step1: {
      eventTitle: "AI Agent Hackathon & Tech Expo 2025",
      category: "Hackathon & Competition",
      expectedAttendance: 120,
      targetAudience: "All Nile engineering and computing students",
      eventFormat: "Physical In-Person"
    },
    step2: {
      proposedDate: "2025-11-15",
      startTime: "09:00",
      endTime: "18:00",
      venue: "Computer Science Lab Complex & Auditorium",
      objectives: "Hands-on multi-agent AI system building competition with industry mentors from Google and AWS.",
      keynoteSpeaker: "Dr. Aminu Galadima & Industry Lead"
    },
    step3: {
      budgetItems: [
        { id: "b1", description: "Hackathon participant catering (Lunch & Drinks)", unitPrice: 3500, quantity: 120, fundingSource: "Club Dues Fund" },
        { id: "b2", description: "Hardware testing boards & cables", unitPrice: 15000, quantity: 4, fundingSource: "Department Grant" },
        { id: "b3", description: "Winners trophies & branded certificates", unitPrice: 25000, quantity: 3, fundingSource: "Corporate Sponsor" }
      ]
    },
    step4: {
      leadOrganizer: "Farouk Al-Mansoor (President)",
      logisticsLead: "Zainab Mukhtar (VP Logistics)",
      mediaLead: "Oluwaseun Adeleke (PR Lead)",
      equipmentNeeds: "High-speed Wi-Fi access points, 30 extension strips, projector in CS Lab A.",
      safetyPrecautions: "Physical security guard at lab gate, external hardware inspection protocol."
    },
    remarks: {
      reviewerName: "Dr. Aminu Galadima",
      reviewerRole: "Staff Advisor",
      date: "Yesterday, 3:45 PM",
      comment: "Please specify the lab safety protocol for external hardware devices and include the catering quotation vendor name before resubmitting."
    }
  },
  {
    id: "prop-106",
    title: "Campus Open Source Sprint",
    category: "Developer Workshop",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    status: "admin_rejected",
    createdAt: "Oct 8, 2025",
    updatedAt: "Oct 11, 2025",
    step1: {
      eventTitle: "Campus Open Source Sprint",
      category: "Developer Workshop",
      expectedAttendance: 80,
      targetAudience: "Computer Science students contributing to campus tools",
      eventFormat: "Physical In-Person"
    },
    step2: {
      proposedDate: "2025-11-08",
      startTime: "10:00",
      endTime: "16:00",
      venue: "ICT Center, Lab 1",
      objectives: "Ship one usable campus tooling improvement with documented source control.",
      keynoteSpeaker: "Faculty engineering mentor"
    },
    step3: {
      budgetItems: [
        { id: "b30", description: "Lab refreshments", unitPrice: 1500, quantity: 80, fundingSource: "Club Dues Fund" }
      ]
    },
    step4: {
      leadOrganizer: "Farouk Al-Mansoor",
      logisticsLead: "Zainab Mukhtar",
      mediaLead: "Tariq Ibrahim",
      equipmentNeeds: "Lab workstations and a projector",
      safetyPrecautions: "Standard computer lab regulations"
    },
    remarks: {
      reviewerName: "Director Zainab Ahmed",
      reviewerRole: "Student Affairs Admin",
      date: "Oct 11, 2025",
      comment: "Venue calendar conflicts with an already authorized faculty session. Please propose an alternate date."
    }
  },
  {
    id: "prop-104",
    title: "Google Cloud TechSprint & Certification Clinic",
    category: "Technical Workshop",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    status: "draft",
    createdAt: "Oct 16, 2025",
    updatedAt: "3 days ago",
    step1: {
      eventTitle: "Google Cloud TechSprint & Certification Clinic",
      category: "Technical Workshop",
      expectedAttendance: 60,
      targetAudience: "Computer Science & Software Engineering Students",
      eventFormat: "Physical In-Person"
    },
    step2: {
      proposedDate: "2025-11-05",
      startTime: "14:00",
      endTime: "17:30",
      venue: "Engineering Computer Lab 3",
      objectives: "Guided walkthrough of GCP Associate Cloud Engineer exam preparation and sandbox labs.",
      keynoteSpeaker: "Cloud Champion Innovator"
    },
    step3: {
      budgetItems: [
        { id: "b10", description: "GCP Lab Credit Vouchers", unitPrice: 5000, quantity: 60, fundingSource: "Corporate Sponsor" }
      ]
    },
    step4: {
      leadOrganizer: "Farouk Al-Mansoor",
      logisticsLead: "Zainab Mukhtar",
      mediaLead: "Tariq Ibrahim",
      equipmentNeeds: "Lab workstations with internet access",
      safetyPrecautions: "Standard computer lab regulations"
    }
  },
  {
    id: "prop-101",
    title: "Nile DevFest & Career Keynote 2025",
    category: "Industry Keynote",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    status: "approved",
    createdAt: "Sept 28, 2025",
    updatedAt: "Oct 10, 2025",
    step1: {
      eventTitle: "Nile DevFest & Career Keynote 2025",
      category: "Industry Keynote",
      expectedAttendance: 150,
      targetAudience: "University-wide students and faculty",
      eventFormat: "Physical In-Person"
    },
    step2: {
      proposedDate: "2025-10-25",
      startTime: "10:00",
      endTime: "15:00",
      venue: "Main Campus Auditorium",
      objectives: "Annual flagship developer keynote featuring Nile alumni working at global tech companies.",
      keynoteSpeaker: "3 Nile Alumni Tech Leads"
    },
    step3: {
      budgetItems: [
        { id: "b20", description: "Main auditorium stage banner & badges", unitPrice: 45000, quantity: 1, fundingSource: "Club Dues Fund" },
        { id: "b21", description: "Speaker honorarium packages", unitPrice: 20000, quantity: 3, fundingSource: "Club Dues Fund" }
      ]
    },
    step4: {
      leadOrganizer: "Farouk Al-Mansoor",
      logisticsLead: "Zainab Mukhtar",
      mediaLead: "Oluwaseun Adeleke",
      equipmentNeeds: "Stage audio system, 2 wireless mics, livestream camera",
      safetyPrecautions: "University security personnel assigned to Auditorium main doors"
    }
  },
  {
    id: "prop-105",
    title: "Intro to Flutter & Mobile App Architecture",
    category: "Developer Workshop",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    status: "pending_advisor_review",
    createdAt: "Oct 17, 2025",
    updatedAt: "Oct 17, 2025",
    step1: {
      eventTitle: "Intro to Flutter & Mobile App Architecture",
      category: "Developer Workshop",
      expectedAttendance: 45,
      targetAudience: "Beginner & intermediate mobile app enthusiasts",
      eventFormat: "Hybrid"
    },
    step2: {
      proposedDate: "2025-11-20",
      startTime: "15:00",
      endTime: "17:30",
      venue: "CS Lecture Theatre 2",
      objectives: "Teach cross-platform app development using Dart & Flutter SDK.",
      keynoteSpeaker: "GDG Abuja Community Lead"
    },
    step3: {
      budgetItems: [
        { id: "b30", description: "Workshop printed workbooks", unitPrice: 1200, quantity: 45, fundingSource: "Club Dues Fund" }
      ]
    },
    step4: {
      leadOrganizer: "Tariq Ibrahim",
      logisticsLead: "Zainab Mukhtar",
      mediaLead: "Oluwaseun Adeleke",
      equipmentNeeds: "Projector, Google Meet livestream kit",
      safetyPrecautions: "Standard classroom ventilation and seating limits"
    }
  }
];

type ProposalForm = Pick<ProposalRecord, "step1" | "step2" | "step3" | "step4">;

const INITIAL_EMPTY_FORM: ProposalForm = {
  step1: {
    eventTitle: "",
    category: "Technical Workshop",
    expectedAttendance: 50,
    targetAudience: "Registered Club Members and Nile Undergraduates",
    eventFormat: "Physical In-Person"
  },
  step2: {
    proposedDate: "",
    startTime: "10:00",
    endTime: "13:00",
    venue: "",
    objectives: "",
    keynoteSpeaker: ""
  },
  step3: {
    budgetItems: [
      { id: "b-new-1", description: "Event materials and refreshments", unitPrice: 2000, quantity: 50, fundingSource: "Club Dues Fund" }
    ]
  },
  step4: {
    leadOrganizer: "Farouk Al-Mansoor (President)",
    logisticsLead: "Zainab Mukhtar (Executive)",
    mediaLead: "Oluwaseun Adeleke (PR Lead)",
    equipmentNeeds: "Projector and audio mic",
    safetyPrecautions: "Standard campus safety and student identification"
  }
};

export function PresidentProposalsWorkspace() {
  const { profile } = useAuth();
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [proposals, setProposals] = useState<ProposalRecord[]>(INITIAL_PROPOSALS);
  const [activeTab, setActiveTab] = useState<"all" | "drafts" | "returned" | "under_review" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Builder Modal / View State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProposalForm>(INITIAL_EMPTY_FORM);
  const [activeRemarks, setActiveRemarks] = useState<ProposalRecord["remarks"] | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Read-only Details Sheet
  const [viewingProposal, setViewingProposal] = useState<ProposalRecord | null>(null);

  // Total budget calculation
  const totalBudget = useMemo(() => {
    return formData.step3.budgetItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [formData.step3.budgetItems]);

  // Step completion validation (Truthful step state only when fields exist)
  const isStep1Complete = Boolean(formData.step1.eventTitle.trim() && formData.step1.expectedAttendance > 0);
  const isStep2Complete = Boolean(formData.step2.proposedDate && formData.step2.venue.trim() && formData.step2.objectives.trim());
  const isStep3Complete = formData.step3.budgetItems.length > 0 && formData.step3.budgetItems.every((b) => b.description.trim() && b.unitPrice >= 0);
  const isStep4Complete = Boolean(formData.step4.leadOrganizer.trim() && formData.step4.equipmentNeeds.trim());

  // Filtered proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "drafts") return p.status === "draft";
      if (activeTab === "returned") return isReturnedProposalStatus(p.status);
      if (activeTab === "under_review") return isUnderReviewProposalStatus(p.status);
      if (activeTab === "approved") return p.status === "approved";
      return true;
    });
  }, [proposals, searchQuery, activeTab]);

  // Launch New Proposal Builder
  const handleStartNewProposal = () => {
    setEditingProposalId(null);
    setActiveRemarks(null);
    setFormData(INITIAL_EMPTY_FORM);
    setCurrentStep(1);
    setIsBuilderOpen(true);
    setSaveStatus("idle");
    setLastSavedTime(null);
  };

  // Launch Edit / Revise Proposal Builder
  const handleOpenEditProposal = (proposal: ProposalRecord) => {
    if (isUnderReviewProposalStatus(proposal.status)) {
      // Cannot edit while under review - open read-only view
      setViewingProposal(proposal);
      return;
    }

    setEditingProposalId(proposal.id);
    setActiveRemarks(proposal.remarks || null);
    setFormData({
      step1: { ...proposal.step1 },
      step2: { ...proposal.step2 },
      step3: {
        budgetItems: proposal.step3.budgetItems.map((b) => ({ ...b }))
      },
      step4: { ...proposal.step4 }
    });
    setCurrentStep(1);
    setIsBuilderOpen(true);
    setSaveStatus("idle");
    setLastSavedTime(proposal.updatedAt);
  };

  // Save draft anytime
  const handleSaveDraft = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      const now = "Just now";
      setLastSavedTime(now);
      setSaveStatus("saved");

      if (editingProposalId) {
        setProposals((prev) =>
          prev.map((p) =>
            p.id === editingProposalId
              ? {
                  ...p,
                  title: formData.step1.eventTitle || p.title,
                  category: formData.step1.category,
                  updatedAt: now,
                  step1: { ...formData.step1 },
                  step2: { ...formData.step2 },
                  step3: { ...formData.step3 },
                  step4: { ...formData.step4 }
                }
              : p
          )
        );
      } else {
        const newId = `prop-${Date.now().toString().slice(-4)}`;
        const newRecord: ProposalRecord = {
          id: newId,
          title: formData.step1.eventTitle || "Untitled Event Draft",
          category: formData.step1.category,
          clubName,
          clubCode,
          status: "draft",
          createdAt: "Today",
          updatedAt: now,
          step1: { ...formData.step1 },
          step2: { ...formData.step2 },
          step3: { ...formData.step3 },
          step4: { ...formData.step4 }
        };
        setProposals((prev) => [newRecord, ...prev]);
        setEditingProposalId(newId);
      }

      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  };

  // Submit Proposal for Advisor Review (Step 5)
  const handleSubmitForReview = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      const targetId = editingProposalId || `prop-${Date.now().toString().slice(-4)}`;
      const updatedRecord: ProposalRecord = {
        id: targetId,
        title: formData.step1.eventTitle || "New Club Proposal",
        category: formData.step1.category,
        clubName,
        clubCode,
        status: "pending_advisor_review",
        createdAt: "Today",
        updatedAt: "Just now",
        step1: { ...formData.step1 },
        step2: { ...formData.step2 },
        step3: { ...formData.step3 },
        step4: { ...formData.step4 }
      };

      setProposals((prev) => {
        const exists = prev.some((p) => p.id === targetId);
        if (exists) {
          return prev.map((p) => (p.id === targetId ? updatedRecord : p));
        }
        return [updatedRecord, ...prev];
      });

      setIsBuilderOpen(false);
      setSaveStatus("idle");
    }, 500);
  };

  // Budget item helpers
  const handleAddBudgetItem = () => {
    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      description: "",
      unitPrice: 0,
      quantity: 1,
      fundingSource: "Club Dues Fund"
    };
    setFormData((prev) => ({
      ...prev,
      step3: {
        budgetItems: [...prev.step3.budgetItems, newItem]
      }
    }));
  };

  const handleRemoveBudgetItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      step3: {
        budgetItems: prev.step3.budgetItems.filter((b) => b.id !== id)
      }
    }));
  };

  const handleUpdateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setFormData((prev) => ({
      ...prev,
      step3: {
        budgetItems: prev.step3.budgetItems.map((b) => (b.id === id ? { ...b, ...updates } : b))
      }
    }));
  };

  const getStatusBadge = (status: ProposalStatus) => {
    const label = isOneClubProposalStatus(status) ? proposalStatusLabel(status) : "Unknown status";
    return <StatusBadge status={status} label={label} />;
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="proposals-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-proposals-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/PROPOSALS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Pipeline &bull; {clubCode}
            </span>
          </div>
          <h1 id="proposals-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Proposal Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Author new event proposals, edit returned items with reviewer remarks, and track approval status through Staff Advisor and Student Affairs.
          </p>
        </div>

        {/* Primary Dominant Action */}
        <Button
          onClick={handleStartNewProposal}
          size="sm"
          className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>New Event Proposal</span>
        </Button>
      </header>

      {/* FILTER TABS & SEARCH */}
      <section aria-labelledby="pipeline-filter-heading" className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <TextField
            id="proposal-search"
            placeholder="Search proposals by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Proposals" },
            { id: "drafts", label: "Drafts" },
            { id: "returned", label: "Returned" },
            { id: "under_review", label: "Under Review" },
            { id: "approved", label: "Approved" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* PROPOSAL DIRECTORY LIST */}
      <section aria-labelledby="directory-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="directory-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Club Proposals ({filteredProposals.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Assigned Club: {clubName}
          </span>
        </div>

        {filteredProposals.length === 0 ? (
          <Card className="border-dashed border-border/80 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No proposals found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No event proposals match your current filter. Draft a new proposal to start the approval workflow.
              </p>
            </div>
            <Button size="sm" onClick={handleStartNewProposal} className="text-xs font-bold gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Draft New Proposal</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProposals.map((proposal) => {
              const isEditable = proposal.status === "draft" || isReturnedProposalStatus(proposal.status);
              const isUnderReview = isUnderReviewProposalStatus(proposal.status);

              return (
                <Card key={proposal.id} className="border-border/80 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {proposal.id}
                      </span>
                      {getStatusBadge(proposal.status)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {proposal.category} &bull; {proposal.step1.expectedAttendance} Expected Attendees
                      </p>
                    </div>

                    {/* Show remarks highlight if returned */}
                    {proposal.remarks && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Remarks from {proposal.remarks.reviewerName}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          "{proposal.remarks.comment}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Updated {proposal.updatedAt}
                    </span>

                    <div className="flex items-center gap-2">
                      {isUnderReview ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingProposal(proposal)}
                          className="text-xs font-semibold h-8 gap-1"
                        >
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Review Timeline</span>
                        </Button>
                      ) : isEditable ? (
                        <Button
                          size="sm"
                          variant={isReturnedProposalStatus(proposal.status) ? "default" : "outline"}
                          onClick={() => handleOpenEditProposal(proposal)}
                          className="text-xs font-bold h-8 gap-1"
                        >
                          <FileEdit className="h-3.5 w-3.5" />
                          <span>{isReturnedProposalStatus(proposal.status) ? "Revise & Resubmit" : "Edit Draft"}</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingProposal(proposal)}
                          className="text-xs font-semibold h-8 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* FIVE-STEP PROPOSAL BUILDER DIALOG */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent maxWidth="2xl" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {/* BUILDER HEADER */}
          <div className="p-5 border-b border-border/80 bg-card">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                    {clubName} ({clubCode})
                  </span>
                  {saveStatus === "saving" && (
                    <span className="text-[11px] text-muted-foreground font-mono animate-pulse">
                      Saving draft...
                    </span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Draft saved ({lastSavedTime})
                    </span>
                  )}
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {editingProposalId ? "Revise Event Proposal" : "New Event Proposal Builder"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Complete all five sections to submit your proposal for Staff Advisor review.
                </DialogDescription>
              </div>

              {/* SAVE DRAFT ANYTIME BUTTON */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="text-xs font-semibold shrink-0 gap-1.5 h-8"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Draft</span>
              </Button>
            </div>

            {/* RETURNED PROPOSAL REMARKS FIRST */}
            {activeRemarks && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Revision Requested by {activeRemarks.reviewerName} ({activeRemarks.reviewerRole})
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{activeRemarks.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "{activeRemarks.comment}"
                </p>
              </div>
            )}

            {/* FIVE-STEP PROGRESS BAR (Truthful Step State) */}
            <div className="mt-5 grid grid-cols-5 gap-1.5 text-center">
              {[
                { step: 1, label: "Basic Info", isComplete: isStep1Complete },
                { step: 2, label: "Event Plan", isComplete: isStep2Complete },
                { step: 3, label: "Budget", isComplete: isStep3Complete },
                { step: 4, label: "Logistics", isComplete: isStep4Complete },
                { step: 5, label: "Review", isComplete: false }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step as typeof currentStep)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                    currentStep === s.step
                      ? "bg-primary/10 text-primary font-bold border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold border bg-card">
                    {s.isComplete ? <Check className="h-3 w-3 text-emerald-500" /> : s.step}
                  </div>
                  <span className="text-[10px] hidden sm:inline-block truncate max-w-full">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* BUILDER STEP CONTENT (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* STEP 1: BASIC INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>1. Basic Information</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Provide the core title, format, and expected scale of the event.
                  </p>
                </div>

                <div className="space-y-3">
                  <TextField
                    id="event-title"
                    label="Event Title"
                    placeholder="e.g. AI Agent Hackathon & Tech Expo 2025"
                    value={formData.step1.eventTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        step1: { ...prev.step1, eventTitle: e.target.value }
                      }))
                    }
                    helperText="Official title that will appear in the Campus One calendar upon approval."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Event Category
                      </label>
                      <select
                        value={formData.step1.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            step1: { ...prev.step1, category: e.target.value }
                          }))
                        }
                        className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                      >
                        <option value="Technical Workshop">Technical Workshop</option>
                        <option value="Hackathon & Competition">Hackathon &amp; Competition</option>
                        <option value="Industry Keynote">Industry Keynote</option>
                        <option value="Career & Mentorship">Career &amp; Mentorship</option>
                        <option value="Community Meetup">Community Meetup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Event Format
                      </label>
                      <select
                        value={formData.step1.eventFormat}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            step1: {
                              ...prev.step1,
                              eventFormat: e.target.value as typeof formData.step1.eventFormat
                            }
                          }))
                        }
                        className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                      >
                        <option value="Physical In-Person">Physical In-Person</option>
                        <option value="Hybrid">Hybrid (In-Person + Online Stream)</option>
                        <option value="Virtual Workshop">Virtual Workshop</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      id="expected-attendance"
                      label="Expected Attendance Count"
                      type="number"
                      value={formData.step1.expectedAttendance.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step1: { ...prev.step1, expectedAttendance: parseInt(e.target.value) || 0 }
                        }))
                      }
                      helperText="Capacity planning for venue assignment."
                    />

                    <TextField
                      id="target-audience"
                      label="Target Audience"
                      placeholder="e.g. Nile Engineering Students"
                      value={formData.step1.targetAudience}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step1: { ...prev.step1, targetAudience: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EVENT PLAN */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    2. Event Schedule &amp; Venue Plan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Specify the date, facility requirements, and program objectives.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <TextField
                      id="proposed-date"
                      label="Proposed Date"
                      type="date"
                      value={formData.step2.proposedDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step2: { ...prev.step2, proposedDate: e.target.value }
                        }))
                      }
                    />

                    <TextField
                      id="start-time"
                      label="Start Time"
                      type="time"
                      value={formData.step2.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step2: { ...prev.step2, startTime: e.target.value }
                        }))
                      }
                    />

                    <TextField
                      id="end-time"
                      label="End Time"
                      type="time"
                      value={formData.step2.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step2: { ...prev.step2, endTime: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <TextField
                    id="venue-name"
                    label="Requested Venue / Room"
                    placeholder="e.g. Main Campus Auditorium or Engineering Computer Lab 3"
                    value={formData.step2.venue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, venue: e.target.value }
                      }))
                    }
                  />

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Objectives &amp; Program Summary
                    </label>
                    <textarea
                      rows={3}
                      value={formData.step2.objectives}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step2: { ...prev.step2, objectives: e.target.value }
                        }))
                      }
                      placeholder="Outline what participants will learn, keynote agenda, and expected outcomes..."
                      className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <TextField
                    id="keynote-speaker"
                    label="Keynote Speakers / External Guests (Optional)"
                    placeholder="e.g. Google Developer Expert or Industry Partner"
                    value={formData.step2.keynoteSpeaker || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        step2: { ...prev.step2, keynoteSpeaker: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET (LINE ITEMS) */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      3. Budget &amp; Line Items Breakdown
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Itemized expenditures with verified unit prices and funding sources.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBudgetItem}
                    className="text-xs font-bold gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {formData.step3.budgetItems.map((item, index) => (
                    <Card key={item.id} className="p-3 border-border/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-primary font-mono">
                          Item #{index + 1}
                        </span>
                        {formData.step3.budgetItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBudgetItem(item.id)}
                            className="text-destructive hover:text-destructive/80 p-1 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Description (e.g. Refreshments)"
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateBudgetItem(item.id, { description: e.target.value })
                            }
                            className="w-full rounded-xl border border-border/80 bg-card p-2 text-xs"
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            placeholder="Unit Price (₦)"
                            value={item.unitPrice || ""}
                            onChange={(e) =>
                              handleUpdateBudgetItem(item.id, {
                                unitPrice: parseFloat(e.target.value) || 0
                              })
                            }
                            className="w-full rounded-xl border border-border/80 bg-card p-2 text-xs"
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleUpdateBudgetItem(item.id, {
                                quantity: parseInt(e.target.value) || 1
                              })
                            }
                            className="w-full rounded-xl border border-border/80 bg-card p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                        <select
                          value={item.fundingSource}
                          onChange={(e) =>
                            handleUpdateBudgetItem(item.id, {
                              fundingSource: e.target.value as BudgetItem["fundingSource"]
                            })
                          }
                          className="rounded-lg border border-border/80 bg-card px-2 py-1 text-[11px]"
                        >
                          <option value="Club Dues Fund">Club Dues Fund</option>
                          <option value="Department Grant">Department Grant</option>
                          <option value="Corporate Sponsor">Corporate Sponsor</option>
                        </select>

                        <span className="font-mono font-bold text-foreground">
                          Total: ₦{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Total Budget Card */}
                <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Total Estimated Budget:</span>
                  <span className="text-base font-bold font-mono text-primary">
                    ₦{totalBudget.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: LOGISTICS & RESPONSIBLE MEMBERS */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    4. Logistics, Roles &amp; Safety Precautions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assign responsible club officers and outline safety measures.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <TextField
                      id="lead-organizer"
                      label="Lead Organizer"
                      value={formData.step4.leadOrganizer}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step4: { ...prev.step4, leadOrganizer: e.target.value }
                        }))
                      }
                    />

                    <TextField
                      id="logistics-lead"
                      label="Logistics Executive"
                      value={formData.step4.logisticsLead}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step4: { ...prev.step4, logisticsLead: e.target.value }
                        }))
                      }
                    />

                    <TextField
                      id="media-lead"
                      label="PR / Media Lead"
                      value={formData.step4.mediaLead}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step4: { ...prev.step4, mediaLead: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Facility &amp; Technical Equipment Needs
                    </label>
                    <textarea
                      rows={2}
                      value={formData.step4.equipmentNeeds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step4: { ...prev.step4, equipmentNeeds: e.target.value }
                        }))
                      }
                      placeholder="e.g. 2 Wireless microphones, projector in CS Lab A, 30 power extension strips..."
                      className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Risk Assessment &amp; Campus Safety Precautions
                    </label>
                    <textarea
                      rows={2}
                      value={formData.step4.safetyPrecautions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          step4: { ...prev.step4, safetyPrecautions: e.target.value }
                        }))
                      }
                      placeholder="e.g. Student ID verification at door, crowd control protocols, hardware safety checks..."
                      className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW AND SUBMIT */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    5. Review Summary &amp; Submission
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Carefully review all proposal details before routing to your Staff Advisor.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Summary Card */}
                  <Card className="p-4 border-border/80 space-y-3 bg-muted/20">
                    <div className="border-b border-border/60 pb-2 flex items-center justify-between">
                      <span className="font-bold text-foreground">{formData.step1.eventTitle || "Untitled Event"}</span>
                      <span className="font-mono text-primary font-bold">₦{totalBudget.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div><strong>Category:</strong> {formData.step1.category}</div>
                      <div><strong>Format:</strong> {formData.step1.eventFormat}</div>
                      <div><strong>Date:</strong> {formData.step2.proposedDate || "TBC"} ({formData.step2.startTime} - {formData.step2.endTime})</div>
                      <div><strong>Venue:</strong> {formData.step2.venue || "TBC"}</div>
                      <div><strong>Expected:</strong> {formData.step1.expectedAttendance} participants</div>
                      <div><strong>Lead:</strong> {formData.step4.leadOrganizer}</div>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-muted-foreground">
                      <strong>Objectives:</strong> {formData.step2.objectives || "Not specified."}
                    </div>
                  </Card>

                  {/* Submission Declaration */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Presidential Submission Notice</span>
                    </div>
                    <p>
                      Submitting will lock this proposal and route it immediately to Staff Advisor (Prof. Halima Yusuf). You cannot modify proposal contents while under review until remarks are returned.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BUILDER FOOTER CONTROLS */}
          <div className="p-4 border-t border-border/80 bg-card flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as typeof currentStep)}
                  className="text-xs font-semibold gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBuilderOpen(false)}
                className="text-xs"
              >
                Close Builder
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => (prev + 1) as typeof currentStep)}
                  className="text-xs font-bold gap-1"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                /* Do NOT preselect Submit - explicit action */
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmitForReview}
                  className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit for Advisor Review</span>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* READ-ONLY PROPOSAL DETAILS & TIMELINE DIALOG */}
      <Dialog open={Boolean(viewingProposal)} onOpenChange={(open) => !open && setViewingProposal(null)}>
        <DialogContent maxWidth="md">
          {viewingProposal && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground">{viewingProposal.id}</span>
                  {getStatusBadge(viewingProposal.status)}
                </div>
                <DialogTitle className="text-foreground">{viewingProposal.title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {viewingProposal.clubName} &bull; {viewingProposal.category}
                </DialogDescription>
              </DialogHeader>

              {/* TIMELINE / STATE CARD */}
              <div className="space-y-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <h4 className="font-bold text-foreground">Workflow Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submitted by Club President ({viewingProposal.createdAt})</span>
                  </div>

                  {viewingProposal.status === "pending_advisor_review" && (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>Currently under Staff Advisor Review (Dr. Aminu Galadima)</span>
                    </div>
                  )}

                  {viewingProposal.status === "pending_admin_review" && (
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>Advisor Approved &bull; Awaiting Student Affairs Admin final review</span>
                    </div>
                  )}

                  {viewingProposal.status === "approved" && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approved by Student Affairs &bull; Converted into Official Campus Event</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILS SUMMARY */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Proposed Date &amp; Time:</span>
                  <span className="font-semibold text-foreground">{viewingProposal.step2.proposedDate} ({viewingProposal.step2.startTime})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Venue:</span>
                  <span className="font-semibold text-foreground">{viewingProposal.step2.venue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Expected Attendees:</span>
                  <span className="font-semibold text-foreground">{viewingProposal.step1.expectedAttendance}</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingProposal(null)}
                  className="w-full text-xs"
                >
                  Close Inspection
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
