import {
  BarChart3,
  Bell,
  CalendarDays,
  FileText,
  MessageSquare,
  ScrollText,
  UserCircle,
  type LucideIcon
} from "lucide-react";

export interface AdminLauncherDestination {
  id: string;
  title: string;
  shortTitle: string;
  url: string;
  icon: LucideIcon;
  category: "Operations" | "Communications" | "Quality & Feedback" | "Insights" | "Account";
  description: string;
  keywords: string[];
  badge?: string;
  accentClass: string;
}

export const ADMIN_LAUNCHER_DESTINATIONS: AdminLauncherDestination[] = [
  {
    id: "events",
    title: "Events",
    shortTitle: "Events",
    url: "/admin/events",
    icon: CalendarDays,
    category: "Operations",
    description: "See approved events, schedules, and verified check-ins.",
    keywords: ["events", "calendar", "attendance", "check-in", "qr", "schedule", "activities", "workshops"],
    badge: "Calendar",
    accentClass: "text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400"
  },
  {
    id: "announcements",
    title: "Announcements",
    shortTitle: "Announcements",
    url: "/admin/announcements",
    icon: MessageSquare,
    category: "Communications",
    description: "Publish official updates for clubs and students.",
    keywords: ["announcements", "broadcast", "messages", "communications", "notices", "alerts", "bulletin"],
    badge: "Updates",
    accentClass: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400"
  },
  {
    id: "notifications",
    title: "Notifications",
    shortTitle: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    category: "Communications",
    description: "See approval, payment-proof, and system updates.",
    keywords: ["notifications", "alerts", "inbox", "updates", "unread", "activity", "messages"],
    badge: "Alerts",
    accentClass: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400"
  },
  {
    id: "feedback",
    title: "Feedback",
    shortTitle: "Feedback",
    url: "/admin/feedback",
    icon: FileText,
    category: "Quality & Feedback",
    description: "Read feedback submitted by students across all 14 clubs.",
    keywords: ["feedback", "suggestions", "students", "reviews", "quality", "comments", "support"],
    badge: "Read-Only",
    accentClass: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400"
  },
  {
    id: "analytics",
    title: "Analytics",
    shortTitle: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
    category: "Insights",
    description: "See simple trends for members, requests, payment proofs, and attendance.",
    keywords: ["analytics", "metrics", "counts", "stats", "telemetry", "active users", "reports", "insights"],
    badge: "Trends",
    accentClass: "text-primary bg-primary/10 border-primary/20"
  },
  {
    id: "activity",
    title: "Activity Log",
    shortTitle: "Activity",
    url: "/admin/activity",
    icon: ScrollText,
    category: "Insights",
    description: "Read the immutable Club Services audit history.",
    keywords: ["activity", "audit", "log", "history", "records", "mutations"],
    badge: "Read-Only",
    accentClass: "text-slate-600 bg-slate-500/10 border-slate-500/20 dark:text-slate-300"
  },
  {
    id: "profile",
    title: "Profile",
    shortTitle: "Profile",
    url: "/admin/profile",
    icon: UserCircle,
    category: "Account",
    description: "View your read-only Campus One identity and choose light or dark mode.",
    keywords: ["profile", "account", "theme", "dark mode", "light mode", "settings", "credentials", "identity", "admin"],
    badge: "Account",
    accentClass: "text-slate-600 bg-slate-500/10 border-slate-500/20 dark:text-slate-300"
  }
];
