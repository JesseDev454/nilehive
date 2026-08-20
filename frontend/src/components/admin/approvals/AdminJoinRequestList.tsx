import { useEffect, useState } from "react";
import {
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { displayValue, formatShortDate } from "@/lib/approvals/adapters";
import type { JoinRequestApprovalView } from "@/lib/approvals/types";
import { membershipRequestStatusLabel } from "@/lib/membershipStatus";
import { ApprovalsQueueStatus } from "./ApprovalsQueueStatus";
import type { QueueState } from "./useAdminApprovalsData";

interface AdminJoinRequestListProps {
  queue: QueueState<JoinRequestApprovalView>;
  joinRequests: JoinRequestApprovalView[];
  busyId: string | null;
  filteredEmpty: boolean;
  mockMode?: boolean;
  onRetry: () => void;
  onApprove: (request: JoinRequestApprovalView) => void;
  onReject: (request: JoinRequestApprovalView) => void;
  onWhatsAppChange: (request: JoinRequestApprovalView, added: boolean) => void;
}

export function AdminJoinRequestList({
  queue,
  joinRequests,
  busyId,
  filteredEmpty,
  mockMode = false,
  onRetry,
  onApprove,
  onReject,
  onWhatsAppChange
}: AdminJoinRequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(joinRequests[0]?.id ?? null);

  useEffect(() => {
    if (!joinRequests.some((item) => item.id === expandedId)) {
      setExpandedId(joinRequests[0]?.id ?? null);
    }
  }, [expandedId, joinRequests]);

  const statusView = (
    <ApprovalsQueueStatus
      status={queue.status}
      error={queue.error}
      filteredEmpty={filteredEmpty}
      emptyTitle="No join requests pending"
      emptyDescription="All student club applications across the 14 official organizations have been processed."
      loadingLabel="Loading membership requests"
      onRetry={onRetry}
      icon={UserCheck}
    />
  );

  if (queue.status === "loading" || queue.status === "error" || queue.status === "forbidden" || queue.status === "empty" || filteredEmpty) {
    return statusView;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-2.5 lg:col-span-5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pending Membership Applications ({joinRequests.length})
          </span>
        </div>

        {joinRequests.map((req) => {
          const isSelected = expandedId === req.id;
          return (
            <button
              key={req.id}
              type="button"
              onClick={() => setExpandedId(req.id)}
              aria-pressed={isSelected}
              aria-label={`Inspect membership request from ${req.student_name}`}
              className={`group flex w-full flex-col justify-between rounded-xl border p-4 text-left transition-all duration-180 min-h-11 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {req.club_name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {displayValue(req.student_id)}
                  </span>
                </div>

                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {req.student_name}
                </p>

                <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                  {req.statement ? `"${req.statement}"` : "No motivation statement was returned."}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Applied: {formatShortDate(req.applied_at)}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7">
        {(() => {
          const selected = joinRequests.find((r) => r.id === expandedId) || joinRequests[0];
          if (!selected) return null;
          const busy = busyId === selected.id;
          const canDecide = selected.status === "pending";

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Applying to: {selected.club_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {membershipRequestStatusLabel(selected.status)}
                  </Badge>
                </div>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {selected.student_name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selected.profile_removed
                    ? "The linked student profile is unavailable."
                    : "Campus One Verified Student Application"}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Campus One Identity (Read-Only)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Student / Matric ID:</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">{displayValue(selected.student_id)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Institutional Email:</span>
                    <span className="font-medium text-foreground mt-0.5 block truncate">
                      {displayValue(selected.student_email, "Not returned by the membership record")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/10 p-4 text-xs">
                <span className="font-semibold text-foreground block text-xs">Student Statement of Motivation</span>
                <p className="text-muted-foreground leading-relaxed italic bg-background/50 p-3 rounded-lg border border-border/40">
                  {selected.statement ? `"${selected.statement}"` : "No motivation statement was returned."}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Official Club Communication Group</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.whatsapp_added
                      ? "This student is marked as added to the official club WhatsApp group."
                      : selected.whatsapp_ready
                        ? "Mark the student as added after admission and dues verification."
                        : "Available after the student is admitted and dues are marked paid."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`whatsapp-${selected.id}`}
                    checked={selected.whatsapp_added}
                    disabled={busy || selected.whatsapp_added || (!mockMode && !selected.whatsapp_ready)}
                    onCheckedChange={(checked) => onWhatsAppChange(selected, checked)}
                    aria-label={`Mark WhatsApp added for ${selected.student_name}`}
                  />
                  <Label htmlFor={`whatsapp-${selected.id}`} className="text-xs cursor-pointer">
                    {selected.whatsapp_added ? "Added" : "Not yet"}
                  </Label>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy || !canDecide}
                  onClick={() => onReject(selected)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 min-h-11"
                  aria-label={`Reject membership request from ${selected.student_name}`}
                >
                  Decline Application
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={busy || !canDecide}
                  onClick={() => onApprove(selected)}
                  className="text-xs bg-primary text-primary-foreground gap-1.5 min-h-11"
                  aria-label={`Approve membership request from ${selected.student_name}`}
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{busy ? "Saving..." : "Admit Student to Club"}</span>
                </Button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
