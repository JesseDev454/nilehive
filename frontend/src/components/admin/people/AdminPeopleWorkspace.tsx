import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPeopleHeader } from "./AdminPeopleHeader";
import { AdminPeopleTable } from "./AdminPeopleTable";
import { AdminPersonDetailModal } from "./AdminPersonDetailModal";
import { AdminRoleAssignmentModal } from "./AdminRoleAssignmentModal";
import { PeopleDirectoryStatus } from "./PeopleDirectoryStatus";
import { useAdminPeopleData } from "./useAdminPeopleData";
import type { PersonDirectoryView } from "@/lib/people/types";
import { Button } from "@/components/ui/button";

export function AdminPeopleWorkspace() {
  const { reportAuthFailure } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [club, setClub] = useState("all");
  const [page, setPage] = useState(1);
  const [assigning, setAssigning] = useState<PersonDirectoryView | null>(null);

  const data = useAdminPeopleData(reportAuthFailure, {
    search,
    role,
    clubId: club,
    page,
  });

  const filteredEmpty = data.directory.status === "ready" && data.directory.items.length === 0 && Boolean(search || role !== "all" || club !== "all");
  const showTable = data.directory.status === "ready" || data.directory.status === "refreshing";

  const rangeLabel = useMemo(() => {
    if (!data.directory.total) return "0 people";
    const start = (data.directory.page - 1) * data.directory.pageSize + 1;
    const end = Math.min(data.directory.page * data.directory.pageSize, data.directory.total);
    return `Showing ${start}–${end} of ${data.directory.total}`;
  }, [data.directory.page, data.directory.pageSize, data.directory.total]);

  const openAssign = (user: PersonDirectoryView) => {
    data.closePerson();
    setAssigning(user);
  };

  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-6 pb-16"
      data-people-source={data.source}
    >
      <AdminPeopleHeader
        counts={data.counts}
        searchTerm={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        roleFilter={role}
        onRoleFilterChange={(value) => {
          setRole(value);
          setPage(1);
        }}
        clubFilter={club}
        onClubFilterChange={(value) => {
          setClub(value);
          setPage(1);
        }}
        clubs={data.clubs}
      />

      <div className="sr-only" aria-live="polite">
        {data.liveMessage}
      </div>

      <PeopleDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
      />

      {showTable && data.directory.items.length > 0 ? (
        <>
          <AdminPeopleTable
            users={data.directory.items}
            mutatingIds={data.mutatingIds}
            onInspect={(user) => void data.openPerson(user)}
            onAssignRole={openAssign}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <span>{rangeLabel}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                disabled={data.directory.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                disabled={!data.directory.hasNext}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <AdminPersonDetailModal
        user={data.selected}
        open={Boolean(data.selected) || data.detailStatus === "loading" || data.detailStatus === "error"}
        loading={data.detailStatus === "loading"}
        error={data.detailError}
        saving={Boolean(data.selected && data.mutatingIds.includes(data.selected.id))}
        onOpenChange={(open) => {
          if (!open) data.closePerson();
        }}
        onAssignRole={openAssign}
        onRetry={data.selected ? () => void data.openPerson(data.selected as PersonDirectoryView) : undefined}
      />
      <AdminRoleAssignmentModal
        user={assigning}
        clubs={data.clubs}
        open={Boolean(assigning)}
        saving={Boolean(assigning && data.mutatingIds.includes(assigning.id))}
        mockMode={data.mockMode}
        onOpenChange={(open) => {
          if (!open && assigning && data.mutatingIds.includes(assigning.id)) return;
          if (!open) setAssigning(null);
        }}
        onSaveAssignment={async (input) => {
          const error = await data.saveAssignment(input);
          if (!error) {
            toast.success(data.mockMode ? "Assignment saved in this UI preview." : "OneClub role saved.");
            setAssigning(null);
          }
          return error;
        }}
      />
    </section>
  );
}
