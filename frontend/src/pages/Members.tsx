import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  getClubs,
  getClubMembers,
  updateClubMember,
  type ClubMemberRecord,
  type UpdateClubMemberPayload
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

interface PresidentConflictDetails {
  current_president?: {
    id: string;
    full_name: string | null;
    student_id: string | null;
    club_id: string | null;
  } | null;
}

interface PendingPresidentReplacement {
  member: ClubMemberRecord;
  patch: UpdateClubMemberPayload;
  currentPresident: PresidentConflictDetails["current_president"];
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load members right now.";
}

function getPresidentConflictDetails(error: unknown): PresidentConflictDetails["current_president"] {
  if (!(error instanceof ApiClientError) || error.code !== "PRESIDENT_ALREADY_EXISTS") {
    return null;
  }

  const details = error.details as PresidentConflictDetails | undefined;
  return details?.current_president ?? null;
}

function RoleBadge({ role }: { role: ClubMemberRecord["club_role"] }) {
  const className =
    role === "president"
      ? "bg-primary/15 text-primary hover:bg-primary/15"
      : role === "executive"
        ? "bg-success/15 text-success hover:bg-success/15"
        : "bg-muted text-muted-foreground hover:bg-muted";

  return <Badge className={`${className} capitalize`}>{role}</Badge>;
}

function StatusBadge({ status }: { status: ClubMemberRecord["membership_status"] }) {
  const className =
    status === "active"
      ? "bg-success/15 text-success hover:bg-success/15"
      : status === "inactive"
        ? "bg-warning/15 text-warning hover:bg-warning/15"
        : "bg-muted text-muted-foreground hover:bg-muted";

  return <Badge className={`${className} capitalize`}>{status}</Badge>;
}

