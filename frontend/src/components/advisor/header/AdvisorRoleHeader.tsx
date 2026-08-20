import { useState } from "react";
import { ShieldCheck, Info, CheckCircle, Clock, AlertTriangle, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/Dialog";

interface AdvisorRoleHeaderProps {
  title?: string;
  subtitle?: string;
  pendingCount?: number;
  assignedClubs?: Array<{ id: string; name: string; code: string }>;
  showGovernanceModal?: boolean;
}

export function AdvisorRoleHeader({
  title = "Staff Advisor Workspace",
  subtitle = "Review proposals for assigned clubs and read post-event reports.",
  pendingCount = 1,
  assignedClubs = [
    { id: "club-8", name: "Nile Google Developers", code: "NGD" },
    { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
    { id: "club-11", name: "Nile Startup Campus", code: "NSC" }
  ]
}: AdvisorRoleHeaderProps) {
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);

  return (
    <header className="space-y-4 border-b border-border/80 pb-6 text-left" aria-label="Advisor Role Header">
      {/* Top badges bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Staff Advisor
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Campus One SSO Verified
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            {pendingCount} Pending Review{pendingCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Governance Boundaries Trigger */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsGovernanceOpen(true)}
          className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5 text-primary" />
          <span>Advisor Mandate &amp; Boundaries</span>
        </Button>

        <Dialog open={isGovernanceOpen} onOpenChange={setIsGovernanceOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Staff Advisor Institutional Governance
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                What Advisors can view and decide in OneClub.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Allowed Operations (Advisor Authority)
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Review pending event proposals submitted by assigned clubs</li>
                  <li>Inspect read-only proposal body and itemized budgets</li>
                  <li><strong>Approve</strong> proposals to send them to Admin for the final decision</li>
                  <li><strong>Return for Changes</strong> with mandatory actionable remarks</li>
                  <li>View assigned club portfolios, constitutions, and leadership</li>
                  <li>View scheduled events and dates for assigned clubs</li>
                  <li>Read post-event reports, attendee statistics, and media</li>
                  <li>Receive system notifications for assigned club submissions</li>
                  <li>View verified Campus One staff identity credentials</li>
                </ul>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
                <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Forbidden Operations (Enforced System Limits)
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li><strong>Final Admin decision</strong> (Admin only)</li>
                  <li><strong>Editing President Proposal Text</strong> (Proposal text is strictly read-only)</li>
                  <li><strong>Membership Management</strong> (Cannot accept or remove club members)</li>
                  <li><strong>Payments</strong> (not available to Advisors)</li>
                  <li><strong>Role Assignment</strong> (Cannot appoint presidents or executive officers)</li>
                  <li><strong>Unrelated Clubs</strong> (Access restricted strictly to assigned clubs portfolio)</li>
                  <li><strong>Attendance management</strong> (not available to Advisors)</li>
                  <li><strong>Editing Identity</strong> (Staff ID and department are locked via Campus One SSO)</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Title & Purpose Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Assigned Clubs Portfolio Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
          <School className="h-3.5 w-3.5 text-primary" />
          Assigned Portfolio:
        </span>
        {assignedClubs.map((club) => (
          <Badge
            key={club.id}
            variant="secondary"
            className="rounded-md px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <span className="font-bold mr-1 text-primary">{club.code}:</span>
            {club.name}
          </Badge>
        ))}
      </div>
    </header>
  );
}
