import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Filter, Megaphone, MessageSquare, Send, Users } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { NeoCommandPanel, NeoLoadingState } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  AnnouncementRecord,
  ApiClientError,
  CreateAnnouncementPayload,
  createAnnouncement,
  createFeedback,
  getAnnouncements,
  getClubs,
  getFeedback,
  markAllAnnouncementsRead,
  markAnnouncementRead
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

type AnnouncementAudience = AnnouncementRecord["audience"];
type AnnouncementPriority = AnnouncementRecord["priority"];
type AnnouncementFilter = "all" | "unread" | "priority" | "club";
type HubTab = "announcements" | "feedback";
type TargetRole = "student" | "executive" | "president" | "advisor" | "admin";

const priorityOptions: AnnouncementPriority[] = ["low", "normal", "high", "urgent"];
const adminRoleOptions: TargetRole[] = ["student", "executive", "president", "advisor", "admin"];
const presidentRoleOptions: TargetRole[] = ["student", "executive"];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load communications right now.";
}

function getDateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
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

export default function Communications() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canCreateAnnouncement = role === "admin" || role === "president";
  const canSubmitFeedback = role === "president" || role === "executive";
  const [activeTab, setActiveTab] = useState<HubTab>("announcements");
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
  const [feedbackCategory, setFeedbackCategory] = useState<"general" | "event" | "club">("general");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  useEffect(() => {
    setAnnouncementPage(1);
  }, [announcementFilter]);

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
    queryKey: ["feedback"],
    queryFn: () => getFeedback(),
    retry: false
  });

  const clubNameById = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs]
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
        category: feedbackCategory,
        rating: feedbackRating ? Number(feedbackRating) : null,
        comment: feedbackComment
      }),
    onSuccess: () => {
      actionSuccess("Feedback submitted", "Club Services can now review it.");
      setFeedbackCategory("general");
      setFeedbackRating("");
      setFeedbackComment("");
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
    <div className="nh-page">
      <NeoCommandPanel
        eyebrow="Communication Hub"
        title="Announcements and Feedback"
        description="Publish official updates, track who has seen them, and keep club feedback in one place before Outlook delivery is added later."
        stats={[
          { label: "Unread", value: unreadCount },
          { label: "High Priority", value: urgentCount }
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeTab === "announcements" ? "default" : "outline"}
          onClick={() => setActiveTab("announcements")}
        >
          <Megaphone className="mr-2 h-4 w-4" />
          Announcements
        </Button>
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
        <div className="nh-section-grid">
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
                    <div key={item} className="h-28 animate-pulse border-2 border-foreground bg-muted shadow-[4px_4px_0_hsl(var(--foreground))]" />
                  ))}
                </div>
              ) : isAnnouncementsError ? (
                <p className="text-sm text-destructive">{getErrorMessage(announcementsError)}</p>
              ) : announcements.length === 0 ? (
                <div className="nh-empty">
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
                      className={`nh-list-card ${
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
        <div className="nh-section-grid">
          {canSubmitFeedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Submit Feedback
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share club or event feedback for follow-up.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={feedbackCategory}
                        onValueChange={(value) => setFeedbackCategory(value as "general" | "event" | "club")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="club">Club</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-rating">Rating</Label>
                      <Input
                        id="feedback-rating"
                        max="5"
                        min="1"
                        onChange={(event) => setFeedbackRating(event.target.value)}
                        placeholder="1-5"
                        type="number"
                        value={feedbackRating}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-comment">Comment</Label>
                    <Textarea
                      id="feedback-comment"
                      value={feedbackComment}
                      onChange={(event) => setFeedbackComment(event.target.value)}
                      placeholder="Share the feedback..."
                      required
                      rows={5}
                    />
                  </div>
                  <Button disabled={createFeedbackMutation.isPending} type="submit">
                    {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Feedback submission is currently limited to club operators. You can still read announcements from the main tab.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingFeedback ? (
                <NeoLoadingState title="Loading feedback" message="We are checking recent club feedback." compact />
              ) : isFeedbackError ? (
                <p className="text-sm text-destructive">{getErrorMessage(feedbackError)}</p>
              ) : feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feedback yet.</p>
              ) : (
                feedback.map((entry) => (
                  <div key={entry.id} className="nh-list-card">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {entry.category}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {entry.status}
                      </Badge>
                      {entry.rating && <span className="text-xs text-muted-foreground">{entry.rating}/5</span>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.comment}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {getDateLabel(entry.created_at)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
