import type { AppProfile } from "@/contexts/AuthContext";
import type { User } from "@supabase/supabase-js";

export function getStudentDisplayName(
  profile: AppProfile | null | undefined,
  user?: User | null
): string | null {
  const metadata = user?.user_metadata;

  // 1. Supported preferred or first name from user metadata if provided
  const preferredName =
    typeof metadata?.preferred_name === "string" && metadata.preferred_name.trim()
      ? metadata.preferred_name.trim()
      : typeof metadata?.first_name === "string" && metadata.first_name.trim()
      ? metadata.first_name.trim()
      : null;

  if (preferredName) {
    return preferredName;
  }

  // 2. Full name from profile or metadata (take first word/token of full name)
  const rawFullName =
    (typeof profile?.full_name === "string" && profile.full_name.trim()) ||
    (typeof metadata?.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata?.name === "string" && metadata.name.trim()) ||
    "";

  const firstToken = rawFullName.split(/\s+/).filter(Boolean)[0];
  if (firstToken) {
    return firstToken;
  }

  // 3. Fallback: null (signals to render neutral "Welcome back")
  return null;
}

export function formatStudentGreeting(displayName: string | null): string {
  if (!displayName) {
    return "Welcome back";
  }
  return `Welcome back, ${displayName}`;
}
