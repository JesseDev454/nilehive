import {
  CheckCircle2,
  Info,
  Layers,
  Lock,
  School,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

export function ExecutiveGovernanceBoundaries() {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Executive Governance &amp; Institutional Scope</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Nile University OneClub enforces strict role-based access boundaries to preserve academic society compliance and audit trails.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Supported Executive Capabilities */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Assigned Executive Officer Scope</span>
            </span>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Manage assigned action items (Pending, In Progress, Blocked, Completed)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Log blocker flags &amp; technical notes for President unblocking</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>View read-only 148-student accredited club member roster</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>View accredited club charter, constitution bylaws, and event logistics</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Receive role-scoped dispatches and personal notifications</span>
              </li>
            </ul>
          </div>

          {/* Reserved / Non-Executive Scope */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Restricted &amp; Non-Executive Actions</span>
            </span>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span><strong>Announcements are read-only:</strong> Creation tools are not available to Executive accounts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span><strong>Dues are not part of this role:</strong> Payment records are not shown in the Executive workspace.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span><strong>No Proposal Approvals:</strong> Formal venue and event approvals require Faculty Advisor and Director sign-off.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span><strong>No Intake Decisions:</strong> New membership acceptance is ratified by the President.</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
