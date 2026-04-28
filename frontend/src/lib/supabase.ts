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
export const SUPABASE_AUTH_STORAGE_KEY = `nilehive-auth-${getSupabaseProjectRef(supabaseUrl)}`;

if (typeof window !== "undefined") {
  const legacyStorageKey = "nilehive-auth";

  if (legacyStorageKey !== SUPABASE_AUTH_STORAGE_KEY) {
    window.localStorage.removeItem(legacyStorageKey);
  }
}

export const supabase = createClient(supabaseUrl, getSupabaseAnonKey(), {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: SUPABASE_AUTH_STORAGE_KEY
  }
});
