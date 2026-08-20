import { Eye, ShieldCheck, UserCog, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampusUserRecord, AssignableOneClubRole } from "@/data/adminPeopleData";

interface AdminPeopleTableProps {
  users: CampusUserRecord[];
  onInspect: (user: CampusUserRecord) => void;
  onAssignRole: (user: CampusUserRecord) => void;
}

function RolePill({ role }: { role: AssignableOneClubRole }) {
  switch (role) {
    case "president":
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          Club President
        </span>
      );
    case "executive":
      return (
        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
          Club Executive
        </span>
      );
    case "advisor":
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          Staff Advisor
        </span>
      );
    case "student":
      return (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Student
        </span>
      );
  }
}

export function AdminPeopleTable({
  users,
  onInspect,
  onAssignRole
}: AdminPeopleTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Grouped Table Header separating Campus One from OneClub */}
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th className="py-3.5 pl-4 pr-3 sm:pl-6">
                <span className="text-[10px] uppercase tracking-wider text-foreground">Campus One Identity (Read-Only)</span>
              </th>
              <th className="px-3 py-3.5 hidden md:table-cell">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Faculty &amp; Dept</span>
              </th>
              <th className="px-3 py-3.5">
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">OneClub Role</span>
              </th>
              <th className="px-3 py-3.5 hidden sm:table-cell">
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Club Assignment</span>
              </th>
              <th className="px-3 py-3.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
              </th>
              <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-muted/30 group"
              >
                {/* 1. Campus One Identity (Read-Only) */}
                <td className="py-3 pl-4 pr-3 sm:pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {user.fullName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {user.campusId}
                    </span>
                    <span className="text-[10px] text-muted-foreground/80 truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </div>
                </td>

                {/* 2. Campus Dept & Faculty */}
                <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">
                  <div className="flex flex-col text-[11px]">
                    <span className="font-medium text-foreground">{user.department}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{user.faculty}</span>
                  </div>
                </td>

                {/* 3. OneClub Role */}
                <td className="px-3 py-3">
                  <RolePill role={user.oneClubRole} />
                </td>

                {/* 4. Club Assignment */}
                <td className="px-3 py-3 hidden sm:table-cell">
                  {user.assignedClubName ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[180px]">{user.assignedClubName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[11px] italic">None (General)</span>
                  )}
                </td>

                {/* 5. Account Status */}
                <td className="px-3 py-3">
                  <Badge variant="outline" className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {user.accountStatus}
                  </Badge>
                </td>

                {/* 6. Actions */}
                <td className="py-3 pl-3 pr-4 sm:pr-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspect(user)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Inspect Campus One profile and club memberships"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignRole(user)}
                      className="h-8 gap-1 text-[11px] font-semibold hover:border-primary hover:text-primary"
                    >
                      <UserCog className="h-3 w-3" />
                      <span>Assign</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
