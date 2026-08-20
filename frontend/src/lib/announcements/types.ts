export type AnnouncementAudience = "all_users" | "all_clubs" | "club" | "role";
export type AnnouncementAudienceType = "all_users" | "all_clubs" | "one_club" | "role";
export type AnnouncementPriorityLevel = "low" | "normal" | "high" | "urgent";
export type TargetRoleType = "student" | "executive" | "president" | "advisor" | "admin";

export interface AnnouncementRecord {
  id: string;
  club_id: string | null;
  created_by: string | null;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  priority: AnnouncementPriorityLevel;
  target_role: TargetRoleType | string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminAnnouncementView {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudienceType;
  targetClubId?: string;
  targetClubName?: string;
  targetRole?: TargetRoleType;
  priority: AnnouncementPriorityLevel;
  publishedAt: string;
  publishedBy: string;
  readCount: number | null;
  totalRecipients: number | null;
  actionUrl?: string;
  actionLabel?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  audience: AnnouncementAudience | "all";
  priority?: AnnouncementPriorityLevel;
  club_id?: string | null;
  target_role?: TargetRoleType | string | null;
}

export interface ListAnnouncementsQuery {
  audience?: AnnouncementAudience;
  club_id?: string;
  priority?: AnnouncementPriorityLevel;
  unread?: boolean;
  page?: number;
  page_size?: number;
  sort?: "created_at" | "updated_at" | "priority";
  order?: "asc" | "desc";
  signal?: AbortSignal;
}

export interface AnnouncementComposerInput {
  title: string;
  content: string;
  audience: AnnouncementAudienceType;
  targetClubId?: string;
  targetRole?: TargetRoleType;
  priority: AnnouncementPriorityLevel;
}
