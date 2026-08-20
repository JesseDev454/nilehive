import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PreviewRoleContextValue {
  currentUser: {
    full_name: string;
  };
}

const PreviewRoleContext = createContext<PreviewRoleContextValue>({
  currentUser: { full_name: "Zainab Ahmed" },
});

export function PreviewRoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  return (
    <PreviewRoleContext.Provider value={{ currentUser: { full_name: profile.full_name } }}>
      {children}
    </PreviewRoleContext.Provider>
  );
}

export function useRole() {
  return useContext(PreviewRoleContext);
}
