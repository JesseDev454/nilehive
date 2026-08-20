import { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  Save,
  ShieldAlert,
  Sparkles,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { OfficialClub } from "@/data/official14ClubsData";

interface AdminClubEditSheetProps {
  club: OfficialClub | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveClub: (updatedClub: OfficialClub) => void;
}

export function AdminClubEditSheet({
  club,
  open,
  onOpenChange,
  onSaveClub
}: AdminClubEditSheetProps) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [isPublicSignup, setIsPublicSignup] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [tagsString, setTagsString] = useState("");

  // Bank & Payment Instructions
  const [duesAmount, setDuesAmount] = useState<number>(0);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [narrationGuideline, setNarrationGuideline] = useState("");
  const [proofInstructions, setProofInstructions] = useState("");

  // Private Admin-Only WhatsApp Notes
  const [adminOnlyWhatsAppNotes, setAdminOnlyWhatsAppNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (club) {
      setDescription(club.description);
      setLocation(club.location);
      setMeetingSchedule(club.meetingSchedule);
      setIsPublicSignup(club.isPublicSignup);
      setCoverImage(club.coverImage);
      setTagsString(club.tags.join(", "));

      setDuesAmount(club.duesAmount);
      setBankName(club.bankDetails.bankName);
      setAccountNumber(club.bankDetails.accountNumber);
      setAccountName(club.bankDetails.accountName);
      setNarrationGuideline(club.bankDetails.narrationGuideline);
      setProofInstructions(club.bankDetails.proofInstructions);

      setAdminOnlyWhatsAppNotes(club.adminOnlyWhatsAppNotes);
      setErrors({});
    }
  }, [club]);

  if (!club) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!description.trim() || description.trim().length < 20) {
      errs.description = "Description must be at least 20 characters long.";
    }

    if (!location.trim()) {
      errs.location = "Meeting location is required.";
    }

    if (!meetingSchedule.trim()) {
      errs.meetingSchedule = "Meeting schedule is required.";
    }

    if (duesAmount < 0 || isNaN(duesAmount)) {
      errs.duesAmount = "Dues amount must be ₦0 or greater.";
    }

    if (!accountNumber.trim() || !/^\d{10}$/.test(accountNumber.trim())) {
      errs.accountNumber = "Account number must be exactly 10 digits.";
    }

    if (!bankName.trim()) {
      errs.bankName = "Designated bank name is required.";
    }

    if (!accountName.trim()) {
      errs.accountName = "Account name is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);

      const parsedTags = tagsString
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const updated: OfficialClub = {
        ...club,
        description: description.trim(),
        location: location.trim(),
        meetingSchedule: meetingSchedule.trim(),
        isPublicSignup,
        coverImage: coverImage.trim() || club.coverImage,
        tags: parsedTags.length > 0 ? parsedTags : club.tags,
        duesAmount,
        bankDetails: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          narrationGuideline: narrationGuideline.trim() || `MatricNo - ${club.code} Dues`,
          proofInstructions: proofInstructions.trim() || "Upload bank transfer confirmation."
        },
        adminOnlyWhatsAppNotes: adminOnlyWhatsAppNotes.trim()
      };

      onSaveClub(updated);
      toast.success(`Updated settings & payment directives for ${club.name}.`);
      onOpenChange(false);
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              <span>Administrative Directive Editor</span>
            </div>
            <DialogTitle className="text-xl font-bold">
              Edit {club.name} ({club.code})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update official public description, meeting logistics, cover media, dues transfer account, and private admin notes.
            </DialogDescription>
          </DialogHeader>

          {/* Section 1: Public Profile & Logistics */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
              1. Public Profile &amp; Campus Logistics
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="club-desc" className="text-xs font-semibold">
                  Club Description &amp; Mission <span className="text-destructive">*</span>
                </Label>
                {errors.description && (
                  <span className="text-[11px] text-destructive">{errors.description}</span>
                )}
              </div>
              <Textarea
                id="club-desc"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                className={`text-xs leading-relaxed ${errors.description ? "border-destructive" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="club-location" className="text-xs font-semibold">
                    Campus Meeting Location <span className="text-destructive">*</span>
                  </Label>
                  {errors.location && (
                    <span className="text-[11px] text-destructive">{errors.location}</span>
                  )}
                </div>
                <Input
                  id="club-location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                  }}
                  className={`text-xs h-9 ${errors.location ? "border-destructive" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="club-schedule" className="text-xs font-semibold">
                    Meeting Schedule <span className="text-destructive">*</span>
                  </Label>
                  {errors.meetingSchedule && (
                    <span className="text-[11px] text-destructive">{errors.meetingSchedule}</span>
                  )}
                </div>
                <Input
                  id="club-schedule"
                  value={meetingSchedule}
                  onChange={(e) => {
                    setMeetingSchedule(e.target.value);
                    if (errors.meetingSchedule) setErrors((prev) => ({ ...prev, meetingSchedule: "" }));
                  }}
                  className={`text-xs h-9 ${errors.meetingSchedule ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="club-tags" className="text-xs font-semibold">
                  Discovery Tags (Comma-separated)
                </Label>
                <Input
                  id="club-tags"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="e.g. Technology, AI, Coding"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="club-cover" className="text-xs font-semibold">
                  Cover Image URL
                </Label>
                <Input
                  id="club-cover"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">Open Campus Public Sign-ups</span>
                <p className="text-[11px] text-muted-foreground">Allow verified students to apply directly through OneClub.</p>
              </div>
              <Switch
                checked={isPublicSignup}
                onCheckedChange={setIsPublicSignup}
              />
            </div>
          </div>

          {/* Section 2: Shared Payment Instructions for Proof Uploads */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border-b border-border pb-1 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>2. Shared Dues &amp; Bank Transfer Instructions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dues-amount" className="text-xs font-semibold">
                    Annual Dues Amount (₦) <span className="text-destructive">*</span>
                  </Label>
                  {errors.duesAmount && (
                    <span className="text-[11px] text-destructive">{errors.duesAmount}</span>
                  )}
                </div>
                <Input
                  id="dues-amount"
                  type="number"
                  min="0"
                  step="500"
                  value={duesAmount}
                  onChange={(e) => {
                    setDuesAmount(Number(e.target.value));
                    if (errors.duesAmount) setErrors((prev) => ({ ...prev, duesAmount: "" }));
                  }}
                  className={`text-xs h-9 font-mono ${errors.duesAmount ? "border-destructive" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bank-name" className="text-xs font-semibold">
                    Designated Bank <span className="text-destructive">*</span>
                  </Label>
                  {errors.bankName && (
                    <span className="text-[11px] text-destructive">{errors.bankName}</span>
                  )}
                </div>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: "" }));
                  }}
                  className={`text-xs h-9 ${errors.bankName ? "border-destructive" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="account-num" className="text-xs font-semibold">
                    Account Number (10 digits) <span className="text-destructive">*</span>
                  </Label>
                  {errors.accountNumber && (
                    <span className="text-[11px] text-destructive">{errors.accountNumber}</span>
                  )}
                </div>
                <Input
                  id="account-num"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: "" }));
                  }}
                  className={`text-xs h-9 font-mono ${errors.accountNumber ? "border-destructive" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="account-name" className="text-xs font-semibold">
                    Account Name <span className="text-destructive">*</span>
                  </Label>
                  {errors.accountName && (
                    <span className="text-[11px] text-destructive">{errors.accountName}</span>
                  )}
                </div>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    if (errors.accountName) setErrors((prev) => ({ ...prev, accountName: "" }));
                  }}
                  className={`text-xs h-9 ${errors.accountName ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="narration" className="text-xs font-semibold">
                  Required Transfer Narration Guideline
                </Label>
                <Input
                  id="narration"
                  value={narrationGuideline}
                  onChange={(e) => setNarrationGuideline(e.target.value)}
                  placeholder="MatricNo - Club Dues"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proof-inst" className="text-xs font-semibold">
                  Proof Upload Note for Students
                </Label>
                <Input
                  id="proof-inst"
                  value={proofInstructions}
                  onChange={(e) => setProofInstructions(e.target.value)}
                  placeholder="Upload stamped teller or mobile receipt screenshot"
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Section 3: ADMIN-ONLY WHATSAPP GROUP NOTES (Strictly Internal) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 border-b border-border pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>3. Admin-Only WhatsApp Notes</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">Private to Directorate</span>
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="admin-wa-notes" className="text-xs font-semibold text-foreground">
                Internal Group Administration Notes (Never Public)
              </Label>
              <Textarea
                id="admin-wa-notes"
                rows={2}
                value={adminOnlyWhatsAppNotes}
                onChange={(e) => setAdminOnlyWhatsAppNotes(e.target.value)}
                placeholder="Track official executive group link governance, rotation schedules, or coordinator contact remarks..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSaving}
              className="text-xs gap-1.5 h-9"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving Directives..." : "Save Club Settings"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
