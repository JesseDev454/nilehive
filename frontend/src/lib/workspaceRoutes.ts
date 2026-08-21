export type OneClubRole = "student" | "president" | "executive" | "advisor" | "admin";

export const ONECLUB_ROLES: readonly OneClubRole[] = [
  "student",
  "president",
  "executive",
  "advisor",
  "admin",
];

export const ROLE_LABELS: Record<OneClubRole, string> = {
  student: "Student",
  president: "President",
  executive: "Executive",
  advisor: "Advisor",
  admin: "Club Services Admin",
};

const ADMIN_ALIAS_REDIRECTS: Record<string, string> = {
  "/approvals": "/admin/approvals",
  "/user-management": "/admin/people",
  "/dues": "/admin/approvals",
  "/events": "/admin/events",
  "/communications": "/admin/announcements",
  "/notifications": "/admin/notifications",
  "/feedback": "/admin/feedback",
  "/analytics": "/admin/analytics",
  "/profile": "/admin/profile",
  "/archive": "/admin/events",
};

export function isOneClubRole(value: string | null | undefined): value is OneClubRole {
  return ONECLUB_ROLES.includes(value as OneClubRole);
}

export function roleFromPath(pathname: string): OneClubRole | null {
  const candidate = pathname.split("/")[1];
  return isOneClubRole(candidate) ? candidate : null;
}

export function homePathForRole(role: OneClubRole): string {
  return `/${role}/home`;
}

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

export function adminAliasRedirect(pathname: string): string | null {
  return ADMIN_ALIAS_REDIRECTS[normalizePathname(pathname)] ?? null;
}

export type AdminWorkspaceKey =
  | "home"
  | "approvals"
  | "clubs"
  | "people"
  | "events"
  | "announcements"
  | "notifications"
  | "feedback"
  | "analytics"
  | "profile"
  | "more"
  | "activity"
  | "notfound";

export function matchAdminWorkspace(pathname: string): AdminWorkspaceKey {
  const path = normalizePathname(pathname);

  if (path === "/admin" || path === "/admin/home") return "home";
  if (path.startsWith("/admin/approvals")) return "approvals";
  if (path.startsWith("/admin/people")) return "people";
  if (path.startsWith("/admin/clubs")) return "clubs";
  if (path.startsWith("/admin/events")) return "events";
  if (path.startsWith("/admin/announcements")) return "announcements";
  if (path.startsWith("/admin/notifications")) return "notifications";
  if (path.startsWith("/admin/feedback")) return "feedback";
  if (path.startsWith("/admin/analytics")) return "analytics";
  if (path.startsWith("/admin/profile")) return "profile";
  if (path.startsWith("/admin/activity")) return "activity";
  if (path.startsWith("/admin/more")) return "more";
  return "notfound";
}

export function isPublicPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/login" || path.startsWith("/login?");
}

export function isSystemGalleryPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/system" || path === "/shared-screens" || path === "/admin/shared-screens";
}

export function safeReturnTo(pathname: string, search = ""): string {
  const next = `${pathname}${search}`;
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next === "/feedback" || next.startsWith("/feedback?") || next.startsWith("/feedback#")) return "/";
  return next;
}

export function loginPath(pathname: string, search = ""): string {
  const safe = safeReturnTo(pathname, search);
  if (safe === "/" || isPublicPath(safe.split("?")[0] || "/")) {
    return "/login";
  }
  return `/login?return_to=${encodeURIComponent(safe)}`;
}
