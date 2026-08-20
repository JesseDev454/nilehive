import {
  CheckCircle2,
  GraduationCap,
  Info,
  Lock,
  Mail,
  School,
  ShieldCheck,
  User,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

interface ExecutiveIdentityCardProps {
  name: string;
  matricNumber: string;
  campusOneId: string;
  department: string;
  faculty: string;
  email: string;
  level: string;
}

export function ExecutiveIdentityCard({
  name,
  matricNumber,
  campusOneId,
  department,
  faculty,
  email,
  level
}: ExecutiveIdentityCardProps) {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Campus One Academic Identity</span>
          </CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Verified Student Record
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        {/* Top summary row */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/20 border border-border/50">
          <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-mono font-bold text-base shrink-0 border border-primary/25">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">{name}</h3>
            <p className="text-[11px] text-muted-foreground font-mono">{email}</p>
          </div>
        </div>

        {/* Read-Only Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Matriculation Number
            </span>
            <p className="font-mono font-bold text-foreground text-xs">{matricNumber}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Campus One Student ID
            </span>
            <p className="font-mono font-bold text-foreground text-xs">{campusOneId}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Department &amp; Level
            </span>
            <p className="font-semibold text-foreground text-xs">{department} &bull; {level}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Faculty
            </span>
            <p className="font-medium text-foreground text-xs truncate">{faculty}</p>
          </div>
        </div>

        {/* Campus One identity boundary */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <span>
            Your Campus One identity is read-only in OneClub. Contact the Campus One technical team if these details are incorrect.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
