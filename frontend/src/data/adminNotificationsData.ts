export type { AdminNotificationCategory, AdminNotificationRecord } from "@/lib/notifications/types";
export { mockAdminNotifications as INITIAL_ADMIN_NOTIFICATIONS } from "@/lib/notifications/mockNotifications";

export const CATEGORY_CONFIG: Record<
  import("@/lib/notifications/types").AdminNotificationCategory,
  { label: string; badgeClass: string; iconName: string }
> = {
  proposal: {
    label: "Proposals",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    iconName: "FileCheck"
  },
  join_request: {
    label: "Join Requests",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    iconName: "UserPlus"
  },
  dues_proof: {
    label: "Dues Proofs",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    iconName: "CreditCard"
  },
  event: {
    label: "Campus Events",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
    iconName: "CalendarDays"
  },
  announcement: {
    label: "Broadcasts",
    badgeClass: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
    iconName: "Megaphone"
  },
  system: {
    label: "System Alerts",
    badgeClass: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
    iconName: "ShieldAlert"
  }
};
