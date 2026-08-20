import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCurrentProfile, beginCampusOneLogin, logoutCampusOne, type ProfileMeRecord } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import { isOneClubRole, type OneClubRole } from "@/lib/workspaceRoutes";

export type PreviewRole = OneClubRole;

export interface PreviewProfile {
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  phone_number: string;
  club_name: string;
}

interface PreviewUser {
  email: string;
}

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "session_expired"
  | "unauthorized"
  | "suspended"
  | "unsupported_domain"
  | "offline"
  | "error";

export interface AuthContextValue {
  status: AuthStatus;
  mode: "mock" | "integrated";
  profile: PreviewProfile;
  user: PreviewUser;
  sessionProfile: ProfileMeRecord | null;
  app_role: string | null;
  portal_role: string | null;
  custom_roles: string[];
  effective_role: OneClubRole | null;
  account_status: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  beginLogin: (returnTo?: string) => void;
  signOut: () => Promise<void>;
}

const PREVIEW_PROFILE: PreviewProfile = {
  full_name: "Amina Bello",
  email: "amina.bello@nileuniversity.edu.ng",
  student_id: "NIL/2023/UG/0458",
  department: "Computer Science",
  phone_number: "+234 800 000 0458",
  club_name: "Nile Google Developers",
};

const defaultContext: AuthContextValue = {
  status: "authenticated",
  mode: "mock",
  profile: PREVIEW_PROFILE,
  user: { email: PREVIEW_PROFILE.email },
  sessionProfile: null,
  app_role: "student",
  portal_role: "student",
  custom_roles: [],
  effective_role: "student",
  account_status: "active",
  errorCode: null,
  errorMessage: null,
  refresh: async () => undefined,
  beginLogin: () => undefined,
  signOut: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultContext);

function mapPreviewProfile(record: ProfileMeRecord | null, email: string | null): PreviewProfile {
  return {
    full_name: record?.full_name || "OneClub user",
    email: record?.email || email || "",
    student_id: record?.student_id || "",
    department: "",
    phone_number: "",
    club_name: "",
  };
}

function statusFromError(error: unknown): Pick<AuthContextValue, "status" | "errorCode" | "errorMessage"> {
  if (error instanceof ApiClientError) {
    if (error.code === "NETWORK_ERROR" || error.status === 0) {
      return { status: "offline", errorCode: error.code, errorMessage: error.message };
    }
    if (error.code === "SESSION_EXPIRED" || error.code === "INVALID_SESSION") {
      return { status: "session_expired", errorCode: error.code, errorMessage: error.message };
    }
    if (error.code === "AUTH_REQUIRED" || error.status === 401) {
      return { status: "unauthenticated", errorCode: error.code, errorMessage: error.message };
    }
    if (error.code === "ACCOUNT_SUSPENDED") {
      return { status: "suspended", errorCode: error.code, errorMessage: error.message };
    }
    if (error.code === "UNSUPPORTED_EMAIL_DOMAIN") {
      return { status: "unsupported_domain", errorCode: error.code, errorMessage: error.message };
    }
    if (error.status === 403) {
      return { status: "unauthorized", errorCode: error.code, errorMessage: error.message };
    }
    return { status: "error", errorCode: error.code, errorMessage: error.message };
  }

  return {
    status: "error",
    errorCode: "UNEXPECTED",
    errorMessage: "OneClub could not complete sign-in.",
  };
}

export function PreviewAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={defaultContext}>
      {children}
    </AuthContext.Provider>
  );
}

function IntegratedAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [sessionProfile, setSessionProfile] = useState<ProfileMeRecord | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const loadProfile = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setStatus("checking");
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const data = await getCurrentProfile(controller.signal);
      if (controller.signal.aborted) return;

      const record = data.profile;
      const nextRole = record?.effective_role;
      if (!record || !isOneClubRole(nextRole)) {
        setSessionProfile(record);
        setUserEmail(data.user.email);
        setStatus("unauthorized");
        setErrorCode("UNSUPPORTED_ROLE");
        setErrorMessage("This OneClub role is not available.");
        return;
      }

      setSessionProfile(record);
      setUserEmail(data.user.email);
      setStatus("authenticated");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const mapped = statusFromError(error);
      if (!navigator.onLine || mapped.status === "offline") {
        setStatus("offline");
        setErrorCode("NETWORK_ERROR");
        setErrorMessage(mapped.errorMessage);
        return;
      }
      setSessionProfile(null);
      setStatus(mapped.status);
      setErrorCode(mapped.errorCode);
      setErrorMessage(mapped.errorMessage);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    return () => inFlight.current?.abort();
  }, [loadProfile]);

  const beginLogin = useCallback((returnTo?: string) => {
    const next = returnTo || `${window.location.pathname}${window.location.search}` || "/";
    beginCampusOneLogin(next);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutCampusOne();
    } catch {
      // Cookie clear on the server is best-effort; always return to login.
    } finally {
      setSessionProfile(null);
      setUserEmail(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const effective = isOneClubRole(sessionProfile?.effective_role) ? sessionProfile.effective_role : null;
    return {
      status,
      mode: "integrated",
      profile: mapPreviewProfile(sessionProfile, userEmail),
      user: { email: sessionProfile?.email || userEmail || "" },
      sessionProfile,
      app_role: sessionProfile?.app_role ?? null,
      portal_role: sessionProfile?.portal_role ?? null,
      custom_roles: sessionProfile?.custom_roles ?? [],
      effective_role: effective,
      account_status: sessionProfile?.account_status ?? null,
      errorCode,
      errorMessage,
      refresh: loadProfile,
      beginLogin,
      signOut,
    };
  }, [status, sessionProfile, userEmail, errorCode, errorMessage, loadProfile, beginLogin, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isMockPreviewMode()) {
    return <PreviewAuthProvider>{children}</PreviewAuthProvider>;
  }
  return <IntegratedAuthProvider>{children}</IntegratedAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
