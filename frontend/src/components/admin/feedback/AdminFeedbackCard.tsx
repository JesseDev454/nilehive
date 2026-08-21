import {
  Calendar,
  ChevronRight,
  MessageSquare,
  School,
  Star,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FEEDBACK_CATEGORIES,
  type AdminFeedbackItem
} from "@/data/adminFeedbackData";

interface AdminFeedbackCardProps {
  feedback: AdminFeedbackItem;
  onInspect: (item: AdminFeedbackItem) => void;
}

export function AdminFeedbackCard({
  feedback,
  onInspect
}: AdminFeedbackCardProps) {
  const catConf = FEEDBACK_CATEGORIES[feedback.category];
  const formattedDate = new Date(feedback.submittedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div
      id={`feedback-${feedback.id}`}
      aria-label={`${feedback.title}, ${feedback.rating ? `${feedback.rating} of 5 rating` : "no rating"}, status ${feedback.status}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-180 hover:border-primary/40 hover:shadow-xs"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${catConf.badgeClass}`}
            >
              {catConf.label}
            </span>
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground capitalize">
              {feedback.authorRole}
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          {feedback.title}
        </h2>

        {/* Excerpt */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {feedback.message}
        </p>

        {/* Submitter & Context info */}
        <div className="pt-2 border-t border-border/60 flex flex-col gap-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-foreground">{feedback.authorName}</span>
              {feedback.studentId && (
                <span className="font-mono text-[10px] opacity-75">({feedback.studentId})</span>
              )}
            </div>

            {feedback.rating && (
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="font-bold text-[10px] text-foreground">{feedback.rating} of 5</span>
              </div>
            )}
          </div>

          {feedback.clubName && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <School className="h-3 w-3 text-primary" />
              <span>Affiliated with: <strong className="text-foreground">{feedback.clubName}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 font-semibold capitalize text-foreground">
            {feedback.status}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(feedback)}
          className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
        >
          <span>Read Feedback</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
