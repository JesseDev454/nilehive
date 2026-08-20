import { createContext, useContext, type ReactNode } from "react";

interface PreviewRoleContextValue {
  currentUser: {
    full_name: string;
  };
}

const PreviewRoleContext = createContext<PreviewRoleContextValue>({
  currentUser: { full_name: "Zainab Ahmed" },
});

export function PreviewRoleProvider({ children }: { children: ReactNode }) {
  return (
    <PreviewRoleContext.Provider
      value={{ currentUser: { full_name: "Zainab Ahmed" } }}
    >
      {children}
    </PreviewRoleContext.Provider>
  );
}

export function useRole() {
  return useContext(PreviewRoleContext);
}
