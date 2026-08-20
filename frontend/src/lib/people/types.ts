export type AssignableOneClubRole = "student" | "executive" | "president" | "advisor";

export const ASSIGNABLE_ONECLUB_ROLES: AssignableOneClubRole[] = [
  "student",
  "executive",
  "president",
  "advisor",
];

export interface ClubReference {
  id: string;
  name: string;
  code: string | null;
}

export interface AdvisorAssignmentRecord {
  id: string;
  club_id: string;
  assigned_by: string | null;
  remarks: string | null;
  created_at: string | null;
  club: ClubReference | null;
}

export interface AdminUserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  portal_user_id: string | null;
  department: string | null;
  student_type: string | null;
  role: string;
  app_role: string;
  effective_role: string | null;
  portal_role: string | null;
  custom_roles: string[];
  club_id: string | null;
  student_id: string | null;
  requested_role: string | null;
  onboarding_status: string | null;
  account_status: string | null;
  club: ClubReference | null;
  advisor_assignments: AdvisorAssignmentRecord[];
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUserRoleHistory {
  id?: string;
  previous_role?: string | null;
  new_role?: string | null;
  previous_club_id?: string | null;
  new_club_id?: string | null;
  remarks?: string | null;
  created_at?: string | null;
}

export interface AdminUserRoleUpdateResult {
  profile: AdminUserRecord;
  history: AdminUserRoleHistory | null;
}

export interface AdminAdvisorAssignmentResult {
  profile: AdminUserRecord;
  club: ClubReference | null;
  history: AdminUserRoleHistory | null;
}

export interface PresidentConflictDetails {
  id: string;
  full_name: string | null;
  student_id: string | null;
  club_id: string | null;
}

export interface RoleUpdatePayload {
  role: AssignableOneClubRole;
  club_id?: string | null;
  remarks?: string | null;
  replace_existing_president?: boolean;
}

export interface AdvisorAssignmentPayload {
  club_id: string;
  remarks?: string | null;
}

export interface AssignmentClub {
  id: string;
  name: string;
  code: string | null;
}

export interface AdvisorAssignmentView {
  id: string;
  club_id: string;
  club_name: string;
}

export interface PersonDirectoryView {
  id: string;
  fullName: string;
  campusId: string | null;
  email: string | null;
  portalUserId: string | null;
  campusOneBaseRole: string | null;
  department: string | null;
  faculty: string | null;
  accountStatus: string;
  oneClubRole: string;
  assignedClubId: string | null;
  assignedClubName: string | null;
  advisorAssignments: AdvisorAssignmentView[];
  requestedRole: string | null;
  onboardingStatus: string | null;
  portalRole: string | null;
  customRoles: string[];
  effectiveRole: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  executiveTitle?: string;
  joinedClubsCount: number | null;
}

export interface PaginatedEnvelope<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface ListAdminUsersQuery {
  page?: number;
  page_size?: number;
  sort?: "created_at" | "full_name" | "updated_at";
  order?: "asc" | "desc";
  role?: string;
  club_id?: string;
  q?: string;
  signal?: AbortSignal;
}
