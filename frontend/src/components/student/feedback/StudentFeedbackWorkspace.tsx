import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Banner } from "@/shared/components/Banner";

export type FeedbackCategory =
  | "general"
  | "club"
  | "onboarding"
  | "joining"
  | "dues"
  | "login_access";

const FEEDBACK_CATEGORIES: Array<{ value: FeedbackCategory; label: string; description: string }> = [
  {
    value: "general",
    label: "General Campus Suggestion",
    description: "Ideas, campus life improvements, or general feedback for Club Services."
  },
  {
    value: "club",
    label: "Club Experience & Operations",
    description: "Meeting schedules, club leadership, resources, or executive management."
  },
  {
    value: "onboarding",
    label: "Onboarding & App Experience",
    description: "Confusing navigation, account setup, or mobile UI suggestions."
  },
  {
    value: "joining",
    label: "Club Joining & Requests",
    description: "Application submission, member approvals, or discovery directory."
  },
  {
    value: "dues",
    label: "Dues & Bank Payment Proof",
    description: "Bank transfer verification, fee clearance, or receipt upload issues."
  },
  {
    value: "login_access",
    label: "Login & Campus One Access",
    description: "SSO authentication, student matric number verification, or account locks."
  }
];

const OFFICIAL_CLUBS = [
  { code: "GENERAL", name: "None / Campus-Wide (Not Club Specific)" },
  { code: "NGD", name: "Nile Google Developers (NGD)" },
  { code: "NBC", name: "Nile Book Club (NBC)" },
  { code: "WIT", name: "Women in Tech Club (WIT)" },
  { code: "NDC", name: "Nile Debate Club (NDC)" },
  { code: "NRS", name: "Nile Robotics Society (NRS)" },
  { code: "NPS", name: "Nile Photography Society (NPS)" },
  { code: "NCC", name: "Nile Chess Club (NCC)" }
];

export interface FeedbackReceipt {
  submissionId: string;
  categoryLabel: string;
  clubName: string;
  timestamp: string;
  commentPreview: string;
  canContact: boolean;
}

