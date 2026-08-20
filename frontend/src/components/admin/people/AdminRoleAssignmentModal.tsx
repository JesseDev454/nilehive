import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { isAssignableOneClubRole } from "@/lib/people/adapters";
import type { PeopleUiError } from "@/lib/people/errors";
import type {
  AssignableOneClubRole,
  AssignmentClub,
  PersonDirectoryView,
} from "@/lib/people/types";

interface AdminRoleAssignmentModalProps {
  user: PersonDirectoryView | null;
  clubs: AssignmentClub[];
  open: boolean;
  saving: boolean;
  mockMode: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAssignment: (input: {
    profileId: string;
    role: AssignableOneClubRole;
    clubId: string | null;
    replaceExistingPresident?: boolean;
  }) => Promise<PeopleUiError | null>;
}

const ROLE_HELP: Record<AssignableOneClubRole, string> = {
  student: "Ordinary club member without leadership responsibilities.",
  executive: "Helps run one assigned club. A club is required.",
  president: "Leads one assigned club. A club is required.",
  advisor: "Staff advisor. Additional clubs can be assigned after this role is set.",
};

export function AdminRoleAssignmentModal({
  user,
  clubs,
  open,
  saving,
  mockMode,
  onOpenChange,
  onSaveAssignment,
}: AdminRoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<AssignableOneClubRole>("student");
  const [selectedClubId, setSelectedClubId] = useState<string>("none");
  const [executiveTitle, setExecutiveTitle] = useState("");
  const [replacementConfirmed, setReplacementConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [conflictPresident, setConflictPresident] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(isAssignableOneClubRole(user.oneClubRole) ? user.oneClubRole : "student");
      setSelectedClubId(user.assignedClubId || "none");
      setExecutiveTitle(user.executiveTitle || "");
      setReplacementConfirmed(false);
      setValidationError(null);
      setConflictPresident(null);
    }
  }, [user]);

  const requiresClub = selectedRole === "president" || selectedRole === "executive";
  const assignedAdvisorClubIds = useMemo(
    () => new Set((user?.advisorAssignments ?? []).map((assignment) => assignment.club_id)),
    [user],
  );

  const unchanged = useMemo(() => {
    if (!user) return true;
    if (selectedRole !== user.oneClubRole) return false;
    if (selectedRole === "president" || selectedRole === "executive") {
      return (user.assignedClubId || "none") === selectedClubId;
    }
    if (selectedRole === "advisor") {
      if (selectedClubId === "none") return true;
      return assignedAdvisorClubIds.has(selectedClubId);
    }
    return true;
  }, [assignedAdvisorClubIds, selectedClubId, selectedRole, user]);

  if (!user) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    setValidationError(null);

    if (requiresClub && selectedClubId === "none") {
      setValidationError(`The ${selectedRole} role requires selecting an official club.`);
      return;
    }

    if (conflictPresident && !replacementConfirmed) {
      setValidationError(`You must acknowledge replacing ${conflictPresident} as President before proceeding.`);
      return;
    }

    if (selectedRole === "advisor" && selectedClubId !== "none" && assignedAdvisorClubIds.has(selectedClubId)) {
      setValidationError("This advisor is already assigned to the selected club.");
      return;
    }

    const clubId = selectedRole === "student" || selectedClubId === "none" ? null : selectedClubId;
    const error = await onSaveAssignment({
      profileId: user.id,
      role: selectedRole,
      clubId,
      replaceExistingPresident: replacementConfirmed || undefined,
    });

    if (!error) {
      onOpenChange(false);
      return;
    }

    if (error.code === "DECISION_IN_PROGRESS") return;

    if (error.code === "PRESIDENT_ALREADY_EXISTS") {
      setConflictPresident(error.currentPresident?.full_name || "the current president");
      setReplacementConfirmed(false);
    }

    setValidationError(error.message);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <UserCog className="h-4 w-4 text-primary" />
            <span>Role Governance</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Change OneClub role for {user.fullName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign or update club leadership position for <strong className="text-foreground">{user.fullName}</strong>
            {user.campusId ? ` (${user.campusId})` : ""}. Campus One access is managed in Campus One. OneClub roles control responsibilities inside OneClub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Campus One Account</span>
            <p className="font-semibold text-foreground">{user.fullName}{user.email ? ` • ${user.email}` : ""}</p>
            <p className="text-muted-foreground text-[11px]">
              {(user.department || "Department not provided")}
              {user.campusOneBaseRole ? ` (${user.campusOneBaseRole})` : ""}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oneclub-role-select" className="text-xs font-semibold">
              Select OneClub Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => {
                setSelectedRole(val as AssignableOneClubRole);
                setReplacementConfirmed(false);
                setConflictPresident(null);
                setValidationError(null);
              }}
              disabled={saving}
            >
              <SelectTrigger id="oneclub-role-select" className="text-xs h-9 bg-background" aria-label="Select OneClub Role">
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student (General Member)</SelectItem>
                <SelectItem value="executive">Club Executive</SelectItem>
                <SelectItem value="president">Club President</SelectItem>
                <SelectItem value="advisor">Staff Advisor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">{ROLE_HELP[selectedRole]}</p>
            <p className="text-[10px] text-muted-foreground">
              Campus One administrator roles cannot be assigned from OneClub.
            </p>
          </div>

          {selectedRole !== "student" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="oneclub-club-select" className="text-xs font-semibold">
                  Assigned Club {requiresClub && <span className="text-destructive">*</span>}
                </Label>
                {requiresClub && (
                  <span className="text-[10px] text-muted-foreground">Required for {selectedRole}</span>
                )}
              </div>
              {selectedRole === "advisor" && user.advisorAssignments.length > 0 ? (
                <ul className="rounded-lg border border-border/70 bg-muted/10 p-2 space-y-1">
                  {user.advisorAssignments.map((assignment) => (
                    <li key={assignment.id} className="text-[11px] font-medium text-foreground">
                      {assignment.club_name}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Select
                value={selectedClubId}
                onValueChange={(val) => {
                  setSelectedClubId(val);
                  setReplacementConfirmed(false);
                  setConflictPresident(null);
                  setValidationError(null);
                }}
                disabled={saving}
              >
                <SelectTrigger id="oneclub-club-select" className="text-xs h-9 bg-background" aria-label="Assigned Club">
                  <SelectValue placeholder="Select official club" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">
                    {selectedRole === "advisor" ? "-- Keep current clubs --" : "-- No Club Assignment --"}
                  </SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole === "advisor" ? (
                <p className="text-[10px] text-muted-foreground">
                  Adding a club is saved immediately. Removing an advisor club is not available in OneClub yet.
                </p>
              ) : null}
            </div>
          )}

          {mockMode && selectedRole === "executive" ? (
            <div className="space-y-1.5">
              <Label htmlFor="oneclub-exec-title" className="text-xs font-semibold">
                Executive Title / Position
              </Label>
              <Input
                id="oneclub-exec-title"
                placeholder="e.g. Vice President, General Secretary, Financial Director"
                value={executiveTitle}
                onChange={(e) => setExecutiveTitle(e.target.value)}
                className="text-xs h-9"
                disabled={saving}
              />
            </div>
          ) : null}

          {conflictPresident ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs">Incumbent President Replacement Warning</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{conflictPresident}</strong> is currently recorded as President of this club. Appointing {user.fullName} will supersede their presidency.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-amber-500/20">
                <Checkbox
                  id="confirm-president-replacement"
                  checked={replacementConfirmed}
                  onCheckedChange={(checked) => setReplacementConfirmed(Boolean(checked))}
                  className="mt-0.5"
                  disabled={saving}
                />
                <Label
                  htmlFor="confirm-president-replacement"
                  className="text-[11px] font-medium text-foreground cursor-pointer leading-tight"
                >
                  I confirm replacing {conflictPresident} with {user.fullName} as Club President.
                </Label>
              </div>
            </div>
          ) : null}

          {validationError ? (
            <div id="admin-people-role-error" className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-[11px] text-destructive flex items-center gap-1.5" role="alert">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          ) : null}

          <p className="text-[10px] text-muted-foreground" aria-live="polite">
            {saving ? `Saving OneClub role for ${user.fullName}.` : "The new OneClub role applies the next time they use OneClub."}
          </p>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="text-xs h-9"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => void handleSave()}
              className="text-xs h-9"
              disabled={saving || unchanged}
              aria-label={`Confirm OneClub role change for ${user.fullName}`}
            >
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
