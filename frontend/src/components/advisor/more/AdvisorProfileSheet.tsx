import { ShieldCheck, School, Mail, Hash, Calendar, Building2, User, Lock, Award, BookOpen } from "lucide-react";
import { Sheet } from "@/shared/components/Sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/Button";

interface AdvisorProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  advisor: {
    name: string;
    staffId: string;
    department: string;
    faculty: string;
    email: string;
    office: string;
    appointmentDate: string;
    status: string;
    assignedClubs: Array<{ code: string; name: string; term: string }>;
  };
}

export function AdvisorProfileSheet({ isOpen, onClose, advisor }: AdvisorProfileSheetProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Advisor Profile"
      description="Campus One Single Sign-On faculty credentials and club appointment charter."
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3 text-muted-foreground" /> Read-only SSO credentials
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-left py-2">
        {/* Profile Card Summary */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-border/80 bg-muted/30">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-2xl flex items-center justify-center font-display shrink-0">
            KO
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground leading-snug">{advisor.name}</h2>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {advisor.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{advisor.department}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{advisor.faculty}</p>
          </div>
        </div>

        {/* Institutional Identification Info */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Institutional Identifiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl border border-border/60 bg-card text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Hash className="h-3 w-3 text-primary" /> Staff ID Number
              </span>
              <p className="font-mono font-bold text-foreground">{advisor.staffId}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary" /> Official University Email
              </span>
              <p className="font-medium text-foreground truncate">{advisor.email}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Building2 className="h-3 w-3 text-primary" /> Faculty Office
              </span>
              <p className="font-medium text-foreground">{advisor.office}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" /> Appointment Date
              </span>
              <p className="font-medium text-foreground">{advisor.appointmentDate}</p>
            </div>
          </div>
        </div>

        {/* Assigned Student Organizations Portfolio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned Student Chapters ({advisor.assignedClubs.length})
            </h3>
            <span className="text-[11px] text-primary font-medium">Session 2026/2027</span>
          </div>

          <div className="space-y-2">
            {advisor.assignedClubs.map((club) => (
              <div
                key={club.code}
                className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <School className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{club.name}</p>
                    <p className="text-[11px] text-muted-foreground">Appointed Advisor &bull; {club.term}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-bold text-xs">
                  {club.code}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Remit & Boundaries Notice */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs text-left">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <Lock className="h-3.5 w-3.5" />
            <span>Campus One SSO Policy</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Campus One provides these read-only identity details. Contact Club Services if an assigned club is incorrect.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
