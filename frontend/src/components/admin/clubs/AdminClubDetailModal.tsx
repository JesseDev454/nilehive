import { useState } from "react";
import {
  Building2,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Users,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { OfficialClub } from "@/data/official14ClubsData";

interface AdminClubDetailModalProps {
  club: OfficialClub | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClub: (club: OfficialClub) => void;
}

export function AdminClubDetailModal({
  club,
  open,
  onOpenChange,
  onEditClub
}: AdminClubDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!club) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard.`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Cover Header */}
        <div className="relative aspect-21/9 w-full bg-muted overflow-hidden">
          <img
            src={club.coverImage}
            alt={club.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-black/60 text-white backdrop-blur-md border-0">
              {club.category}
            </Badge>
            <Badge variant="outline" className="bg-primary/90 text-primary-foreground border-0 font-mono">
              Code: {club.code}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Public Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Club Purpose &amp; Overview
            </h3>
            <p className="text-xs text-foreground leading-relaxed">
              {club.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {club.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Meeting Logistics & Member Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Meeting Venue</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{club.location}</span>
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Meeting Schedule</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{club.meetingSchedule}</span>
              </p>
            </div>
          </div>

          {/* Leadership & Staff Advisor (Read-only assignments) */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Club Executive &amp; Advisor Roster</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Campus One Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase block font-semibold">President</span>
                <p className="font-bold text-foreground">{club.presidentName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{club.presidentEmail}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase block font-semibold">Faculty Advisor</span>
                <p className="font-bold text-foreground">{club.advisorName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{club.advisorEmail}</p>
              </div>
            </div>
          </div>

          {/* Shared Official Payment Instructions for Proof Uploads */}
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
                    onClick={() => handleCopy(club.bankDetails.accountNumber, "account number")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy account number"
                  >
                    {copiedField === "account number" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px]">Mandatory Narration Guideline:</span>
                <span className="font-mono text-foreground">{club.bankDetails.narrationGuideline}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-emerald-500/20">
              Guideline for student proof uploads: "{club.bankDetails.proofInstructions}"
            </p>
          </div>

          {/* ADMIN-ONLY WHATSAPP GROUP NOTES (Strictly Never Public) */}
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
              {club.adminOnlyWhatsAppNotes}
            </p>
            <p className="text-[10px] text-muted-foreground">
              These notes are visible exclusively to Club Services Directorate admins for communications governance.
            </p>
          </div>

          {/* Footer Actions */}
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
