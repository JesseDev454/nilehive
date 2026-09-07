import type { Role } from "@/contexts/RoleContext";

export function canViewProposalDetails(role: Role | null) {
  return role === "president" || role === "advisor" || role === "admin";
}
