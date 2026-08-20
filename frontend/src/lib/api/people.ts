import { apiRequest } from "./client";
import { adaptAdminUser, adaptAdminUserList, adaptAssignmentClub, unwrapPaginated } from "@/lib/people/adapters";
import type {
  AdminAdvisorAssignmentResult,
  AdminUserRecord,
  AdminUserRoleUpdateResult,
  AdvisorAssignmentPayload,
  AssignmentClub,
  ListAdminUsersQuery,
  PaginatedEnvelope,
  PersonDirectoryView,
  RoleUpdatePayload,
} from "@/lib/people/types";

function queryString(filters: ListAdminUsersQuery): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.role) params.set("role", filters.role);
  if (filters.club_id) params.set("club_id", filters.club_id);
  if (filters.q) params.set("q", filters.q);
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export async function listAdminUsers(
  filters: ListAdminUsersQuery = {},
): Promise<PaginatedEnvelope<AdminUserRecord>> {
  const payload = await apiRequest<{ data: PaginatedEnvelope<AdminUserRecord> | AdminUserRecord[] }>(
    `/admin/users${queryString(filters)}`,
    { signal: filters.signal },
  );
  return unwrapPaginated<AdminUserRecord>(payload.data);
}

export async function listAdminUserViews(
  filters: ListAdminUsersQuery = {},
): Promise<PaginatedEnvelope<PersonDirectoryView>> {
  return adaptAdminUserList(await listAdminUsers(filters));
}

export async function getAdminUser(
  profileId: string,
  signal?: AbortSignal,
): Promise<AdminUserRecord> {
  const payload = await apiRequest<{ data: AdminUserRecord }>(
    `/admin/users/${encodeURIComponent(profileId)}`,
    { signal },
  );
  return payload.data;
}

export async function getAdminUserView(
  profileId: string,
  signal?: AbortSignal,
): Promise<PersonDirectoryView> {
  return adaptAdminUser(await getAdminUser(profileId, signal));
}

export async function assignOneClubRole(
  profileId: string,
  body: RoleUpdatePayload,
  signal?: AbortSignal,
): Promise<AdminUserRoleUpdateResult> {
  const payload = await apiRequest<{ data: AdminUserRoleUpdateResult }>(
    `/admin/users/${encodeURIComponent(profileId)}/role`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function updateAdvisorAssignment(
  profileId: string,
  body: AdvisorAssignmentPayload,
  signal?: AbortSignal,
): Promise<AdminAdvisorAssignmentResult> {
  const payload = await apiRequest<{ data: AdminAdvisorAssignmentResult }>(
    `/admin/users/${encodeURIComponent(profileId)}/advisor-assignment`,
    { method: "POST", body, signal },
  );
  return payload.data;
}

export async function listClubsForAssignment(signal?: AbortSignal): Promise<AssignmentClub[]> {
  const payload = await apiRequest<{ data: unknown[] }>("/clubs", { signal });
  return (payload.data ?? []).map(adaptAssignmentClub).filter((club): club is AssignmentClub => Boolean(club));
}
