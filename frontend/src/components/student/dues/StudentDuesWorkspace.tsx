import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  FileUp,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";

export type DuePaymentState = "unpaid" | "proof_awaiting_review" | "proof_verified" | "proof_rejected";

export interface StudentClubDueRecord {
  id: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  category: string;
  session: string;
  amount: number;
  dueDate: string;
  status: DuePaymentState;
  proofReference?: string;
  accountNameOnProof?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  reviewerNotes?: string;
}

const INITIAL_STUDENT_DUES: StudentClubDueRecord[] = [
  {
    id: "due-ngd-01",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    category: "Technology",
    session: "2025/2026 Academic Session",
    amount: 10000,
    dueDate: "November 30, 2025",
    status: "proof_verified",
    proofReference: "TXN-NGD-2025-0814",
    accountNameOnProof: "Amina Bello",
    submittedAt: "Oct 12, 2025",
    verifiedAt: "Oct 14, 2025 by Nile Student Affairs Treasury Desk",
    reviewerNotes: "Transaction verified against Providus Bank statement batch #104."
  },
  {
    id: "due-nbc-02",
    clubId: "club-1",
    clubName: "Nile Book Club",
    clubCode: "NBC",
    category: "Arts & Culture",
    session: "2025/2026 Academic Session",
    amount: 10000,
    dueDate: "December 15, 2025",
    status: "proof_verified",
    proofReference: "TXN-NBC-2025-0992",
    accountNameOnProof: "Amina Bello",
    submittedAt: "Nov 02, 2025",
    verifiedAt: "Nov 04, 2025 by Nile Student Affairs Treasury Desk"
  },
  {
    id: "due-wit-03",
    clubId: "club-wit",
    clubName: "Women in Tech Club",
    clubCode: "WIT",
    category: "Technology",
    session: "2025/2026 Academic Session",
    amount: 10000,
    dueDate: "November 25, 2025",
    status: "proof_awaiting_review",
    proofReference: "TXN-WIT-2025-9941",
    accountNameOnProof: "Amina Bello",
    submittedAt: "Yesterday at 3:45 PM",
    reviewerNotes: "Under review in the Nile Accounting clearance queue."
  },
  {
    id: "due-ndc-04",
    clubId: "club-ndc",
    clubName: "Nile Debate Club",
    clubCode: "NDC",
    category: "Leadership & Speaking",
    session: "2025/2026 Academic Session",
    amount: 10000,
    dueDate: "November 15, 2025",
    status: "proof_rejected",
    proofReference: "TXN-NDC-77210",
    accountNameOnProof: "Amina Bello",
    submittedAt: "Oct 14, 2025",
    rejectionReason: "Uploaded bank receipt was unreadable/blurred. Please re-upload a clear Providus Bank transaction slip with visible session ID."
  },
  {
    id: "due-nrs-05",
    clubId: "club-nrs",
    clubName: "Nile Robotics Society",
    clubCode: "NRS",
    category: "Engineering",
    session: "2025/2026 Academic Session",
    amount: 10000,
    dueDate: "December 20, 2025",
    status: "unpaid"
  }
];

