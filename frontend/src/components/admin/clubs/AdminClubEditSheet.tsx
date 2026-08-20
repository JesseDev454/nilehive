import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, CreditCard, Lock, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { ClubsUiError } from "@/lib/clubs/errors";
import type { AdminClubView, ClubEditInput } from "@/lib/clubs/types";

interface AdminClubEditSheetProps {
  club: AdminClubView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveClub: (club: AdminClubView, input: ClubEditInput) => Promise<boolean>;
  saving: boolean;
  saveError: ClubsUiError | null;
}

function formFromClub(club: AdminClubView) {
  return {
    description: club.description,
    location: club.location || "",
    meetingSchedule: club.meetingSchedule || "",
    isPublicSignup: club.isPublicSignup,
    coverImage: club.coverImage || "",
    tagsString: club.tags.join(", "),
    duesAmount: club.duesAmount,
    bankName: club.bankDetails?.bankName && club.bankDetails.bankName !== "Not provided" ? club.bankDetails.bankName : "",
    accountNumber:
      club.bankDetails?.accountNumber && club.bankDetails.accountNumber !== "Not provided"
        ? club.bankDetails.accountNumber
        : "",
    accountName:
      club.bankDetails?.accountName && club.bankDetails.accountName !== "Not provided" ? club.bankDetails.accountName : "",
    narrationGuideline: club.bankDetails?.narrationGuideline || "",
    proofInstructions:
      club.bankDetails?.proofInstructions && club.bankDetails.proofInstructions !== "Not provided"
        ? club.bankDetails.proofInstructions
        : "",
    adminOnlyWhatsAppNotes: club.adminOnlyWhatsAppNotes || "",
  };
}

