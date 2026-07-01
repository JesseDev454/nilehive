import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { DataPagination } from "@/components/DataPagination";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
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
  getEventReportDetail,
  getApprovedEvents,
  getClubs,
  getEventReports,
  type EventReportRecord
} from "@/lib/api";
import { downloadEventReportPdf, downloadEventReportsZip, downloadReportMediaZip } from "@/lib/exports";
import { uploadStorageFile } from "@/lib/storage";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

const MAX_REPORT_MEDIA_IMAGES = 10;
const REPORT_DRAFT_STORAGE_KEY = "clubly:post-event-report-draft:v1";

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

function ReportCard({
  report,
  isDownloading,
  isDownloadingMedia,
  onDownload,
  onDownloadMedia
}: {
  report: EventReportRecord;
  isDownloading: boolean;
  isDownloadingMedia: boolean;
  onDownload: (reportId: string) => void;
  onDownloadMedia: (reportId: string) => void;
}) {
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
          <div className="nh-card-soft p-3">
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="font-semibold">{report.attendance_count}</p>
          </div>
          <div className="nh-card-soft p-3">
            <p className="text-xs text-muted-foreground">Budget Used</p>
            <p className="font-semibold">{formatCurrency(report.budget_used)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onDownload(report.id)} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing PDF
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </>
            )}
          </Button>
          {report.media_urls.length ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDownloadMedia(report.id)}
                disabled={isDownloadingMedia}
              >
                {isDownloadingMedia ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing ZIP
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Download Images ({report.media_urls.length})
                  </>
                )}
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={report.media_urls[0]} target="_blank" rel="noreferrer">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View Media
                </a>
              </Button>
            </>
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
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([]);
  const [uploadedMediaNames, setUploadedMediaNames] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedClubId, setSelectedClubId] = useState("all");
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [downloadingMediaReportId, setDownloadingMediaReportId] = useState<string | null>(null);
  const [isDownloadingBulkReports, setIsDownloadingBulkReports] = useState(false);
  const canSubmitReports = role === "president";
  const canViewReports = ["admin", "advisor", "president"].includes(role);
  const reportClubFilter = role === "admin" && selectedClubId !== "all" ? selectedClubId : undefined;

  const {
    data: reportsPage = emptyPaginatedResponse<EventReportRecord>(),
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["event-reports", role, page, reportClubFilter || "all"],
    queryFn: () => getEventReports({ page, page_size: DEFAULT_PAGE_SIZE, club_id: reportClubFilter }),
    enabled: canViewReports,
    retry: false
  });
  const reports = reportsPage.items;
  const { data: clubs = [] } = useQuery({
    queryKey: ["archive-clubs"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });
  const { data: approvedEventsPage = emptyPaginatedResponse() } = useQuery({
    queryKey: ["approved-events", "report-form"],
    queryFn: () => getApprovedEvents({ page: 1, page_size: 100 }),
    enabled: canSubmitReports,
    retry: false
  });
  const approvedEvents = approvedEventsPage.items;
  const reportedProposalIds = useMemo(
    () => new Set(reports.map((report) => report.proposal_id)),
    [reports]
  );
  const reportableEvents = approvedEvents.filter((event) => !reportedProposalIds.has(event.proposal_id));
  const selectedEvent = useMemo(
    () => reportableEvents.find((event) => event.proposal_id === proposalId) || null,
    [proposalId, reportableEvents]
  );
  const totalMediaCount = uploadedMediaUrls.length;

  useEffect(() => {
    setPage(1);
  }, [reportClubFilter]);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(REPORT_DRAFT_STORAGE_KEY);

    if (!savedDraft) {
      return;
    }

    try {
      const draft = JSON.parse(savedDraft) as {
        proposalId?: string;
        attendanceCount?: string;
        summary?: string;
        challenges?: string;
        outcomes?: string;
        budgetUsed?: string;
        uploadedMediaUrls?: string[];
        uploadedMediaNames?: string[];
      };

      setProposalId(draft.proposalId || "");
      setAttendanceCount(draft.attendanceCount || "");
      setSummary(draft.summary || "");
      setChallenges(draft.challenges || "");
      setOutcomes(draft.outcomes || "");
      setBudgetUsed(draft.budgetUsed || "");
      setUploadedMediaUrls(Array.isArray(draft.uploadedMediaUrls) ? draft.uploadedMediaUrls : []);
      setUploadedMediaNames(Array.isArray(draft.uploadedMediaNames) ? draft.uploadedMediaNames : []);
    } catch {
      window.localStorage.removeItem(REPORT_DRAFT_STORAGE_KEY);
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: () =>
      createEventReport({
        proposal_id: proposalId,
        attendance_count: Number(attendanceCount),
        summary,
        challenges: challenges || null,
        outcomes: outcomes || null,
        budget_used: budgetUsed ? Number(budgetUsed) : null,
        media_urls: uploadedMediaUrls
      }),
    onSuccess: async () => {
      actionSuccess("Post-event report submitted", "The completed event is now in the archive.");
      setProposalId("");
      setAttendanceCount("");
      setSummary("");
      setChallenges("");
      setOutcomes("");
      setBudgetUsed("");
      setUploadedMediaUrls([]);
      setUploadedMediaNames([]);
      window.localStorage.removeItem(REPORT_DRAFT_STORAGE_KEY);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["approved-events"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not submit report", mutationError, getErrorMessage(mutationError));
    }
  });

  function handleSubmitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (totalMediaCount > MAX_REPORT_MEDIA_IMAGES) {
      toast.error("Too many images", {
        description: `You can attach up to ${MAX_REPORT_MEDIA_IMAGES} images per report.`
      });
      return;
    }

    createMutation.mutate();
  }

  function handleSaveDraft() {
    window.localStorage.setItem(
      REPORT_DRAFT_STORAGE_KEY,
      JSON.stringify({
        proposalId,
        attendanceCount,
        summary,
        challenges,
        outcomes,
        budgetUsed,
        uploadedMediaUrls,
        uploadedMediaNames
      })
    );

    toast.success("Report draft saved", {
      description: "This draft stays on this device until you submit or replace it."
    });
  }

  async function handleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    if (!selectedEvent?.club_id) {
      toast.error("Select event first", {
        description: "Choose the event before uploading images so they are scoped to the correct club."
      });
      event.target.value = "";
      return;
    }

    const nonImageFile = files.find((file) => !file.type.startsWith("image/"));

    if (nonImageFile) {
      toast.error("Only image files are allowed", {
        description: `Unsupported file: ${nonImageFile.name}`
      });
      event.target.value = "";
      return;
    }

    if (totalMediaCount + files.length > MAX_REPORT_MEDIA_IMAGES) {
      toast.error("Image limit exceeded", {
        description: `You can attach up to ${MAX_REPORT_MEDIA_IMAGES} images in total.`
      });
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingMedia(true);
      const uploads = [] as { url: string; name: string }[];

      for (const file of files) {
        const upload = await uploadStorageFile(file, "event-media", {
          folder: selectedEvent.club_id
        });

        uploads.push({
          url: upload.url,
          name: file.name
        });
      }

      setUploadedMediaUrls((current) => [...current, ...uploads.map((item) => item.url)]);
      setUploadedMediaNames((current) => [...current, ...uploads.map((item) => item.name)]);

      toast.success("Images uploaded", {
        description: `${uploads.length} image${uploads.length > 1 ? "s" : ""} ready for submission.`
      });
    } catch (uploadError) {
      toast.error("Could not upload images", {
        description: getErrorMessage(uploadError)
      });
    } finally {
      setIsUploadingMedia(false);
      event.target.value = "";
    }
  }

  function removeUploadedMedia(index: number) {
    setUploadedMediaUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setUploadedMediaNames((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleDownloadReport(reportId: string) {
    setDownloadingReportId(reportId);

    try {
      const detail = await getEventReportDetail(reportId);
      await downloadEventReportPdf(detail);
      actionSuccess("Report download ready", "The event report PDF has been prepared for your device.");
    } catch (downloadError) {
      actionError("Could not download report", downloadError, getErrorMessage(downloadError));
    } finally {
      setDownloadingReportId(null);
    }
  }

  async function handleDownloadMedia(reportId: string) {
    setDownloadingMediaReportId(reportId);

    try {
      const detail = await getEventReportDetail(reportId);
      const result = await downloadReportMediaZip(detail);

      if (result.failedCount > 0) {
        toast.warning("Image download completed with some skips", {
          description: `${result.downloadedCount} image(s) were added to the ZIP, but ${result.failedCount} could not be fetched.`
        });
      } else {
        actionSuccess("Image download ready", `${result.downloadedCount} report image(s) were prepared for your device.`);
      }
    } catch (downloadError) {
      actionError("Could not download report images", downloadError, getErrorMessage(downloadError));
    } finally {
      setDownloadingMediaReportId(null);
    }
  }

  async function handleDownloadBulkReports() {
    setIsDownloadingBulkReports(true);

    try {
      const allReports: EventReportRecord[] = [];
      let nextPage = 1;
      let hasNext = true;

      while (hasNext) {
        const reportPage = await getEventReports({
          page: nextPage,
          page_size: 100,
          club_id: reportClubFilter
        });
        allReports.push(...reportPage.items);
        hasNext = reportPage.has_next;
        nextPage += 1;
      }

      if (!allReports.length) {
        toast.info("No reports to download", {
          description: "This filter does not have any event reports yet."
        });
        return;
      }

      await downloadEventReportsZip(allReports);
      actionSuccess("Reports ZIP ready", `${allReports.length} event report PDF(s) were prepared for your device.`);
    } catch (downloadError) {
      actionError("Could not download reports ZIP", downloadError, getErrorMessage(downloadError));
    } finally {
      setIsDownloadingBulkReports(false);
    }
  }

  if (!canViewReports) {
    return (
      <div className="nh-page">
        <NeoPageHeader
          eyebrow="Archive"
          title="Reports & Media Archive"
          description="Post-event reports are available to presidents, advisors, and Club Services admins."
        />
        <NeoStateCard icon={FileText} title="Report access is restricted" message="No report access for this role." />
      </div>
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Archive"
        title="Reports & Media Archive"
        description="Document completed events and keep a central Club Services record."
      />

      {canSubmitReports ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Post-Event Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="nh-form-grid">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="proposal_id">Event</Label>
                <Select value={proposalId} onValueChange={setProposalId}>
                  <SelectTrigger id="proposal_id">
                    <SelectValue placeholder="Select an event" />
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
                    No events without reports are available right now.
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
                <Label htmlFor="media_upload">Upload Event Images</Label>
                <Input
                  id="media_upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia || !proposalId}
                />
                <p className="text-xs text-muted-foreground">
                  Max {MAX_REPORT_MEDIA_IMAGES} images per report. Uploaded: {uploadedMediaUrls.length}.
                </p>
                {uploadedMediaNames.length ? (
                  <div className="space-y-1">
                    {uploadedMediaNames.map((name, index) => (
                      <div key={`${name}-${index}`} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
                        <span className="truncate pr-2">{name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeUploadedMedia(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Total media count: {totalMediaCount}/{MAX_REPORT_MEDIA_IMAGES}</p>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Drafts stay on this device and are not visible as submitted reports.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={createMutation.isPending || isUploadingMedia}
                  >
                    Save Draft
                  </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || isUploadingMedia || !proposalId || totalMediaCount > MAX_REPORT_MEDIA_IMAGES}
                >
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
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Archive</CardTitle>
            {role === "admin" ? (
              <div className="grid gap-2 sm:w-72">
                <Label htmlFor="report_club_filter">Club</Label>
                <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                  <SelectTrigger id="report_club_filter">
                    <SelectValue placeholder="All clubs" />
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
                <Button type="button" variant="outline" disabled={isDownloadingBulkReports} onClick={handleDownloadBulkReports}>
                  {isDownloadingBulkReports ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isDownloadingBulkReports ? "Preparing ZIP..." : "Download Filtered Reports ZIP"}
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NeoLoadingState title="Loading report archive" message="We are gathering post-event records." compact />
          ) : isError ? (
            <div className="nh-empty border-destructive bg-destructive/5">
              <p className="font-medium">Unable to load reports</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="nh-empty">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No event reports yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reports will appear here after presidents document events.
              </p>
            </div>
          ) : (
            <div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isDownloading={downloadingReportId === report.id}
                    isDownloadingMedia={downloadingMediaReportId === report.id}
                    onDownload={handleDownloadReport}
                    onDownloadMedia={handleDownloadMedia}
                  />
                  ))}
                </div>
              <DataPagination
                page={reportsPage.page}
                pageSize={reportsPage.page_size}
                total={reportsPage.total}
                hasNext={reportsPage.has_next}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
