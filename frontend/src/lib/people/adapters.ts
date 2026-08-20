import { unwrapPaginated as unwrapSharedPaginated } from "@/lib/approvals/adapters";
import type {
  AdminUserRecord,
  AdvisorAssignmentRecord,
  AdvisorAssignmentView,
  AssignableOneClubRole,
  AssignmentClub,
  PaginatedEnvelope,
  PersonDirectoryView,
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

function clubName(club: unknown, fallbackId: string | null): string | null {
  const record = asRecord(club);
  return asString(record?.name) || fallbackId;
}

export function unwrapPaginated<T>(value: unknown): PaginatedEnvelope<T> {
  return unwrapSharedPaginated<T>(value);
}

export function adaptAssignmentClub(record: unknown): AssignmentClub | null {
  const value = asRecord(record);
  const id = asString(value?.id);
  const name = asString(value?.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    code: asString(value?.code),
  };
}

export function adaptAdvisorAssignment(record: AdvisorAssignmentRecord): AdvisorAssignmentView {
  return {
    id: record.id,
    club_id: asString(record.club_id) || "",
    club_name: clubName(record.club, asString(record.club_id)) || "Club unavailable",
  };
}

export function accountStatusLabel(status: string | null): string {
  const normalized = (status || "active").trim().toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "suspended") return "Suspended";
  if (normalized === "inactive") return "Inactive";
  return status || "Unknown";
}

export function campusOneBaseRoleLabel(studentType: string | null): string | null {
  return asString(studentType);
}

export function isAssignableOneClubRole(role: string): role is AssignableOneClubRole {
  return role === "student" || role === "executive" || role === "president" || role === "advisor";
}

export function adaptAdminUser(record: AdminUserRecord): PersonDirectoryView {
  const assignments = Array.isArray(record.advisor_assignments)
    ? record.advisor_assignments.map(adaptAdvisorAssignment)
    : [];
  const assignedClubId = asString(record.club_id) || asString(record.club?.id);
  const assignedClubName = clubName(record.club, assignedClubId);

  return {
    id: record.id,
    fullName: asString(record.full_name) || "Unnamed campus member",
    campusId: asString(record.student_id),
    email: asString(record.email),
    portalUserId: asString(record.portal_user_id),
    campusOneBaseRole: campusOneBaseRoleLabel(record.student_type),
    department: asString(record.department),
    faculty: null,
    accountStatus: accountStatusLabel(record.account_status),
    oneClubRole: asString(record.app_role) || asString(record.role) || "student",
    assignedClubId,
    assignedClubName,
    advisorAssignments: assignments,
    requestedRole: asString(record.requested_role),
    onboardingStatus: asString(record.onboarding_status),
    portalRole: asString(record.portal_role),
    customRoles: asStringArray(record.custom_roles),
    effectiveRole: asString(record.effective_role),
    createdAt: asString(record.created_at),
    updatedAt: asString(record.updated_at),
    joinedClubsCount: null,
  };
}

export function adaptAdminUserList(page: PaginatedEnvelope<AdminUserRecord>): PaginatedEnvelope<PersonDirectoryView> {
  return {
    ...page,
    items: page.items.map(adaptAdminUser),
  };
}
