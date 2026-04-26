import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, UserCog, Users } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { NeoLoadingState, NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  assignAdminUserAdvisor,
  getClubs,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUserProfileRecord,
  type ProfileRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

const ROLE_OPTIONS: ProfileRecord["role"][] = ["student", "executive", "president", "advisor", "admin"];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to complete this user management action right now.";
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function RoleBadge({ role }: { role: ProfileRecord["role"] }) {
  const className = {
    admin: "bg-destructive/15 text-destructive hover:bg-destructive/15",
    advisor: "bg-primary/15 text-primary hover:bg-primary/15",
    president: "bg-secondary/15 text-secondary hover:bg-secondary/15",
    executive: "bg-warning/15 text-warning hover:bg-warning/15",
    student: "bg-muted text-muted-foreground hover:bg-muted"
  }[role];

  return <Badge className={`${className} capitalize`}>{role}</Badge>;
}

function UserActionPanel({ user, onClose }: { user: AdminUserProfileRecord; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<ProfileRecord["role"]>(user.role);
  const [clubId, setClubId] = useState(user.club_id || "none");
  const [remarks, setRemarks] = useState("");
  const { data: clubs = [] } = useQuery({
    queryKey: ["admin-user-management-clubs"],
    queryFn: () => getClubs(),
    retry: false
  });
  const roleMutation = useMutation({
    mutationFn: () =>
      updateAdminUserRole(user.id, {
        role,
        club_id: clubId === "none" ? null : clubId,
        remarks: remarks || null
      }),
    onSuccess: async () => {
      actionSuccess("User role updated", `${user.full_name || "User"} is now ${role}.`);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: (error) => {
      actionError("Could not update role", error, getErrorMessage(error));
    }
  });
  const advisorMutation = useMutation({
    mutationFn: () =>
      assignAdminUserAdvisor(user.id, {
        club_id: clubId === "none" ? "" : clubId,
        remarks: remarks || null
      }),
    onSuccess: async () => {
      actionSuccess("Advisor assigned", `${user.full_name || "User"} is now assigned as club advisor.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-user-management-clubs"] })
      ]);
      onClose();
    },
    onError: (error) => {
      actionError("Could not assign advisor", error, getErrorMessage(error));
    }
  });
  const requiresClub = role === "executive" || role === "president" || role === "advisor";
  const isSaving = roleMutation.isPending || advisorMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (role === "advisor") {
      advisorMutation.mutate();
      return;
    }

    roleMutation.mutate();
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Manage User Access</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Update access for someone who has already signed up with a Nile University email.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="nh-form-grid" onSubmit={handleSubmit}>
          <div className="nh-card-soft p-4 lg:col-span-2">
            <p className="font-semibold">{user.full_name || "Unnamed user"}</p>
            <p className="text-sm text-muted-foreground">
              {user.student_id || "University ID not set"} - Current role: <span className="capitalize">{user.role}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Requested role: <span className="capitalize">{user.requested_role || "student"}</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This updates an existing signed-up user. It does not create a new login account.
            </p>
          </div>

          <div className="space-y-2">
            <Label>New role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as ProfileRecord["role"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((nextRole) => (
                  <SelectItem key={nextRole} value={nextRole}>
                    <span className="capitalize">{nextRole}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{requiresClub ? "Club" : "Club context"}</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger>
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{requiresClub ? "Select a club" : "No club"}</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}{club.code ? ` (${club.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === "advisor" && user.advisor_assignments?.length ? (
            <div className="nh-card-soft p-4 text-sm lg:col-span-2">
              <p className="font-semibold">Current advisor clubs</p>
              <p className="mt-2 text-muted-foreground">
                {user.advisor_assignments
                  .map((assignment) => assignment.club?.name || "Unknown club")
                  .join(", ")}
              </p>
            </div>
          ) : null}

          <div className="space-y-2 lg:col-span-2">
            <Label>Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Example: Approved by Club Services after verification."
              rows={3}
            />
          </div>

          <div className="flex justify-end lg:col-span-2">
            <Button type="submit" disabled={isSaving || (requiresClub && clubId === "none")}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : role === "advisor" ? (
                "Assign Advisor"
              ) : (
                "Update Role"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function UserManagement() {
  const { role } = useRole();
  const [roleFilter, setRoleFilter] = useState("all");
  const [requestedRoleFilter, setRequestedRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserProfileRecord | null>(null);
  useEffect(() => {
    setPage(1);
  }, [roleFilter, requestedRoleFilter, query]);
  const {
    data: usersPage = emptyPaginatedResponse<AdminUserProfileRecord>(),
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["admin-users", roleFilter, requestedRoleFilter, query, page],
    queryFn: () =>
      getAdminUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        requested_role: requestedRoleFilter === "all" ? undefined : requestedRoleFilter,
        q: query || undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE
      }),
    enabled: role === "admin",
    retry: false
  });
  const users = usersPage.items;
  const summary = useMemo(
    () => ({
      total: usersPage.total,
      students: users.filter((user) => user.role === "student").length,
      presidents: users.filter((user) => user.role === "president").length,
      executives: users.filter((user) => user.role === "executive").length,
      advisors: users.filter((user) => user.role === "advisor").length,
      advisorRequests: users.filter((user) => user.requested_role === "advisor").length
    }),
    [users, usersPage.total]
  );

  if (role !== "admin") {
    return (
      <div className="nh-page">
        <NeoStateCard
          icon={ShieldCheck}
          title="Admin area"
          message="User Management is only available to Club Services admins."
        />
      </div>
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Admin Controls"
        title="User Management"
        description="Review signed-up users, adjust their role, and assign club access from one place."
      />

      <div className="nh-metric-grid">
        <NeoMetricCard title="Visible Users" value={summary.total} icon={Users} tone="navy" />
        <NeoMetricCard title="Students" value={summary.students} icon={UserCog} tone="gold" />
        <NeoMetricCard title="Presidents / Executives" value={`${summary.presidents} / ${summary.executives}`} icon={ShieldCheck} tone="green" />
        <NeoMetricCard title="Advisors / Requests" value={`${summary.advisors} / ${summary.advisorRequests}`} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How access works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="nh-card-soft p-4">
            <p className="font-semibold">1. User signs up first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The user signs up with a Nile University email first. Students can submit their first club join during signup.
            </p>
          </div>
          <div className="nh-card-soft p-4">
            <p className="font-semibold">2. Club Services updates access</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use this page to assign president access, adjust club context, or attach advisor access after signup.
            </p>
          </div>
          <div className="nh-card-soft p-4">
            <p className="font-semibold">3. They log in with the new role</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Presidents can then choose executives from active club members. Users see the new role on their next refresh or sign-in.
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedUser ? <UserActionPanel user={selectedUser} onClose={() => setSelectedUser(null)} /> : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              User Directory
            </CardTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or ID"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLE_OPTIONS.map((nextRole) => (
                    <SelectItem key={nextRole} value={nextRole}>
                      <span className="capitalize">{nextRole}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={requestedRoleFilter} onValueChange={setRequestedRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Requested role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All requests</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NeoLoadingState title="Loading Club Services controls" message="We are preparing the user directory." compact />
          ) : isError ? (
            <div className="nh-empty border-destructive bg-destructive/5">
              <p className="font-medium">Unable to load users</p>
              <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="nh-empty">
              <UserCog className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No users match this view</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another role filter or search term.</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="nh-list-card flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{user.full_name || "Unnamed user"}</p>
                        <RoleBadge role={user.role} />
                        {user.requested_role === "advisor" && user.role === "student" ? (
                          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                            Requests advisor access
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(user.student_id || (user.requested_role === "advisor" || user.role === "advisor"
                          ? "No University ID required"
                          : "University ID not set"))} - {user.club?.name || "No club assigned"}
                      </p>
                      {user.advisor_assignments?.length ? (
                        <p className="text-xs text-muted-foreground">
                          Advisor clubs: {user.advisor_assignments.map((assignment) => assignment.club?.name || "Unknown club").join(", ")}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                    </div>
                    <Button type="button" onClick={() => setSelectedUser(user)}>
                      Manage Access
                    </Button>
                  </div>
                ))}
              </div>
              <DataPagination
                page={usersPage.page}
                pageSize={usersPage.page_size}
                total={usersPage.total}
                hasNext={usersPage.has_next}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
