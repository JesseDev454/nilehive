import { Building2, Loader2, ShieldCheck, User, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PeopleUiError } from "@/lib/people/errors";
import type { PersonDirectoryView } from "@/lib/people/types";

interface AdminPersonDetailModalProps {
  user: PersonDirectoryView | null;
  open: boolean;
  loading: boolean;
  error: PeopleUiError | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignRole: (user: PersonDirectoryView) => void;
  onRetry?: () => void;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">{label}</span>
      <span className="font-medium text-foreground mt-0.5 block truncate">{value?.trim() || "Not provided"}</span>
    </div>
  );
}

export function AdminPersonDetailModal({
  user,
  open,
  loading,
  error,
  saving,
  onOpenChange,
  onAssignRole,
  onRetry,
}: AdminPersonDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-4 w-4 text-primary" />
            <span>Campus Member Record</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {user?.fullName || "Campus member"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-xs text-muted-foreground" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading this campus member.
          </div>
        ) : error && !user ? (
          <div className="space-y-3 py-4 text-xs" role="alert">
            <p className="text-destructive">{error.message}</p>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : user ? (
          <div className="space-y-4 pt-1 text-xs">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Campus One Identity (Read-Only)</span>
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {user.accountStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50 text-[11px]">
                <Field label="Campus ID / Matric" value={user.campusId} />
                <Field label="Base Identity" value={user.campusOneBaseRole} />
                <div className="col-span-2">
                  <Field label="Institutional Email" value={user.email} />
                </div>
                <Field label="Department" value={user.department} />
                <Field label="Faculty" value={user.faculty} />
                <Field label="Campus One user ID" value={user.portalUserId} />
                <Field
                  label="Campus One access"
                  value={
                    user.portalRole || user.customRoles.length
                      ? [user.portalRole, ...user.customRoles].filter(Boolean).join(", ")
                      : "Managed in Campus One"
                  }
                />
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Campus One access is managed in Campus One. OneClub roles control responsibilities inside OneClub.
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>OneClub Assignment</span>
                </span>
                <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                  {user.oneClubRole}
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-primary/15 text-[11px]">
                {user.oneClubRole === "advisor" && user.advisorAssignments.length ? (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Assigned clubs:</span>
                    <ul className="mt-1 space-y-0.5">
                      {user.advisorAssignments.map((assignment) => (
                        <li key={assignment.id} className="font-bold text-foreground text-xs">
                          {assignment.club_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : user.assignedClubName ? (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Appointed Organization:</span>
                    <span className="font-bold text-foreground text-xs">{user.assignedClubName}</span>
                    {user.executiveTitle ? (
                      <span className="block text-[11px] text-primary font-medium mt-0.5">{user.executiveTitle}</span>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    General student member without executive club assignment.
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Account status:</span>
                  <span className="font-bold text-foreground">{user.accountStatus}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Account status is managed through Campus One.
                </p>
              </div>
            </div>

            {error ? (
              <p className="text-[11px] text-destructive" role="alert">
                {error.message}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-9"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={saving}
                onClick={() => onAssignRole(user)}
                className="text-xs gap-1.5 h-9"
                aria-label={`Change OneClub role for ${user.fullName}`}
              >
                <UserCog className="h-3.5 w-3.5" />
                <span>Assign / Change Role</span>
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
