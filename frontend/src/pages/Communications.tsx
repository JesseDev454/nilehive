import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiClientError,
  createAnnouncement,
  createFeedback,
  getAnnouncements,
  getFeedback
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load communications right now.";
}

function getDateLabel(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

export default function Communications() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canCreateAnnouncement = role === "admin" || role === "president" || role === "executive";
  const canSubmitFeedback = role === "president" || role === "executive";
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState<"all" | "club">("all");
  const [feedbackCategory, setFeedbackCategory] = useState<"general" | "event" | "club">("general");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");

  const {
    data: announcements = [],
    isLoading: isLoadingAnnouncements,
    isError: isAnnouncementsError,
    error: announcementsError
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => getAnnouncements(),
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

  const createAnnouncementMutation = useMutation({
    mutationFn: () =>
      createAnnouncement({
        title: announcementTitle,
        message: announcementMessage,
        audience: role === "admin" ? announcementAudience : "club"
      }),
    onSuccess: () => {
      toast.success("Announcement published");
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error) => {
      toast.error("Announcement failed", {
        description: getErrorMessage(error)
      });
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
      toast.success("Feedback submitted");
      setFeedbackCategory("general");
      setFeedbackRating("");
      setFeedbackComment("");
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    onError: (error) => {
      toast.error("Feedback failed", {
        description: getErrorMessage(error)
      });
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

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Announcements & Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Club communication records and feedback tracking
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {canCreateAnnouncement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone className="h-5 w-5 text-primary" />
                Create Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAnnouncementSubmit}>
                {role === "admin" && (
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select
                      value={announcementAudience}
                      onValueChange={(value) => setAnnouncementAudience(value as "all" | "club")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All clubs</SelectItem>
                        <SelectItem value="club" disabled>
                          Specific club later
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                  />
                </div>
                <Button disabled={createAnnouncementMutation.isPending} type="submit">
                  {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canSubmitFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Submit Feedback
              </CardTitle>
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
                  />
                </div>
                <Button disabled={createFeedbackMutation.isPending} type="submit">
                  {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingAnnouncements ? (
              <p className="text-sm text-muted-foreground">Loading announcements...</p>
            ) : isAnnouncementsError ? (
              <p className="text-sm text-destructive">{getErrorMessage(announcementsError)}</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{announcement.title}</p>
                    <Badge variant="outline" className="capitalize">
                      {announcement.audience}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{announcement.message}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {getDateLabel(announcement.created_at)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingFeedback ? (
              <p className="text-sm text-muted-foreground">Loading feedback...</p>
            ) : isFeedbackError ? (
              <p className="text-sm text-destructive">{getErrorMessage(feedbackError)}</p>
            ) : feedback.length === 0 ? (
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            ) : (
              feedback.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
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
    </div>
  );
}
