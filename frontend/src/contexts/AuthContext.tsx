import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { SESSION_EXPIRED_EVENT } from "@/lib/api";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain, isPasswordAuthEnabled } from "@/lib/env";
import { queryClient } from "@/lib/queryClient";
import { isValidStudentId, normalizeStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";
import { supabase } from "@/lib/supabase";

export type AppRole = "executive" | "advisor" | "admin" | "president" | "student";

export interface AppProfile {
  id: string;
  full_name: string | null;
  role: AppRole;
  club_id: string | null;
  student_id?: string | null;
  requested_role?: AppRole | null;
  onboarding_status?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AppProfile | null;
  role: AppRole | null;
  isLoading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMicrosoft: (redirectTo?: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    requestedRole: "student" | "advisor";
    clubId: string;
    clubName: string;
    studentId?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string;
  refreshProfile: () => Promise<AppProfile | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;
const UNSUPPORTED_EMAIL_MESSAGE = `Please use your Nile University Microsoft account (${getAllowedEmailDomainLabel()}).`;

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, club_id, student_id, requested_role, onboarding_status")
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
  const currentUserIdRef = useRef<string | null>(null);

  function clearAuthState() {
    currentUserIdRef.current = null;
    queryClient.clear();
    setSession(null);
    setProfile(null);
    setProfileError(null);
    setIsLoading(false);
  }

  function prepareForSession(nextSession: Session | null) {
    const nextUserId = nextSession?.user?.id ?? null;
    const userChanged = currentUserIdRef.current !== nextUserId;

    if (currentUserIdRef.current && userChanged) {
      queryClient.clear();
    }

    currentUserIdRef.current = nextUserId;
    setSession(nextSession);

    if (userChanged) {
      setProfile(null);
      setProfileError(null);
    }
  }

  async function loadProfileForSession(nextSession: Session | null) {
    if (!nextSession?.user) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    if (!isAllowedEmailDomain(nextSession.user.email ?? "")) {
      setProfile(null);
      setProfileError(UNSUPPORTED_EMAIL_MESSAGE);
      return;
    }

    try {
      const currentProfile = await fetchProfile(nextSession.user.id);
      setProfile(currentProfile);
      setProfileError(currentProfile ? null : "No application profile was found for this user.");
    } catch (error) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : "Unable to load user profile.");
    }
  }

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

      prepareForSession(currentSession);

      await loadProfileForSession(currentSession);

      if (!isMounted) {
        return;
      }

      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setIsLoading(true);

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      prepareForSession(nextSession);
      loadProfileForSession(nextSession).finally(() => setIsLoading(false));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      clearAuthState();
      void supabase.auth.signOut();
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let timeoutId: ReturnType<typeof window.setTimeout>;

    function resetTimer() {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void supabase.auth.signOut();
      }, INACTIVITY_TIMEOUT_MS);
    }

    resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [session]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.role ?? null,
      isLoading,
      profileError,
      async signIn(email, password) {
        if (!isPasswordAuthEnabled()) {
          throw new Error("Password login is disabled. Please continue with your Nile University Microsoft account.");
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      async signInWithMicrosoft(redirectTo) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "azure",
          options: {
            redirectTo: redirectTo || `${window.location.origin}/`,
            queryParams: {
              domain_hint: "nileuniversity.edu.ng",
              prompt: "select_account"
            }
          }
        });

        if (error) {
          throw error;
        }
      },
      async signUp({ email, password, fullName, requestedRole, clubId, clubName, studentId }) {
        if (!isPasswordAuthEnabled()) {
          throw new Error("Password signup is disabled. Please continue with your Nile University Microsoft account.");
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isAllowedEmailDomain(normalizedEmail)) {
          throw new Error(`Please use your Nile University email address (${getAllowedEmailDomainLabel()}).`);
        }

        const normalizedStudentId = requestedRole === "student"
          ? normalizeStudentId(studentId ?? "")
          : "";

        if (requestedRole === "student" && !isValidStudentId(normalizedStudentId)) {
          throw new Error(STUDENT_ID_ERROR_MESSAGE);
        }

        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              requested_role: requestedRole,
              requested_club_id: clubId,
              requested_club: clubName.trim(),
              student_id: requestedRole === "student" ? normalizedStudentId : null
            }
          }
        });

        if (error) {
          throw error;
        }

        await supabase.auth.signOut();
      },
      async signOut() {
        clearAuthState();
        await supabase.auth.signOut();
      },
      getAccessToken() {
        return session?.access_token ?? "";
      },
      async refreshProfile() {
        if (!session?.user) {
          setProfile(null);
          setProfileError(null);
          return null;
        }

        const nextProfile = await fetchProfile(session.user.id);
        setProfile(nextProfile);
        setProfileError(nextProfile ? null : "No application profile was found for this user.");
        return nextProfile;
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