export function StudentDuesWorkspace() {
  const { profile } = useAuth();
  const studentName = profile?.full_name || "Amina Bello";
  const studentId = profile?.student_id || "2021/0458";

  const [duesList, setDuesList] = useState<StudentClubDueRecord[]>(INITIAL_STUDENT_DUES);
  const [activeFilter, setActiveFilter] = useState<"all" | "unpaid" | "submitted" | "paid" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Bank Info from institutional payment settings
  const bankSettings = {
    bankName: "Providus Bank",
    accountNumber: "1305861314",
    accountName: "Nile University Student Affairs - Club Services",
    referenceFormat: "MatricNo-ClubCode (e.g. 20210458-NGD)"
  };

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Upload & Proof Modal State
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [targetDue, setTargetDue] = useState<StudentClubDueRecord | null>(null);
  const [payerAccountName, setPayerAccountName] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Proof Upload Modal (for unpaid or rejected)
  const handleOpenProofModal = (due: StudentClubDueRecord) => {
    setTargetDue(due);
    setPayerAccountName(studentName);
    setReferenceCode(due.proofReference || "");
    setTransferDate(new Date().toISOString().split("T")[0]);
    setSelectedFile(null);
    setFilePreview(null);
    setFormError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setProofModalOpen(true);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("File size must be under 5MB.");
        return;
      }
      setSelectedFile(file);
      setFormError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit proof via storage simulation
  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDue) return;

    if (!payerAccountName.trim()) {
      setFormError("Please provide the account name on the payment transfer.");
      return;
    }
    if (!referenceCode.trim()) {
      setFormError("Please enter the bank transaction reference or session ID.");
      return;
    }
    if (!selectedFile && !filePreview) {
      setFormError("Please upload an image or PDF of the bank receipt.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(100);

      const timestamp = new Date().toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      setDuesList((prev) =>
        prev.map((d) =>
          d.id === targetDue.id
            ? {
                ...d,
                status: "proof_awaiting_review",
                proofReference: referenceCode.trim(),
                accountNameOnProof: payerAccountName.trim(),
                submittedAt: `Today (${timestamp})`,
                reviewerNotes: "Receipt uploaded via OneClub storage. Queued for Club Services accounting verification."
              }
            : d
        )
      );

      setProofModalOpen(false);
      setFeedbackNotice(
        `Payment proof for ${targetDue.clubName} (₦${targetDue.amount.toLocaleString()}) has been submitted and queued for review.`
      );
    }, 900);
  };

  // Filtered Dues
  const filteredDues = useMemo(() => {
    return duesList.filter((d) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unpaid" && d.status === "unpaid") ||
        (activeFilter === "submitted" && d.status === "proof_awaiting_review") ||
        (activeFilter === "paid" && d.status === "proof_verified") ||
        (activeFilter === "rejected" && d.status === "proof_rejected");

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === "" ||
        d.clubName.toLowerCase().includes(q) ||
        d.clubCode.toLowerCase().includes(q) ||
        d.session.toLowerCase().includes(q) ||
        (d.proofReference && d.proofReference.toLowerCase().includes(q));

      return matchesFilter && matchesQuery;
    });
  }, [duesList, activeFilter, searchQuery]);

  return (
    <main className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="dues-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-dues-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/DUES
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Session Dues &bull; {studentId}
            </span>
          </div>
          <h1 id="dues-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Club Dues &amp; Payment Proofs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Semester dues created upon club enrollment. Review official bank transfer instructions and upload payment receipts for accounting review.
          </p>
        </div>

        {/* Security / Verification Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Accounting Desk
          </span>
        </div>
      </header>

      {/* Global Status Banner */}
      {feedbackNotice && (
        <Banner
          variant="success"
          title="Proof Submission Confirmed"
          description={feedbackNotice}
          onDismiss={() => setFeedbackNotice(null)}
        />
      )}

      {/* OFFICIAL BANK INSTRUCTIONS (Never 'Pay Now') */}
      <section aria-labelledby="bank-instructions-heading" className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary shrink-0" />
            <h2 id="bank-instructions-heading" className="text-xs font-bold uppercase tracking-wider text-primary">
              Official Institutional Bank Account Details
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Providus Bank Nigeria
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Account Number */}
          <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Account Number
              </span>
              <span className="text-sm font-mono font-bold text-foreground">
                {bankSettings.accountNumber}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(bankSettings.accountNumber, "acc")}
              className="h-8 w-8 p-0"
              aria-label="Copy account number"
            >
              {copiedKey === "acc" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Account Name */}
          <div className="p-3 rounded-xl bg-card border border-border/80">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Beneficiary Name
            </span>
            <span className="text-xs font-bold text-foreground truncate block">
              {bankSettings.accountName}
            </span>
          </div>

          {/* Reference Format */}
          <div className="p-3 rounded-xl bg-card border border-border/80">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Transfer Narration
            </span>
            <span className="text-xs font-mono font-semibold text-primary block truncate">
              {studentId.replace("/", "")}-[CLUB_CODE]
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/20 border border-border/70 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>External Payment Notice:</strong> Payments must be executed outside OneClub via your bank app or internet banking. After transfer, upload your receipt below with the transaction reference. Club Services reviews and updates your status to <em>Paid &amp; Cleared</em>.
          </span>
        </div>
      </section>

      {/* FILTER TABS & SEARCH */}
      <section aria-label="Dues filtering" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Dues ({duesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "unpaid"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unpaid ({duesList.filter((d) => d.status === "unpaid").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("submitted")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "submitted"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Awaiting Review ({duesList.filter((d) => d.status === "proof_awaiting_review").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "paid"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Paid ({duesList.filter((d) => d.status === "proof_verified").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "rejected"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Rejected ({duesList.filter((d) => d.status === "proof_rejected").length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dues or refs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DUES RECORD CARDS (Per-Club Dues Records) */}
      <section aria-label="Club dues records" className="space-y-4">
        {filteredDues.length > 0 ? (
          filteredDues.map((due) => {
            const isPaid = due.status === "proof_verified";
            const isAwaiting = due.status === "proof_awaiting_review";
            const isRejected = due.status === "proof_rejected";
            const isUnpaid = due.status === "unpaid";

            return (
              <Card
                key={due.id}
                className={`border-border/80 text-left transition-all ${
                  isPaid ? "border-emerald-500/30" : isRejected ? "border-destructive/30" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">
                          {due.clubName}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                          {due.clubCode}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          &bull; {due.session}
                        </span>
                      </div>

                      <CardTitle className="text-base font-bold text-foreground">
                        Annual Membership Dues &bull; ₦{due.amount.toLocaleString()}
                      </CardTitle>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPaid ? (
                        <StatusBadge variant="success" dot label="Proof Verified (Paid)" />
                      ) : isAwaiting ? (
                        <StatusBadge variant="warning" dot label="Proof Awaiting Review" />
                      ) : isRejected ? (
                        <StatusBadge variant="error" dot label="Proof Rejected" />
                      ) : (
                        <StatusBadge variant="neutral" dot label="Unpaid (Proof Needed)" />
                      )}
                    </div>
                  </div>

                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Official registration fee for {due.category} club participation &bull; Due date: {due.dueDate}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  {/* Detailed State Metadata */}
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/15 text-xs space-y-1">
                    {isPaid && (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Clearance Confirmed ({due.verifiedAt})</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          Verified Reference: <strong className="font-mono text-foreground">{due.proofReference}</strong> &bull; Payer: {due.accountNameOnProof}
                        </p>
                        {due.reviewerNotes && (
                          <p className="text-[11px] text-muted-foreground/80 pl-5 italic">
                            {due.reviewerNotes}
                          </p>
                        )}
                      </div>
                    )}

                    {isAwaiting && (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Receipt Submitted on {due.submittedAt}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          Pending Reference: <strong className="font-mono text-foreground">{due.proofReference}</strong> &bull; Payer: {due.accountNameOnProof}
                        </p>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          Nile Student Affairs treasury desk is matching your payment against Providus bank records.
                        </p>
                      </div>
                    )}

                    {isRejected && (
                      <div className="space-y-1 text-destructive">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Proof Verification Rejected</span>
                        </div>
                        <p className="text-[11px] leading-relaxed pl-5">
                          <strong>Reason:</strong> {due.rejectionReason}
                        </p>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          Please click &ldquo;Resubmit Bank Proof&rdquo; below with a clear transaction receipt.
                        </p>
                      </div>
                    )}

                    {isUnpaid && (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Banknote className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>No payment proof submitted yet for this session.</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          Make an external bank transfer of ₦{due.amount.toLocaleString()} to Providus Bank <code>{bankSettings.accountNumber}</code>, then submit proof.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Row (Never "Pay now" - Always Submit Proof / Resubmit) */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Ref: {due.proofReference || "None"}
                    </span>

                    <div className="flex items-center gap-2">
                      {isPaid && (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          Good Standing
                        </span>
                      )}

                      {isAwaiting && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenProofModal(due)}
                          className="text-xs"
                        >
                          Update / Replace Proof
                        </Button>
                      )}

                      {(isUnpaid || isRejected) && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenProofModal(due)}
                          className="text-xs font-bold gap-1.5"
                        >
                          <FileUp className="h-3.5 w-3.5" />
                          <span>{isRejected ? "Resubmit Bank Proof" : "Submit Payment Proof"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
            <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No dues found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No matching dues records found for this filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="text-xs mt-2"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </section>

      {/* MODAL: SUBMIT PAYMENT PROOF VIA STORAGE & CONFIRMATION */}
      <Dialog
        open={proofModalOpen}
        onOpenChange={(open) => !open && setProofModalOpen(false)}
      >
        <DialogContent maxWidth="md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {targetDue?.clubName}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {targetDue?.clubCode}
              </span>
            </div>
            <DialogTitle className="text-lg mt-1 text-foreground">
              Submit Bank Payment Proof
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Amount Due: <strong>₦{targetDue?.amount.toLocaleString()}</strong> &bull; {targetDue?.session}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleProofSubmit} className="space-y-4 py-2 text-xs">
            {/* Bank Target Reminder */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/80 text-[11px] space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Destination Bank:</span>
                <span className="font-semibold text-foreground">Providus Bank</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-primary">{bankSettings.accountNumber}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Account Name:</span>
                <span className="font-semibold text-foreground truncate">{bankSettings.accountName}</span>
              </div>
            </div>

            {/* Account Name on Proof */}
            <TextField
              label="Account Name on Bank Transfer"
              placeholder="e.g. Amina Bello"
              value={payerAccountName}
              onChange={(e) => setPayerAccountName(e.target.value)}
              required
            />

            {/* Transaction Reference */}
            <TextField
              label="Bank Transaction Reference / Session ID"
              placeholder="e.g. TXN-NGD-2025-9982 or Session Ref"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              required
            />

            {/* Receipt Upload via Storage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Upload Bank Transfer Receipt (Image / PDF)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-21/9 w-full rounded-xl border-2 border-dashed border-primary/40 bg-muted/20 hover:bg-muted/30 cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-1 flex flex-col items-center">
                    <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold text-foreground truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 flex flex-col items-center">
                    <Upload className="h-6 w-6 text-primary" />
                    <p className="text-xs font-bold text-foreground">
                      Click to choose bank receipt
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      JPG, PNG, or PDF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar when uploading */}
            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                  <span>Uploading receipt to secure storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProofModalOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="gap-1.5 font-bold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting Proof...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm &amp; Submit Proof</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
