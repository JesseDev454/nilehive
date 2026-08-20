import { Link } from "react-router-dom";
import {
  Award,
  Calendar,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  School,
  ShieldCheck,
  User,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface AssignedClubSectionProps {
  clubName: string;
  clubCode: string;
  category: string;
  faculty: string;
  meetingSchedule: string;
  meetingVenue: string;
  accreditationTier: string;
  totalMembers: number;
  presidentName: string;
  advisorName: string;
}

export function AssignedClubSection({
  clubName,
  clubCode,
  category,
  faculty,
  meetingSchedule,
  meetingVenue,
  accreditationTier,
  totalMembers,
  presidentName,
  advisorName
}: AssignedClubSectionProps) {
  return (
    <section
      id="assigned-club-section"
      aria-labelledby="assigned-club-heading"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="h-4 w-4 text-primary shrink-0" />
          <h2
            id="assigned-club-heading"
            className="text-sm sm:text-base font-bold text-foreground tracking-tight"
          >
            Assigned Club Profile
          </h2>
        </div>
        <Button
          asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 gap-1 h-8 px-2.5"
        >
          <Link to="/executive/club">
            <span>View Full Roster &amp; Charter</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Top Club Header & Accreditation Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/60">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  {clubCode}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  {accreditationTier}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {clubName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category} &bull; {faculty}
              </p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 shrink-0 bg-muted/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none">
              <span className="text-[11px] text-muted-foreground">Active Roster</span>
              <span className="text-sm font-bold text-foreground font-mono">
                {totalMembers} Registered Students
              </span>
            </div>
          </div>

          {/* Meeting Schedule, Venue, & Key Governance Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Weekly Meeting
                </span>
              </div>
              <p className="font-bold text-foreground text-xs">{meetingSchedule}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Official Venue
                </span>
              </div>
              <p className="font-bold text-foreground text-xs">{meetingVenue}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Club President
                </span>
              </div>
              <p className="font-bold text-foreground text-xs">{presidentName}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Staff Advisor
                </span>
              </div>
              <p className="font-bold text-foreground text-xs">{advisorName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
