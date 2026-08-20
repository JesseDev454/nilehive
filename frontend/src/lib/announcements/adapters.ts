import { unwrapPaginated } from "@/lib/approvals/adapters";
import type { PaginatedEnvelope } from "@/lib/people/types";
import type {
  AdminAnnouncementView,
  AnnouncementAudience,
  AnnouncementAudienceType,
  AnnouncementComposerInput,
  AnnouncementPriorityLevel,
  AnnouncementRecord,
  CreateAnnouncementPayload,
  TargetRoleType,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

const AUDIENCES: AnnouncementAudience[] = ["all_users", "all_clubs", "club", "role"];
const PRIORITIES: AnnouncementPriorityLevel[] = ["low", "normal", "high", "urgent"];
const ROLES: TargetRoleType[] = ["student", "executive", "president", "advisor", "admin"];

export function toUiAudience(audience: AnnouncementAudience | string | null): AnnouncementAudienceType {
  if (audience === "club") return "one_club";
  if (audience === "all_clubs" || audience === "role" || audience === "all_users") return audience;
  if (audience === "all") return "all_users";
  return "all_users";
}

export function toApiAudience(audience: AnnouncementAudienceType): AnnouncementAudience {
  if (audience === "one_club") return "club";
  return audience;
}

export function adaptAnnouncementRecord(value: unknown): AnnouncementRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const title = asString(record?.title);
  const message = asString(record?.message);
  if (!id || !title || !message) return null;

  const rawAudience = asString(record?.audience) || "all_users";
  const audience: AnnouncementAudience =
    rawAudience === "all" ? "all_users" : AUDIENCES.includes(rawAudience as AnnouncementAudience)
      ? (rawAudience as AnnouncementAudience)
      : "all_users";
  const rawPriority = asString(record?.priority) || "normal";
  const priority: AnnouncementPriorityLevel = PRIORITIES.includes(rawPriority as AnnouncementPriorityLevel)
    ? (rawPriority as AnnouncementPriorityLevel)
    : "normal";

  return {
    id,
    club_id: asString(record?.club_id),
    created_by: asString(record?.created_by),
    title,
    message,
    audience,
    priority,
    target_role: asString(record?.target_role),
    is_read: asBoolean(record?.is_read, false),
    read_at: asString(record?.read_at),
    created_at: asString(record?.created_at),
    updated_at: asString(record?.updated_at),
  };
}

export function adaptAnnouncementPage(value: unknown): PaginatedEnvelope<AnnouncementRecord> {
  const page = unwrapPaginated<unknown>(value);
  return {
    ...page,
    items: page.items
      .map(adaptAnnouncementRecord)
      .filter((item): item is AnnouncementRecord => Boolean(item)),
  };
}

export function toAdminAnnouncementView(
  record: AnnouncementRecord,
  options: {
    clubName?: string | null;
    publisherName?: string | null;
  } = {},
): AdminAnnouncementView {
  const targetRole = ROLES.includes(record.target_role as TargetRoleType)
    ? (record.target_role as TargetRoleType)
    : undefined;

  return {
    id: record.id,
    title: record.title,
    content: record.message,
    audience: toUiAudience(record.audience),
    targetClubId: record.club_id || undefined,
    targetClubName: options.clubName || undefined,
    targetRole: record.audience === "role" ? targetRole : undefined,
    priority: record.priority,
    publishedAt: record.created_at || new Date().toISOString(),
    publishedBy: options.publisherName || "Campus One publisher",
    readCount: null,
    totalRecipients: null,
  };
}

export function buildCreateAnnouncementPayload(input: AnnouncementComposerInput): CreateAnnouncementPayload {
  const audience = toApiAudience(input.audience);
  return {
    title: input.title.trim(),
    message: input.content.trim(),
    audience,
    priority: input.priority,
    club_id: audience === "club" ? input.targetClubId || null : null,
    target_role: audience === "role" ? input.targetRole || null : null,
  };
}

export interface ComposerValidationErrors {
  title?: string;
  content?: string;
  targetClubId?: string;
  targetRole?: string;
}

export function validateAnnouncementComposer(input: AnnouncementComposerInput): ComposerValidationErrors {
  const errors: ComposerValidationErrors = {};
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title) {
    errors.title = "Announcement title is required.";
  } else if (title.length < 5) {
    errors.title = "Title must be at least 5 characters.";
  } else if (title.length > 150) {
    errors.title = "Title cannot exceed 150 characters.";
  }

  if (!content) {
    errors.content = "Announcement message content is required.";
  } else if (content.length < 10) {
    errors.content = "Message content must be at least 10 characters.";
  }

  if (input.audience === "one_club" && !input.targetClubId) {
    errors.targetClubId = "Please select a target club.";
  }

  if (input.audience === "role" && !input.targetRole) {
    errors.targetRole = "Please select a target role.";
  }

  return errors;
}
