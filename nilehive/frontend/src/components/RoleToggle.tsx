import { useRole, Role } from "@/contexts/RoleContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";

const roles: { value: Role; label: string }[] = [
  { value: "executive", label: "Executive" },
  { value: "advisor", label: "Advisor" },
  { value: "admin", label: "Admin" },
  { value: "president", label: "President" },
  { value: "student", label: "Student" },
];

export function RoleToggle() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-muted-foreground" />
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
