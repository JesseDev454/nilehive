const ALLOWED_ADMIN_PREFIXES = [
  "/admin/approvals",
  "/admin/clubs",
  "/admin/people",
  "/admin/events",
  "/admin/announcements",
  "/admin/feedback",
  "/admin/analytics",
  "/admin/notifications",
  "/admin/activity",
  "/admin/home",
  "/admin/profile",
] as const;

export function sanitizeAdminDeepLink(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  if (trimmed.includes("\\") || trimmed.includes("..")) return null;

  const path = trimmed.split("?")[0]?.split("#")[0] ?? "";
  const allowed = ALLOWED_ADMIN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  return allowed ? trimmed : null;
}
