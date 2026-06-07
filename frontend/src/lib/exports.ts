import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type {
  AdminClubDashboardRecord,
  AdminOperationsDashboardRecord,
  FeedbackRecord,
  EventReportRecord
} from "@/lib/api";

const A4_PAGE = [595.28, 841.89] as const;
const PAGE_MARGIN = 48;
const BODY_FONT_SIZE = 11;
const SMALL_FONT_SIZE = 9;
const SECTION_TITLE_SIZE = 13;
const TITLE_FONT_SIZE = 20;
const SUBTITLE_FONT_SIZE = 12;
const LINE_GAP = 4;

function sanitizeFilenamePart(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "export";
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-NG") : "Not recorded";
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString("en-NG") : "Not recorded";
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatPdfCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "code",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function createCsvValue(value: string | number | null | undefined) {
  const normalized = value ?? "";
  const text = typeof normalized === "number" ? String(normalized) : normalized;
  return `"${String(text).replace(/"/g, "\"\"")}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function inferExtension(url: string, contentType: string | null) {
  const normalizedType = (contentType || "").toLowerCase();

  if (normalizedType.includes("png")) {
    return "png";
  }

  if (normalizedType.includes("jpeg") || normalizedType.includes("jpg")) {
    return "jpg";
  }

  if (normalizedType.includes("webp")) {
    return "webp";
  }

  if (normalizedType.includes("gif")) {
    return "gif";
  }

  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop()?.toLowerCase();

    if (extension && extension.length <= 5) {
      return extension;
    }
  } catch {
    return "jpg";
  }

  return "jpg";
}

async function createPdfBuilder() {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let page = pdfDoc.addPage(A4_PAGE);
  let cursorY = page.getHeight() - PAGE_MARGIN;

  function ensureSpace(heightNeeded: number) {
    if (cursorY - heightNeeded >= PAGE_MARGIN) {
      return;
    }

    page = pdfDoc.addPage(A4_PAGE);
    cursorY = page.getHeight() - PAGE_MARGIN;
  }

  function drawTextLine(
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      x?: number;
    } = {}
  ) {
    const font = options.font ?? regularFont;
    const size = options.size ?? BODY_FONT_SIZE;
    const color = options.color ?? rgb(0.12, 0.12, 0.12);
    const x = options.x ?? PAGE_MARGIN;
    const lineHeight = size + LINE_GAP;
    ensureSpace(lineHeight);
    page.drawText(text, {
      x,
      y: cursorY,
      size,
      font,
      color
    });
    cursorY -= lineHeight;
  }

  function drawWrappedText(
    text: string,
    options: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      x?: number;
      maxWidth?: number;
    } = {}
  ) {
    const font = options.font ?? regularFont;
    const size = options.size ?? BODY_FONT_SIZE;
    const color = options.color ?? rgb(0.12, 0.12, 0.12);
    const x = options.x ?? PAGE_MARGIN;
    const maxWidth = options.maxWidth ?? page.getWidth() - PAGE_MARGIN * 2;
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, size);

      if (width <= maxWidth || !currentLine) {
        currentLine = candidate;
        return;
      }

      lines.push(currentLine);
      currentLine = word;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    lines.forEach((line) => {
      drawTextLine(line, { font, size, color, x });
    });
  }

  function drawSpacer(size = 10) {
    cursorY -= size;
  }

  function drawSectionTitle(title: string) {
    drawSpacer(4);
    drawTextLine(title, {
      font: boldFont,
      size: SECTION_TITLE_SIZE,
      color: rgb(0.08, 0.29, 0.56)
    });
    drawSpacer(2);
  }

  async function drawOptionalImage(url: string | null | undefined, label: string) {
    if (!url) {
      return false;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return false;
      }

      const bytes = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "";
      const image = contentType.includes("png")
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);
      const maxWidth = page.getWidth() - PAGE_MARGIN * 2;
      const dimensions = image.scale(1);
      const widthRatio = maxWidth / dimensions.width;
      const heightRatio = 180 / dimensions.height;
      const scale = Math.min(widthRatio, heightRatio, 1);
      const width = dimensions.width * scale;
      const height = dimensions.height * scale;

      ensureSpace(height + 28);
      drawTextLine(label, {
        font: boldFont,
        size: SMALL_FONT_SIZE,
        color: rgb(0.45, 0.45, 0.45)
      });
      page.drawImage(image, {
        x: PAGE_MARGIN,
        y: cursorY - height,
        width,
        height
      });
      cursorY -= height + 14;
      return true;
    } catch {
      return false;
    }
  }

  return {
    pdfDoc,
    regularFont,
    boldFont,
    drawTextLine,
    drawWrappedText,
    drawSectionTitle,
    drawSpacer,
    drawOptionalImage,
    save: () => pdfDoc.save()
  };
}

async function buildEventReportPdf(report: EventReportRecord) {
  const title = report.proposal?.proposed_activity || report.proposal?.title || "Completed Event";
  const builder = await createPdfBuilder();
  const mediaCount = report.media_urls.length;
  const firstMediaUrl = report.media_urls[0];

  builder.drawTextLine("Club Services", {
    font: builder.boldFont,
    size: TITLE_FONT_SIZE,
    color: rgb(0.08, 0.29, 0.56)
  });
  builder.drawTextLine("Official Event Report", {
    font: builder.boldFont,
    size: SUBTITLE_FONT_SIZE,
    color: rgb(0.32, 0.32, 0.32)
  });
  builder.drawSpacer(10);
  builder.drawTextLine(report.club?.name || "Club not recorded", {
    font: builder.boldFont,
    size: SUBTITLE_FONT_SIZE
  });
  builder.drawWrappedText(title, {
    font: builder.boldFont,
    size: 16
  });
  builder.drawSpacer(8);

  const imageEmbedded = await builder.drawOptionalImage(firstMediaUrl, "Event media preview");

  builder.drawSectionTitle("Event Details");
  builder.drawTextLine(`Event Date: ${formatDate(report.proposal?.event_date)}`);
  builder.drawTextLine(`Event Time: ${report.proposal?.event_time?.slice(0, 5) || "Not recorded"}`);
  builder.drawTextLine(`Venue: ${report.proposal?.location || "Not recorded"}`);
  builder.drawSpacer();

  builder.drawSectionTitle("Report Details");
  builder.drawTextLine(`Submitted: ${formatDateTime(report.submitted_at)}`);
  builder.drawTextLine(`Status: ${report.status}`);
  builder.drawTextLine(`Attendance Count: ${report.attendance_count}`);
  builder.drawTextLine(`Budget Used: ${report.budget_used === null ? "Not recorded" : formatPdfCurrency(report.budget_used)}`);
  builder.drawSpacer();

  builder.drawSectionTitle("Summary");
  builder.drawWrappedText(report.summary);

  if (report.outcomes) {
    builder.drawSectionTitle("Outcomes");
    builder.drawWrappedText(report.outcomes);
  }

  if (report.challenges) {
    builder.drawSectionTitle("Challenges");
    builder.drawWrappedText(report.challenges);
  }

  builder.drawSectionTitle("Media");
  if (!mediaCount) {
    builder.drawTextLine("No media attached.");
  } else {
    if (!imageEmbedded && firstMediaUrl) {
      builder.drawTextLine("Preview image could not be embedded, but media is still attached.");
    }
    builder.drawTextLine(`Primary media shown: ${imageEmbedded ? "Yes" : "No"}`);
    builder.drawTextLine(`Additional media: ${Math.max(mediaCount - 1, 0)} file(s)`);
  }

  const bytes = await builder.save();
  const filename = [
    sanitizeFilenamePart(report.club?.name || "Club"),
    sanitizeFilenamePart(title),
    "EventReport",
    sanitizeFilenamePart(report.proposal?.event_date || new Date().toISOString().slice(0, 10))
  ].join("-");

  return { bytes, filename: `${filename}.pdf` };
}

export async function downloadEventReportPdf(report: EventReportRecord) {
  const { bytes, filename } = await buildEventReportPdf(report);
  downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
}

export async function downloadEventReportsZip(reports: EventReportRecord[]) {
  const zip = new JSZip();

  for (const report of reports) {
    const { bytes, filename } = await buildEventReportPdf(report);
    zip.file(filename, bytes);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `Club-Services-Event-Reports-${new Date().toISOString().slice(0, 10)}.zip`);
}

export function downloadAdminPerformanceMatrixCsv(dashboard: AdminOperationsDashboardRecord) {
  const currentLabel = dashboard.dues_comparison_context.current_academic_session;
  const previousLabel = dashboard.dues_comparison_context.previous_academic_session || "Previous session";
  const headers = [
    "Club Name",
    "Club Code",
    "Club Health Score",
    "Club Health Label",
    "Total Members",
    "Active Members",
    "Pending Proposals",
    "Approved Events",
    "Dues Collected Amount",
    "Dues Collection Rate",
    "Reports Submitted",
    "Feedback Count",
    "Attendance Count",
    "RSVP Count",
    "Attendance Rate",
    "Open Tasks",
    `${currentLabel} Dues Collected`,
    `${previousLabel} Dues Collected`,
    "Dues Change Amount",
    "Last Activity"
  ];
  const rows = dashboard.club_performance.map((club) => [
    club.club_name,
    club.club_code || "",
    club.club_health_score,
    club.club_health_label,
    club.total_members,
    club.active_members,
    club.pending_proposals,
    club.approved_events,
    club.dues_collected_amount,
    club.dues_collection_rate,
    club.reports_submitted,
    club.feedback_count,
    club.attendance_count,
    club.rsvp_count,
    club.rsvp_count > 0 ? Math.min(100, Math.round((club.attendance_count / club.rsvp_count) * 100)) : 0,
    club.open_tasks,
    club.current_session_dues_collected,
    club.previous_session_dues_collected,
    club.dues_change_amount,
    club.last_activity_at ? formatDate(club.last_activity_at) : ""
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => createCsvValue(value)).join(","))
    .join("\r\n");
  const filename = `Club-Services-Performance-Matrix-${new Date().toISOString().slice(0, 10)}.csv`;

  downloadBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }), filename);
}

export function downloadFeedbackCsv(
  feedback: FeedbackRecord[],
  options: {
    clubNameById?: Map<string, string>;
    filenameSuffix?: string;
  } = {}
) {
  const headers = [
    "Club",
    "Event",
    "Category",
    "Rating",
    "Comment",
    "Status",
    "Submitted Date"
  ];
  const rows = feedback.map((entry) => {
    const eventName = entry.proposal?.proposed_activity || entry.proposal?.title || "";

    return [
      entry.club_id ? options.clubNameById?.get(entry.club_id) || entry.club_id : "No club",
      eventName,
      entry.category,
      entry.rating ?? "",
      entry.comment,
      entry.status,
      formatDateTime(entry.created_at)
    ];
  });
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => createCsvValue(value)).join(","))
    .join("\r\n");
  const suffix = options.filenameSuffix ? `-${sanitizeFilenamePart(options.filenameSuffix)}` : "";
  const filename = `Club-Services-Feedback${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;

  downloadBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }), filename);
}

