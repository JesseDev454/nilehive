import { apiRequest, campusOneLoginUrl } from "./client";

export interface ProfileMeUser {
  id: string;
  email: string | null;
  role: string;
}

export interface ProfileMeRecord {
  id: string;
  email: string | null;
  portal_user_id: string | null;
  full_name: string;
  role: string;
  app_role: string;
  effective_role: string;
  portal_role: string;
  custom_roles: string[];
  access_pending: boolean;
  role_sync_state: string;
  club_id: string | null;
  student_id: string | null;
  requested_role: string | null;
  onboarding_status: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileMeResponse {
  data: {
    user: ProfileMeUser;
    profile: ProfileMeRecord | null;
    requires_profile_setup: boolean;
  };
}

export async function getCurrentProfile(signal?: AbortSignal): Promise<ProfileMeResponse["data"]> {
  const payload = await apiRequest<ProfileMeResponse>("/profile/me", { signal });
  return payload.data;
}

export function beginCampusOneLogin(returnTo: string): void {
  window.location.assign(campusOneLoginUrl(returnTo));
}

export async function logoutCampusOne(signal?: AbortSignal): Promise<void> {
  await apiRequest<{ data: { signed_out: boolean } }>("/auth/campus-one/logout", {
    method: "POST",
    signal,
  });
}
