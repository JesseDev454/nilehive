import { useState, useEffect } from "react";
import { Megaphone, AlertCircle, CheckCircle2, Send, Save, X } from "lucide-react";
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
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import { toast } from "sonner";

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
  onPublished
}: AdminAnnouncementComposerProps) {
  const [title, setTitle] = useState("");
  const [targetClubId, setTargetClubId] = useState("all");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Restore draft if available in session storage
  useEffect(() => {
    if (open) {
      const savedDraft = sessionStorage.getItem("oneclub_admin_announcement_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.content) setContent(parsed.content);
          if (parsed.priority) setPriority(parsed.priority);
          if (parsed.targetClubId) setTargetClubId(parsed.targetClubId);
        } catch {
          // ignore corrupted draft
        }
      }
    }
  }, [open]);

  const handleSaveDraft = () => {
    sessionStorage.setItem(
      "oneclub_admin_announcement_draft",
      JSON.stringify({ title, content, priority, targetClubId })
    );
    toast.success("Announcement draft saved to local session.");
  };

  const validate = () => {
    const errs: { title?: string; content?: string } = {};
    if (!title.trim()) {
      errs.title = "Announcement title is required.";
    } else if (title.trim().length < 4) {
      errs.title = "Title must be at least 4 characters long.";
    }

    if (!content.trim()) {
      errs.content = "Announcement message content cannot be empty.";
    } else if (content.trim().length < 10) {
      errs.content = "Content must be at least 10 characters long.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors before publishing.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      sessionStorage.removeItem("oneclub_admin_announcement_draft");

      const targetLabel =
        targetClubId === "all"
          ? "All 14 Official Clubs"
          : OFFICIAL_14_CLUBS.find((c) => c.id === targetClubId)?.name || "Target Club";

      toast.success(`Announcement broadcasted to ${targetLabel}.`, {
        description: `Priority: ${priority.toUpperCase()} • Notification sent to executives.`
      });

      onPublished?.({ title, targetClubId, priority, content });
      onOpenChange(false);

      // reset form
      setTitle("");
      setContent("");
      setPriority("normal");
      setTargetClubId("all");
      setErrors({});
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Megaphone className="h-4 w-4" />
              <span>Campus Directive</span>
            </div>
            <DialogTitle className="text-xl font-bold">New Campus Announcement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Publish an authoritative communication across Nile University's official student clubs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            {/* Title Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="announcement-title" className="text-xs font-semibold">
                  Announcement Title <span className="text-destructive">*</span>
                </Label>
                {errors.title && (
                  <span className="text-[11px] font-medium text-destructive">{errors.title}</span>
                )}
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

            {/* Audience & Priority Grid */}
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
                    <SelectItem value="all">All 14 Official Clubs (Campus-Wide)</SelectItem>
                    {OFFICIAL_14_CLUBS.map((club) => (
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
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
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

            {/* Content Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="announcement-content" className="text-xs font-semibold">
                  Message Content <span className="text-destructive">*</span>
                </Label>
                {errors.content && (
                  <span className="text-[11px] font-medium text-destructive">{errors.content}</span>
                )}
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
                className={`text-xs leading-relaxed ${errors.content ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs gap-1.5 h-9"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save draft</span>
            </Button>

            <div className="flex items-center gap-2">
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
                disabled={isSubmitting}
                className="text-xs gap-1.5 h-9"
              >
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
