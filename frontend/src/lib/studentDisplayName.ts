import type { User } from "@supabase/supabase-js";
import type { AppProfile } from "@/contexts/AuthContext";

export function getStudentDisplayName(
  profile: AppProfile | null | undefined,
  user?: User | null,
): string | null {
  const metadata = user?.user_metadata;
  const preferredName =
    typeof metadata?.preferred_name === "string" && metadata.preferred_name.trim()
      ? metadata.preferred_name.trim()
      : typeof metadata?.first_name === "string" && metadata.first_name.trim()
        ? metadata.first_name.trim()
        : null;

  if (preferredName) {
    return preferredName;
  }

  const fullName =
    (typeof profile?.full_name === "string" && profile.full_name.trim())
    || (typeof metadata?.full_name === "string" && metadata.full_name.trim())
    || (typeof metadata?.name === "string" && metadata.name.trim())
    || "";

  return fullName.split(/\s+/).filter(Boolean)[0] || null;
}

export function formatStudentGreeting(displayName: string | null): string {
  return displayName ? `Welcome back, ${displayName}` : "Welcome back";
}
