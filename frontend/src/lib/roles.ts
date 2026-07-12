export function formatRoleLabel(role: string): string {
  return role.split("_").filter(Boolean).map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
}
