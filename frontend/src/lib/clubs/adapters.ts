import { unwrapPaginated } from "@/lib/approvals/adapters";
import type { AdminUserRecord, PaginatedEnvelope } from "@/lib/people/types";
import type {
  AdminClubView,
  ClubBankDetails,
  ClubLeaderView,
  ClubMemberRecord,
  ClubMemberView,
  ClubPaymentSettingsRecord,
  ClubRecord,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter((item): item is string => Boolean(item));
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function publicCoverFromLogo(logoPath: string | null): string | null {
  if (!logoPath) return null;
  if (/^https?:\/\//i.test(logoPath)) return logoPath;
  return null;
}

export function adaptClubRecord(value: unknown): ClubRecord | null {
  const record = asRecord(value);
  const id = asString(record?.id);
  const name = asString(record?.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    code: asString(record?.code),
    description: asString(record?.description),
    advisor_id: asString(record?.advisor_id),
    dues_amount: asNumber(record?.dues_amount, 10000),
    is_public_signup: asBoolean(record?.is_public_signup, true),
    whatsapp_group_name: asString(record?.whatsapp_group_name),
    whatsapp_onboarding_notes: asString(record?.whatsapp_onboarding_notes),
    categories: asStringArray(record?.categories),
    skills_offered: asStringArray(record?.skills_offered),
    career_goals: asStringArray(record?.career_goals),
    meeting_windows: asStringArray(record?.meeting_windows),
    weekly_commitment: asString(record?.weekly_commitment),
    logo_path: asString(record?.logo_path),
    website_url: asString(record?.website_url),
    social_links: asRecord(record?.social_links)
      ? Object.fromEntries(
          Object.entries(asRecord(record?.social_links) ?? {})
            .map(([key, item]) => [key, asString(item)])
            .filter((entry): entry is [string, string] => Boolean(entry[1])),
        )
      : {},
    created_at: asString(record?.created_at),
  };
}

export function adaptClubList(value: unknown): ClubRecord[] {
  if (!Array.isArray(value)) return [];
  return value.map(adaptClubRecord).filter((club): club is ClubRecord => Boolean(club));
}

export function adaptPaymentSettings(value: unknown): ClubPaymentSettingsRecord | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    id: asString(record.id),
    club_id: asString(record.club_id),
    bank_name: asString(record.bank_name),
    account_number: asString(record.account_number),
    account_name: asString(record.account_name),
    payment_instructions: asString(record.payment_instructions),
    fresher_dues_amount: record.fresher_dues_amount == null ? null : asNumber(record.fresher_dues_amount, 10000),
    returning_student_dues_amount:
      record.returning_student_dues_amount == null ? null : asNumber(record.returning_student_dues_amount, 10000),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at),
  };
}

export function adaptClubMember(value: unknown): ClubMemberView | null {
  const record = asRecord(value) as ClubMemberRecord | Record<string, unknown> | null;
  if (!record) return null;
  const id = asString(record.id);
  const clubId = asString(record.club_id);
  if (!id || !clubId) return null;
  return {
    id,
    clubId,
    profileId: asString(record.profile_id),
    fullName: asString(record.full_name) || "Unnamed member",
    studentId: asString(record.student_id),
    email: asString(record.email),
    clubRole: asString(record.club_role),
    membershipStatus: asString(record.membership_status),
    joinedAt: asString(record.created_at),
  };
}

export function adaptClubMemberPage(value: unknown): PaginatedEnvelope<ClubMemberView> {
  const page = unwrapPaginated<unknown>(value);
  return {
    ...page,
    items: page.items.map(adaptClubMember).filter((member): member is ClubMemberView => Boolean(member)),
  };
}

export function bankDetailsFromSettings(settings: ClubPaymentSettingsRecord | null): ClubBankDetails | null {
  if (!settings) return null;
  if (!settings.bank_name && !settings.account_number && !settings.account_name) return null;
  return {
    bankName: settings.bank_name || "Not provided",
    accountNumber: settings.account_number || "Not provided",
    accountName: settings.account_name || "Not provided",
    narrationGuideline: "Not a separate backend field",
    proofInstructions: settings.payment_instructions || "Not provided",
  };
}

export function leaderFromAdminUser(user: AdminUserRecord): ClubLeaderView {
  return {
    id: user.id,
    fullName: asString(user.full_name) || "Unnamed person",
    email: asString(user.email),
    studentId: asString(user.student_id),
  };
}

export function adaptAdminClubView(
  record: ClubRecord,
  extras: {
    president?: ClubLeaderView | null;
    advisors?: ClubLeaderView[];
    executives?: ClubLeaderView[];
    members?: ClubMemberView[];
    memberCount?: number | null;
    payment?: ClubPaymentSettingsRecord | null;
    paymentLoaded?: boolean;
  } = {},
): AdminClubView {
  const categories = record.categories;
  const advisors = extras.advisors ?? [];
  const primaryAdvisor = advisors[0] ?? null;

  return {
    id: record.id,
    name: record.name,
    code: record.code,
    description: record.description || "No description has been stored for this club.",
    categoryLabel: categories[0] || "Uncategorized",
    categories,
    duesAmount: record.dues_amount,
    presidentName: extras.president?.fullName ?? null,
    presidentEmail: extras.president?.email ?? null,
    presidentId: extras.president?.id ?? null,
    advisorName: primaryAdvisor?.fullName ?? null,
    advisorEmail: primaryAdvisor?.email ?? null,
    advisorId: primaryAdvisor?.id ?? null,
    advisors,
    executives: extras.executives ?? [],
    meetingWindows: record.meeting_windows,
    weeklyCommitment: record.weekly_commitment,
    location: null,
    meetingSchedule: null,
    memberCount: extras.memberCount ?? extras.members?.length ?? null,
    isPublicSignup: record.is_public_signup,
    coverImage: publicCoverFromLogo(record.logo_path),
    tags: categories,
    bankDetails: extras.paymentLoaded ? bankDetailsFromSettings(extras.payment ?? null) : null,
    adminOnlyWhatsAppNotes: record.whatsapp_onboarding_notes,
    whatsappGroupName: record.whatsapp_group_name,
    websiteUrl: record.website_url,
    logoPath: record.logo_path,
    createdAt: record.created_at,
    members: extras.members ?? [],
    paymentLoaded: extras.paymentLoaded ?? false,
    supportsLocation: false,
    supportsMeetingSchedule: false,
    supportsCoverUrl: false,
    supportsFreeformTags: false,
    supportsArchive: false,
    supportsDelete: false,
    supportsLogoUpload: false,
    supportsCreate: false,
  };
}

export function mergeClubView(current: AdminClubView, next: Partial<AdminClubView>): AdminClubView {
  return { ...current, ...next };
}

export function meetingWindowLabel(value: string): string {
  if (value === "weekday_daytime") return "Weekday daytime";
  if (value === "weekday_evening") return "Weekday evening";
  if (value === "weekend") return "Weekend";
  if (value === "flexible") return "Flexible";
  return value;
}

export function membershipStatusLabel(value: string | null): string {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  if (value === "alumni") return "Alumni";
  return value || "Unknown";
}

export function clubRoleLabel(value: string | null): string {
  if (value === "president") return "President";
  if (value === "executive") return "Executive";
  if (value === "member") return "Member";
  return value || "Member";
}
