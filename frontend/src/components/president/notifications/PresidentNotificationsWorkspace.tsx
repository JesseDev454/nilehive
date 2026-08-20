import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck,
  FileEdit,
  FilePlus2,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Layers,
  Mail,
  Megaphone,
  MessageSquare,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export type PresidentNotificationCategory =
  | "proposal"
  | "membership"
  | "report"
  | "task"
  | "admin"
  | "feedback";

export interface PresidentNotificationRecord {
  id: string;
  category: PresidentNotificationCategory;
  title: string;
  message: string;
  sender: string;
  senderRole: string;
  timestamp: string;
  isRead: boolean;
  isActionRequired: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: {
    referenceId?: string;
    stage?: string;
    assignedTo?: string;
    studentName?: string;
    studentMatric?: string;
    deadline?: string;
  };
}

const INITIAL_PRESIDENT_NOTIFICATIONS: PresidentNotificationRecord[] = [
  {
    id: "notif-pres-101",
    category: "proposal",
    title: "Proposal Approved: Flutter Mobile Dev Bootcamp",
    message: "Your faculty advisor Dr. Aminu Galadima and Dean of Student Affairs have formally endorsed proposal PROP-098 with allocated budget of ₦54,000. Proceed to venue booking confirmation.",
    sender: "Dr. Aminu Galadima",
    senderRole: "Staff Advisor & Dean Review",
    timestamp: "25 minutes ago",
    isRead: false,
    isActionRequired: true,
    actionLabel: "View Approved Proposal",
    actionUrl: "/proposals/prop-098",
    metadata: {
      referenceId: "PROP-098",
      stage: "Approved & Budget Cleared",
      deadline: "Oct 18, 2025"
    }
  },
  {
    id: "notif-pres-102",
    category: "membership",
    title: "3 New Membership Applications Pending Review",
    message: "Undergraduate engineering students have submitted joining requests to Nile Google Developers. Review academic standing and matric credentials.",
    sender: "Nile Admissions & Registry Desk",
    senderRole: "Automated Registration Roster",
    timestamp: "2 hours ago",
    isRead: false,
    isActionRequired: true,
    actionLabel: "Review Members Roster",
    actionUrl: "/members",
    metadata: {
      studentName: "Ahmad Bello + 2 others",
      stage: "Pending President Sign-off"
    }
  },
  {
    id: "notif-pres-103",
    category: "report",
    title: "Post-Event Closure Report Due: Open Source Git Bootcamp",
    message: "Event completed on Sept 20. Institutional guidelines require attendance verification and expenditure ledger reconciliation within 7 days of event conclusion.",
    sender: "Student Affairs Compliance Desk",
    senderRole: "Compliance & Auditing Unit",
    timestamp: "5 hours ago",
    isRead: false,
    isActionRequired: true,
    actionLabel: "File Event Report",
    actionUrl: "/reports",
    metadata: {
      referenceId: "EV-PAST-02",
      deadline: "Sept 27, 2025"
    }
  },
  {
    id: "notif-pres-104",
    category: "task",
    title: "Executive Work Completed: Lab 3 AV & Switcher Inspection",
    message: "Tariq Ibrahim (Workshops Coordinator) marked task #task-102 as complete: 'All 45 workstations verified online; HDMI switchers operational.'",
    sender: "Tariq Ibrahim",
    senderRole: "Workshops Coordinator (Exec)",
    timestamp: "Yesterday at 3:45 PM",
    isRead: true,
    isActionRequired: false,
    actionLabel: "Inspect Delegation Work",
    actionUrl: "/tasks",
    metadata: {
      referenceId: "task-102",
      assignedTo: "Tariq Ibrahim"
    }
  },
  {
    id: "notif-pres-105",
    category: "admin",
    title: "Student Affairs Directive: Semester 2 Campus Keynote Guidelines",
    message: "All club presidents are requested to enforce student digital check-in protocols for faculty auditorium events to meet Nile University fire safety occupancy limits.",
    sender: "Directorate of Student Affairs",
    senderRole: "Official University Directive",
    timestamp: "2 days ago",
    isRead: true,
    isActionRequired: false,
    actionLabel: "Read Broadcast Memo",
    actionUrl: "/announcements",
    metadata: {
      referenceId: "DIR-SA-2025-04"
    }
  },
  {
    id: "notif-pres-106",
    category: "feedback",
    title: "New Participant Feedback Received (14 Responses)",
    message: "Students submitted ratings for the Web3 & Smart Contracts Onboarding seminar. Overall satisfaction rating: 4.8 / 5.0.",
    sender: "OneClub Feedback Bot",
    senderRole: "Automated Post-Event Pulse",
    timestamp: "3 days ago",
    isRead: true,
    isActionRequired: false,
    metadata: {
      referenceId: "FB-2025-072",
      stage: "Satisfaction 96%"
    }
  }
];

