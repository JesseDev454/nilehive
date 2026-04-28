import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

function getSupabaseProjectRef(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".")[0] || "default";
  } catch {
    return "default";
  }
}

const supabaseUrl = getSupabaseUrl();
const storageKey = `nilehive-auth-${getSupabaseProjectRef(supabaseUrl)}`;

if (typeof window !== "undefined") {
  const legacyStorageKey = "nilehive-auth";

  if (legacyStorageKey !== storageKey) {
    window.localStorage.removeItem(legacyStorageKey);
  }
}

export const supabase = createClient(supabaseUrl, getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey
  }
});
