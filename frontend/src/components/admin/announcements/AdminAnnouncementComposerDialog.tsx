import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Megaphone,
  Radio,
  Send,
  Sparkles,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import {
  AUDIENCE_CONFIG,
  PRIORITY_CONFIG,
  ROLE_LABELS,
  type AdminAnnouncementItem,
  type AnnouncementAudienceType,
  type AnnouncementPriorityLevel,
  type TargetRoleType
} from "@/data/adminAnnouncementsData";
import { toast } from "sonner";

interface AdminAnnouncementComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: (newAnnouncement: AdminAnnouncementItem) => void;
}

export function AdminAnnouncementComposerDialog({
  open,
  onOpenChange,
  onPublished
}: AdminAnnouncementComposerDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudienceType>("all_users");
  const [targetClubId, setTargetClubId] = useState<string>("google-developers");
  const [targetRole, setTargetRole] = useState<TargetRoleType>("president");
  const [priority, setPriority] = useState<AnnouncementPriorityLevel>("normal");
  const [actionUrl, setActionUrl] = useState("");
  const [actionLabel, setActionLabel] = useState("");

  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    targetClubId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft from sessionStorage if available
  useEffect(() => {
    if (open) {
      const draft = sessionStorage.getItem("oneclub_admin_announcement_composer_draft");
      if (draft) {
        try {
          const p = JSON.parse(draft);
          if (p.title) setTitle(p.title);
          if (p.content) setContent(p.content);
          if (p.audience) setAudience(p.audience);
          if (p.targetClubId) setTargetClubId(p.targetClubId);
          if (p.targetRole) setTargetRole(p.targetRole);
          if (p.priority) setPriority(p.priority);
        } catch {
          // ignore corrupted draft
        }
      }
    }
  }, [open]);

  // Persist draft on edit
  useEffect(() => {
    if (title || content) {
      sessionStorage.setItem(
        "oneclub_admin_announcement_composer_draft",
        JSON.stringify({
          title,
          content,
          audience,
          targetClubId,
          targetRole,
          priority
        })
      );
    }
  }, [title, content, audience, targetClubId, targetRole, priority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Announcement title is required.";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    }

    if (!content.trim()) {
      newErrors.content = "Announcement message content is required.";
    } else if (content.trim().length < 10) {
      newErrors.content = "Message content must be at least 10 characters.";
    }

    if (audience === "one_club" && !targetClubId) {
      newErrors.targetClubId = "Please select a target club.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const targetClubObj =
        audience === "one_club"
          ? OFFICIAL_14_CLUBS.find((c) => c.id === targetClubId)
          : undefined;

      // Estimate initial total recipients based on audience
      let totalRecipients = 1850;
      if (audience === "all_clubs") totalRecipients = 156;
      if (audience === "one_club") totalRecipients = 95;
      if (audience === "role") {
        if (targetRole === "president") totalRecipients = 14;
        else if (targetRole === "advisor") totalRecipients = 14;
        else if (targetRole === "executive") totalRecipients = 70;
        else totalRecipients = 1750;
      }

      const publishedItem: AdminAnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        audience,
        targetClubId: audience === "one_club" ? targetClubId : undefined,
        targetClubName: targetClubObj?.name,
        targetRole: audience === "role" ? targetRole : undefined,
        priority,
        publishedAt: new Date().toISOString(),
        publishedBy: "Directorate of Student Affairs",
        readCount: 0,
        totalRecipients,
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined
      };

      onPublished(publishedItem);
      toast.success("Announcement broadcasted successfully.");

      // Clear draft & reset
      sessionStorage.removeItem("oneclub_admin_announcement_composer_draft");
      setTitle("");
      setContent("");
      setAudience("all_users");
      setPriority("normal");
      setActionUrl("");
      setActionLabel("");
      setErrors({});
      onOpenChange(false);
    }, 280);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Megaphone className="h-4 w-4" />
              <span>Broadcast Composer</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Publish New Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official broadcasts are delivered to users' notification feeds. Once published, broadcasts cannot be edited or duplicated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-1">
            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="ann-title" className="text-xs font-semibold">
                  Announcement Title <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {title.length}/150
                </span>
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
              />
              {errors.title && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Target Audience Selector */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
              <Label className="text-xs font-semibold block text-foreground">
                Target Audience <span className="text-destructive">*</span>
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAudience("all_users")}
                  className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                    audience === "all_users"
                      ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>All Campus Users</span>
                  <span className="text-[10px] opacity-75 font-normal">Every student &amp; advisor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("all_clubs")}
                  className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                    audience === "all_clubs"
                      ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>All 14 Official Clubs</span>
                  <span className="text-[10px] opacity-75 font-normal">All club executives &amp; advisors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("one_club")}
                  className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                    audience === "one_club"
                      ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Single Club</span>
                  <span className="text-[10px] opacity-75 font-normal">Target one specific organization</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("role")}
                  className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                    audience === "role"
                      ? "border-primary bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Specific Role</span>
                  <span className="text-[10px] opacity-75 font-normal">Filter by user governance role</span>
                </button>
              </div>

              {/* Conditional Sub-selectors */}
              {audience === "one_club" && (
                <div className="pt-2 space-y-1">
                  <Label htmlFor="club-selector" className="text-[11px] font-medium text-foreground">
                    Select Target Club
                  </Label>
                  <Select value={targetClubId} onValueChange={setTargetClubId}>
                    <SelectTrigger id="club-selector" className="text-xs h-9 bg-background">
                      <SelectValue placeholder="Select one of 14 official clubs" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {OFFICIAL_14_CLUBS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {audience === "role" && (
                <div className="pt-2 space-y-1">
                  <Label htmlFor="role-selector" className="text-[11px] font-medium text-foreground">
                    Select Target Governance Role
                  </Label>
                  <Select value={targetRole} onValueChange={(r) => setTargetRole(r as TargetRoleType)}>
                    <SelectTrigger id="role-selector" className="text-xs h-9 bg-background">
                      <SelectValue placeholder="Select target role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="president">Club Presidents Only</SelectItem>
                      <SelectItem value="advisor">Staff Advisors Only</SelectItem>
                      <SelectItem value="executive">Club Executives Only</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Priority Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold block text-foreground">
                Notice Priority Level
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["low", "normal", "high", "urgent"] as const).map((p) => {
                  const isSelected = priority === p;
                  const conf = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-bold ring-1 ring-primary/20"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="block font-semibold capitalize">{p}</span>
                      <span className="text-[10px] opacity-75 font-normal line-clamp-1">
                        {p === "normal" ? "Standard" : p === "urgent" ? "Critical" : p}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-0.5">
                {PRIORITY_CONFIG[priority].description}
              </p>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="ann-content" className="text-xs font-semibold">
                  Announcement Message <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {content.length} characters
                </span>
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
              />
              {errors.content && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.content}</span>
                </p>
              )}
            </div>

            {/* Optional Action Deep-Link */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <Label htmlFor="ann-action-url" className="text-[11px] font-medium">
                  Attached Action Route (Optional)
                </Label>
                <Input
                  id="ann-action-url"
                  placeholder="e.g. /events or /proposals"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ann-action-label" className="text-[11px] font-medium">
                  Button Label (Optional)
                </Label>
                <Input
                  id="ann-action-label"
                  placeholder="e.g. View Guidelines"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
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
              Cancel Draft
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5 h-9"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Broadcasting..." : "Publish Broadcast"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
