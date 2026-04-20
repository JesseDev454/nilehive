import React, { createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Role = "executive" | "advisor" | "admin" | "president" | "student";

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { role: authenticatedRole } = useAuth();
  const setRole = () => {};

  return (
    <RoleContext.Provider value={{ role: authenticatedRole, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
