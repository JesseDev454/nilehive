import React, { createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Role = "executive" | "advisor" | "admin" | "president" | "student";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "executive",
  setRole: () => {},
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { role: authenticatedRole } = useAuth();
  const role = authenticatedRole ?? "executive";
  const setRole = () => {};

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
