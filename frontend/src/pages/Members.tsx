import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
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
  const [clubRole, setClubRole] = useState<ClubMemberRecord["club_role"]>("member");
  const [membershipStatus, setMembershipStatus] = useState<ClubMemberRecord["membership_status"]>("active");
  const canViewMembers = role === "president" || role === "executive" || role === "admin";
  const canManageMembers = role === "president" || role === "admin";

  const {
    data: members = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["club-members", role],
    queryFn: () => getClubMembers(),
    enabled: canViewMembers,
    retry: false
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ["member-form-clubs"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });
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
      toast.success("Member added", {
        description: "The club member database has been updated."
      });
      setFullName("");
      setStudentId("");
      setEmail("");
      setPhoneNumber("");
      setSelectedClubId("");
      setClubRole("member");
      setMembershipStatus("active");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not add member", {
        description: getErrorMessage(mutationError)
      });
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
      toast.success("Member updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not update member", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  if (!canViewMembers) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Member Database</h1>
          <p className="text-muted-foreground text-sm mt-1">Member records are available to executives, presidents, and admins.</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">This role does not use the member database yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Member Database</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View club members and keep the executive team structure organized.
        </p>
      </div>

      {canManageMembers ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="NILE-001"
                  required
                />
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
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
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load members</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No member records yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add the first member above to start building the club database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Student ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Contact</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{member.student_id}</p>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{member.student_id}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        <p>{member.email || "-"}</p>
                        <p className="text-xs">{member.phone_number || ""}</p>
                      </td>
                      <td className="p-3">
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
                      <td className="p-3">
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
                              <SelectItem value="alumni">Alumni</SelectItem>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
