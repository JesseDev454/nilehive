import type {
  AdminFeedbackCategory,
  AdminFeedbackView,
  ApiFeedbackCategory,
  FeedbackAuthorRole,
  FeedbackRecord,
  FeedbackStatus,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const API_CATEGORIES: ApiFeedbackCategory[] = [
  "general",
  "event",
  "club",
  "onboarding",
  "club_joining",
  "dues_payment",
  "login_access",
];

const AUTHOR_ROLES: FeedbackAuthorRole[] = ["student", "executive", "president", "advisor", "admin"];

export function toUiFeedbackCategory(category: string | null | undefined): AdminFeedbackCategory {
  if (category === "club_joining") return "joining";
  if (category === "dues_payment") return "dues";
  if (
    category === "general" ||
    category === "club" ||
    category === "onboarding" ||
    category === "login_access" ||
    category === "event"
  ) {
    return category;
  }
  return "general";
}

export function toApiFeedbackCategory(category: AdminFeedbackCategory): ApiFeedbackCategory {
  if (category === "joining") return "club_joining";
  if (category === "dues") return "dues_payment";
  return category;
}

function titleFromComment(comment: string): string {
  const firstLine = comment.split(/\n/)[0]?.trim() || "Feedback";
  return firstLine.length > 90 ? `${firstLine.slice(0, 87).trimEnd()}…` : firstLine;
}

export function adaptFeedbackRecord(value: unknown): FeedbackRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const comment = asString(record?.comment);
  if (!id || !comment) return null;

  const rawCategory = asString(record?.category) || "general";
  const category = API_CATEGORIES.includes(rawCategory as ApiFeedbackCategory)
    ? (rawCategory as ApiFeedbackCategory)
    : rawCategory;

  const proposal = asRecord(record?.proposal);
  const club = asRecord(record?.club);
  const submitter = asRecord(record?.submitter);
  const rating = asNumber(record?.rating);

  return {
    id,
    club_id: asString(record?.club_id),
    proposal_id: asString(record?.proposal_id),
    submitted_by: asString(record?.submitted_by),
    category,
    rating: rating !== null && rating >= 1 && rating <= 5 ? rating : null,
    comment,
    status: asString(record?.status) || "open",
    proposal: proposal && asString(proposal.id)
      ? {
          id: asString(proposal.id) as string,
          title: asString(proposal.title),
          proposed_activity: asString(proposal.proposed_activity),
          event_date: asString(proposal.event_date),
        }
      : null,
    club: club && asString(club.id) && asString(club.name)
      ? {
          id: asString(club.id) as string,
          name: asString(club.name) as string,
          code: asString(club.code),
        }
      : null,
    submitter: submitter && asString(submitter.id)
      ? {
          id: asString(submitter.id) as string,
          full_name: asString(submitter.full_name),
          role: asString(submitter.role),
          student_id: asString(submitter.student_id),
        }
      : null,
    created_at: asString(record?.created_at),
    updated_at: asString(record?.updated_at),
  };
}

export function adaptFeedbackList(value: unknown): FeedbackRecord[] {
  if (Array.isArray(value)) {
    return value.map(adaptFeedbackRecord).filter((item): item is FeedbackRecord => Boolean(item));
  }
  const record = asRecord(value);
  if (record && Array.isArray(record.items)) {
    return record.items.map(adaptFeedbackRecord).filter((item): item is FeedbackRecord => Boolean(item));
  }
  const single = adaptFeedbackRecord(value);
  return single ? [single] : [];
}

export function toAdminFeedbackView(record: FeedbackRecord): AdminFeedbackView {
  const authorRoleRaw = record.submitter?.role || "";
  const authorRole: FeedbackAuthorRole = AUTHOR_ROLES.includes(authorRoleRaw as FeedbackAuthorRole)
    ? (authorRoleRaw as FeedbackAuthorRole)
    : "student";
  const authorName = record.submitter?.full_name?.trim() || "Submitter on record";
  const clubName = record.club?.name || undefined;
  const status: FeedbackStatus | string = record.status || "open";

  return {
    id: record.id,
    category: toUiFeedbackCategory(String(record.category)),
    title: titleFromComment(record.comment),
    message: record.comment,
    authorName,
    authorRole,
    studentId: record.submitter?.student_id || undefined,
    clubName,
    submittedAt: record.created_at || new Date(0).toISOString(),
    rating: record.rating ?? undefined,
    status,
    identityAvailable: Boolean(record.submitter?.full_name),
  };
}
