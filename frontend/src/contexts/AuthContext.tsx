import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getMyProfile, getUserFacingErrorMessage, SESSION_EXPIRED_EVENT } from "@/lib/api";
import {
  getCampusOneOidcAuthUrl,
  getAllowedEmailDomainLabel,
  getPortalAuthUrl,
  isAllowedEmailDomain,
  isCampusOneOidcAuthProvider,
  isPasswordAuthEnabled,
  usesCookieAuthProvider
} from "@/lib/env";
import { queryClient } from "@/lib/queryClient";
import { supabase, SUPABASE_AUTH_STORAGE_KEY } from "@/lib/supabase";

export type AppRole = "executive" | "advisor" | "admin" | "president" | "student" | "feedback_manager";
export type PlatformRole = "student" | "staff" | "admin";
export type EffectiveRole = AppRole;

export interface AppProfile {
  id: string;
  full_name: string | null;
  role: AppRole;
  app_role?: AppRole | null;
  effective_role?: EffectiveRole | null;
  portal_role?: PlatformRole | null;
  access_pending?: boolean;
  role_sync_state?: string | null;
  club_id: string | null;
  student_id?: string | null;
  phone_number?: string | null;
  department?: string | null;
  student_type?: "fresher" | "returning" | null;
  join_reason?: string | null;
  requested_role?: AppRole | null;
  onboarding_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AppProfile | null;
  role: EffectiveRole | null;
  appRole: AppRole | null;
  portalRole: PlatformRole | null;
  accessPending: boolean;
  isLoading: boolean;
  profileError: string | null;
  requiresProfileRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMicrosoft: (redirectTo?: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    requestedRole: "student" | "advisor";
  }) => Promise<{ needsEmailConfirmation: boolean; userId: string | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string;
  refreshProfile: () => Promise<AppProfile | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;
const UNSUPPORTED_EMAIL_MESSAGE = `Please use your Nile University Microsoft account (${getAllowedEmailDomainLabel()}).`;
const PROFILE_FETCH_RETRY_ATTEMPTS = 5;
const PROFILE_FETCH_RETRY_DELAY_MS = 500;
const LAST_ACTIVITY_STORAGE_KEY = `${SUPABASE_AUTH_STORAGE_KEY}:last-activity-at`;

function readLastActivityAt() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
  const timestamp = rawValue ? Number(rawValue) : NaN;

  return Number.isFinite(timestamp) ? timestamp : null;
}

function writeLastActivityAt(timestamp = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp));
}

function clearLastActivityAt() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
}

function getCurrentUrl() {
  return typeof window === "undefined" ? undefined : window.location.href;
}

function isSignedOutLoginRoute() {
  if (typeof window === "undefined") {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  return window.location.pathname === "/login" && searchParams.get("signed_out") === "1";
}

function redirectToPortal(path: "sign-in" | "sign-up" | "forgot-password" | "sign-out", callbackUrl = getCurrentUrl()) {
  if (typeof window === "undefined") {
    return;
  }

  const targetUrl = getPortalAuthUrl(path, callbackUrl || window.location.origin);

  window.location.assign(targetUrl);
}

function redirectToCampusOneOidc(returnTo = "/") {
  if (typeof window === "undefined") {
    return;
  }

  const nextReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  window.location.assign(getCampusOneOidcAuthUrl("login", nextReturnTo));
}

function redirectToCookieAuth(path: "sign-in" | "sign-up" | "forgot-password" | "sign-out", callbackUrl = getCurrentUrl()) {
  if (isCampusOneOidcAuthProvider()) {
    if (path === "sign-out") {
      window.location.assign(getCampusOneOidcAuthUrl("logout"));
      return;
    }

    const returnTo = callbackUrl && typeof window !== "undefined" && callbackUrl.startsWith(window.location.origin)
      ? callbackUrl.slice(window.location.origin.length) || "/"
      : "/";
    redirectToCampusOneOidc(returnTo);
    return;
  }

  redirectToPortal(path, callbackUrl);
}

function createPortalSession(input: {
  user: { id: string; email: string | null; role?: PlatformRole | null };
  profile: AppProfile | null;
}) {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: "",
    refresh_token: "",
    expires_in: 60 * 60,
    expires_at: now + 60 * 60,
    token_type: "bearer",
    user: {
      id: input.profile?.id || input.user.id,
      aud: "authenticated",
      role: "authenticated",
      email: input.user.email ?? undefined,
      app_metadata: {
        provider: "campus-one",
        providers: ["campus-one"]
      },
      user_metadata: {
        full_name: input.profile?.full_name ?? null,
        portal_role: input.user.role ?? input.profile?.portal_role ?? "student",
        effective_role: input.profile?.effective_role ?? input.profile?.role ?? "student"
      },
      created_at: input.profile?.created_at ?? new Date().toISOString(),
      updated_at: input.profile?.updated_at ?? new Date().toISOString()
    } as User
  } as Session;
}

