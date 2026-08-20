import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  MessageSquareQuote,
  RotateCcw,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProposalMock } from "@/components/AdminHomeView";

interface AdminProposalListProps {
  proposals: ProposalMock[];
  onApprove: (proposal: ProposalMock) => void;
  onReject: (proposal: ProposalMock) => void;
  onOverride: (proposal: ProposalMock) => void;
}

export function AdminProposalList({
  proposals,
  onApprove,
  onReject,
  onOverride
}: AdminProposalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(proposals[0]?.id ?? null);

  if (proposals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No proposals waiting for authorization</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          All event proposals submitted by club executives have been reviewed and decided.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left List (5 cols) */}
      <div className="space-y-2.5 lg:col-span-5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Awaiting Final Decision ({proposals.length})
          </span>
        </div>

        {proposals.map((prop) => {
          const isSelected = expandedId === prop.id;
          return (
            <div
              key={prop.id}
              onClick={() => setExpandedId(prop.id)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-180 cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {prop.club_name}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ₦{prop.budget.toLocaleString()}
                  </Badge>
                </div>

                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {prop.title}
                </h3>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>{prop.proposed_date}</span>
                  <span>•</span>
                  <span>{prop.venue}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Endorsed by {prop.advisor_name}
                </span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Detailed Inspector (7 cols) */}
      <div className="lg:col-span-7">
        {(() => {
          const selected = proposals.find((p) => p.id === expandedId) || proposals[0];
          if (!selected) return null;

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Proposal Header */}
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {selected.club_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">ID: {selected.id}</span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {selected.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted by <strong className="text-foreground">{selected.submitted_by_name}</strong> (President)
                </p>
              </div>

              {/* Full Proposal Spec (Strictly Read-Only) */}
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Date</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selected.proposed_date}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Venue</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selected.venue}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Requested Budget</span>
                  <span className="font-mono font-bold text-foreground mt-0.5 block">₦{selected.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Description (Read-Only) */}
              <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/10 p-3.5 text-xs">
                <span className="font-semibold text-foreground block text-xs">Proposal Description &amp; Objectives (Read-Only)</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Advisor Remarks Block */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <MessageSquareQuote className="h-4 w-4" />
                  <span>Advisor Review &amp; Recommendation</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pt-1">
                  "I have reviewed the academic timeline and safety protocols for this proposal. Highly recommended for Directorate clearance."
                </p>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">
                  — {selected.advisor_name}, Faculty Advisor
                </p>
              </div>

              {/* Decision Actions Bar (Never preselected) */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOverride(selected)}
                  className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 h-9"
                  title="Override a rejected or disputed proposal with directorate remarks"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Directorate Override</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(selected)}
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 h-9"
                  >
                    Return / Reject with Remarks
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => onApprove(selected)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Authorize Proposal</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