export function AdminClubEditSheet({
  club,
  open,
  onOpenChange,
  onSaveClub,
  saving,
  saveError,
}: AdminClubEditSheetProps) {
  const [form, setForm] = useState(() =>
    club
      ? formFromClub(club)
      : {
          description: "",
          location: "",
          meetingSchedule: "",
          isPublicSignup: true,
          coverImage: "",
          tagsString: "",
          duesAmount: 0,
          bankName: "",
          accountNumber: "",
          accountName: "",
          narrationGuideline: "",
          proofInstructions: "",
          adminOnlyWhatsAppNotes: "",
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmClosedSignup, setConfirmClosedSignup] = useState(false);
  const [confirmSharedBank, setConfirmSharedBank] = useState(false);

  useEffect(() => {
    if (club && open) {
      setForm(formFromClub(club));
      setErrors({});
      setConfirmClosedSignup(false);
      setConfirmSharedBank(false);
    }
    // Reset only when a different club is opened.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- club.id/open are the intended reset keys
  }, [club?.id, open]);

  useEffect(() => {
    if (!club?.paymentLoaded || !open) return;
    const loaded = formFromClub(club);
    setForm((current) => ({
      ...current,
      bankName: current.bankName || loaded.bankName,
      accountNumber: current.accountNumber || loaded.accountNumber,
      accountName: current.accountName || loaded.accountName,
      proofInstructions: current.proofInstructions || loaded.proofInstructions,
    }));
    // Merge bank fields after payment settings arrive without wiping in-progress edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- paymentLoaded is the intended trigger
  }, [club?.paymentLoaded]);

  const baseline = club ? formFromClub(club) : null;

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return JSON.stringify(form) !== JSON.stringify(baseline);
  }, [baseline, form]);

  const bankDirty = useMemo(() => {
    if (!baseline) return false;
    return (
      form.bankName !== baseline.bankName ||
      form.accountNumber !== baseline.accountNumber ||
      form.accountName !== baseline.accountName ||
      form.proofInstructions !== baseline.proofInstructions
    );
  }, [baseline, form.accountName, form.accountNumber, form.bankName, form.proofInstructions]);

  const closingSignup = Boolean(club?.isPublicSignup && !form.isPublicSignup);

  if (!club) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.description.trim() || form.description.trim().length < 20) {
      errs.description = "Description must be at least 20 characters long.";
    }

    if (club.supportsLocation && !form.location.trim()) {
      errs.location = "Meeting location is required.";
    }

    if (club.supportsMeetingSchedule && !form.meetingSchedule.trim()) {
      errs.meetingSchedule = "Meeting schedule is required.";
    }

    if (form.duesAmount < 0 || Number.isNaN(form.duesAmount)) {
      errs.duesAmount = "Dues amount must be ₦0 or greater.";
    }

    if (bankDirty || club.supportsCoverUrl) {
      if (!form.accountNumber.trim() || !/^\d{10}$/.test(form.accountNumber.trim())) {
        if (bankDirty) errs.accountNumber = "Account number must be exactly 10 digits.";
      }
      if (bankDirty && !form.bankName.trim()) errs.bankName = "Designated bank name is required.";
      if (bankDirty && !form.accountName.trim()) errs.accountName = "Account name is required.";
    }

    if (closingSignup && !confirmClosedSignup) {
      errs.confirmClosedSignup = "Confirm that public signup will close before saving.";
    }

    if (bankDirty && !club.supportsCoverUrl && !confirmSharedBank) {
      errs.confirmSharedBank = "Confirm that this updates the shared campus payment account.";
    }

    if (bankDirty && club.supportsCoverUrl && !form.bankName.trim()) {
      errs.bankName = "Designated bank name is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!dirty) return;
    if (!validate()) return;

    const parsedTags = form.tagsString
      .split(",")
      .map((value) => value.trim().replace(/^#/, ""))
      .filter(Boolean);

    const saved = await onSaveClub(club, {
      description: form.description,
      isPublicSignup: form.isPublicSignup,
      duesAmount: form.duesAmount,
      adminOnlyWhatsAppNotes: form.adminOnlyWhatsAppNotes,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      accountName: form.accountName,
      paymentInstructions: form.proofInstructions,
      location: form.location,
      meetingSchedule: form.meetingSchedule,
      coverImage: form.coverImage,
      tags: parsedTags,
    });

    if (saved) onOpenChange(false);
  };

  const unsupportedHint = "Not stored by OneClub yet. This field stays local to preview only.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={(event) => void handleSave(event)} className="space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              <span>Administrative Directive Editor</span>
            </div>
            <DialogTitle className="text-xl font-bold">
              Edit {club.name} ({club.code || "no code"})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update official public description, meeting logistics, cover media, dues transfer account, and private admin notes.
            </DialogDescription>
          </DialogHeader>

          <div className="sr-only" aria-live="polite">
            {saving ? `Saving ${club.name}` : saveError ? saveError.message : ""}
          </div>

          {saveError ? (
            <p id="admin-clubs-save-error" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
              {saveError.message}
            </p>
          ) : null}

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
              1. Public Profile &amp; Campus Logistics
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="club-desc" className="text-xs font-semibold">
                  Club Description &amp; Mission <span className="text-destructive">*</span>
                </Label>
                {errors.description ? (
                  <span className="text-[11px] text-destructive">{errors.description}</span>
                ) : null}
              </div>
              <Textarea
                id="club-desc"
                rows={3}
                value={form.description}
                onChange={(e) => {
                  setForm((current) => ({ ...current, description: e.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                aria-invalid={Boolean(errors.description)}
                className={`text-xs leading-relaxed ${errors.description ? "border-destructive" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="club-location" className="text-xs font-semibold">
                  Campus Meeting Location {club.supportsLocation ? <span className="text-destructive">*</span> : null}
                </Label>
                <Input
                  id="club-location"
                  value={form.location}
                  disabled={!club.supportsLocation}
                  onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                  className="text-xs h-9"
                />
                {!club.supportsLocation ? (
                  <p className="text-[11px] text-muted-foreground">{unsupportedHint}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="club-schedule" className="text-xs font-semibold">
                  Meeting Schedule {club.supportsMeetingSchedule ? <span className="text-destructive">*</span> : null}
                </Label>
                <Input
                  id="club-schedule"
                  value={form.meetingSchedule}
                  disabled={!club.supportsMeetingSchedule}
                  onChange={(e) => setForm((current) => ({ ...current, meetingSchedule: e.target.value }))}
                  className="text-xs h-9"
                />
                {!club.supportsMeetingSchedule ? (
                  <p className="text-[11px] text-muted-foreground">{unsupportedHint}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="club-tags" className="text-xs font-semibold">
                  Discovery Tags (Comma-separated)
                </Label>
                <Input
                  id="club-tags"
                  value={form.tagsString}
                  disabled={!club.supportsFreeformTags}
                  onChange={(e) => setForm((current) => ({ ...current, tagsString: e.target.value }))}
                  placeholder="e.g. Technology, AI, Coding"
                  className="text-xs h-9"
                />
                {!club.supportsFreeformTags ? (
                  <p className="text-[11px] text-muted-foreground">
                    Stored categories come from the backend list. Freeform tags are not saved.
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="club-cover" className="text-xs font-semibold">
                  Cover Image URL
                </Label>
                <Input
                  id="club-cover"
                  value={form.coverImage}
                  disabled={!club.supportsCoverUrl}
                  onChange={(e) => setForm((current) => ({ ...current, coverImage: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs h-9 font-mono"
                />
                {!club.supportsCoverUrl ? (
                  <p className="text-[11px] text-muted-foreground">
                    Logo upload is not connected. External image URLs are not stored as club logos.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="club-public-signup" className="text-xs font-semibold text-foreground">
                  Open Campus Public Sign-ups
                </Label>
                <p className="text-[11px] text-muted-foreground">Allow verified students to apply directly through OneClub.</p>
              </div>
              <Switch
                id="club-public-signup"
                checked={form.isPublicSignup}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, isPublicSignup: checked }))}
                aria-label={`Public signup for ${club.name}`}
              />
            </div>
            {closingSignup ? (
              <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-[11px]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={confirmClosedSignup}
                  onChange={(event) => setConfirmClosedSignup(event.target.checked)}
                />
                <span>
                  Students will no longer be able to apply through public signup. Confirm before saving.
                  {errors.confirmClosedSignup ? (
                    <span className="block text-destructive">{errors.confirmClosedSignup}</span>
                  ) : null}
                </span>
              </label>
            ) : null}
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border-b border-border pb-1 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>2. Shared Dues &amp; Bank Transfer Instructions</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Dues amount is stored on this club. Bank account fields update the shared campus payment profile used by every official club.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dues-amount" className="text-xs font-semibold">
                    Session Dues Amount (₦) <span className="text-destructive">*</span>
                  </Label>
                  {errors.duesAmount ? (
                    <span className="text-[11px] text-destructive">{errors.duesAmount}</span>
                  ) : null}
                </div>
                <Input
                  id="dues-amount"
                  type="number"
                  min="0"
                  step="500"
                  value={form.duesAmount}
                  onChange={(e) => setForm((current) => ({ ...current, duesAmount: Number(e.target.value) }))}
                  className={`text-xs h-9 font-mono ${errors.duesAmount ? "border-destructive" : ""}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bank-name" className="text-xs font-semibold">
                  Designated Bank {bankDirty ? <span className="text-destructive">*</span> : null}
                </Label>
                <Input
                  id="bank-name"
                  value={form.bankName}
                  disabled={!club.paymentLoaded && !club.supportsCoverUrl}
                  onChange={(e) => setForm((current) => ({ ...current, bankName: e.target.value }))}
                  className={`text-xs h-9 ${errors.bankName ? "border-destructive" : ""}`}
                />
                {errors.bankName ? <span className="text-[11px] text-destructive">{errors.bankName}</span> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-num" className="text-xs font-semibold">
                  Account Number (10 digits)
                </Label>
                <Input
                  id="account-num"
                  maxLength={10}
                  value={form.accountNumber}
                  disabled={!club.paymentLoaded && !club.supportsCoverUrl}
                  onChange={(e) => setForm((current) => ({ ...current, accountNumber: e.target.value }))}
                  className={`text-xs h-9 font-mono ${errors.accountNumber ? "border-destructive" : ""}`}
                />
                {errors.accountNumber ? <span className="text-[11px] text-destructive">{errors.accountNumber}</span> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="account-name" className="text-xs font-semibold">
                  Account Name
                </Label>
                <Input
                  id="account-name"
                  value={form.accountName}
                  disabled={!club.paymentLoaded && !club.supportsCoverUrl}
                  onChange={(e) => setForm((current) => ({ ...current, accountName: e.target.value }))}
                  className={`text-xs h-9 ${errors.accountName ? "border-destructive" : ""}`}
                />
                {errors.accountName ? <span className="text-[11px] text-destructive">{errors.accountName}</span> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="narration" className="text-xs font-semibold">
                  Required Transfer Narration Guideline
                </Label>
                <Input
                  id="narration"
                  value={form.narrationGuideline}
                  disabled
                  className="text-xs h-9"
                />
                <p className="text-[11px] text-muted-foreground">
                  OneClub stores a single payment-instructions field. Include narration in the student proof note.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proof-inst" className="text-xs font-semibold">
                  Proof Upload Note for Students
                </Label>
                <Input
                  id="proof-inst"
                  value={form.proofInstructions}
                  disabled={!club.paymentLoaded && !club.supportsCoverUrl}
                  onChange={(e) => setForm((current) => ({ ...current, proofInstructions: e.target.value }))}
                  placeholder="Upload stamped teller or mobile receipt screenshot"
                  className="text-xs h-9"
                />
              </div>
            </div>
            {bankDirty && !club.supportsCoverUrl ? (
              <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-[11px]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={confirmSharedBank}
                  onChange={(event) => setConfirmSharedBank(event.target.checked)}
                />
                <span>
                  Saving bank details updates the shared campus payment account for every official club.
                  {errors.confirmSharedBank ? (
                    <span className="block text-destructive">{errors.confirmSharedBank}</span>
                  ) : null}
                </span>
              </label>
            ) : null}
          </div>

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
                value={form.adminOnlyWhatsAppNotes}
                onChange={(e) => setForm((current) => ({ ...current, adminOnlyWhatsAppNotes: e.target.value }))}
                placeholder="Track official executive group link governance, rotation schedules, or coordinator contact remarks..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          {dirty ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              Saving will update this club’s stored description, public signup, dues, or WhatsApp notes where changed.
              {bankDirty ? " Bank fields will update the shared campus payment account." : ""}
              {" Archive, delete and logo upload are not available."}
            </p>
          ) : null}

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
              disabled={saving || !dirty}
              aria-label={`Save club settings for ${club.name}`}
              className="text-xs gap-1.5 h-9"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving Directives..." : "Save Club Settings"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
