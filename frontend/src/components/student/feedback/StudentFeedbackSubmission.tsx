import { useState } from "react";
import { CheckCircle2, MessageSquare, Send, ShieldCheck, Sparkles, User, UserX } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";
import { OFFICIAL_CLUBS } from "@/shared/mock/clubs";

const ALLOWED_FEEDBACK_CATEGORIES = [
  { id: "campus_life", label: "General Campus Life", description: "Student community, campus climate, and general suggestions" },
  { id: "club_operations", label: "Club Operations & Funding", description: "Feedback regarding club activities, leadership, or resources" },
  { id: "facilities", label: "Campus Facilities & Spaces", description: "Meeting rooms, laboratories, library, and venue access" },
  { id: "academic_support", label: "Academic Support & Seminars", description: "Workshops, speaker sessions, and study group feedback" }
] as const;

export function StudentFeedbackSubmission() {
  const [category, setCategory] = useState<string>("campus_life");
  const [targetClub, setTargetClub] = useState<string>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulate brief network submission to Student Affairs
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setSubject("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/80 pb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            Student Voice
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Submit Student Feedback
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Share your ideas, suggestions, or concerns directly with Nile University Student Affairs and Club Services.
        </p>
      </div>

      {submittedSuccess && (
        <Banner
          variant="success"
          title="Feedback Submitted Successfully"
          description="Thank you for sharing your thoughts. Your feedback has been routed to the Student Affairs & Club Services team for review."
          onDismiss={() => setSubmittedSuccess(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Constructive Feedback Form</CardTitle>
          <CardDescription>
            Choose a category and provide details. All submissions are reviewed by the Dean of Student Affairs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Select Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALLOWED_FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all duration-180 ${
                      category === cat.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground">{cat.label}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {cat.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Club (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Related Club (Optional)
              </label>
              <select
                value={targetClub}
                onChange={(e) => setTargetClub(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="general">General Nile University Campus (No specific club)</option>
                {OFFICIAL_CLUBS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <TextField
              label="Subject / Topic Summary"
              placeholder="e.g. Request for extended engineering lab access on weekends"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Detailed Feedback / Suggestion *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your suggestion, context, and how it can improve campus life or club activities..."
                required
                className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Anonymity Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAnonymous ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {isAnonymous ? <UserX className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isAnonymous ? "Submit Anonymously" : "Submit with Student Identity"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isAnonymous
                      ? "Your student name and ID will not be attached to this feedback."
                      : "Staff can reach out to you directly if follow-up is helpful."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary ${
                  isAnonymous ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAnonymous ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Send Feedback"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Governance policy */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <span>
          Submissions are handled in accordance with Nile University Student Affairs governance policies.
        </span>
      </div>
    </div>
  );
}
