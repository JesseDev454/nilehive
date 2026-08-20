import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X
} from "lucide-react";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";
import { OFFICIAL_14_CLUBS_DATA, type OfficialClub } from "@/data/official14ClubsData";

export function AdvisorClubsWorkspace() {
  // Assigned clubs for Dr. Kalu Okonkwo
  const assignedClubCodes = ["NGDG", "NCIC", "NSC"];
  const assignedClubs = OFFICIAL_14_CLUBS_DATA.filter((c) =>
    assignedClubCodes.includes(c.code) || c.advisorName.includes("Okonkwo")
  );

  const [selectedClub, setSelectedClub] = useState<OfficialClub | null>(null);
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenDetails = (club: OfficialClub) => {
    setSelectedClub(club);
    setIsDetailsModalOpen(true);
  };

  const handleOpenCharter = (club: OfficialClub) => {
    setSelectedClub(club);
    setIsCharterModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      <AdvisorRoleHeader
        title="Assigned Clubs Portfolio"
        subtitle="Oversight of official student organizations under your faculty advisory portfolio. View leadership rosters, approved charters, and event schedules."
        pendingCount={1}
      />

      {/* Scoping and Governance Alert */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <School className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">
              Institutional Advisory Assignment (3 Clubs)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can view only the three official clubs assigned to your Advisor account.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs text-primary border-primary/30 font-semibold shrink-0">
          Faculty of Engineering &amp; ICT
        </Badge>
      </div>

      {/* Assigned Clubs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignedClubs.map((club) => (
          <Card
            key={club.id}
            className="overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
          >
            <CardHeader className="p-5 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="font-bold text-primary bg-primary/10">
                  {club.code}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {club.category}
                </Badge>
              </div>

              <CardTitle className="text-lg font-bold text-foreground leading-snug">
                {club.name}
              </CardTitle>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {club.description}
              </p>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* President & Meeting Details */}
              <div className="rounded-xl bg-muted/40 p-3 space-y-2 text-xs border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> President:
                  </span>
                  <span className="font-bold text-foreground">{club.presidentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Members:
                  </span>
                  <span className="font-semibold text-foreground">{club.memberCount} registered</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Meetings:
                  </span>
                  <span className="font-medium text-foreground">{club.meetingSchedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Venue:
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[150px]">{club.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(club)}
                    className="text-xs w-full"
                  >
                    View Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCharter(club)}
                    className="text-xs w-full flex items-center justify-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Charter
                  </Button>
                </div>

                {/* Scoped Boundary Notice for Forbidden Actions */}
                <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    Club details: Read-only
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unrelated Clubs Institutional Scoping Section */}
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Institutional Advisory Scoping Boundary
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          As a Staff Advisor, your operational authority is strictly confined to your assigned club portfolio (Nile Google Developers, Nile Climate Initiatives, Nile Startup Campus). Unassigned clubs report to their designated faculty mentors and are not actionable in this workspace.
        </p>
      </div>

      {/* Club Details Modal (Read-Only) */}
      {selectedClub && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl text-left">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-bold text-primary">
                  {selectedClub.code}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {selectedClub.category}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold font-display text-foreground">
                {selectedClub.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assigned Staff Advisor: Dr. Kalu Okonkwo &bull; Nile University of Nigeria
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs sm:text-sm">
              <div className="rounded-xl bg-card border border-border/80 p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Club Mission &amp; Purpose
                </h4>
                <p className="text-foreground leading-relaxed">
                  {selectedClub.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Elected President</span>
                  <p className="font-bold text-foreground">{selectedClub.presidentName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {selectedClub.presidentEmail}
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Regular Meeting Schedule</span>
                  <p className="font-bold text-foreground">{selectedClub.meetingSchedule}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedClub.location}
                  </p>
                </div>
              </div>

              {/* Read-Only Governance Notice */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs space-y-1 text-blue-900 dark:text-blue-200">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Advisor Scoping Rules
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Advisors guide assigned clubs, review proposals, and read reports. Club details and events are view-only here.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Charter & Constitution Viewer Modal */}
      {selectedClub && (
        <Dialog open={isCharterModalOpen} onOpenChange={setIsCharterModalOpen}>
          <DialogContent className="max-w-2xl text-left max-h-[85vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold text-primary">
                  {selectedClub.code} CHARTER
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Approved &bull; 2026 Academic Session
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Official Charter &amp; Constitution: {selectedClub.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official club charter on file with Club Services.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-3 text-xs leading-relaxed border-y border-border/80">
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">Article I: Name &amp; Affiliation</h4>
                <p className="text-muted-foreground">
                  The official name of this student club is {selectedClub.name} ({selectedClub.code}). It is one of your assigned OneClub clubs.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">Article II: Aims &amp; Mandate</h4>
                <p className="text-muted-foreground">
                  To provide extracurricular enrichment, technical workshops, leadership conferences, and hands-on project opportunities for all enrolled undergraduate and postgraduate students in good academic standing.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">Article III: Role of the Faculty Advisor</h4>
                <p className="text-muted-foreground">
                  The Staff Advisor reviews proposals, checks safety and budget context, provides guidance, approves submissions for Admin review, and reads post-event reports.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">Article IV: Executive Officers</h4>
                <p className="text-muted-foreground">
                  The Executive Committee shall consist of President, Vice President, General Secretary, Financial Secretary, and Technical Coordinator, elected annually in accordance with Nile University electoral bylaws.
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCharterModalOpen(false)}
                className="text-xs"
              >
                Close Charter Viewer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