export default function Members() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [memberClubFilter, setMemberClubFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pendingPresidentReplacement, setPendingPresidentReplacement] = useState<PendingPresidentReplacement | null>(null);
  const canViewMembers = role === "president" || role === "executive" || role === "admin";
  const canManageMembers = role === "president" || role === "admin";
  const availableClubRoles: ClubMemberRecord["club_role"][] = role === "admin"
    ? ["member", "executive", "president"]
    : ["member", "executive"];

  useEffect(() => {
    setPage(1);
  }, [memberClubFilter]);

  const {
    data: membersPage = emptyPaginatedResponse<ClubMemberRecord>(),
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["club-members", role, memberClubFilter, page],
    queryFn: () =>
      getClubMembers({
        club_id: role === "admin" && memberClubFilter !== "all" ? memberClubFilter : undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE
      }),
    enabled: canViewMembers,
    retry: false
  });

  const members = useMemo(
    () => membersPage.items.filter((member) => member.membership_status !== "alumni"),
    [membersPage.items]
  );

  const { data: clubs = [] } = useQuery({
    queryKey: ["member-form-clubs"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });

  const clubNameById = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs]
  );

  const groupedMembers = useMemo(() => {
    if (role !== "admin") {
      return [];
    }

    const groups = new Map<string, { id: string; name: string; code: string | null; members: ClubMemberRecord[] }>();

    members.forEach((member) => {
      const clubId = member.club_id || "unknown";
      const existing = groups.get(clubId);
      const clubName = member.club?.name || clubNameById.get(member.club_id) || "Unassigned club";

      if (existing) {
        existing.members.push(member);
        return;
      }

      groups.set(clubId, {
        id: clubId,
        name: clubName,
        code: member.club?.code ?? null,
        members: [member]
      });
    });

    return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [clubNameById, members, role]);

  const updateMutation = useMutation({
    mutationFn: ({
      member,
      patch
    }: {
      member: ClubMemberRecord;
      patch: UpdateClubMemberPayload;
    }) => updateClubMember(member.id, patch),
    onSuccess: async () => {
      setPendingPresidentReplacement(null);
      actionSuccess("Member updated", "The member record has been saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] })
      ]);
    },
    onError: (mutationError, variables) => {
      if (mutationError instanceof ApiClientError && mutationError.code === "PRESIDENT_ALREADY_EXISTS") {
        setPendingPresidentReplacement({
          member: variables.member,
          patch: variables.patch,
          currentPresident: getPresidentConflictDetails(mutationError)
        });
        return;
      }

      actionError("Could not update member", mutationError, getErrorMessage(mutationError));
    }
  });

  function renderMembersTable(memberList: ClubMemberRecord[]) {
    return (
      <div className="nh-table-wrap">
        <table className="nh-table">
          <thead>
            <tr>
              <th>Name</th>
              <th className="hidden md:table-cell">Student ID</th>
              <th className="hidden lg:table-cell">Contact</th>
              <th>Club</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-accent/50">
                <td>
                  <p className="font-medium">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground md:hidden">{member.student_id}</p>
                  <p className="text-xs text-muted-foreground lg:hidden">{member.email || member.phone_number || "No contact"}</p>
                </td>
                <td className="hidden md:table-cell text-muted-foreground">{member.student_id}</td>
                <td className="hidden lg:table-cell text-muted-foreground">
                  <p>{member.email || "-"}</p>
                  <p className="text-xs">{member.phone_number || ""}</p>
                </td>
                <td>
                  <p className="font-medium">{member.club?.name || clubNameById.get(member.club_id) || "Unknown club"}</p>
                  <p className="text-xs text-muted-foreground">{member.club?.code || "No code"}</p>
                </td>
                <td>
                  {canManageMembers ? (
                    <Select
                      value={member.club_role}
                      disabled={updateMutation.isPending}
                      onValueChange={(value) =>
                        updateMutation.mutate({
                          member,
                          patch: { club_role: value as ClubMemberRecord["club_role"] }
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClubRoles.map((clubRoleOption) => (
                          <SelectItem key={clubRoleOption} value={clubRoleOption}>
                            {clubRoleOption.charAt(0).toUpperCase() + clubRoleOption.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <RoleBadge role={member.club_role} />
                  )}
                </td>
                <td>
                  {canManageMembers ? (
                    <Select
                      value={member.membership_status}
                      disabled={updateMutation.isPending}
                      onValueChange={(value) =>
                        updateMutation.mutate({
                          member,
                          patch: { membership_status: value as ClubMemberRecord["membership_status"] }
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={member.membership_status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!canViewMembers) {
    return (
      <div className="nh-page">
        <NeoPageHeader
          eyebrow="Club Records"
          title="Member Database"
          description="Member records are available to executives, presidents, and Club Services admins."
        />
        <NeoStateCard icon={Users} title="Member access is restricted" message="This role does not use the member database yet." />
      </div>
    );
  }

  const currentPresidentLabel = pendingPresidentReplacement?.currentPresident?.full_name
    || pendingPresidentReplacement?.currentPresident?.student_id
    || "the current president";
  const replacementMemberLabel = pendingPresidentReplacement?.member.full_name || "this member";

  return (
    <>
      <div className="nh-page">
        <NeoPageHeader
          eyebrow="Club Records"
          title="Member Database"
          description="View signed-up members, track club roles, and keep your club records organized."
        />

        {role === "admin" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Club Services Member View</CardTitle>
              <p className="text-sm text-muted-foreground">
                Filter and review members across all registered clubs.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-[320px_1fr] md:items-end">
                <div className="space-y-2">
                  <Label htmlFor="member_club_filter">Club filter</Label>
                  <Select value={memberClubFilter} onValueChange={setMemberClubFilter}>
                    <SelectTrigger id="member_club_filter">
                      <SelectValue placeholder="All clubs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All clubs</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}{club.code ? ` (${club.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="nh-card-soft p-3">
                    <p className="nh-panel-title text-muted-foreground">Members</p>
                    <p className="mt-1 text-2xl font-black">{members.length}</p>
                  </div>
                  <div className="nh-card-soft p-3">
                    <p className="nh-panel-title text-muted-foreground">Active</p>
                    <p className="mt-1 text-2xl font-black">{members.filter((member) => member.membership_status === "active").length}</p>
                  </div>
                  <div className="nh-card-soft p-3">
                    <p className="nh-panel-title text-muted-foreground">Clubs Shown</p>
                    <p className="mt-1 text-2xl font-black">{groupedMembers.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Club Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <NeoLoadingState title="Loading member database" message="We are organizing club member records." compact />
            ) : isError ? (
              <div className="nh-empty border-destructive bg-destructive/5">
                <p className="font-medium">Unable to load members</p>
                <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
              </div>
            ) : members.length === 0 ? (
              <div className="nh-empty">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No member records yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Member records will appear here once students join clubs and dues are verified.
                </p>
              </div>
            ) : role === "admin" ? (
              <div>
                <div className="space-y-6">
                  {groupedMembers.map((group) => {
                    const activeCount = group.members.filter((member) => member.membership_status === "active").length;

                    return (
                      <section key={group.id} className="space-y-3">
                        <div className="flex flex-col gap-2 border-2 border-foreground bg-primary p-4 text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground))] sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="nh-panel-title text-primary-foreground/70">{group.code || "No code"}</p>
                            <h3 className="text-xl font-black uppercase">{group.name}</h3>
                          </div>
                          <div className="flex gap-3 text-sm font-black uppercase tracking-[0.12em]">
                            <span>{group.members.length} member(s)</span>
                            <span>{activeCount} active</span>
                          </div>
                        </div>
                        {renderMembersTable(group.members)}
                      </section>
                    );
                  })}
                </div>
                <DataPagination
                  page={membersPage.page}
                  pageSize={membersPage.page_size}
                  total={membersPage.total}
                  hasNext={membersPage.has_next}
                  onPageChange={setPage}
                />
              </div>
            ) : (
              <div>
                {renderMembersTable(members)}
                <DataPagination
                  page={membersPage.page}
                  pageSize={membersPage.page_size}
                  total={membersPage.total}
                  hasNext={membersPage.has_next}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(pendingPresidentReplacement)}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) {
            setPendingPresidentReplacement(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Club President?</DialogTitle>
            <DialogDescription>
              This club already has a president. Confirming this change will replace the current president and keep the one-president-per-club rule intact.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border-2 border-foreground bg-muted/40 p-4 text-sm">
            <p>
              <span className="font-black uppercase tracking-[0.08em]">Current president:</span>{" "}
              {currentPresidentLabel}
            </p>
            <p>
              <span className="font-black uppercase tracking-[0.08em]">New president:</span>{" "}
              {replacementMemberLabel}
            </p>
            <p className="text-muted-foreground">
              {currentPresidentLabel} will be demoted to a regular member record and lose local president access in NileHive.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingPresidentReplacement(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!pendingPresidentReplacement) {
                  return;
                }

                updateMutation.mutate({
                  member: pendingPresidentReplacement.member,
                  patch: {
                    ...pendingPresidentReplacement.patch,
                    replace_existing_president: true
                  }
                });
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Replacing..." : "Confirm Replacement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
