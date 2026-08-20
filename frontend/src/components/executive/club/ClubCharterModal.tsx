import { BookOpen, CheckCircle2, FileText, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";

interface ClubCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClubCharterModal({ isOpen, onClose }: ClubCharterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" className="p-0 overflow-hidden border-border/80 shadow-xl">
        <div className="space-y-0 text-left text-xs">
          {/* Header */}
          <div className="p-5 bg-card border-b border-border/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Official Society Constitution
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Official university club
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogTitle className="text-base font-bold text-foreground">
              Constitution &amp; Operational Bylaws of Nile Google Developers (NGD)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Document Reference: NGD/CONST/2025-REV4 &bull; Ratified Academic Year 2025/2026
            </DialogDescription>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto leading-relaxed">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <h4 className="font-bold text-foreground text-xs">Article I: Name, Mandate &amp; Affiliation</h4>
              <p className="text-muted-foreground text-[11px]">
                The organization shall be officially designated as <em>Nile Google Developers (NGD)</em>, operating as a registered student technical society at Nile University of Nigeria.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <h4 className="font-bold text-foreground text-xs">Article II: Executive Governance Structure</h4>
              <p className="text-muted-foreground text-[11px]">
                The executive committee shall consist of the President, Vice President (Tech Lead), Workshops Coordinator, and Logistics &amp; Treasury Officer. Executive officers serve an academic tenure of one year and are responsible for workshop logistics, code lab facilitation, and university compliance.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <h4 className="font-bold text-foreground text-xs">Article III: Membership &amp; Active Standing</h4>
              <p className="text-muted-foreground text-[11px]">
                Membership is open to all enrolled undergraduate and postgraduate students of Nile University. Active status requires a minimum attendance rate of 70% across weekly technical meetups and official bootcamps.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <h4 className="font-bold text-foreground text-xs">Article IV: Code of Conduct &amp; Equipment Custody</h4>
              <p className="text-muted-foreground text-[11px]">
                Members and officers must maintain respectful conduct in accordance with the Nile Student Handbook. Lab workstations, audio-visual equipment, and developer hardware rigs remain the strict custody of the designated executive coordinator and must be secured after every session.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/20 border-t border-border/70 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Read-only reference copy for executive officers.
            </span>
            <Button size="sm" onClick={onClose} className="text-xs font-bold">
              Close Charter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
