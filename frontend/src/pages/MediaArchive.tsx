import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  createEventReport,
  getApprovedEvents,
  getEventReports,
  type EventReportRecord
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load event reports right now.";
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function splitUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function ReportCard({ report }: { report: EventReportRecord }) {
  const title = report.proposal?.proposed_activity || report.proposal?.title || "Completed Event";
  const firstMediaUrl = report.media_urls[0];

  return (
    <Card className="overflow-hidden">
      {firstMediaUrl ? (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={firstMediaUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(report.proposal?.event_date)} - {report.proposal?.location || "Venue not recorded"}
            </p>
          </div>
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15 capitalize">{report.status}</Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{report.summary}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="font-semibold">{report.attendance_count}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Budget Used</p>
            <p className="font-semibold">{formatCurrency(report.budget_used)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {report.report_file_url ? (
            <Button asChild variant="outline" size="sm">
              <a href={report.report_file_url} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Report File
              </a>
            </Button>
          ) : null}
          {report.media_urls.length ? (
            <Button asChild variant="outline" size="sm">
              <a href={report.media_urls[0]} target="_blank" rel="noreferrer">
                <ImageIcon className="h-4 w-4 mr-2" />
                View Media
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MediaArchive() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [proposalId, setProposalId] = useState("");
  const [attendanceCount, setAttendanceCount] = useState("");
  const [summary, setSummary] = useState("");
  const [challenges, setChallenges] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [budgetUsed, setBudgetUsed] = useState("");
  const [mediaUrls, setMediaUrls] = useState("");
  const [reportFileUrl, setReportFileUrl] = useState("");
  const canSubmitReports = role === "executive";
  const canViewReports = ["admin", "advisor", "president", "executive"].includes(role);

  const {
    data: reports = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["event-reports", role],
    queryFn: () => getEventReports(),
    enabled: canViewReports,
    retry: false
  });
  const { data: approvedEvents = [] } = useQuery({
    queryKey: ["approved-events", "report-form"],
    queryFn: () => getApprovedEvents(),
    enabled: canSubmitReports,
    retry: false
  });
  const reportedProposalIds = useMemo(
    () => new Set(reports.map((report) => report.proposal_id)),
    [reports]
  );
  const reportableEvents = approvedEvents.filter((event) => !reportedProposalIds.has(event.proposal_id));
  const createMutation = useMutation({
    mutationFn: () =>
      createEventReport({
        proposal_id: proposalId,
        attendance_count: Number(attendanceCount),
        summary,
        challenges: challenges || null,
        outcomes: outcomes || null,
        budget_used: budgetUsed ? Number(budgetUsed) : null,
        media_urls: splitUrls(mediaUrls),
        report_file_url: reportFileUrl || null
      }),
    onSuccess: async () => {
      toast.success("Post-event report submitted");
      setProposalId("");
      setAttendanceCount("");
      setSummary("");
      setChallenges("");
      setOutcomes("");
      setBudgetUsed("");
      setMediaUrls("");
      setReportFileUrl("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["approved-events"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not submit report", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  function handleSubmitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  if (!canViewReports) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Reports & Media Archive</h1>
          <p className="text-muted-foreground text-sm mt-1">This role does not use reports yet.</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No report access for this role.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Reports & Media Archive</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Document completed approved events and keep a central Club Services record.
        </p>
      </div>

      {canSubmitReports ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Post-Event Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="proposal_id">Approved Event</Label>
                <Select value={proposalId} onValueChange={setProposalId}>
                  <SelectTrigger id="proposal_id">
                    <SelectValue placeholder="Select an approved event" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportableEvents.map((event) => (
                      <SelectItem key={event.proposal_id} value={event.proposal_id}>
                        {event.title} - {formatDate(event.event_date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!reportableEvents.length ? (
                  <p className="text-xs text-muted-foreground">
                    No approved events without reports are available right now.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance_count">Attendance Count</Label>
                <Input
                  id="attendance_count"
                  type="number"
                  min="0"
                  value={attendanceCount}
                  onChange={(event) => setAttendanceCount(event.target.value)}
                  placeholder="75"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_used">Budget Used</Label>
                <Input
                  id="budget_used"
                  type="number"
                  min="0"
                  value={budgetUsed}
                  onChange={(event) => setBudgetUsed(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="summary">Event Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="What happened during the event?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcomes">Outcomes</Label>
                <Textarea
                  id="outcomes"
                  value={outcomes}
                  onChange={(event) => setOutcomes(event.target.value)}
                  placeholder="What did the club achieve?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges</Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(event) => setChallenges(event.target.value)}
                  placeholder="Any issues or lessons learned?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media_urls">Media URLs</Label>
                <Textarea
                  id="media_urls"
                  value={mediaUrls}
                  onChange={(event) => setMediaUrls(event.target.value)}
                  placeholder="One photo/video link per line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report_file_url">Report File URL</Label>
                <Input
                  id="report_file_url"
                  value={reportFileUrl}
                  onChange={(event) => setReportFileUrl(event.target.value)}
                  placeholder="Optional document link"
                />
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || !proposalId}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Archive</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading event reports...</p>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load reports</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No event reports yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reports will appear here after executives document approved events.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
