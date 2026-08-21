export type {
  AdminFeedbackCategory,
  AdminFeedbackItem,
  FeedbackAuthorRole,
} from "@/lib/feedback/types";
export { mockAdminFeedback as INITIAL_ADMIN_FEEDBACK } from "@/lib/feedback/mockFeedback";
import type { AdminFeedbackCategory } from "@/lib/feedback/types";

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
  },
  event: {
    label: "Event",
    badgeClass: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
    description: "Historical event feedback records. New event feedback is collected through attendance."
  }
};
