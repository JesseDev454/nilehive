import { useEffect, useState } from "react";
import { AlertCircle, Megaphone, Send } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_CONFIG } from "@/data/adminAnnouncementsData";
import { validateAnnouncementComposer, type ComposerValidationErrors } from "@/lib/announcements/adapters";
import { ANNOUNCEMENT_DRAFT_KEY } from "@/lib/announcements/mockAnnouncements";
import type { AnnouncementsUiError } from "@/lib/announcements/errors";
import type {
  AdminAnnouncementView,
  AnnouncementAudienceType,
  AnnouncementComposerInput,
  AnnouncementPriorityLevel,
  TargetRoleType,
} from "@/lib/announcements/types";
import { toast } from "sonner";

interface AdminAnnouncementComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubs: Array<{ id: string; name: string }>;
  publishing: boolean;
  publishError: AnnouncementsUiError | null;
  mockMode: boolean;
  onPublish: (input: AnnouncementComposerInput) => Promise<{
    ok: boolean;
    fieldErrors?: ComposerValidationErrors;
    alreadyInFlight?: boolean;
    announcement?: AdminAnnouncementView;
    error?: AnnouncementsUiError | "auth" | "abort";
  }>;
}

const EMPTY_ERRORS: ComposerValidationErrors = {};

export function AdminAnnouncementComposerDialog({
  open,
  onOpenChange,
  clubs,
  publishing,
  publishError,
  onPublish,
}: AdminAnnouncementComposerDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudienceType>("all_users");
  const [targetClubId, setTargetClubId] = useState("");
  const [targetRole, setTargetRole] = useState<TargetRoleType>("president");
  const [priority, setPriority] = useState<AnnouncementPriorityLevel>("normal");
  const [errors, setErrors] = useState<ComposerValidationErrors>(EMPTY_ERRORS);

  useEffect(() => {
    if (!open) return;
    const draft = sessionStorage.getItem(ANNOUNCEMENT_DRAFT_KEY);
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft) as Partial<AnnouncementComposerInput>;
      if (parsed.title) setTitle(parsed.title);
      if (parsed.content) setContent(parsed.content);
      if (parsed.audience) setAudience(parsed.audience);
      if (parsed.targetClubId) setTargetClubId(parsed.targetClubId);
      if (parsed.targetRole) setTargetRole(parsed.targetRole);
      if (parsed.priority) setPriority(parsed.priority);
    } catch {
      // ignore corrupted device-local draft
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!title && !content) return;
    sessionStorage.setItem(
      ANNOUNCEMENT_DRAFT_KEY,
      JSON.stringify({ title, content, audience, targetClubId, targetRole, priority }),
    );
  }, [audience, content, open, priority, targetClubId, targetRole, title]);

  useEffect(() => {
    if (audience === "one_club" && !targetClubId && clubs[0]) {
      setTargetClubId(clubs[0].id);
    }
  }, [audience, clubs, targetClubId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: AnnouncementComposerInput = {
      title,
      content,
      audience,
      targetClubId: audience === "one_club" ? targetClubId : undefined,
      targetRole: audience === "role" ? targetRole : undefined,
      priority,
    };
    const nextErrors = validateAnnouncementComposer(input);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const result = await onPublish(input);
    if (result.fieldErrors) {
      setErrors(result.fieldErrors);
      return;
    }
    if (!result.ok) return;

    toast.success("Announcement published.");
    sessionStorage.removeItem(ANNOUNCEMENT_DRAFT_KEY);
    setTitle("");
    setContent("");
    setAudience("all_users");
    setPriority("normal");
    setErrors(EMPTY_ERRORS);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              <span>Broadcast Composer</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Publish New Announcement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official broadcasts are delivered to users&apos; notification feeds. Once published, broadcasts cannot be edited, deleted, pinned, or scheduled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="ann-title" className="text-xs font-semibold">
                  Announcement Title <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">{title.length}/150</span>
              </div>
              <Input
                id="ann-title"
                placeholder="e.g. 2026/2027 Academic Session: Annual Activity Grant Guidelines"
                value={title}
                maxLength={150}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`text-xs h-9 ${errors.title ? "border-destructive" : ""}`}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  <span>{errors.title}</span>
                </p>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
              <Label className="text-xs font-semibold block text-foreground">
                Target Audience <span className="text-destructive">*</span>
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["all_users", "All Campus Users", "Every student & advisor"],
                    ["all_clubs", "All Official Clubs", "All club executives & advisors"],
                    ["one_club", "Single Club", "Target one specific organization"],
                    ["role", "Specific Role", "Filter by user governance role"],
                  ] as const
                ).map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={audience === value}
                    onClick={() => setAudience(value)}
                    className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all min-h-11 ${
                      audience === value
                        ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] opacity-75 font-normal">{hint}</span>
                  </button>
                ))}
              </div>

              {audience === "one_club" ? (
                <div className="pt-2 space-y-1">
                  <Label htmlFor="club-selector" className="text-[11px] font-medium text-foreground">
                    Select Target Club
                  </Label>
                  <Select value={targetClubId} onValueChange={setTargetClubId}>
                    <SelectTrigger id="club-selector" className="text-xs h-9 bg-background">
                      <SelectValue placeholder="Select an official club" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetClubId ? (
                    <p className="text-[11px] text-destructive">{errors.targetClubId}</p>
                  ) : null}
                </div>
              ) : null}

              {audience === "role" ? (
                <div className="pt-2 space-y-1">
                  <Label htmlFor="role-selector" className="text-[11px] font-medium text-foreground">
                    Select Target Governance Role
                  </Label>
                  <Select value={targetRole} onValueChange={(role) => setTargetRole(role as TargetRoleType)}>
                    <SelectTrigger id="role-selector" className="text-xs h-9 bg-background">
                      <SelectValue placeholder="Select target role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="president">Club Presidents Only</SelectItem>
                      <SelectItem value="advisor">Staff Advisors Only</SelectItem>
                      <SelectItem value="executive">Club Executives Only</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="admin">Club Services Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold block text-foreground">Notice Priority Level</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["low", "normal", "high", "urgent"] as const).map((level) => {
                  const isSelected = priority === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setPriority(level)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all min-h-11 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-bold ring-1 ring-primary/20"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="block font-semibold capitalize">{level}</span>
                      <span className="text-[10px] opacity-75 font-normal line-clamp-1">
                        {level === "normal" ? "Standard" : level === "urgent" ? "Critical" : level}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-0.5">
                {PRIORITY_CONFIG[priority].description}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="ann-content" className="text-xs font-semibold">
                  Announcement Message <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">{content.length} characters</span>
              </div>
              <Textarea
                id="ann-content"
                placeholder="State the context, requirements, actionable dates, and directives clearly..."
                rows={5}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                className={`text-xs ${errors.content ? "border-destructive" : ""}`}
                aria-invalid={Boolean(errors.content)}
              />
              {errors.content ? (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  <span>{errors.content}</span>
                </p>
              ) : null}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Drafts stay on this device only and are not saved to OneClub. Action links, attachments, scheduling, and pinning are not supported.
            </p>

            {publishError ? (
              <div id="admin-announcements-publish-error" className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-[11px] text-destructive" role="alert">
                {publishError.message}
              </div>
            ) : null}

            <div className="sr-only" aria-live="polite">
              {publishing ? "Publishing announcement." : ""}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-11">
              Cancel Draft
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={publishing} className="text-xs gap-1.5 h-11">
              <Send className="h-3.5 w-3.5" />
              <span>{publishing ? "Broadcasting..." : "Publish Broadcast"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
