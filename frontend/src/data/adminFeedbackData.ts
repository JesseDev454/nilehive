export type AdminFeedbackCategory =
  | "general"
  | "club"
  | "onboarding"
  | "joining"
  | "dues"
  | "login_access";

export type FeedbackAuthorRole = "student" | "executive" | "president";

export interface AdminFeedbackItem {
  id: string;
  category: AdminFeedbackCategory;
  title: string;
  message: string;
  authorName: string;
  authorRole: FeedbackAuthorRole;
  studentId?: string;
  clubName?: string;
  submittedAt: string; // ISO 8601
  canContact: boolean;
  contactEmail?: string;
  rating?: number; // 1-5
}

export const INITIAL_ADMIN_FEEDBACK: AdminFeedbackItem[] = [
  {
    id: "fb-101",
    category: "dues",
    title: "Bank-transfer proof review time for session dues",
    message: "Can bank transfer verifications for Nile Google Developers Club dues be reviewed before Friday? Several students want to participate in the upcoming AI workshop and need active member status.",
    authorName: "Tariq Ibrahim",
    authorRole: "student",
    studentId: "210103044",
    clubName: "Nile Google Developers",
    submittedAt: "2026-08-18T11:20:00Z",
    canContact: true,
    contactEmail: "tariq.ibrahim@nileuniversity.edu.ng",
    rating: 4
  },
  {
    id: "fb-102",
    category: "club",
    title: "Inter-club collaboration proposal guidelines",
    message: "Having a standardized format or joint proposal template for co-hosted initiatives between TEDx Nile and Nile Business Club would streamline approval workflows between faculty advisors.",
    authorName: "Zainab Bello",
    authorRole: "executive",
    studentId: "200104012",
    clubName: "Nile Business Club",
    submittedAt: "2026-08-17T14:45:00Z",
    canContact: true,
    contactEmail: "zainab.bello@nileuniversity.edu.ng",
    rating: 5
  },
  {
    id: "fb-103",
    category: "joining",
    title: "Clearer notification when membership application is accepted",
    message: "When my membership application for Nile Cyber Security Club was reviewed, it would be helpful to receive an SMS or direct push alert in addition to the in-app notice.",
    authorName: "Emeka Okafor",
    authorRole: "student",
    studentId: "220105088",
    clubName: "Cyber Security Club",
    submittedAt: "2026-08-16T16:10:00Z",
    canContact: false,
    rating: 4
  },
  {
    id: "fb-104",
    category: "onboarding",
    title: "New executive handbook and proposal orientation",
    message: "As a newly elected executive for Nile Robotics Society, a 15-minute digital walkthrough on grant budgeting and venue protocol in OneClub would make the onboarding process even smoother.",
    authorName: "Farida Al-Mansur",
    authorRole: "executive",
    studentId: "210102003",
    clubName: "Nile Robotics Society",
    submittedAt: "2026-08-15T09:30:00Z",
    canContact: true,
    contactEmail: "farida.almansur@nileuniversity.edu.ng",
    rating: 4
  },
  {
    id: "fb-105",
    category: "login_access",
    title: "Single Sign-On login session persistence on mobile devices",
    message: "When switching between Nile University student portal tabs on iOS Safari, the Campus One institutional login occasionally prompts for 2FA re-verification.",
    authorName: "Oluwaseun Adeleke",
    authorRole: "student",
    studentId: "220108031",
    submittedAt: "2026-08-14T10:15:00Z",
    canContact: true,
    contactEmail: "o.adeleke@nileuniversity.edu.ng",
    rating: 3
  },
  {
    id: "fb-106",
    category: "general",
    title: "OneClub interface accessibility and night study mode",
    message: "The dark mode theme is very comfortable during late-night library study sessions. Appreciate the high-contrast typography and clean spacing across the platform.",
    authorName: "Fatima Kabir",
    authorRole: "student",
    studentId: "230101019",
    submittedAt: "2026-08-12T19:00:00Z",
    canContact: false,
    rating: 5
  },
  {
    id: "fb-107",
    category: "club",
    title: "Equipment storage coordination between student societies",
    message: "Can Club Services provide a shared schedule for audio-visual equipment checkouts in the student center? This will prevent double-booking between societies.",
    authorName: "Mustapha Garba",
    authorRole: "president",
    studentId: "190101004",
    clubName: "Nile Literary Society",
    submittedAt: "2026-08-10T13:20:00Z",
    canContact: true,
    contactEmail: "m.garba@nileuniversity.edu.ng",
    rating: 4
  }
];

export const FEEDBACK_CATEGORIES: Record<
  AdminFeedbackCategory,
  { label: string; badgeClass: string; description: string }
> = {
  general: {
    label: "General Experience",
    badgeClass: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
    description: "General suggestions, student life ideas, and platform accessibility feedback."
  },
  club: {
    label: "Club Operations",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
    description: "Executive coordination, club logistics, inter-society collaborations, and facility requests."
  },
  onboarding: {
    label: "Onboarding",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    description: "New member welcome experience, executive orientation, and handbook clarity."
  },
  joining: {
    label: "Club Applications",
    badgeClass: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
    description: "Application forms, membership requirements, and approval notifications."
  },
  dues: {
    label: "Dues & Payments",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    description: "Semester dues bank transfer proof uploads, verification turnaround, and receipts."
  },
  login_access: {
    label: "Login & Access",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    description: "Campus One identity login, SSO credentials, and device access permissions."
  }
};