export function PresidentNotificationsWorkspace() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [notifications, setNotifications] = useState<PresidentNotificationRecord[]>(
    INITIAL_PRESIDENT_NOTIFICATIONS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [onlyActionRequired, setOnlyActionRequired] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PresidentNotificationRecord | null>(
    null
  );
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Unread & Action Required metrics
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const actionRequiredCount = useMemo(
    () => notifications.filter((n) => n.isActionRequired).length,
    [notifications]
  );

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || n.category === categoryFilter;

      const matchesAction = !onlyActionRequired || n.isActionRequired;

      return matchesSearch && matchesCategory && matchesAction;
    });
  }, [notifications, searchQuery, categoryFilter, onlyActionRequired]);

  // Handle individual notification click (Open details & mark single item read)
  const handleOpenNotification = (item: PresidentNotificationRecord) => {
    setSelectedNotification(item);
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
  };

  // Toggle individual item read state
  const handleToggleRead = (id: string, currentReadState: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !currentReadState } : n))
    );
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification((prev) =>
        prev ? { ...prev, isRead: !currentReadState } : null
      );
    }
  };

  // Dismiss / Remove individual notification
  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    setSuccessBanner("Notification removed from your feed.");
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  // Category Icon & Color Helper
  const getCategoryMeta = (cat: PresidentNotificationCategory) => {
    switch (cat) {
      case "proposal":
        return {
          icon: FileCheck,
          label: "Proposal Milestone",
          tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
        };
      case "membership":
        return {
          icon: UserPlus,
          label: "Membership Request",
          tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
        };
      case "report":
        return {
          icon: FileEdit,
          label: "Closure Report",
          tone: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
        };
      case "task":
        return {
          icon: CheckCircle2,
          label: "Executive Task",
          tone: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
        };
      case "admin":
        return {
          icon: Megaphone,
          label: "Student Affairs Memo",
          tone: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
        };
      case "feedback":
        return {
          icon: MessageSquare,
          label: "Member Feedback",
          tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
        };
    }
  };

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="president-notifications-heading"
    >
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-notifications-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/NOTIFICATIONS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Inbox &bull; {clubCode}
            </span>
          </div>
          <h1
            id="president-notifications-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {clubName} Presidential Feed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Real-time updates regarding proposal approvals, membership rosters, executive task progress, post-event reporting requirements, and Student Affairs directives.
          </p>
        </div>

        {/* Status Indicators (No Mark-all-read as per strict rules) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
            <Bell className="h-3.5 w-3.5" />
            <span>{unreadCount} Unread</span>
          </div>
          {actionRequiredCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{actionRequiredCount} Action Due</span>
            </div>
          )}
        </div>
      </header>

      {/* CONFIRMATION BANNER */}
      {successBanner && (
        <Banner
          variant="success"
          title="Feed Updated"
          description={successBanner}
          onClose={() => setSuccessBanner(null)}
        />
      )}

      {/* FILTER & SEARCH BAR */}
      <section aria-labelledby="filter-heading" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <TextField
              id="search-notifications"
              placeholder="Search notifications, senders, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Category Selector */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs shrink-0">
              {(
                [
                  { key: "All", label: "All" },
                  { key: "proposal", label: "Proposals" },
                  { key: "membership", label: "Memberships" },
                  { key: "report", label: "Reports" },
                  { key: "task", label: "Tasks" },
                  { key: "admin", label: "Memos" }
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    categoryFilter === cat.key
                      ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Action Required Toggle */}
            <button
              type="button"
              onClick={() => setOnlyActionRequired(!onlyActionRequired)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                onlyActionRequired
                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40"
                  : "bg-card text-muted-foreground border-border/70 hover:text-foreground"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Action Due Only</span>
            </button>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS LIST */}
      <section aria-labelledby="notifications-list-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="notifications-list-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Notifications Feed ({filteredNotifications.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Strict presidential scope &bull; Individual record management
          </span>
        </div>

        {notifications.length === 0 ? (
          /* EMPTY STATE: ZERO NOTIFICATIONS */
          <Card className="border-dashed border-border/80 p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <BellOff className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-foreground">No notifications yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your presidential feed is clear. Upcoming proposal updates, roster requests, and executive task milestones will appear here in real time.
              </p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          /* EMPTY STATE: NO SEARCH MATCHES */
          <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No notifications found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No presidential alerts match your active filter or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
                setOnlyActionRequired(false);
              }}
              className="text-xs mt-1"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          /* POPULATED NOTIFICATIONS LIST */
          <div className="space-y-2.5">
            {filteredNotifications.map((item) => {
              const meta = getCategoryMeta(item.category);
              const CategoryIcon = meta.icon;

              return (
                <Card
                  key={item.id}
                  hoverable
                  onClick={() => handleOpenNotification(item)}
                  className={`p-4 border transition-all duration-180 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    !item.isRead
                      ? "border-primary/40 bg-primary/5 hover:border-primary/60"
                      : "border-border/80 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Category Icon Badge */}
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.tone}`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.tone}`}
                        >
                          {meta.label}
                        </span>

                        {item.isActionRequired && (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Action Required
                          </span>
                        )}

                        {!item.isRead ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Read
                          </span>
                        )}

                        <span className="text-[10px] text-muted-foreground/80 font-mono ml-auto sm:ml-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold text-foreground leading-snug ${
                          !item.isRead ? "text-primary dark:text-primary-foreground font-extrabold" : ""
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                        <span>From: <strong>{item.sender}</strong> ({item.senderRole})</span>
                        {item.metadata?.referenceId && (
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                            {item.metadata.referenceId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Inspect Affordance */}
                  <div
                    className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto justify-between sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.actionLabel && item.actionUrl ? (
                      <Link to={item.actionUrl}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                        >
                          <span>{item.actionLabel}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenNotification(item)}
                        className="text-xs h-8 text-muted-foreground hover:text-foreground"
                      >
                        <span>Details</span>
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDismissNotification(item.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* NOTIFICATION DETAILS INSPECT DIALOG */}
      <Dialog
        open={Boolean(selectedNotification)}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent maxWidth="md">
          {selectedNotification && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-muted-foreground">
                    {selectedNotification.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedNotification.isActionRequired && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Action Required
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        getCategoryMeta(selectedNotification.category).tone
                      }`}
                    >
                      {getCategoryMeta(selectedNotification.category).label}
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-foreground text-base sm:text-lg">
                  {selectedNotification.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedNotification.timestamp} &bull; Received for {clubName}
                </DialogDescription>
              </DialogHeader>

              {/* SENDER & METADATA CARD */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Sender &amp; Authority</span>
                    <p className="font-bold text-foreground text-sm">{selectedNotification.sender}</p>
                    <p className="text-muted-foreground text-[11px]">{selectedNotification.senderRole}</p>
                  </div>

                  {selectedNotification.metadata?.referenceId && (
                    <div className="text-right font-mono">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Reference</span>
                      <p className="font-bold text-primary">{selectedNotification.metadata.referenceId}</p>
                    </div>
                  )}
                </div>

                {selectedNotification.metadata && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                    {selectedNotification.metadata.stage && (
                      <div>
                        <span className="text-muted-foreground">Status / Milestone:</span>
                        <p className="font-semibold text-foreground">{selectedNotification.metadata.stage}</p>
                      </div>
                    )}
                    {selectedNotification.metadata.deadline && (
                      <div>
                        <span className="text-muted-foreground">Deadline:</span>
                        <p className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{selectedNotification.metadata.deadline}</p>
                      </div>
                    )}
                    {selectedNotification.metadata.assignedTo && (
                      <div>
                        <span className="text-muted-foreground">Assigned Officer:</span>
                        <p className="font-semibold text-foreground">{selectedNotification.metadata.assignedTo}</p>
                      </div>
                    )}
                    {selectedNotification.metadata.studentName && (
                      <div>
                        <span className="text-muted-foreground">Student Roster:</span>
                        <p className="font-semibold text-foreground">{selectedNotification.metadata.studentName}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* MESSAGE CONTENT */}
              <div className="space-y-1">
                <h4 className="font-bold text-foreground">Notification Message</h4>
                <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3.5 rounded-lg border border-border/50 text-xs">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Read status is supplied by the mock; OneClub does not expose unsupported mutation controls. */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex items-center justify-between">
                <span className="text-muted-foreground">
                  Status: <strong>{selectedNotification.isRead ? "Marked as Read" : "Unread"}</strong>
                </span>
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotification(null)}
                  className="w-full sm:w-auto text-xs"
                >
                  Close
                </Button>

                {selectedNotification.actionLabel && selectedNotification.actionUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const url = selectedNotification.actionUrl;
                      setSelectedNotification(null);
                      if (url) navigate(url);
                    }}
                    className="w-full sm:w-auto text-xs font-bold gap-1 bg-primary text-primary-foreground"
                  >
                    <span>{selectedNotification.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
