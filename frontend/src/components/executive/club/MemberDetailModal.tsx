import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Mail,
  ShieldCheck,
  User,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { ClubMember } from "./ClubMemberDirectorySection";

interface MemberDetailModalProps {
  member: ClubMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberDetailModal({
  member,
  isOpen,
  onClose
}: MemberDetailModalProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" className="p-0 overflow-hidden border-border/80 shadow-lg">
        <div className="space-y-0 text-left text-xs">
          {/* Header */}
          <div className="p-5 bg-card border-b border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Student Member Profile (Read-Only)
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Nile Student
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-mono font-bold text-base shrink-0 border border-primary/30">
                {member.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {member.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground">
                  Matric No: {member.matricNumber} &bull; {member.department}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Academic & Membership Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Academic Level
                </span>
                <p className="font-bold text-foreground text-xs">{member.level}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Membership Status
                </span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {member.status}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Official Join Date
                </span>
                <p className="font-bold text-foreground text-xs">{member.joinDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Workshop Attendance Rate
                </span>
                <p className="font-mono font-bold text-foreground text-xs">{member.attendanceRate}</p>
              </div>
            </div>

            {/* Department & Faculty */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span>Enrolled Program</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                Bachelor of Science in {member.department}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Faculty of Natural &amp; Applied Sciences &bull; Nile University of Nigeria
              </p>
            </div>

            {/* Read-Only Governance Boundary Notice */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-[11px] space-y-1">
              <span className="font-bold block">Executive Read-Only Access Notice:</span>
              <p className="leading-relaxed text-muted-foreground">
                Executive officers have view-only access to this member directory. Member status, role, and access controls are not available in this workspace.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/20 border-t border-border/70 flex justify-end">
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
