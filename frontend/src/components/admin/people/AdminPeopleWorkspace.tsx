import { useMemo, useState } from "react";
import { AdminPeopleHeader } from "./AdminPeopleHeader";
import { AdminPeopleTable } from "./AdminPeopleTable";
import { AdminPersonDetailModal } from "./AdminPersonDetailModal";
import { AdminRoleAssignmentModal } from "./AdminRoleAssignmentModal";
import {
  INITIAL_CAMPUS_USERS,
  type AssignableOneClubRole,
  type CampusUserRecord,
} from "@/data/adminPeopleData";

export function AdminPeopleWorkspace() {
  const [users, setUsers] = useState(INITIAL_CAMPUS_USERS);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [club, setClub] = useState("all");
  const [selected, setSelected] = useState<CampusUserRecord | null>(null);
  const [assigning, setAssigning] = useState<CampusUserRecord | null>(null);

  const visible = useMemo(
    () =>
      users.filter(
        (user) =>
          (role === "all" || user.oneClubRole === role) &&
          (club === "all" || user.assignedClubId === club) &&
          `${user.fullName} ${user.campusId} ${user.email} ${user.assignedClubName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [users, search, role, club],
  );

  const counts = {
    total: users.length,
    presidents: users.filter((user) => user.oneClubRole === "president").length,
    executives: users.filter((user) => user.oneClubRole === "executive").length,
    advisors: users.filter((user) => user.oneClubRole === "advisor").length,
    students: users.filter((user) => user.oneClubRole === "student").length,
  };

  const saveAssignment = (
    userId: string,
    nextRole: AssignableOneClubRole,
    clubId: string | null,
    clubName: string | null,
    executiveTitle?: string,
  ) => {
    setUsers((items) =>
      items.map((user) =>
        user.id === userId
          ? { ...user, oneClubRole: nextRole, assignedClubId: clubId, assignedClubName: clubName, executiveTitle }
          : user,
      ),
    );
    setAssigning(null);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 pb-16">
      <AdminPeopleHeader
        counts={counts}
        searchTerm={search}
        onSearchChange={setSearch}
        roleFilter={role}
        onRoleFilterChange={setRole}
        clubFilter={club}
        onClubFilterChange={setClub}
      />
      <AdminPeopleTable users={visible} onInspect={setSelected} onAssignRole={setAssigning} />
      <AdminPersonDetailModal
        user={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onAssignRole={(user) => {
          setSelected(null);
          setAssigning(user);
        }}
      />
      <AdminRoleAssignmentModal
        user={assigning}
        allUsers={users}
        open={Boolean(assigning)}
        onOpenChange={(open) => !open && setAssigning(null)}
        onSaveAssignment={saveAssignment}
      />
    </section>
  );
}
