import { createContext, useContext, type ReactNode } from "react";

export type PreviewRole = "student" | "president" | "executive" | "advisor" | "admin";

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

interface AuthContextValue {
  profile: PreviewProfile;
  user: PreviewUser;
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

const AuthContext = createContext<AuthContextValue>({
  profile: PREVIEW_PROFILE,
  user: { email: PREVIEW_PROFILE.email },
  signOut: async () => undefined,
});

export function PreviewAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        profile: PREVIEW_PROFILE,
        user: { email: PREVIEW_PROFILE.email },
        signOut: async () => undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
