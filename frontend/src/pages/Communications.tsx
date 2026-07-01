import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Filter, Megaphone, MessageSquare, Send, Users } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { ClublyCommandPanel, ClublyLoadingState } from "@/components/Clubly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import {
  AnnouncementRecord,
  ApiClientError,
  ApprovedEventRecord,
  CreateAnnouncementPayload,
  FeedbackRecord,
  createAnnouncement,
  createFeedback,
  getAnnouncements,
  getApprovedEvents,
  getClubs,
  getFeedback,
  markAllAnnouncementsRead,
  markAnnouncementRead
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { downloadFeedbackCsv } from "@/lib/exports";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

type AnnouncementAudience = AnnouncementRecord["audience"];
type AnnouncementPriority = AnnouncementRecord["priority"];
type AnnouncementFilter = "all" | "unread" | "priority" | "club";
type HubTab = "announcements" | "feedback";
type TargetRole = "student" | "executive" | "president" | "advisor" | "admin";
type FeedbackCategory = FeedbackRecord["category"];
type FeedbackCompletion = "yes" | "no" | "partially";
type FeedbackFormCategory =
  | "bug"
  | "suggestion"
  | "confusing_experience"
  | "missing_feature"
  | "payment_dues"
  | "event_check_in"
  | "other";
type FeedbackImpact = "low" | "medium" | "high" | "urgent";
type FeedbackRoleFilter = "all" | "student" | "executive" | "president" | "advisor" | "admin" | "feedback_manager" | "unknown";
type FeedbackDateFilter = "all" | "today" | "7d" | "30d";

