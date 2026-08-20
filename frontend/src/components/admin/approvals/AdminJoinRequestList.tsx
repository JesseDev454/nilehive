import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  UserPlus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { JoinRequestMock } from "@/components/AdminHomeView";

interface AdminJoinRequestListProps {
  joinRequests: JoinRequestMock[];
  onApprove: (request: JoinRequestMock) => void;
  onReject: (request: JoinRequestMock) => void;
}

export function AdminJoinRequestList({
  joinRequests,
  onApprove,
  onReject
}: AdminJoinRequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(joinRequests[0]?.id ?? null);
  const [whatsappAddedMap, setWhatsappAddedMap] = useState<Record<string, boolean>>({});

  const handleToggleWhatsApp = (id: string, checked: boolean) => {
    setWhatsappAddedMap((prev) => ({ ...prev, [id]: checked }));
    if (checked) {
      toast.success("Student marked as added to the official club WhatsApp community.");
    } else {
      toast.info("WhatsApp group status unmarked.");
    }
  };

  if (joinRequests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserCheck className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No join requests pending</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          All student club applications across the 14 official organizations have been processed.
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
            Pending Membership Applications ({joinRequests.length})
          </span>
        </div>

        {joinRequests.map((req) => {
          const isSelected = expandedId === req.id;
          return (
            <div
              key={req.id}
              onClick={() => setExpandedId(req.id)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-180 cursor-pointer ${
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
                    {req.student_id}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {req.student_name}
                </h3>

                <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                  "{req.statement}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Applied: {new Date(req.applied_at).toLocaleDateString()}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Detailed Inspector (7 cols) */}
      <div className="lg:col-span-7">
        {(() => {
          const selected = joinRequests.find((r) => r.id === expandedId) || joinRequests[0];
          if (!selected) return null;
          const isWhatsAppAdded = whatsappAddedMap[selected.id] || false;

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Header */}
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Applying to: {selected.club_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Pending Verification
                  </Badge>
                </div>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {selected.student_name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Campus One Verified Student Application
                </p>
              </div>

              {/* Read-Only Identity Card */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Campus One Identity (Read-Only)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Student / Matric ID:</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block">{selected.student_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Institutional Email:</span>
                    <span className="font-medium text-foreground mt-0.5 block truncate">{selected.student_email}</span>
                  </div>
                </div>
              </div>

              {/* Motivation & Join Statement */}
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/10 p-4 text-xs">
                <span className="font-semibold text-foreground block text-xs">Student Statement of Motivation</span>
                <p className="text-muted-foreground leading-relaxed italic bg-background/50 p-3 rounded-lg border border-border/40">
                  "{selected.statement}"
                </p>
              </div>

              {/* Post-verification WhatsApp group option */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <MessageCircle className="h-4 w-4" />
                    <span>Official Club Communication Group</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Mark student as added to the official club WhatsApp channel upon admission.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`whatsapp-${selected.id}`}
                    checked={isWhatsAppAdded}
                    onCheckedChange={(checked) => handleToggleWhatsApp(selected.id, checked)}
                  />
                  <Label htmlFor={`whatsapp-${selected.id}`} className="text-xs cursor-pointer">
                    {isWhatsAppAdded ? "Added" : "Not yet"}
                  </Label>
                </div>
              </div>

              {/* Decision Actions Bar (Never preselected) */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(selected)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 h-9"
                >
                  Decline Application
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onApprove(selected)}
                  className="text-xs bg-primary text-primary-foreground gap-1.5 h-9"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Admit Student to Club</span>
                </Button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