function hasValidPersistedActivity() {
  const lastActivityAt = readLastActivityAt();

  return lastActivityAt !== null && Date.now() - lastActivityAt < INACTIVITY_TIMEOUT_MS;
}

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, club_id, student_id, phone_number, department, student_type, join_reason, requested_role, onboarding_status")
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
  const [requiresProfileRecovery, setRequiresProfileRecovery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);

  async function waitForProfileProvisioning() {
    await new Promise((resolve) => window.setTimeout(resolve, PROFILE_FETCH_RETRY_DELAY_MS));
  }

  function clearAuthState() {
    clearLastActivityAt();
    currentUserIdRef.current = null;
    queryClient.clear();
    setSession(null);
    setProfile(null);
    setProfileError(null);
    setRequiresProfileRecovery(false);
    setIsLoading(false);
  }

  async function expireSessionForInactivity() {
    clearAuthState();
    if (usesCookieAuthProvider()) {
      redirectToCookieAuth("sign-in");
      return;
    }

    await supabase.auth.signOut();
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
      setRequiresProfileRecovery(false);
    }
  }

  async function loadPortalProfile() {
    const data = await getMyProfile();
    const nextProfile = data.profile as AppProfile | null;

    prepareForSession(createPortalSession({ user: data.user, profile: nextProfile }));
    setProfile(nextProfile);
    setProfileError(nextProfile ? null : "We couldn't finish opening your profile. Please try again.");
    setRequiresProfileRecovery(!nextProfile);

    return nextProfile;
  }

  async function loadProfileForSession(nextSession: Session | null) {
    if (!nextSession?.user) {
      setProfile(null);
      setProfileError(null);
      setRequiresProfileRecovery(false);
      return;
    }

    if (!isAllowedEmailDomain(nextSession.user.email ?? "")) {
      setProfile(null);
      setProfileError(UNSUPPORTED_EMAIL_MESSAGE);
      setRequiresProfileRecovery(false);
      return;
    }

    try {
      let currentProfile: AppProfile | null = null;

      for (let attempt = 0; attempt < PROFILE_FETCH_RETRY_ATTEMPTS; attempt += 1) {
        currentProfile = await fetchProfile(nextSession.user.id);

        if (currentProfile) {
          break;
        }

        if (attempt < PROFILE_FETCH_RETRY_ATTEMPTS - 1) {
          await waitForProfileProvisioning();
        }
      }

      if (currentProfile) {
        setProfile(currentProfile);
        setProfileError(null);
        setRequiresProfileRecovery(false);
        return;
      }

      setProfile(null);
      setProfileError(
        "We couldn't load your profile yet. If this is an older account, try the recovery form below once."
      );
      setRequiresProfileRecovery(true);
    } catch (error) {
      setProfile(null);
      setRequiresProfileRecovery(false);
      setProfileError(error instanceof Error ? error.message : "We couldn't load your profile right now.");
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      setIsLoading(true);

      if (usesCookieAuthProvider()) {
        if (isSignedOutLoginRoute()) {
          clearAuthState();
          return;
        }

        try {
          await loadPortalProfile();
          writeLastActivityAt();
          setIsLoading(false);
        } catch (error) {
          clearAuthState();

          if (isMounted) {
            const message = getUserFacingErrorMessage(error, "Please sign in to continue.");
            setProfileError(message);
            redirectToCookieAuth("sign-in");
          }
        }

        return;
      }

      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (currentSession?.user && !hasValidPersistedActivity()) {
        await expireSessionForInactivity();
        return;
      }

      if (currentSession?.user) {
        writeLastActivityAt();
      }

      prepareForSession(currentSession);

      await loadProfileForSession(currentSession);

      if (!isMounted) {
        return;
      }

      setIsLoading(false);
    }

    loadSession();

    if (usesCookieAuthProvider()) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setIsLoading(true);

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      if (event !== "SIGNED_IN" && !hasValidPersistedActivity()) {
        void expireSessionForInactivity();
        return;
      }

      writeLastActivityAt();
      prepareForSession(nextSession);
      loadProfileForSession(nextSession).finally(() => setIsLoading(false));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!usesCookieAuthProvider() || !session) {
      return;
    }

    let isRefreshing = false;

    async function syncPortalRoleState() {
      if (isRefreshing || document.visibilityState === "hidden") {
        return;
      }

      isRefreshing = true;

      try {
        await loadPortalProfile();
      } catch (error) {
        clearAuthState();
        const message = getUserFacingErrorMessage(error, "Please sign in to continue.");
        setProfileError(message);
        redirectToCookieAuth("sign-in");
      } finally {
        isRefreshing = false;
      }
    }

    function handleFocus() {
      void syncPortalRoleState();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void syncPortalRoleState();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session]);

  useEffect(() => {
    function handleSessionExpired() {
      clearAuthState();
      if (usesCookieAuthProvider()) {
        redirectToCookieAuth("sign-in");
        return;
      }

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

    function scheduleTimeout(lastActivityAt = readLastActivityAt() ?? Date.now()) {
      window.clearTimeout(timeoutId);
      const remainingTime = Math.max(INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivityAt), 0);
      timeoutId = window.setTimeout(() => {
        clearLastActivityAt();
        if (usesCookieAuthProvider()) {
          redirectToCookieAuth("sign-in");
          return;
        }

        void supabase.auth.signOut();
      }, remainingTime);
    }

    function handleActivity() {
      if (!hasValidPersistedActivity()) {
        clearLastActivityAt();
        if (usesCookieAuthProvider()) {
          redirectToCookieAuth("sign-in");
          return;
        }

        void supabase.auth.signOut();
        return;
      }

      const timestamp = Date.now();
      writeLastActivityAt(timestamp);
      scheduleTimeout(timestamp);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        handleActivity();
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== LAST_ACTIVITY_STORAGE_KEY) {
        return;
      }

      if (!event.newValue) {
        window.clearTimeout(timeoutId);
        return;
      }

      const timestamp = Number(event.newValue);

      if (Number.isFinite(timestamp)) {
        scheduleTimeout(timestamp);
      }
    }

    writeLastActivityAt();
    scheduleTimeout();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener("focus", handleActivity);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener("focus", handleActivity);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role: profile?.effective_role ?? profile?.role ?? null,
      appRole: profile?.app_role ?? profile?.role ?? null,
      portalRole: profile?.portal_role ?? null,
      accessPending: Boolean(profile?.access_pending),
      isLoading,
      profileError,
      requiresProfileRecovery,
      async signIn(email, password) {
        if (usesCookieAuthProvider()) {
          redirectToCookieAuth("sign-in");
          return;
        }

        if (!isPasswordAuthEnabled()) {
          throw new Error("Password login is disabled. Please continue with your Nile University Microsoft account.");
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      async signInWithMicrosoft(redirectTo) {
        if (usesCookieAuthProvider()) {
          redirectToCookieAuth("sign-in", redirectTo);
          return;
        }

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
      async signUp({
        email,
        password,
        fullName,
        requestedRole
      }) {
        if (usesCookieAuthProvider()) {
          redirectToCookieAuth("sign-up");
          return {
            needsEmailConfirmation: false,
            userId: null
          };
        }

        if (!isPasswordAuthEnabled()) {
          throw new Error("Password signup is disabled. Please continue with your Nile University Microsoft account.");
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isAllowedEmailDomain(normalizedEmail)) {
          throw new Error(`Please use your Nile University email address (${getAllowedEmailDomainLabel()}).`);
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              requested_role: requestedRole
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          writeLastActivityAt();
          prepareForSession(data.session);
          await loadProfileForSession(data.session);
        }

        return {
          needsEmailConfirmation: !data.session,
          userId: data.user?.id ?? null
        };
      },
      async signOut() {
        if (usesCookieAuthProvider()) {
          clearAuthState();
          redirectToCookieAuth("sign-out", null);
          return;
        }

        clearAuthState();
        await supabase.auth.signOut();
      },
      getAccessToken() {
        return session?.access_token ?? "";
      },
      async refreshProfile() {
        if (usesCookieAuthProvider()) {
          return loadPortalProfile();
        }

        if (!session?.user) {
          setProfile(null);
          setProfileError(null);
          setRequiresProfileRecovery(false);
          return null;
        }

        const nextProfile = await fetchProfile(session.user.id);
        setProfile(nextProfile);
          setProfileError(
            nextProfile
              ? null
              : "We couldn't load your profile yet. If this is an older account, try the recovery form below once."
          );
        setRequiresProfileRecovery(!nextProfile);
        return nextProfile;
      }
    }),
    [isLoading, profile, profileError, requiresProfileRecovery, session]
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
