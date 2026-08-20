import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  School,
  ShieldCheck,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface ExecutiveAppointmentCardProps {
  clubName: string;
  clubCode: string;
  role: string;
  term: string;
  accreditation: string;
  memberCount: number;
}

export function ExecutiveAppointmentCard({
  clubName,
  clubCode,
  role,
  term,
  accreditation,
  memberCount
}: ExecutiveAppointmentCardProps) {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
            <span>Assigned Club &amp; Executive Appointment</span>
          </CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
            {clubCode}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Primary Organization
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                {clubName}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              {accreditation}
            </span>
          </div>

          <div className="pt-2 border-t border-primary/10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Officer Role
            </span>
            <p className="text-xs font-bold text-primary">
              {role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tenure Term
            </span>
            <p className="font-semibold text-foreground text-xs">{term}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Club Roster Size
            </span>
            <p className="font-semibold text-foreground text-xs">{memberCount} Registered Students</p>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold justify-between h-8.5 px-3 border-border/70"
          >
            <Link to="/executive/club" className="w-full">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>View Club Details &amp; Charter</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
