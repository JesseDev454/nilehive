import { useEffect, useRef, useState } from "react";
import { Megaphone, Send, Save } from "lucide-react";
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
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import { toast } from "sonner";
import { listClubs } from "@/lib/api/clubs";
import { publishAdminAnnouncement } from "@/lib/api/announcements";
import {
  buildCreateAnnouncementPayload,
  validateAnnouncementComposer,
} from "@/lib/announcements/adapters";
import { normalizeAnnouncementsError } from "@/lib/announcements/errors";
import { HOME_ANNOUNCEMENT_DRAFT_KEY } from "@/lib/announcements/mockAnnouncements";
import type { AnnouncementPriorityLevel } from "@/lib/announcements/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAnnouncementComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished?: (announcement: {
    title: string;
    targetClubId: string;
    priority: "normal" | "high" | "urgent";
    content: string;
  }) => void;
}

export function AdminAnnouncementComposer({
  open,
  onOpenChange,
  onPublished,
}: AdminAnnouncementComposerProps) {
  const { reportAuthFailure } = useAuth();
  const mockMode = isMockPreviewMode();
  const [title, setTitle] = useState("");
  const [targetClubId, setTargetClubId] = useState("all");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string; targetClubId?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clubs, setClubs] = useState(OFFICIAL_14_CLUBS.map((club) => ({ id: club.id, name: club.name })));

  useEffect(() => {
    if (!open) return;
    const savedDraft = sessionStorage.getItem(HOME_ANNOUNCEMENT_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        if (parsed.priority) setPriority(parsed.priority);
        if (parsed.targetClubId) setTargetClubId(parsed.targetClubId);
      } catch {
        // ignore corrupted device-local draft
      }
    }
    if (!mockMode) {
      void listClubs().then((records) => {
        setClubs(records.map((club) => ({ id: club.id, name: club.name })));
      }).catch(() => {
        // keep last known club list
      });
    }
  }, [mockMode, open]);

  const handleSaveDraft = () => {
    sessionStorage.setItem(
      HOME_ANNOUNCEMENT_DRAFT_KEY,
      JSON.stringify({ title, content, priority, targetClubId }),
    );
    toast.success("Draft saved on this device only. It is not saved to OneClub.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const audience = targetClubId === "all" ? "all_users" : "one_club";
    const fieldErrors = validateAnnouncementComposer({
      title,
      content,
      audience,
      targetClubId: audience === "one_club" ? targetClubId : undefined,
      priority: priority as AnnouncementPriorityLevel,
    });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fix the validation errors before publishing.");
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mockMode) {
        sessionStorage.removeItem(HOME_ANNOUNCEMENT_DRAFT_KEY);
        const targetLabel =
          targetClubId === "all"
            ? "all campus users"
            : clubs.find((club) => club.id === targetClubId)?.name || "the selected club";
        toast.success(`Announcement broadcasted to ${targetLabel}.`);
        onPublished?.({ title, targetClubId, priority, content });
        onOpenChange(false);
        setTitle("");
        setContent("");
        setPriority("normal");
        setTargetClubId("all");
        setErrors({});
        return;
      }

      await publishAdminAnnouncement(
        buildCreateAnnouncementPayload({
          title,
          content,
          audience,
          targetClubId: audience === "one_club" ? targetClubId : undefined,
          priority: priority as AnnouncementPriorityLevel,
        }),
      );
      sessionStorage.removeItem(HOME_ANNOUNCEMENT_DRAFT_KEY);
      toast.success("Announcement published.");
      onPublished?.({ title, targetClubId, priority, content });
      onOpenChange(false);
      setTitle("");
      setContent("");
      setPriority("normal");
      setTargetClubId("all");
      setErrors({});
    } catch (error) {
      if (reportAuthFailure(error)) return;
      const mapped = normalizeAnnouncementsError(error);
      setSubmitError(mapped.message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              <span>Campus Directive</span>
            </div>
            <DialogTitle className="text-xl font-bold">New Campus Announcement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Publish an authoritative communication across Nile University&apos;s official student clubs. Drafts stay on this device only.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="announcement-title" className="text-xs font-semibold">
                  Announcement Title <span className="text-destructive">*</span>
                </Label>
                {errors.title ? (
                  <span className="text-[11px] font-medium text-destructive">{errors.title}</span>
                ) : null}
              </div>
              <Input
                id="announcement-title"
                placeholder="e.g., Mandatory Semester Club Activity Compliance Briefing"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`text-xs h-9 ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="target-club" className="text-xs font-semibold">
                  Target Audience
                </Label>
                <Select value={targetClubId} onValueChange={setTargetClubId}>
                  <SelectTrigger id="target-club" className="text-xs h-9">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all">All campus users</SelectItem>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-semibold">
                  Priority Level
                </Label>
                <Select value={priority} onValueChange={(val: "normal" | "high" | "urgent") => setPriority(val)}>
                  <SelectTrigger id="priority" className="text-xs h-9">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Standard (Normal Bulletin)</SelectItem>
                    <SelectItem value="high">High (Executive Action Needed)</SelectItem>
                    <SelectItem value="urgent">Urgent (Mandatory Immediate Broadcast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="announcement-content" className="text-xs font-semibold">
                  Message Content <span className="text-destructive">*</span>
                </Label>
                {errors.content ? (
                  <span className="text-[11px] font-medium text-destructive">{errors.content}</span>
                ) : null}
              </div>
              <Textarea
                id="announcement-content"
                rows={5}
                placeholder="Write the directives, venue notices, deadlines, or campus policy updates for student leaders..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                className={`text-xs leading-relaxed ${errors.content ? "border-destructive" : ""}`}
              />
            </div>

            {submitError ? (
              <p className="text-[11px] text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
            <div className="sr-only" aria-live="polite">
              {isSubmitting ? "Publishing announcement." : ""}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft} className="text-xs gap-1.5 h-11">
              <Save className="h-3.5 w-3.5" />
              <span>Save draft on this device</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-11">
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={isSubmitting} className="text-xs gap-1.5 h-11">
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Broadcasting..." : "Publish Directive"}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
