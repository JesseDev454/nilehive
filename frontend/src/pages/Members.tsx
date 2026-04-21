import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  createClubMember,
  getClubs,
  getClubMembers,
  updateClubMember,
  type ClubMemberRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { isValidStudentId, normalizeStudentId, STUDENT_ID_ERROR_MESSAGE, STUDENT_ID_PLACEHOLDER } from "@/lib/studentId";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load members right now.";
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
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [memberClubFilter, setMemberClubFilter] = useState("all");
  const [clubRole, setClubRole] = useState<ClubMemberRecord["club_role"]>("member");
  const [membershipStatus, setMembershipStatus] = useState<ClubMemberRecord["membership_status"]>("inactive");
  const canViewMembers = role === "president" || role === "executive" || role === "admin";
  const canManageMembers = role === "president" || role === "admin";

  const {
    data: members = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["club-members", role, memberClubFilter],
    queryFn: () =>
      getClubMembers({
        club_id: role === "admin" && memberClubFilter !== "all" ? memberClubFilter : undefined
      }),
    enabled: canViewMembers,
    retry: false
  });
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
  const createMutation = useMutation({
    mutationFn: () =>
      createClubMember({
        club_id: role === "admin" ? selectedClubId : undefined,
        full_name: fullName,
        student_id: studentId,
        email: email || null,
        phone_number: phoneNumber || null,
        club_role: clubRole,
        membership_status: membershipStatus
      }),
    onSuccess: async () => {
      actionSuccess("Member added", "The club member database has been updated.");
      setFullName("");
      setStudentId("");
      setEmail("");
      setPhoneNumber("");
      setSelectedClubId("");
      setClubRole("member");
      setMembershipStatus("inactive");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not add member", mutationError, getErrorMessage(mutationError));
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({
      member,
      patch
    }: {
      member: ClubMemberRecord;
      patch: Partial<Pick<ClubMemberRecord, "club_role" | "membership_status">>;
    }) => updateClubMember(member.id, patch),
    onSuccess: async () => {
      actionSuccess("Member updated", "The member record has been saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not update member", mutationError, getErrorMessage(mutationError));
    }
  });

  function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidStudentId(studentId)) {
      actionError("Check student ID", new Error(STUDENT_ID_ERROR_MESSAGE), STUDENT_ID_ERROR_MESSAGE);
      return;
    }

    createMutation.mutate();
  }

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
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="president">President</SelectItem>
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
                        {role === "admin" ? <SelectItem value="alumni">Alumni</SelectItem> : null}
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

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Club Records"
        title="Member Database"
        description="View club members and keep the executive team structure organized."
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
                  <p className="nh-panel-title text-muted-foreground">Visible Members</p>
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

      {canManageMembers ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Member</CardTitle>
            <p className="text-sm text-muted-foreground">
              New members start inactive until dues are verified for the current academic session.
              Alumni status is controlled by Club Services admins.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="nh-form-grid">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Amina Yusuf"
                  required
                />
              </div>
              {role === "admin" ? (
                <div className="space-y-2">
                  <Label htmlFor="club_id">Club</Label>
                  <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                    <SelectTrigger id="club_id">
                      <SelectValue placeholder="Select club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  inputMode="numeric"
                  maxLength={9}
                  pattern="[0-9]{9}"
                  value={studentId}
                  onChange={(event) => setStudentId(normalizeStudentId(event.target.value))}
                  placeholder={STUDENT_ID_PLACEHOLDER}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter exactly 9 digits.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@nileuniversity.edu.ng"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="08000000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club_role">Club Role</Label>
                <Select value={clubRole} onValueChange={(value) => setClubRole(value as ClubMemberRecord["club_role"])}>
                  <SelectTrigger id="club_role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="president">President</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="membership_status">Status</Label>
                <Select
                  value={membershipStatus}
                  onValueChange={(value) => setMembershipStatus(value as ClubMemberRecord["membership_status"])}
                >
                  <SelectTrigger id="membership_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    {role === "admin" ? <SelectItem value="alumni">Alumni</SelectItem> : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </div>
            </form>
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
                Add the first member above to start building the club database.
              </p>
            </div>
          ) : role === "admin" ? (
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
          ) : (
            renderMembersTable(members)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
