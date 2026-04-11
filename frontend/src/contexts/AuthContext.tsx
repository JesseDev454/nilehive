import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AppRole = "executive" | "advisor" | "admin" | "president";

export interface AppProfile {
  id: string;
  full_name: string | null;
  role: AppRole;
  club_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AppProfile | null;
  role: AppRole | null;
  isLoading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    requestedRole: string;
    clubName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, club_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AppProfile | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      setIsLoading(true);

      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(currentSession);

      if (currentSession?.user) {
        try {
          const currentProfile = await fetchProfile(currentSession.user.id);

          if (!isMounted) {
            return;
          }

          setProfile(currentProfile);
          setProfileError(currentProfile ? null : "No application profile was found for this user.");
        } catch (error) {
          if (!isMounted) {
            return;
          }

          setProfile(null);
          setProfileError(error instanceof Error ? error.message : "Unable to load user profile.");
        }
      } else {
        setProfile(null);
        setProfileError(null);
      }

      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(true);

      if (!nextSession?.user) {
        setProfile(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }

      fetchProfile(nextSession.user.id)
        .then((nextProfile) => {
          setProfile(nextProfile);
          setProfileError(nextProfile ? null : "No application profile was found for this user.");
        })
        .catch((error) => {
          setProfile(null);
          setProfileError(error instanceof Error ? error.message : "Unable to load user profile.");
        })
        .finally(() => setIsLoading(false));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.role ?? null,
      isLoading,
      profileError,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      async signUp({ email, password, fullName, requestedRole, clubName }) {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              requested_role: requestedRole,
              requested_club: clubName.trim()
            }
          }
        });

        if (error) {
          throw error;
        }

        await supabase.auth.signOut();
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      getAccessToken() {
        return session?.access_token ?? "";
      }
    }),
    [isLoading, profile, profileError, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
