import { apiRequest } from "./client";
import {
  adaptClubList,
  adaptClubMemberPage,
  adaptClubRecord,
  adaptPaymentSettings,
} from "@/lib/clubs/adapters";
import type {
  ClubPaymentSettingsRecord,
  ClubRecord,
  CreateClubPayload,
  ListClubMembersQuery,
  UpdateClubPayload,
  UpsertPaymentSettingsPayload,
} from "@/lib/clubs/types";
import type { PaginatedEnvelope } from "@/lib/people/types";
import type { ClubMemberView } from "@/lib/clubs/types";

export async function listClubs(signal?: AbortSignal): Promise<ClubRecord[]> {
  const payload = await apiRequest<{ data: unknown }>(`/clubs`, { signal });
  return adaptClubList(payload.data);
}

export async function getClub(clubId: string, signal?: AbortSignal): Promise<ClubRecord> {
  const payload = await apiRequest<{ data: unknown }>(`/clubs/${encodeURIComponent(clubId)}`, { signal });
  const club = adaptClubRecord(payload.data);
  if (!club) {
    throw new Error("Club payload was missing required fields");
  }
  return club;
}

export async function createClub(body: CreateClubPayload, signal?: AbortSignal): Promise<ClubRecord> {
  const payload = await apiRequest<{ data: unknown }>(`/clubs`, { method: "POST", body, signal });
  const club = adaptClubRecord(payload.data);
  if (!club) {
    throw new Error("Club payload was missing required fields");
  }
  return club;
}

export async function updateClub(
  clubId: string,
  body: UpdateClubPayload,
  signal?: AbortSignal,
): Promise<ClubRecord> {
  const payload = await apiRequest<{ data: unknown }>(`/clubs/${encodeURIComponent(clubId)}`, {
    method: "PATCH",
    body,
    signal,
  });
  const club = adaptClubRecord(payload.data);
  if (!club) {
    throw new Error("Club payload was missing required fields");
  }
  return club;
}

export async function listClubMembers(
  filters: ListClubMembersQuery,
): Promise<PaginatedEnvelope<ClubMemberView>> {
  const params = new URLSearchParams();
  params.set("club_id", filters.club_id);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.membership_status) params.set("membership_status", filters.membership_status);
  params.set("sort", "full_name");
  params.set("order", "asc");
  const payload = await apiRequest<{ data: unknown }>(`/members?${params.toString()}`, {
    signal: filters.signal,
  });
  return adaptClubMemberPage(payload.data);
}

export async function getClubPaymentSettings(
  clubId: string,
  signal?: AbortSignal,
): Promise<ClubPaymentSettingsRecord | null> {
  const payload = await apiRequest<{ data: unknown }>(
    `/dues/payment-settings?club_id=${encodeURIComponent(clubId)}`,
    { signal },
  );
  return adaptPaymentSettings(payload.data);
}

export async function upsertClubPaymentSettings(
  body: UpsertPaymentSettingsPayload,
  signal?: AbortSignal,
): Promise<ClubPaymentSettingsRecord | null> {
  const payload = await apiRequest<{ data: unknown }>(`/dues/payment-settings`, {
    method: "POST",
    body,
    signal,
  });
  return adaptPaymentSettings(payload.data);
}
