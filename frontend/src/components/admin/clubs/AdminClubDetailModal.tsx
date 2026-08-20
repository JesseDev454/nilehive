import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Edit3,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { clubRoleLabel, meetingWindowLabel, membershipStatusLabel } from "@/lib/clubs/adapters";
import type { ClubsUiError } from "@/lib/clubs/errors";
import type { AdminClubView } from "@/lib/clubs/types";

interface AdminClubDetailModalProps {
  club: AdminClubView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClub: (club: AdminClubView) => void;
  detailStatus: "idle" | "loading" | "ready" | "error";
  detailError: ClubsUiError | null;
  onRetry?: () => void;
}

function ClubCover({ club }: { club: AdminClubView }) {
  if (club.coverImage) {
    return (
      <img
        src={club.coverImage}
        alt={club.name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted" role="img" aria-label={`${club.name} has no logo yet`}>
      <span className="text-3xl font-bold text-muted-foreground">{club.code || "Club"}</span>
    </div>
  );
}

export function AdminClubDetailModal({
  club,
  open,
  onOpenChange,
  onEditClub,
  detailStatus,
  detailError,
  onRetry,
}: AdminClubDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!club) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text || text === "Not provided") return;
    void navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const schedule =
    club.meetingSchedule ||
    (club.meetingWindows.length ? club.meetingWindows.map(meetingWindowLabel).join(" · ") : "Not stored by OneClub yet");
  const tags = club.tags.length ? club.tags : club.categories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Club details</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-21/9 w-full bg-muted overflow-hidden">
          <ClubCover club={club} />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-black/60 text-white backdrop-blur-md border-0">
              {club.categoryLabel}
            </Badge>
            <Badge variant="outline" className="bg-primary/90 text-primary-foreground border-0 font-mono">
              Code: {club.code || "None"}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl drop-shadow-sm">
              {club.name}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Official Nile University Student Organization
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {detailStatus === "loading" ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-xs" role="status" aria-live="polite">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading club details, members and payment settings.
              </div>
            </div>
          ) : null}

          {detailStatus === "error" ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-xs space-y-2" role="alert">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                Club details could not be refreshed
              </div>
              <p className="text-muted-foreground">{detailError?.message}</p>
              {onRetry ? (
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Club Purpose &amp; Overview
            </h3>
            <p className="text-xs text-foreground leading-relaxed">
              {club.description}
            </p>

            {tags.length ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No stored categories yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Meeting Venue</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{club.location || "Not stored by OneClub yet"}</span>
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Meeting Schedule</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{schedule}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Club Executive &amp; Advisor Roster</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Campus One Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase block font-semibold">President</span>
                <p className="font-bold text-foreground">{club.presidentName || "Not assigned"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{club.presidentEmail || "No email on file"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase block font-semibold">Faculty Advisor</span>
                <p className="font-bold text-foreground">{club.advisorName || "Not assigned"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{club.advisorEmail || "No email on file"}</p>
                {club.advisors.length > 1 ? (
                  <p className="text-[11px] text-muted-foreground">
                    Additional advisors: {club.advisors.slice(1).map((advisor) => advisor.fullName).join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
            {club.executives.length ? (
              <p className="text-[11px] text-muted-foreground">
                Executives: {club.executives.map((person) => person.fullName).join(", ")}
              </p>
            ) : null}
            <p className="text-[11px] text-muted-foreground">
              Leadership is assigned in People. Advisor removal is not currently supported.
              {" "}
              <Link to="/admin/people" className="text-primary underline-offset-2 hover:underline">
                Open People
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>Club members</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {club.memberCount == null ? "Count unavailable until details load" : `${club.memberCount} listed`}
              </span>
            </div>
            {club.members.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <caption className="sr-only">Members of {club.name}</caption>
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th scope="col" className="py-1.5 pr-3 font-semibold">Name</th>
                      <th scope="col" className="py-1.5 pr-3 font-semibold">Student ID</th>
                      <th scope="col" className="py-1.5 pr-3 font-semibold">Role</th>
                      <th scope="col" className="py-1.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club.members.map((member) => (
                      <tr key={member.id} className="border-b border-border/60">
                        <th scope="row" className="py-1.5 pr-3 font-medium text-foreground">{member.fullName}</th>
                        <td className="py-1.5 pr-3 font-mono">{member.studentId || "—"}</td>
                        <td className="py-1.5 pr-3">{clubRoleLabel(member.clubRole)}</td>
                        <td className="py-1.5">{membershipStatusLabel(member.membershipStatus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {detailStatus === "loading" ? "Loading members." : "No members are listed for this club."}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Membership-request and dues decisions stay in Approvals. Presidents remain member-view-only.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                <CreditCard className="h-4 w-4" />
                <span>Official Dues &amp; Bank Transfer Instructions</span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-sm">
                ₦{club.duesAmount.toLocaleString()} / session
              </span>
            </div>

            {club.paymentLoaded && club.bankDetails ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Designated Bank:</span>
                    <span className="font-semibold text-foreground">{club.bankDetails.bankName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Account Name:</span>
                    <span className="font-semibold text-foreground">{club.bankDetails.accountName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Account Number:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-foreground text-xs">{club.bankDetails.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(club.bankDetails?.accountNumber || "", "account number")}
                        className="text-muted-foreground hover:text-foreground min-h-8 min-w-8 inline-flex items-center justify-center"
                        aria-label="Copy account number"
                      >
                        {copiedField === "account number" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Student payment note:</span>
                    <span className="font-mono text-foreground">{club.bankDetails.proofInstructions}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-emerald-500/20">
                  These bank details are the shared campus payment account used by official clubs.
                </p>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground pt-2 border-t border-emerald-500/20">
                {detailStatus === "loading"
                  ? "Loading shared payment settings."
                  : "Shared payment settings are not on file for this club."}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Public signup is {club.isPublicSignup ? "open" : "closed"} for student applications.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-semibold">
                <Lock className="h-4 w-4" />
                <span>Admin-Only WhatsApp Group Notes (Strictly Internal)</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-300 border-amber-500/40">
                Private / Never Public
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed bg-background/60 p-3 rounded-lg border border-amber-500/20">
              {club.adminOnlyWhatsAppNotes || "No private WhatsApp notes are stored for this club."}
            </p>
            <p className="text-[10px] text-muted-foreground">
              These notes are visible exclusively to Club Services Directorate admins for communications governance.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEditClub(club);
              }}
              aria-label={`Edit ${club.name}`}
              className="text-xs gap-1.5 h-9"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile &amp; Bank Settings</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
