import { unwrapPaginated } from "@/lib/approvals/adapters";
import type { PaginatedEnvelope } from "@/lib/people/types";
import { sanitizeAdminDeepLink } from "./deepLinks";
import type {
  AdminNotificationCategory,
  AdminNotificationView,
  NotificationRecord,
  NotificationRelatedRecordType,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const TYPE_TITLES: Record<string, string> = {
  announcement_published: "New announcement",
  proposal_submitted: "Proposal needs review",
  proposal_resubmitted: "Proposal resubmitted",
  advisor_approved: "Advisor approved proposal",
  advisor_rejected: "Advisor rejected proposal",
  pending_admin_review: "Proposal needs admin review",
  admin_approved: "Proposal approved",
  admin_rejected: "Proposal rejected",
  event_reminder: "Event reminder",
  event_report_submitted: "Event report submitted",
  missing_report_prompt: "Event report is due",
  dues_proof_rejected: "Dues proof needs another upload",
};

interface TypeMeta {
  category: AdminNotificationCategory;
  relatedRecordType: NotificationRelatedRecordType;
  destinationUrl: string;
  destinationLabel: string;
  source: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  proposal_submitted: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Review in Approvals",
    source: "Proposal submissions",
  },
  proposal_resubmitted: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Review in Approvals",
    source: "Proposal submissions",
  },
  advisor_approved: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Review in Approvals",
    source: "Advisor review",
  },
  advisor_rejected: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Open Approvals",
    source: "Advisor review",
  },
  pending_admin_review: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Review in Approvals",
    source: "Proposal submissions",
  },
  admin_approved: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/events",
    destinationLabel: "Open Campus Events",
    source: "Proposal decisions",
  },
  admin_rejected: {
    category: "proposal",
    relatedRecordType: "proposal",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Open Approvals",
    source: "Proposal decisions",
  },
  announcement_published: {
    category: "announcement",
    relatedRecordType: "announcement",
    destinationUrl: "/admin/announcements",
    destinationLabel: "View in Announcements",
    source: "Directorate broadcasts",
  },
  event_reminder: {
    category: "event",
    relatedRecordType: "event",
    destinationUrl: "/admin/events",
    destinationLabel: "Open Campus Events",
    source: "Campus events",
  },
  event_report_submitted: {
    category: "event",
    relatedRecordType: "event",
    destinationUrl: "/admin/events",
    destinationLabel: "Open Campus Events",
    source: "Event reports",
  },
  missing_report_prompt: {
    category: "event",
    relatedRecordType: "event",
    destinationUrl: "/admin/events",
    destinationLabel: "Open Campus Events",
    source: "Event reports",
  },
  dues_proof_rejected: {
    category: "dues_proof",
    relatedRecordType: "payment",
    destinationUrl: "/admin/approvals",
    destinationLabel: "Review in Approvals",
    source: "Dues verification",
  },
};

const FALLBACK_META: TypeMeta = {
  category: "system",
  relatedRecordType: "general",
  destinationUrl: "/admin/notifications",
  destinationLabel: "Stay in Notifications",
  source: "OneClub",
};

export function notificationTitleForType(type: string): string {
  return TYPE_TITLES[type] ?? "OneClub notification";
}

export function adaptNotificationRecord(value: unknown): NotificationRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const message = asString(record?.message);
  if (!id || !message) return null;

  return {
    id,
    user_id: asString(record?.user_id),
    proposal_id: asString(record?.proposal_id),
    announcement_id: asString(record?.announcement_id),
    type: asString(record?.type) || "system",
    message,
    delivery_status: asString(record?.delivery_status),
    read_at: asString(record?.read_at),
    created_at: asString(record?.created_at),
  };
}

export function adaptNotificationPage(value: unknown): PaginatedEnvelope<NotificationRecord> {
  const page = unwrapPaginated<unknown>(value);
  return {
    ...page,
    items: page.items.map(adaptNotificationRecord).filter((item): item is NotificationRecord => Boolean(item)),
  };
}

export function toAdminNotificationView(record: NotificationRecord): AdminNotificationView {
  const meta = TYPE_META[record.type] ?? FALLBACK_META;
  const relatedRecordId = record.proposal_id || record.announcement_id || undefined;
  return {
    id: record.id,
    category: meta.category,
    title: notificationTitleForType(record.type),
    message: record.message,
    timestamp: record.created_at || new Date(0).toISOString(),
    isRead: Boolean(record.read_at),
    relatedRecordType: meta.relatedRecordType,
    relatedRecordId,
    destinationUrl: sanitizeAdminDeepLink(meta.destinationUrl),
    destinationLabel: meta.destinationLabel,
    source: meta.source,
    type: record.type,
  };
}
