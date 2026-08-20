export const AUTHORITATIVE_OFFICIAL_CLUBS = [
  { name: "Nile Book Club", code: "NBC" },
  { name: "Nile Business Club", code: "NBUC" },
  { name: "Nile Charity Club", code: "NCC" },
  { name: "Nile Climate Initiatives Club", code: "NCIC" },
  { name: "Nile Creative Arts Club", code: "NCAC" },
  { name: "Nile Debate Club", code: "NDC" },
  { name: "Nile Games Club", code: "NGC" },
  { name: "Nile Google Developers", code: "NGD" },
  { name: "Nile Model United Nations Club", code: "NMUN" },
  { name: "Nile Photography Club", code: "NPC" },
  { name: "Nile Startup Campus", code: "NSC" },
  { name: "Nile Toastmaster's Club", code: "NTC" },
  { name: "TEDx Nile Club", code: "TEDX" },
  { name: "Women in Tech Club", code: "WIT" },
] as const;

export const BACKEND_CLUB_CATEGORIES = [
  "Tech",
  "Gaming",
  "Music",
  "Entrepreneurship",
  "Sports",
  "Volunteering",
  "Academics",
  "Media",
  "Faith",
  "Arts",
  "Leadership",
  "Wellness",
  "Culture",
  "Other",
] as const;

export type BackendClubCategory = (typeof BACKEND_CLUB_CATEGORIES)[number];

export interface ClubRecord {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  advisor_id: string | null;
  dues_amount: number;
  is_public_signup: boolean;
  whatsapp_group_name: string | null;
  whatsapp_onboarding_notes: string | null;
  categories: string[];
  skills_offered: string[];
  career_goals: string[];
  meeting_windows: string[];
  weekly_commitment: string | null;
  logo_path: string | null;
  website_url: string | null;
  social_links: Record<string, string>;
  created_at: string | null;
  gallery?: ClubMediaRecord[];
}

export interface ClubMediaRecord {
  id: string;
  club_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClubPaymentSettingsRecord {
  id: string | null;
  club_id: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  payment_instructions: string | null;
  fresher_dues_amount: number | null;
  returning_student_dues_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClubMemberRecord {
  id: string;
  club_id: string;
  profile_id: string | null;
  full_name: string | null;
  student_id: string | null;
  email: string | null;
  phone_number: string | null;
  club_role: string | null;
  membership_status: string | null;
  dues_status: string | null;
  dues_paid: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClubMemberView {
  id: string;
  clubId: string;
  profileId: string | null;
  fullName: string;
  studentId: string | null;
  email: string | null;
  clubRole: string | null;
  membershipStatus: string | null;
  joinedAt: string | null;
}

export interface ClubLeaderView {
  id: string;
  fullName: string;
  email: string | null;
  studentId: string | null;
}

export interface ClubBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  narrationGuideline: string;
  proofInstructions: string;
}

export interface AdminClubView {
  id: string;
  name: string;
  code: string | null;
  description: string;
  categoryLabel: string;
  categories: string[];
  duesAmount: number;
  presidentName: string | null;
  presidentEmail: string | null;
  presidentId: string | null;
  advisorName: string | null;
  advisorEmail: string | null;
  advisorId: string | null;
  advisors: ClubLeaderView[];
  executives: ClubLeaderView[];
  meetingWindows: string[];
  weeklyCommitment: string | null;
  location: string | null;
  meetingSchedule: string | null;
  memberCount: number | null;
  isPublicSignup: boolean;
  coverImage: string | null;
  tags: string[];
  bankDetails: ClubBankDetails | null;
  adminOnlyWhatsAppNotes: string | null;
  whatsappGroupName: string | null;
  websiteUrl: string | null;
  logoPath: string | null;
  createdAt: string | null;
  members: ClubMemberView[];
  paymentLoaded: boolean;
  supportsLocation: boolean;
  supportsMeetingSchedule: boolean;
  supportsCoverUrl: boolean;
  supportsFreeformTags: boolean;
  supportsArchive: boolean;
  supportsDelete: boolean;
  supportsLogoUpload: boolean;
  supportsCreate: boolean;
}

export interface CreateClubPayload {
  name: string;
  description: string;
  code?: string | null;
  is_public_signup?: boolean;
  categories?: string[];
  whatsapp_group_name?: string | null;
  whatsapp_onboarding_notes?: string | null;
}

export interface UpdateClubPayload {
  name?: string;
  description?: string;
  code?: string | null;
  is_public_signup?: boolean;
  dues_amount?: number;
  whatsapp_group_name?: string | null;
  whatsapp_onboarding_notes?: string | null;
  categories?: string[];
  logo_path?: string | null;
  website_url?: string | null;
}

export interface UpsertPaymentSettingsPayload {
  bank_name: string;
  account_number: string;
  account_name: string;
  payment_instructions?: string | null;
}

export interface ClubEditInput {
  description: string;
  isPublicSignup: boolean;
  duesAmount: number;
  adminOnlyWhatsAppNotes: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentInstructions: string;
  location?: string;
  meetingSchedule?: string;
  coverImage?: string;
  tags?: string[];
}

export interface ListClubMembersQuery {
  club_id: string;
  page?: number;
  page_size?: number;
  membership_status?: string;
  signal?: AbortSignal;
}
