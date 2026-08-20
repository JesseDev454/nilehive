import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  X
} from "lucide-react";
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
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import type { CampusUserRecord, AssignableOneClubRole } from "@/data/adminPeopleData";

interface AdminRoleAssignmentModalProps {
  user: CampusUserRecord | null;
  allUsers: CampusUserRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAssignment: (
    userId: string,
    role: AssignableOneClubRole,
    clubId: string | null,
    clubName: string | null,
    executiveTitle?: string
  ) => void;
}

export function AdminRoleAssignmentModal({
  user,
  allUsers,
  open,
  onOpenChange,
  onSaveAssignment
}: AdminRoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<AssignableOneClubRole>("student");
  const [selectedClubId, setSelectedClubId] = useState<string>("none");
  const [executiveTitle, setExecutiveTitle] = useState("");
  const [replacementConfirmed, setReplacementConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.oneClubRole);
      setSelectedClubId(user.assignedClubId || "none");
      setExecutiveTitle(user.executiveTitle || "");
      setReplacementConfirmed(false); // DO NOT PRECHECK
      setValidationError(null);
    }
  }, [user]);

  if (!user) return null;

  // Determine if there is an incumbent president conflict
  const isAssigningPresident = selectedRole === "president" && selectedClubId !== "none";
  const incumbentPresident = isAssigningPresident
    ? allUsers.find(
        (u) =>
          u.oneClubRole === "president" &&
          u.assignedClubId === selectedClubId &&
          u.id !== user.id
      )
    : null;

  const requiresClub = selectedRole === "president" || selectedRole === "executive";

  const handleSave = () => {
    setValidationError(null);

    // Validation: President and Executive require a club
    if (requiresClub && selectedClubId === "none") {
      setValidationError(`The ${selectedRole} role requires selecting an official club.`);
      return;
    }

    // Validation: Incumbent President replacement confirmation (must NOT be skipped)
    if (incumbentPresident && !replacementConfirmed) {
      setValidationError(
        `You must acknowledge replacing ${incumbentPresident.fullName} as President before proceeding.`
      );
      return;
    }

    const club = OFFICIAL_14_CLUBS.find((c) => c.id === selectedClubId);
    const assignedClubName = club ? club.name : null;
    const finalClubId = selectedRole === "student" ? null : selectedClubId === "none" ? null : selectedClubId;

    onSaveAssignment(
      user.id,
      selectedRole,
      finalClubId,
      assignedClubName,
      selectedRole === "executive" ? executiveTitle.trim() || "Executive Officer" : undefined
    );

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <UserCog className="h-4 w-4 text-primary" />
            <span>Role Governance</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Assign OneClub Role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign or update club leadership position for <strong className="text-foreground">{user.fullName}</strong> ({user.campusId}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs">
          {/* Read-Only Campus One Banner */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Campus One Account</span>
            <p className="font-semibold text-foreground">{user.fullName} • {user.email}</p>
            <p className="text-muted-foreground text-[11px]">{user.department} ({user.campusOneBaseRole})</p>
          </div>

          {/* Role Selector (ONLY: student, executive, president, advisor) */}
          <div className="space-y-1.5">
            <Label htmlFor="oneclub-role-select" className="text-xs font-semibold">
              Select OneClub Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => {
                setSelectedRole(val as AssignableOneClubRole);
                setReplacementConfirmed(false);
                setValidationError(null);
              }}
            >
              <SelectTrigger id="oneclub-role-select" className="text-xs h-9 bg-background">
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student (General Member)</SelectItem>
                <SelectItem value="executive">Club Executive</SelectItem>
                <SelectItem value="president">Club President</SelectItem>
                <SelectItem value="advisor">Staff Advisor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Campus One administrator roles cannot be assigned from OneClub.
            </p>
          </div>

          {/* Club Selector (Required for president & executive, optional for advisor) */}
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
              <Select
                value={selectedClubId}
                onValueChange={(val) => {
                  setSelectedClubId(val);
                  setReplacementConfirmed(false);
                  setValidationError(null);
                }}
              >
                <SelectTrigger id="oneclub-club-select" className="text-xs h-9 bg-background">
                  <SelectValue placeholder="Select official club" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">-- No Club Assignment --</SelectItem>
                  {OFFICIAL_14_CLUBS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Executive Title input (Only for executive role) */}
          {selectedRole === "executive" && (
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
              />
            </div>
          )}

          {/* INCUMBENT PRESIDENT REPLACEMENT CONFIRMATION (Un-prechecked) */}
          {incumbentPresident && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs">Incumbent President Replacement Warning</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{incumbentPresident.fullName}</strong> is currently recorded as President of this club. Appointing {user.fullName} will supersede their presidency.
                  </p>
                </div>
              </div>

              {/* Explicit confirmation checkbox - NEVER PRECHECKED */}
              <div className="flex items-start gap-2 pt-1 border-t border-amber-500/20">
                <Checkbox
                  id="confirm-president-replacement"
                  checked={replacementConfirmed}
                  onCheckedChange={(checked) => setReplacementConfirmed(Boolean(checked))}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="confirm-president-replacement"
                  className="text-[11px] font-medium text-foreground cursor-pointer leading-tight"
                >
                  I confirm replacing {incumbentPresident.fullName} with {user.fullName} as Club President.
                </Label>
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-[11px] text-destructive flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Dialog Footer */}
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              className="text-xs h-9"
            >
              Confirm Assignment
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
