import { Link } from "react-router-dom";
import {
  GraduationCap,
  Lock,
  Mail,
  School,
  ShieldCheck,
  User,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface ExecutiveProfileHeaderCardProps {
  name: string;
  role: string;
  clubName: string;
  clubCode: string;
  matricNumber: string;
  email: string;
  department: string;
}

export function ExecutiveProfileHeaderCard({
  name,
  role,
  clubName,
  clubCode,
  matricNumber,
  email,
  department
}: ExecutiveProfileHeaderCardProps) {
  return (
    <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-mono font-bold text-lg shrink-0 border border-primary/30 shadow-xs">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  {name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Campus One Verified
                </span>
              </div>

              <p className="text-xs font-semibold text-primary">
                {role} &bull; {clubName} ({clubCode})
              </p>
            </div>
          </div>

          <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 h-8 w-full sm:w-auto"
          >
            <Link to="/executive/profile">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>View Full Profile</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border/50 text-xs">
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Matriculation No
            </span>
            <p className="font-mono font-bold text-foreground text-xs">{matricNumber}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Department &amp; Level
            </span>
            <p className="font-semibold text-foreground text-xs truncate">{department}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Official Email
            </span>
            <p className="font-mono text-muted-foreground text-xs truncate">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/40">
          <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Your Campus One identity is verified and read-only in OneClub.</span>
        </div>
      </CardContent>
    </Card>
  );
}
