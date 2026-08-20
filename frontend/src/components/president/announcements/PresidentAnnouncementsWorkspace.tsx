import { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Megaphone,
  Plus,
  Radio,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export type AnnouncementAudience = "All Club Members" | "Club Executive Board Only" | "General Club Students Only";
export type AnnouncementPriority = "Normal" | "High Priority" | "Urgent";

export interface PresidentAnnouncementRecord {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  clubName: string;
  clubCode: string;
  sentAt: string;
  senderName: string;
  senderRole: string;
  recipientCount: number;
  readCount: number;
}

const INITIAL_ANNOUNCEMENTS: PresidentAnnouncementRecord[] = [
  {
    id: "ann-01",
    title: "DevFest 2025 Volunteer Orientation & Rehearsal",
    message: "Mandatory rehearsal for all selected student track leads and volunteers. We will be testing the main auditorium audio-visual equipment and badge distribution tables.",
    audience: "Club Executive Board Only",
    priority: "High Priority",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    sentAt: "Yesterday, 4:15 PM",
    senderName: "Farouk Al-Mansoor",
    senderRole: "President",
    recipientCount: 14,
    readCount: 14
  },
  {
    id: "ann-02",
    title: "Google Cloud TechSprint Sandbox Access Keys Released",
    message: "Registered participants for the upcoming TechSprint workshop can now access their temporary Google Cloud lab vouchers in their Student Portal under club dues benefits.",
    audience: "All Club Members",
    priority: "Normal",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    sentAt: "3 days ago",
    senderName: "Farouk Al-Mansoor",
    senderRole: "President",
    recipientCount: 168,
    readCount: 142
  },
  {
    id: "ann-03",
    title: "Call for Hackathon Mentors & Code Reviewers",
    message: "We are seeking 300L and 400L Software Engineering members to serve as peer mentors for the upcoming beginner tracks in the AI Agent Hackathon.",
    audience: "General Club Students Only",
    priority: "Normal",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    sentAt: "Oct 12, 2025",
    senderName: "Farouk Al-Mansoor",
    senderRole: "President",
    recipientCount: 154,
    readCount: 130
  }
];

export function PresidentAnnouncementsWorkspace() {
  const { profile } = useAuth();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [announcements, setAnnouncements] = useState<PresidentAnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<"all" | AnnouncementAudience>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<PresidentAnnouncementRecord | null>(null);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerMessage, setComposerMessage] = useState("");
  const [composerAudience, setComposerAudience] = useState<AnnouncementAudience>("All Club Members");
  const [composerPriority, setComposerPriority] = useState<AnnouncementPriority>("Normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.message.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (audienceFilter === "all") return true;
      return ann.audience === audienceFilter;
    });
  }, [announcements, searchQuery, audienceFilter]);

  // Recipient estimate calculation based on audience
  const estimatedRecipients = useMemo(() => {
    if (composerAudience === "All Club Members") return 168;
    if (composerAudience === "Club Executive Board Only") return 14;
    return 154; // General Club Students Only
  }, [composerAudience]);

  // Submit announcement
  const handleDispatchAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTitle.trim() || !composerMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord: PresidentAnnouncementRecord = {
        id: `ann-${Date.now().toString().slice(-4)}`,
        title: composerTitle.trim(),
        message: composerMessage.trim(),
        audience: composerAudience,
        priority: composerPriority,
        clubName,
        clubCode,
        sentAt: "Just now",
        senderName: presidentName,
        senderRole: "President",
        recipientCount: estimatedRecipients,
        readCount: 1
      };

      setAnnouncements((prev) => [newRecord, ...prev]);
      setIsSubmitting(false);
      setIsComposerOpen(false);

      // Reset form
      setComposerTitle("");
      setComposerMessage("");
      setComposerAudience("All Club Members");
      setComposerPriority("Normal");

      setSuccessBanner(`Announcement broadcast successfully to ${newRecord.recipientCount} club members.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 450);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="announcements-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-announcements-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/ANNOUNCEMENTS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Broadcasts &bull; {clubCode}
            </span>
          </div>
          <h1 id="announcements-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Announcements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Dispatch official club bulletins to all registered members or target the executive committee. Dispatched announcements cannot be modified once delivered.
          </p>
        </div>

        {/* Primary Dominant Action: New Announcement */}
        <Button
          onClick={() => setIsComposerOpen(true)}
          size="sm"
          className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs"
        >
          <Megaphone className="h-4 w-4" />
          <span>New Announcement</span>
        </Button>
      </header>

      {/* SUCCESS CONFIRMATION BANNER */}
      {successBanner && (
        <Banner
          variant="success"
          title="Broadcast Dispatched"
          description={successBanner}
          onClose={() => setSuccessBanner(null)}
        />
      )}

      {/* FILTER CONTROLS & SEARCH */}
      <section aria-labelledby="filter-heading" className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <TextField
            id="announcement-search"
            placeholder="Search past bulletins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Broadcasts" },
            { id: "All Club Members", label: "All Club Members" },
            { id: "Club Executive Board Only", label: "Executive Board" },
            { id: "General Club Students Only", label: "General Students" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAudienceFilter(tab.id as typeof audienceFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                audienceFilter === tab.id
                  ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ANNOUNCEMENTS DIRECTORY LIST */}
      <section aria-labelledby="history-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="history-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Dispatched Broadcasts ({filteredAnnouncements.length})
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            Immutable Audit Trail &bull; {clubName}
          </span>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <Card className="border-dashed border-border/80 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No announcements found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No past bulletins match your filter. Compose a new message to notify your club members.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsComposerOpen(true)} className="text-xs font-bold gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Compose Message</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => (
              <Card
                key={ann.id}
                className="p-4 border-border/80 hover:border-primary/50 transition-all duration-180 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge
                        status={
                          ann.priority === "Urgent"
                            ? "destructive"
                            : ann.priority === "High Priority"
                            ? "warning"
                            : "default"
                        }
                        label={ann.priority}
                      />
                      <span className="text-[11px] font-semibold bg-muted/60 text-foreground px-2 py-0.5 rounded-md border border-border/60">
                        {ann.audience}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {ann.sentAt}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground pt-0.5">
                      {ann.title}
                    </h3>
                  </div>

                  <div className="text-xs text-muted-foreground font-mono shrink-0">
                    <span className="font-semibold text-foreground">{ann.readCount}</span> / {ann.recipientCount} Read
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-xl border border-border/50">
                  {ann.message}
                </p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Dispatched by <strong>{ann.senderName}</strong> ({ann.senderRole})
                  </span>

                  <span className="font-mono text-[10px] text-muted-foreground/80">
                    ID: {ann.id} (Delivered)
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* COMPOSER DIALOG */}
      <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <DialogContent maxWidth="md">
          <form onSubmit={handleDispatchAnnouncement} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                  {clubName}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Target Scope
                </span>
              </div>
              <DialogTitle className="text-foreground text-lg">
                Compose Club Announcement
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Broadcast official updates to your members. Note: campus-wide broadcasts are restricted to Student Affairs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <TextField
                id="bulletin-title"
                label="Announcement Title"
                placeholder="e.g. Mandatory DevFest Volunteer Orientation"
                required
                value={composerTitle}
                onChange={(e) => setComposerTitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Target Club Audience
                  </label>
                  <select
                    value={composerAudience}
                    onChange={(e) => setComposerAudience(e.target.value as AnnouncementAudience)}
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="All Club Members">All Club Members (168 Enrolled)</option>
                    <option value="Club Executive Board Only">Club Executive Board Only (14 Officers)</option>
                    <option value="General Club Students Only">General Club Students Only (154 Students)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Priority Level
                  </label>
                  <select
                    value={composerPriority}
                    onChange={(e) => setComposerPriority(e.target.value as AnnouncementPriority)}
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="Normal">Normal Notification</option>
                    <option value="High Priority">High Priority (Pin to Portal)</option>
                    <option value="Urgent">Urgent (Immediate Banner Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear instructions, meeting links, room numbers, or guidelines..."
                  value={composerMessage}
                  onChange={(e) => setComposerMessage(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-muted-foreground space-y-1">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Estimated Delivery:</span>
                  <span className="font-mono text-primary">{estimatedRecipients} Members</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Delivered straight to student mobile notification feeds and club portal inbox. Dispatched messages are immutable.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsComposerOpen(false)}
                className="w-full sm:w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !composerTitle.trim() || !composerMessage.trim()}
                className="w-full sm:w-1/2 text-xs font-bold gap-1 bg-primary text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Dispatching..." : "Dispatch Broadcast"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