export async function downloadReportMediaZip(report: EventReportRecord) {
  if (!report.media_urls.length) {
    throw new Error("No media files are attached to this report.");
  }

  const title = report.proposal?.proposed_activity || report.proposal?.title || "Completed Event";
  const zip = new JSZip();
  let downloadedCount = 0;
  let failedCount = 0;

  for (const [index, mediaUrl] of report.media_urls.entries()) {
    try {
      const response = await fetch(mediaUrl);

      if (!response.ok) {
        throw new Error(`Could not fetch media file ${index + 1}`);
      }

      const bytes = await response.arrayBuffer();
      const extension = inferExtension(mediaUrl, response.headers.get("content-type"));
      const fileName = `${String(index + 1).padStart(2, "0")}-${sanitizeFilenamePart(title)}.${extension}`;

      zip.file(fileName, bytes);
      downloadedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  if (!downloadedCount) {
    throw new Error("No report images could be downloaded.");
  }

  const bytes = await zip.generateAsync({ type: "uint8array" });
  const filename = [
    sanitizeFilenamePart(report.club?.name || "Club"),
    sanitizeFilenamePart(title),
    "ReportImages",
    sanitizeFilenamePart(report.proposal?.event_date || new Date().toISOString().slice(0, 10))
  ].join("-");

  downloadBlob(new Blob([bytes], { type: "application/zip" }), `${filename}.zip`);

  return {
    downloadedCount,
    failedCount
  };
}

export async function downloadAdminClubPerformancePdf(dashboard: AdminClubDashboardRecord) {
  const builder = await createPdfBuilder();
  const currentLabel = dashboard.dues_comparison.current_academic_session;
  const previousLabel = dashboard.dues_comparison.previous_academic_session || "Previous session";

  builder.drawTextLine("Club Services", {
    font: builder.boldFont,
    size: TITLE_FONT_SIZE,
    color: rgb(0.08, 0.29, 0.56)
  });
  builder.drawTextLine("Club Performance Summary", {
    font: builder.boldFont,
    size: SUBTITLE_FONT_SIZE,
    color: rgb(0.32, 0.32, 0.32)
  });
  builder.drawSpacer(10);
  builder.drawTextLine(dashboard.club.name, {
    font: builder.boldFont,
    size: 16
  });
  builder.drawTextLine(`Generated: ${formatDateTime(new Date().toISOString())}`);

  builder.drawSectionTitle("Club Health Score");
  builder.drawTextLine(`Overall Score: ${dashboard.summary.club_health_score}`);
  builder.drawTextLine(`Health Label: ${dashboard.summary.club_health_label}`);

  builder.drawSectionTitle("Membership Snapshot");
  builder.drawTextLine(`Total Members: ${dashboard.summary.total_members}`);
  builder.drawTextLine(`Active Members: ${dashboard.summary.active_members}`);
  builder.drawTextLine(`Pending Membership Requests: ${dashboard.summary.pending_membership_requests}`);

  builder.drawSectionTitle("Proposal And Event Summary");
  builder.drawTextLine(`Total Proposals: ${dashboard.summary.total_proposals}`);
  builder.drawTextLine(`Pending Proposals: ${dashboard.summary.pending_proposals}`);
  builder.drawTextLine(`Approved Events: ${dashboard.summary.approved_events}`);
  builder.drawTextLine(`Reports Submitted: ${dashboard.summary.reports_submitted}`);
  builder.drawTextLine(`Missing Reports: ${dashboard.summary.missing_reports}`);

  builder.drawSectionTitle("Dues Performance");
  builder.drawTextLine(`Total Dues Collected: ${formatPdfCurrency(dashboard.summary.dues_collected_amount)}`);
  builder.drawTextLine(`Dues Collection Rate: ${dashboard.summary.dues_collection_rate}%`);
  builder.drawTextLine(`${currentLabel}: ${formatPdfCurrency(dashboard.dues_comparison.current_session_dues_collected)}`);
  builder.drawTextLine(`${previousLabel}: ${formatPdfCurrency(dashboard.dues_comparison.previous_session_dues_collected)}`);
  builder.drawTextLine(`Change: ${formatPdfCurrency(dashboard.dues_comparison.dues_change_amount)}`);

  builder.drawSectionTitle("Tasks, Reports, And Feedback");
  builder.drawTextLine(`Open Tasks: ${dashboard.summary.open_tasks}`);
  builder.drawTextLine(`Attendance Rate: ${dashboard.summary.attendance_rate}%`);
  builder.drawTextLine(`Feedback Records: ${dashboard.summary.feedback_count}`);
  builder.drawTextLine(`Average Rating: ${dashboard.summary.average_rating ?? "Not recorded"}`);

  if (dashboard.recent_activity.length) {
    builder.drawSectionTitle("Recent Activity");
    dashboard.recent_activity.slice(0, 6).forEach((activity) => {
      builder.drawWrappedText(`- ${activity.title}: ${activity.message}`);
    });
  }

  if (dashboard.tasks.length) {
    builder.drawSectionTitle("Task Oversight");
    dashboard.tasks.slice(0, 5).forEach((task) => {
      builder.drawWrappedText(`- ${task.title} (${task.status.replace(/_/g, " ")}) - assigned to ${task.assigned_to_profile?.full_name || task.assigned_to}`);
    });
  }

  const bytes = await builder.save();
  const filename = `${sanitizeFilenamePart(dashboard.club.name)}-Performance-${new Date().toISOString().slice(0, 10)}.pdf`;

  downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
}
