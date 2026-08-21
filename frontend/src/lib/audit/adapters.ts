import type { PaginatedEnvelope } from "@/lib/people/types";
import type { AuditActor, AuditClub, AuditLogRecord } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function adaptActor(value: unknown): AuditActor | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: asString(record.id),
    full_name: asString(record.full_name),
    role: asString(record.role),
    student_id: asString(record.student_id),
  };
}

function adaptClub(value: unknown): AuditClub | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: asString(record.id),
    name: asString(record.name),
    code: asString(record.code),
  };
}

function adaptMetadata(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  return record ?? {};
}

export function isRedactedValue(value: unknown): boolean {
  const record = asRecord(value);
  return Boolean(record && record.redacted === true && Object.keys(record).length === 1);
}

export function adaptAuditLogRecord(value: unknown): AuditLogRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const createdAt = asString(record?.created_at);
  if (!record || !id || !createdAt) return null;
  return {
    id,
    actor_id: asString(record.actor_id),
    actor: adaptActor(record.actor),
    action: asString(record.action) || "unknown_action",
    entity_type: asString(record.entity_type) || "unknown",
    entity_id: asString(record.entity_id),
    target_profile_id: asString(record.target_profile_id),
    target: adaptActor(record.target),
    club_id: asString(record.club_id),
    club: adaptClub(record.club),
    proposal_id: asString(record.proposal_id),
    due_payment_id: asString(record.due_payment_id),
    leadership_application_id: asString(record.leadership_application_id),
    announcement_id: asString(record.announcement_id),
    remarks: asString(record.remarks),
    metadata: adaptMetadata(record.metadata),
    created_at: createdAt,
  };
}

export function adaptAuditLogPage(value: unknown): PaginatedEnvelope<AuditLogRecord> {
  const record = asRecord(value);
  const rawItems = Array.isArray(record?.items) ? record.items : Array.isArray(value) ? value : [];
  const items = rawItems.map(adaptAuditLogRecord).filter((item): item is AuditLogRecord => Boolean(item));
  const page = Math.max(1, asNumber(record?.page, 1));
  const pageSize = Math.max(1, asNumber(record?.page_size, items.length || 20));
  const total = Math.max(0, asNumber(record?.total, items.length));
  return {
    items,
    page,
    page_size: pageSize,
    total,
    has_next: Boolean(record?.has_next) || page * pageSize < total,
  };
}

export const ACTION_LABELS: Record<string, string> = {
  proposal_reviewed: "Proposal reviewed",
  membership_request_reviewed: "Membership request reviewed",
  dues_payment_reviewed: "Dues payment reviewed",
  role_updated: "Role updated",
  advisor_assigned: "Advisor assigned",
  club_created: "Club created",
  club_updated: "Club updated",
  club_deleted: "Club deleted",
  club_profile_updated: "Club profile updated",
  club_media_added: "Club media added",
  club_media_updated: "Club media updated",
  club_media_deleted: "Club media deleted",
  announcement_published: "Announcement published",
  leadership_application_reviewed: "Leadership application reviewed",
  whatsapp_group_member_marked_added: "WhatsApp onboarding marked added",
};

export const ENTITY_LABELS: Record<string, string> = {
  proposal: "Proposal",
  due_payment: "Dues payment",
  profile: "Profile",
  club: "Club",
  club_media: "Club media",
  announcement: "Announcement",
  leadership_application: "Leadership application",
  membership_request: "Membership request",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, " ");
}

export function entityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] || entityType.replace(/_/g, " ");
}

export function actorDisplayName(actor: AuditActor | null): string {
  if (!actor) return "Unknown actor";
  return actor.full_name || "Deleted or unavailable actor";
}