const priorityOptions: AnnouncementPriority[] = ["low", "normal", "high", "urgent"];
const adminRoleOptions: TargetRole[] = ["student", "executive", "president", "advisor", "admin"];
const presidentRoleOptions: TargetRole[] = ["student", "executive"];
const feedbackCategoryOptions: Array<{ value: FeedbackCategory; label: string }> = [
  { value: "onboarding", label: "Confusing experience" },
  { value: "club_joining", label: "Club joining" },
  { value: "dues_payment", label: "Payment/dues" },
  { value: "login_access", label: "Login/access" },
  { value: "event", label: "Event/check-in" },
  { value: "club", label: "Club" },
  { value: "general", label: "General / other" }
];
const feedbackFormCategoryOptions: Array<{ value: FeedbackFormCategory; label: string }> = [
  { value: "bug", label: "Bug" },
  { value: "suggestion", label: "Suggestion" },
  { value: "confusing_experience", label: "Confusing experience" },
  { value: "missing_feature", label: "Missing feature" },
  { value: "payment_dues", label: "Payment/dues issue" },
  { value: "event_check_in", label: "Event/check-in issue" },
  { value: "other", label: "Other" }
];
const feedbackImpactOptions: Array<{ value: FeedbackImpact; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];
const feedbackCompletionOptions: Array<{ value: FeedbackCompletion; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" }
];
const feedbackRoleFilterOptions: Array<{ value: FeedbackRoleFilter; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "student", label: "Students" },
  { value: "executive", label: "Executives" },
  { value: "president", label: "Presidents" },
  { value: "advisor", label: "Advisors" },
  { value: "admin", label: "Admins" },
  { value: "feedback_manager", label: "Feedback managers" },
  { value: "unknown", label: "Unknown role" }
];
const feedbackDateFilterOptions: Array<{ value: FeedbackDateFilter; label: string }> = [
  { value: "all", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" }
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load communications right now.";
}

function getDateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

function getFeedbackEventLabel(feedback: {
  proposal?: {
    title: string;
    proposed_activity: string | null;
    event_date?: string | null;
  } | null;
}) {
  const eventTitle = feedback.proposal?.proposed_activity || feedback.proposal?.title;

  if (!eventTitle) {
    return null;
  }

  const eventDate = feedback.proposal?.event_date ? formatDateOnly(feedback.proposal.event_date) : null;

  return eventDate ? `${eventTitle} - ${eventDate}` : eventTitle;
}

function formatDateOnly(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function getAudienceLabel(announcement: AnnouncementRecord, clubName?: string) {
  if (announcement.audience === "all_users") {
    return "All users";
  }

  if (announcement.audience === "all_clubs") {
    return "All clubs";
  }

  if (announcement.audience === "club") {
    return clubName ? `${clubName}` : "One club";
  }

  const role = announcement.target_role ? announcement.target_role.replace("_", " ") : "role";
  return announcement.club_id && clubName
    ? `${clubName} ${role}s`
    : `${role}s`;
}

function getPriorityClass(priority: AnnouncementPriority) {
  if (priority === "urgent") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "high") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (priority === "low") {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getAudienceHelp(audience: AnnouncementAudience, role: string | null) {
  if (role === "president") {
    return audience === "role"
      ? "This will only go to selected members of your club."
      : "This will go to everyone connected to your club.";
  }

  if (audience === "all_users") {
    return "Every Club Services user will receive this announcement.";
  }

  if (audience === "all_clubs") {
    return "Club-linked users and assigned advisors will receive this announcement.";
  }

  if (audience === "club") {
    return "Only users connected to the selected club will receive this announcement.";
  }

  return "Only users with the selected role will receive this announcement.";
}

function getFeedbackCategoryLabel(category: FeedbackCategory) {
  return feedbackCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

function getFeedbackFormCategoryLabel(category: FeedbackFormCategory) {
  return feedbackFormCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

function mapFeedbackFormCategoryToApiCategory(category: FeedbackFormCategory): FeedbackCategory {
  if (category === "confusing_experience") {
    return "onboarding";
  }

  if (category === "payment_dues") {
    return "dues_payment";
  }

  if (category === "event_check_in") {
    return "event";
  }

  return "general";
}

function getStructuredFeedbackValue(comment: string, label: string) {
  const line = comment
    .split("\n")
    .find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  return line ? line.slice(label.length + 1).trim() : "";
}

function getFeedbackSubmitterRole(comment: string): FeedbackRoleFilter {
  const value = getStructuredFeedbackValue(comment, "Role").toLowerCase().replace(/\s+/g, "_");
  const roles: FeedbackRoleFilter[] = [
    "student",
    "executive",
    "president",
    "advisor",
    "admin",
    "feedback_manager"
  ];

  return roles.includes(value as FeedbackRoleFilter) ? (value as FeedbackRoleFilter) : "unknown";
}

function getFeedbackRoleLabel(roleValue: FeedbackRoleFilter) {
  return feedbackRoleFilterOptions.find((option) => option.value === roleValue)?.label ?? "Unknown role";
}

function getFeedbackImpactLabel(value: string) {
  return feedbackImpactOptions.find((option) => option.value === value)?.label ?? value;
}

function matchesFeedbackDateFilter(createdAt: string, filter: FeedbackDateFilter) {
  if (filter === "all") {
    return true;
  }

  const createdDate = new Date(createdAt);
  const now = new Date();

  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  if (filter === "today") {
    return createdDate.toDateString() === now.toDateString();
  }

  const days = filter === "7d" ? 7 : 30;
  const earliestDate = new Date(now);
  earliestDate.setDate(now.getDate() - days);

  return createdDate >= earliestDate;
}

function buildStructuredFeedbackComment(input: {
  role: string | null;
  category: FeedbackFormCategory;
  impact: FeedbackImpact;
  tryingToDo: string;
  completion: FeedbackCompletion;
  issue: string;
  suggestions: string;
  canContact: boolean;
}) {
  return [
    `Role: ${input.role ?? "unknown"}`,
    `Issue type: ${getFeedbackFormCategoryLabel(input.category)}`,
    `Impact: ${input.impact}`,
    `Trying to do: ${input.tryingToDo.trim()}`,
    `Completed task: ${input.completion}`,
    `Confusing or broken: ${input.issue.trim()}`,
    `Improvement suggestion: ${input.suggestions.trim() || "Not provided"}`,
    `Can contact for follow-up: ${input.canContact ? "Yes" : "No"}`
  ].join("\n");
}

export default function Communications({ defaultTab = "announcements" }: { defaultTab?: HubTab }) {
  useUsageTracking(defaultTab === "feedback" ? "feedback_view" : "announcements_view");
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const isFeedbackManager = role === "feedback_manager";
  const canCreateAnnouncement = role === "admin" || role === "president";
  const canSubmitFeedback = Boolean(role);
  const canViewFeedback = role === "admin" || isFeedbackManager;
  const requestedFeedbackStatus = searchParams.get("status");
  const initialFeedbackStatus = ["all", "open", "reviewed", "archived"].includes(requestedFeedbackStatus || "")
    ? requestedFeedbackStatus || "all"
    : "all";
  const [activeTab, setActiveTab] = useState<HubTab>(
    isFeedbackManager || searchParams.get("tab") === "feedback" ? "feedback" : defaultTab
  );
  const [announcementFilter, setAnnouncementFilter] = useState<AnnouncementFilter>("all");
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState<AnnouncementAudience>(
    role === "admin" ? "all_users" : "club"
  );
  const [announcementPriority, setAnnouncementPriority] = useState<AnnouncementPriority>("normal");
  const [announcementClubId, setAnnouncementClubId] = useState("");
  const [announcementTargetRole, setAnnouncementTargetRole] = useState<TargetRole>("student");
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackFormCategory>("confusing_experience");
  const [feedbackImpact, setFeedbackImpact] = useState<FeedbackImpact>("medium");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackTryingToDo, setFeedbackTryingToDo] = useState("");
  const [feedbackCompletion, setFeedbackCompletion] = useState<FeedbackCompletion>("partially");
  const [feedbackIssue, setFeedbackIssue] = useState("");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState("");
  const [feedbackCanContact, setFeedbackCanContact] = useState("yes");
  const [feedbackClubFilter, setFeedbackClubFilter] = useState("all");
  const [feedbackProposalFilter, setFeedbackProposalFilter] = useState("all");
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState(initialFeedbackStatus);
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState<FeedbackRoleFilter>("all");
  const [feedbackDateFilter, setFeedbackDateFilter] = useState<FeedbackDateFilter>("all");
  useEffect(() => {
    setActiveTab(isFeedbackManager || searchParams.get("tab") === "feedback" ? "feedback" : defaultTab);
  }, [defaultTab, isFeedbackManager, searchParams]);

  useEffect(() => {
    setFeedbackStatusFilter(initialFeedbackStatus);
  }, [initialFeedbackStatus]);

  useEffect(() => {
    setAnnouncementPage(1);
  }, [announcementFilter]);

  useEffect(() => {
    setFeedbackProposalFilter("all");
  }, [feedbackClubFilter]);

  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: isLoadingAnnouncements,
    isError: isAnnouncementsError,
    error: announcementsError
  } = useQuery({
    queryKey: ["announcements", announcementFilter, announcementPage],
    queryFn: () =>
      getAnnouncements({
        unread: announcementFilter === "unread" ? true : undefined,
        priority: announcementFilter === "priority" ? "high" : undefined,
        audience: announcementFilter === "club" ? "club" : undefined,
        page: announcementPage,
        page_size: DEFAULT_PAGE_SIZE
      }),
    enabled: activeTab === "announcements" && !isFeedbackManager,
    retry: false
  });
  const announcements = announcementsPage.items;

  const {
    data: clubs = [],
    isLoading: isLoadingClubs
  } = useQuery({
    queryKey: ["clubs", "communications"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });

  const {
    data: feedback = [],
    isLoading: isLoadingFeedback,
    isError: isFeedbackError,
    error: feedbackError
  } = useQuery({
    queryKey: ["feedback", feedbackClubFilter, feedbackProposalFilter, feedbackCategoryFilter, feedbackStatusFilter, role],
    queryFn: () =>
      getFeedback({
        club_id: role === "admin" && feedbackClubFilter !== "all" ? feedbackClubFilter : undefined,
        proposal_id: feedbackProposalFilter !== "all" ? feedbackProposalFilter : undefined,
        category: feedbackCategoryFilter !== "all" ? (feedbackCategoryFilter as FeedbackCategory) : undefined,
        status: feedbackStatusFilter !== "all" ? feedbackStatusFilter : undefined
      }),
    enabled: activeTab === "feedback" && canViewFeedback,
    retry: false
  });

  const {
    data: approvedEventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: isLoadingEvents
  } = useQuery({
    queryKey: ["feedback-events", feedbackClubFilter],
    queryFn: () => getApprovedEvents({ page: 1, page_size: 100 }),
    enabled: activeTab === "feedback" && canViewFeedback && !isFeedbackManager,
    retry: false
  });

  const clubNameById = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs]
  );
  const feedbackEventOptions = useMemo(
    () =>
      approvedEventsPage.items.filter((event) =>
        role === "admin" && feedbackClubFilter !== "all"
          ? event.club_id === feedbackClubFilter
          : true
      ),
    [approvedEventsPage.items, feedbackClubFilter, role]
  );
  const visibleFeedback = useMemo(
    () =>
      feedback.filter((entry) => {
        if (!matchesFeedbackDateFilter(entry.created_at, feedbackDateFilter)) {
          return false;
        }

        if (feedbackRoleFilter !== "all" && getFeedbackSubmitterRole(entry.comment) !== feedbackRoleFilter) {
          return false;
        }

        return true;
      }),
    [feedback, feedbackDateFilter, feedbackRoleFilter]
  );

  const unreadCount = announcements.filter((announcement) => !announcement.is_read).length;
  const urgentCount = announcements.filter((announcement) => ["high", "urgent"].includes(announcement.priority)).length;

  const createAnnouncementMutation = useMutation({
    mutationFn: () => {
      const payload: CreateAnnouncementPayload = {
        title: announcementTitle,
        message: announcementMessage,
        audience: role === "president" && announcementAudience !== "role" ? "club" : announcementAudience,
        priority: announcementPriority
      };

      if (role === "admin" && announcementAudience === "club") {
        payload.club_id = announcementClubId;
      }

      if (announcementAudience === "role") {
        payload.target_role = announcementTargetRole;
      }

      return createAnnouncement(payload);
    },
    onSuccess: () => {
      actionSuccess("Announcement sent", "Recipients will see it in their Communication Hub.");
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setAnnouncementPriority("normal");
      setAnnouncementClubId("");
      setAnnouncementAudience(role === "admin" ? "all_users" : "club");
      setAnnouncementTargetRole("student");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      actionError("Announcement failed", error, getErrorMessage(error));
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (announcementId: string) => markAnnouncementRead(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      actionError("Could not mark announcement as read", error, getErrorMessage(error));
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAnnouncementsRead(),
    onSuccess: (result) => {
      actionSuccess(result.marked_read ? "Announcements marked as read" : "No unread announcements");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      actionError("Could not update announcements", error, getErrorMessage(error));
    }
  });

  const createFeedbackMutation = useMutation({
    mutationFn: () =>
      createFeedback({
        category: mapFeedbackFormCategoryToApiCategory(feedbackCategory),
        rating: feedbackRating ? Number(feedbackRating) : null,
        comment: buildStructuredFeedbackComment({
          role,
          category: feedbackCategory,
          impact: feedbackImpact,
          tryingToDo: feedbackTryingToDo,
          completion: feedbackCompletion,
          issue: feedbackIssue,
          suggestions: feedbackSuggestions,
          canContact: feedbackCanContact === "yes"
        })
    }),
    onSuccess: () => {
      actionSuccess("Feedback submitted", "Thanks. Club Services will review it privately.");
      setFeedbackCategory("confusing_experience");
      setFeedbackImpact("medium");
      setFeedbackRating("");
      setFeedbackTryingToDo("");
      setFeedbackCompletion("partially");
      setFeedbackIssue("");
      setFeedbackSuggestions("");
      setFeedbackCanContact("yes");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (error) => {
      actionError("Feedback failed", error, getErrorMessage(error));
    }
  });

  function handleAnnouncementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createAnnouncementMutation.mutate();
  }

  function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createFeedbackMutation.mutate();
  }

  const roleOptions = role === "president" ? presidentRoleOptions : adminRoleOptions;

  return (
    <div className="clb-screen">
      <ClublyCommandPanel
        eyebrow="Communication Hub"
        title={isFeedbackManager ? "Feedback Inbox" : "Announcements and Feedback"}
        description={
          isFeedbackManager
            ? "Review private app feedback from Club Services users without accessing admin-only operations."
            : "Publish official updates, track who has seen them, and keep club feedback in one place before Outlook delivery is added later."
        }
        stats={
          isFeedbackManager
            ? [
                { label: "Open Feedback", value: feedback.filter((entry) => entry.status === "open").length },
                { label: "Filtered", value: visibleFeedback.length }
              ]
            : [
                { label: "Unread", value: unreadCount },
                { label: "High Priority", value: urgentCount }
              ]
        }
      />

      <div className="flex flex-wrap gap-2">
        {!isFeedbackManager ? (
          <Button
            type="button"
            variant={activeTab === "announcements" ? "default" : "outline"}
            onClick={() => setActiveTab("announcements")}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Announcements
          </Button>
        ) : null}
        <Button
          type="button"
          variant={activeTab === "feedback" ? "default" : "outline"}
          onClick={() => setActiveTab("feedback")}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </div>

      {activeTab === "announcements" ? (
        <div className="clb-section-grid">
          <div className="space-y-6">
            {canCreateAnnouncement ? (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Send className="h-5 w-5 text-primary" />
                    Publish Announcement
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {role === "admin"
                      ? "Send updates to everyone, a club, or a role group."
                      : "Send updates to members or executives in your club."}
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4" onSubmit={handleAnnouncementSubmit}>
                    <div className="space-y-2">
                      <Label>Audience</Label>
                      <Select
                        value={announcementAudience}
                        onValueChange={(value) => {
                          const nextAudience = value as AnnouncementAudience;
                          setAnnouncementAudience(nextAudience);
                          if (nextAudience !== "club") {
                            setAnnouncementClubId("");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {role === "admin" && (
                            <>
                              <SelectItem value="all_users">All users</SelectItem>
                              <SelectItem value="all_clubs">All clubs</SelectItem>
                              <SelectItem value="club">Specific club</SelectItem>
                            </>
                          )}
                          {role === "president" && <SelectItem value="club">My club</SelectItem>}
                          <SelectItem value="role">
                            {role === "president" ? "My club role group" : "Role group"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {getAudienceHelp(announcementAudience, role)}
                      </p>
                    </div>

                    {role === "admin" && announcementAudience === "club" && (
                      <div className="space-y-2">
                        <Label>Club</Label>
                        <Select value={announcementClubId} onValueChange={setAnnouncementClubId} required>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Choose a club"} />
                          </SelectTrigger>
                          <SelectContent>
                            {clubs.map((club) => (
                              <SelectItem key={club.id} value={club.id}>
                                {club.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {announcementAudience === "role" && (
                      <div className="space-y-2">
                        <Label>Target role</Label>
                        <Select
                          value={announcementTargetRole}
                          onValueChange={(value) => setAnnouncementTargetRole(value as TargetRole)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem key={option} value={option} className="capitalize">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={announcementPriority}
                        onValueChange={(value) => setAnnouncementPriority(value as AnnouncementPriority)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority} value={priority} className="capitalize">
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="announcement-title">Title</Label>
                      <Input
                        id="announcement-title"
                        value={announcementTitle}
                        onChange={(event) => setAnnouncementTitle(event.target.value)}
                        placeholder="e.g. Club Services update"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="announcement-message">Message</Label>
                      <Textarea
                        id="announcement-message"
                        value={announcementMessage}
                        onChange={(event) => setAnnouncementMessage(event.target.value)}
                        placeholder="Write the announcement..."
                        required
                        rows={5}
                      />
                    </div>

                    <Button
                      className="w-full"
                      disabled={
                        createAnnouncementMutation.isPending ||
                        (role === "admin" && announcementAudience === "club" && !announcementClubId)
                      }
                      type="submit"
                    >
                      {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Read-only communication access</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You can view announcements relevant to your role and club. Announcement creation is currently limited to admins and presidents.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Announcement Feed
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Official updates filtered to what your account is allowed to see.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending || unreadCount === 0}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "All"],
                  ["unread", `Unread (${unreadCount})`],
                  ["priority", `High/Urgent (${urgentCount})`],
                  ["club", "Club updates"]
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={announcementFilter === value ? "default" : "outline"}
                    onClick={() => setAnnouncementFilter(value as AnnouncementFilter)}
                  >
                    {value === "all" && <Filter className="mr-2 h-3.5 w-3.5" />}
                    {label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingAnnouncements ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-28 animate-pulse border border-border bg-muted shadow-soft-sm" />
                  ))}
                </div>
              ) : isAnnouncementsError ? (
                <p className="text-sm text-destructive">{getErrorMessage(announcementsError)}</p>
              ) : announcements.length === 0 ? (
                <div className="clb-empty">
                  <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-medium">No announcements here yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try another filter or publish a new announcement if your role allows it.
                  </p>
                </div>
              ) : (
                announcements.map((announcement) => {
                  const clubName = announcement.club_id ? clubNameById.get(announcement.club_id) : undefined;

                  return (
                    <div
                      key={announcement.id}
                      className={`clb-list-card ${
                        announcement.is_read ? "bg-card" : "border-primary bg-primary/5"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{announcement.title}</h3>
                            {!announcement.is_read && <Badge>Unread</Badge>}
                            <Badge variant="outline" className={getPriorityClass(announcement.priority)}>
                              {announcement.priority}
                            </Badge>
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              {getAudienceLabel(announcement, clubName)}
                            </Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{announcement.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Published {getDateLabel(announcement.created_at)}
                            {announcement.read_at ? ` • Read ${getDateLabel(announcement.read_at)}` : ""}
                          </p>
                        </div>
                        {!announcement.is_read && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => markReadMutation.mutate(announcement.id)}
                            disabled={markReadMutation.isPending}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {!isLoadingAnnouncements && !isAnnouncementsError && announcements.length > 0 ? (
                <DataPagination
                  page={announcementsPage.page}
                  pageSize={announcementsPage.page_size}
                  total={announcementsPage.total}
                  hasNext={announcementsPage.has_next}
                  onPageChange={setAnnouncementPage}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={canViewFeedback && !isFeedbackManager ? "clb-section-grid" : "mx-auto grid w-full max-w-5xl gap-6"}>
          {canSubmitFeedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Send App Feedback
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tell the Club Services team what you were trying to do, what felt confusing, and what would make the app easier.
                </p>
                {!canViewFeedback ? (
                  <p className="border border-primary bg-primary/10 p-3 text-sm font-semibold text-primary">
                    Your feedback is saved privately for Club Services reviewers. Students cannot see submitted feedback.
                  </p>
                ) : null}
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={feedbackCategory}
                        onValueChange={(value) => setFeedbackCategory(value as FeedbackFormCategory)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {feedbackFormCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impact</Label>
                      <Select
                        value={feedbackImpact}
                        onValueChange={(value) => setFeedbackImpact(value as FeedbackImpact)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {feedbackImpactOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-rating">Experience rating</Label>
                      <Input
                        id="feedback-rating"
                        max="5"
                        min="1"
                        onChange={(event) => setFeedbackRating(event.target.value)}
                        placeholder="1-5"
                        type="number"
                        value={feedbackRating}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-goal">What were you trying to do?</Label>
                    <Input
                      id="feedback-goal"
                      value={feedbackTryingToDo}
                      onChange={(event) => setFeedbackTryingToDo(event.target.value)}
                      placeholder="e.g. Join a club, upload dues proof, check an event"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Were you able to complete it?</Label>
                    <Select
                      value={feedbackCompletion}
                      onValueChange={(value) => setFeedbackCompletion(value as FeedbackCompletion)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackCompletionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-issue">What confused you or went wrong?</Label>
                    <Textarea
                      id="feedback-issue"
                      value={feedbackIssue}
                      onChange={(event) => setFeedbackIssue(event.target.value)}
                      placeholder="Describe the issue in simple terms..."
                      required
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-suggestion">What should we improve?</Label>
                    <Textarea
                      id="feedback-suggestion"
                      value={feedbackSuggestions}
                      onChange={(event) => setFeedbackSuggestions(event.target.value)}
                      placeholder="Optional suggestions from your experience..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Can the team contact you for follow-up?</Label>
                    <Select value={feedbackCanContact} onValueChange={setFeedbackCanContact}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button disabled={createFeedbackMutation.isPending} type="submit">
                    {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : !isFeedbackManager ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Sign in to send feedback about onboarding, club joining, dues, login access, or events.
              </CardContent>
            </Card>
          ) : null}

          {canViewFeedback ? (
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>{isFeedbackManager ? "App Feedback Inbox" : "Recent Feedback"}</CardTitle>
                  {isFeedbackManager ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review onboarding, login/access, club joining, dues payment, and general app feedback from all users.
                    </p>
                  ) : null}
                </div>
                {role === "admin" || isFeedbackManager ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      downloadFeedbackCsv(visibleFeedback, {
                        clubNameById,
                        filenameSuffix: isFeedbackManager
                          ? "App-Feedback"
                          :
                          feedbackProposalFilter !== "all"
                            ? "Event"
                            : feedbackClubFilter !== "all"
                              ? clubNameById.get(feedbackClubFilter) || "Club"
                              : "All"
                      })
                    }
                    disabled={visibleFeedback.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={feedbackCategoryFilter} onValueChange={setFeedbackCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {feedbackCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={feedbackStatusFilter} onValueChange={setFeedbackStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={feedbackRoleFilter}
                    onValueChange={(value) => setFeedbackRoleFilter(value as FeedbackRoleFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackRoleFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Select
                    value={feedbackDateFilter}
                    onValueChange={(value) => setFeedbackDateFilter(value as FeedbackDateFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {feedbackDateFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!isFeedbackManager ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {role === "admin" ? (
                    <div className="space-y-2">
                      <Label>Club</Label>
                      <Select value={feedbackClubFilter} onValueChange={setFeedbackClubFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "All clubs"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All clubs</SelectItem>
                          {clubs.map((club) => (
                            <SelectItem key={club.id} value={club.id}>
                              {club.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label>Event</Label>
                    <Select value={feedbackProposalFilter} onValueChange={setFeedbackProposalFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "All events"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All events</SelectItem>
                        {feedbackEventOptions.map((event) => (
                          <SelectItem key={event.proposal_id} value={event.proposal_id}>
                            {role === "admin" && feedbackClubFilter === "all"
                              ? `${event.title} - ${clubNameById.get(event.club_id) || "Club"}`
                              : event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingFeedback ? (
                <ClublyLoadingState title="Loading feedback" message="We are checking recent club feedback." compact />
              ) : isFeedbackError ? (
                <p className="text-sm text-destructive">{getErrorMessage(feedbackError)}</p>
              ) : feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feedback yet.</p>
              ) : visibleFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feedback matches these filters.</p>
              ) : (
                visibleFeedback.map((entry) => {
                  const submitterRole = getFeedbackSubmitterRole(entry.comment);
                  const impact = getStructuredFeedbackValue(entry.comment, "Impact");

                  return (
                    <div key={entry.id} className="clb-list-card">
                      {getFeedbackEventLabel(entry) ? (
                        <p className="text-sm font-semibold">{getFeedbackEventLabel(entry)}</p>
                      ) : (
                        <p className="text-sm font-semibold">{getFeedbackCategoryLabel(entry.category)} feedback</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">{getFeedbackCategoryLabel(entry.category)}</Badge>
                        <Badge variant="outline">{entry.status}</Badge>
                        <Badge variant="outline">{getFeedbackRoleLabel(submitterRole)}</Badge>
                        {impact ? <Badge variant="outline">Impact: {getFeedbackImpactLabel(impact)}</Badge> : null}
                        {entry.rating ? <Badge variant="outline">Rating: {entry.rating}/5</Badge> : null}
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{entry.comment}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {getDateLabel(entry.created_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
