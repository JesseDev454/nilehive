import { useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  Info,
  Layers,
  MapPin,
  Megaphone,
  School,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface ClubProfileOverviewSectionProps {
  clubName: string;
  clubCode: string;
  category: string;
  faculty: string;
  meetingSchedule: string;
  meetingVenue: string;
  accreditationTier: string;
  totalMembers: number;
  onOpenCharter: () => void;
  onCopyMeetingInfo: () => void;
}

export interface ClubUpdateNotice {
  id: string;
  title: string;
  date: string;
  author: string;
  priority: "High" | "Normal";
  content: string;
}

export const OFFICIAL_CLUB_UPDATES: ClubUpdateNotice[] = [
  {
    id: "upd-01",
    title: "Auditorium 1 Booking Confirmed for Nile DevFest 2025",
    date: "Yesterday, 3:45 PM",
    author: "Tariq Ibrahim (President)",
    priority: "High",
    content: "The Main Campus Auditorium 1 venue request is approved. Executive officers are asked to inspect the audio-visual setup on Thursday."
  },
  {
    id: "upd-02",
    title: "Google Cloud TechSprint Vouchers Issued",
    date: "Aug 18, 2025",
    author: "Zainab Mukhtar (VP)",
    priority: "Normal",
    content: "100 Google Cloud Skills Boost voucher codes have been received from the regional GDG team. Allocation priority will be given to students with 80%+ workshop attendance."
  },
  {
    id: "upd-03",
    title: "Semester Accreditation Review Completed",
    date: "Aug 12, 2025",
    author: "Dr. Aminu Galadima (Advisor)",
    priority: "Normal",
    content: "The annual governance audit was ratified with zero compliance flags. Nile Google Developers maintains Tier 1 Accredited status."
  }
];

export function ClubProfileOverviewSection({
  clubName,
  clubCode,
  category,
  faculty,
  meetingSchedule,
  meetingVenue,
  accreditationTier,
  totalMembers,
  onOpenCharter,
  onCopyMeetingInfo
}: ClubProfileOverviewSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyMeetingInfo();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="club-overview-section" aria-labelledby="club-overview-heading" className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Society Profile Card */}
        <Card className="lg:col-span-2 border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle id="club-overview-heading" className="text-sm font-bold text-foreground flex items-center gap-2">
              <School className="h-4 w-4 text-primary" />
              <span>Society Profile &amp; Mission</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCharter}
              className="text-xs font-semibold gap-1.5 h-8 px-2.5"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>View Official Charter</span>
            </Button>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-foreground text-xs">Mission Statement</span>
              <p className="text-muted-foreground leading-relaxed">
                Nile Google Developers (NGD) is dedicated to fostering hands-on technical skills in modern software engineering, Google Cloud technologies, mobile development with Kotlin and Jetpack Compose, machine learning, and open-source leadership across the Nile University campus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Category &amp; Classification
                </span>
                <p className="font-bold text-foreground">{category}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Faculty Affiliation
                </span>
                <p className="font-bold text-foreground">{faculty}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Weekly Meeting Schedule
                  </span>
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                <p className="font-bold text-foreground">{meetingSchedule}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Official Venue
                  </span>
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <p className="font-bold text-foreground">{meetingVenue}</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">
                Meeting Room Logistics: <strong>Lab 2 (40 Workstations + Dual HDMI Projectors)</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-xs font-semibold text-primary hover:text-primary/80 gap-1.5 h-7.5 px-2"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied Meeting Details" : "Copy Schedule & Venue"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accreditation & Standing Sidebar */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span>Accreditation &amp; Governance</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 space-y-3.5 text-xs flex-1 flex flex-col justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{accreditationTier}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Active for the 2025/2026 academic session.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Official Acronym:</span>
                <span className="font-mono font-bold text-foreground">{clubCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Active Student Roster:</span>
                <span className="font-mono font-bold text-foreground">{totalMembers} Students</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Governance Bylaws:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ratified (Rev 4.2)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Campus Code of Conduct:</span>
                <span className="font-semibold text-foreground">100% Compliant</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Executive Role Permissions</span>
              </div>
              <p className="leading-relaxed">
                Club charter modifications and accreditation filings are administered exclusively by the President and Faculty Advisor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Official Club Bulletins & Broadcasts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-sm font-bold text-foreground">Official Club Bulletins &amp; Announcements</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {OFFICIAL_CLUB_UPDATES.map((notice) => (
            <Card key={notice.id} className="border-border/80 bg-card shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    notice.priority === "High"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {notice.priority} Priority
                  </span>
                  <span className="text-[10px] text-muted-foreground">{notice.date}</span>
                </div>

                <h4 className="font-bold text-xs text-foreground line-clamp-2">
                  {notice.title}
                </h4>

                <p className="text-muted-foreground text-[11px] line-clamp-3 leading-relaxed">
                  {notice.content}
                </p>

                <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                  Posted by: <strong className="text-foreground">{notice.author}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