export function StudentFeedbackWorkspace() {
  const { profile } = useAuth();
  const studentIdentity = {
    fullName: profile?.full_name || "Amina Bello",
    studentId: profile?.student_id || "2021/0458",
    email: profile?.email || "amina.bello@nileuniversity.edu.ng",
    department: profile?.department || "Computer Engineering"
  };

  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [selectedClub, setSelectedClub] = useState<string>("GENERAL");
  const [comment, setComment] = useState("");
  const [canContact, setCanContact] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<FeedbackReceipt | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      setFormError("Please describe your feedback or observation in the comment box.");
      return;
    }

    if (comment.trim().length < 15) {
      setFormError("Please provide a bit more detail (minimum 15 characters).");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = `FDB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const catObj = FEEDBACK_CATEGORIES.find((c) => c.value === category);
      const clubObj = OFFICIAL_CLUBS.find((cl) => cl.code === selectedClub);

      setReceipt({
        submissionId: generatedId,
        categoryLabel: catObj?.label || "General Suggestion",
        clubName: clubObj?.name || "General Campus",
        timestamp: new Date().toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        commentPreview: comment.trim(),
        canContact
      });
    }, 700);
  };

  const handleResetForNewSubmission = () => {
    setReceipt(null);
    setCategory("general");
    setSelectedClub("GENERAL");
    setComment("");
    setCanContact(true);
    setFormError(null);
  };

  return (
    <main className="space-y-6 max-w-3xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="feedback-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-feedback-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/FEEDBACK
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Student Voice &bull; {studentIdentity.studentId}
            </span>
          </div>
          <h1 id="feedback-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Submit Feedback &amp; Suggestions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Share ideas, report onboarding friction, or communicate dues issues. Submissions are reviewed directly by Nile Club Services administrators.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="text-xs self-start sm:self-auto">
          <Link to="/student/more">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            More
          </Link>
        </Button>
      </header>

      {/* SUCCESS RECEIPT STATE (For this submission only, no history list) */}
      {receipt ? (
        <section aria-labelledby="receipt-heading" className="space-y-4 animate-fade-in">
          <Card className="border-emerald-500/30 bg-emerald-500/5 text-left">
            <CardHeader className="pb-3 border-b border-emerald-500/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                      Submission Confirmed
                    </span>
                    <CardTitle id="receipt-heading" className="text-base sm:text-lg text-foreground">
                      Feedback Receipt #{receipt.submissionId}
                    </CardTitle>
                  </div>
                </div>

                <StatusBadge variant="success" dot label="Under Review" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              {/* Receipt Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-card border border-border/80 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Category
                  </span>
                  <span className="font-semibold text-foreground">{receipt.categoryLabel}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Associated Organization
                  </span>
                  <span className="font-semibold text-foreground truncate block">{receipt.clubName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Submitted Timestamp
                  </span>
                  <span className="font-mono text-foreground">{receipt.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Assigned Desk
                  </span>
                  <span className="font-semibold text-foreground">Nile Club Services Review Team</span>
                </div>
              </div>

              {/* Comment Quote */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Your Submitted Comment
                </span>
                <p className="text-xs text-foreground italic whitespace-pre-line leading-relaxed">
                  &ldquo;{receipt.commentPreview}&rdquo;
                </p>
              </div>

              {/* Administrative Reading Notice */}
              <div className="p-3 rounded-xl border border-border/80 bg-card text-[11px] text-muted-foreground flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Authorized Club Services administrators have received this feedback. If follow-up is necessary, they will reach out via your official student email.
                </span>
              </div>

              {/* Next Steps Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetForNewSubmission}
                  className="w-full sm:w-auto text-xs"
                >
                  Submit Another Feedback
                </Button>

                <Button asChild size="sm" className="w-full sm:w-auto text-xs">
                  <Link to="/student/home">
                    <span>Return to Student Home</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        /* PRIMARY FEEDBACK WORKFLOW FORM */
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Privacy & Governance Notice */}
          <section aria-label="Governance notice" className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Administrative Review Notice</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Authorized Nile University Club Services administrators and student affairs officers can read this submission. Your verified student profile (<strong>{studentIdentity.fullName} &bull; {studentIdentity.studentId}</strong>) is attached to ensure constructive accountability.
            </p>
          </section>

          {/* Validation Error Banner */}
          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Feedback Form Card */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Feedback Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select the appropriate topic area and provide actionable suggestions or issues.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Category Selector */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-category" className="text-xs font-bold text-foreground block">
                  Feedback Category <span className="text-primary">*</span>
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {FEEDBACK_CATEGORIES.find((c) => c.value === category)?.description}
                </p>
              </div>

              {/* Optional Club Selector */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-club" className="text-xs font-bold text-foreground block">
                  Target Organization <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <select
                  id="feedback-club"
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {OFFICIAL_CLUBS.map((club) => (
                    <option key={club.code} value={club.code}>
                      {club.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Choose a specific club if your observation relates to their meetings, dues, or officers.
                </p>
              </div>

              {/* Detailed Comment Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="feedback-comment" className="text-xs font-bold text-foreground block">
                    Detailed Observation or Suggestion <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {comment.length} characters
                  </span>
                </div>
                <textarea
                  id="feedback-comment"
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your suggestion, what went well, or what friction you experienced..."
                  className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Contact Permission Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/70 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={canContact}
                  onChange={(e) => setCanContact(e.target.checked)}
                  className="mt-0.5 rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground block">
                    Allow Club Services to contact me for follow-up
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Authorized staff may message your student webmail ({studentIdentity.email}) to clarify suggestions.
                  </span>
                </div>
              </label>

              {/* Submit Button (Dominant Action) */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-xs font-bold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Student Feedback</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </main>
  );
}
