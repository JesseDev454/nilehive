import {
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  ShieldCheck,
  User,
  UserCog,
  Users,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampusUserRecord } from "@/data/adminPeopleData";

interface AdminPersonDetailModalProps {
  user: CampusUserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignRole: (user: CampusUserRecord) => void;
}

export function AdminPersonDetailModal({
  user,
  open,
  onOpenChange,
  onAssignRole
}: AdminPersonDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-4 w-4 text-primary" />
            <span>Campus Member Record</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {user.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs">
          {/* 1. CAMPUS ONE IDENTITY (READ-ONLY) */}
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
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus ID / Matric</span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">{user.campusId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Base Identity</span>
                <span className="font-semibold text-foreground mt-0.5 block">{user.campusOneBaseRole}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Institutional Email</span>
                <span className="font-medium text-foreground mt-0.5 block truncate">{user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-medium text-foreground mt-0.5 block">{user.department}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Faculty</span>
                <span className="font-medium text-foreground mt-0.5 block">{user.faculty}</span>
              </div>
            </div>
          </div>

          {/* 2. ONECLUB GOVERNANCE & ROLES */}
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
              {user.assignedClubName ? (
                <div>
                  <span className="text-muted-foreground block text-[10px]">Appointed Organization:</span>
                  <span className="font-bold text-foreground text-xs">{user.assignedClubName}</span>
                  {user.executiveTitle && (
                    <span className="block text-[11px] text-primary font-medium mt-0.5">{user.executiveTitle}</span>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  General student member without executive club assignment.
                </p>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span>Active Club Memberships:</span>
                <span className="font-bold text-foreground font-mono">{user.joinedClubsCount} Clubs</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              onClick={() => {
                onOpenChange(false);
                onAssignRole(user);
              }}
              className="text-xs gap-1.5 h-9"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Assign / Change Role</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
