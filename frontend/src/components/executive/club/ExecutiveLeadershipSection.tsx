import { useState } from "react";
import {
  Award,
  Check,
  Clock,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  department: string;
  level: string;
  email: string;
  responsibilities: string;
  isCurrentUser?: boolean;
}

export const EXECUTIVE_OFFICERS: LeadershipMember[] = [
  {
    id: "lead-01",
    name: "Tariq Ibrahim",
    role: "Club President",
    department: "Software Engineering",
    level: "400L",
    email: "tariq.ibrahim@nileuniversity.edu.ng",
    responsibilities: "Club leadership, proposal submissions, and official coordination."
  },
  {
    id: "lead-02",
    name: "Zainab Mukhtar",
    role: "Vice President & Tech Lead",
    department: "Computer Science",
    level: "400L",
    email: "zainab.mukhtar@nileuniversity.edu.ng",
    responsibilities: "Technical curriculum design, speaker outreach, and cloud lab credit management."
  },
  {
    id: "lead-03",
    name: "Fatima Al-Hassan",
    role: "Workshops Coordinator",
    department: "Computer Science",
    level: "300L",
    email: "fatima.alhassan@nileuniversity.edu.ng",
    responsibilities: "Hands-on code labs, GitHub repository management, and workshop attendee onboarding.",
    isCurrentUser: true
  },
  {
    id: "lead-04",
    name: "Oluwaseun Adeleke",
    role: "Logistics & Treasury Officer",
    department: "Business Administration",
    level: "400L",
    email: "oluwaseun.adeleke@nileuniversity.edu.ng",
    responsibilities: "Auditorium venue bookings, sound rig staging, and financial report reconciliations."
  }
];

export const FACULTY_ADVISORS = [
  {
    id: "adv-01",
    name: "Dr. Aminu Galadima",
    title: "Senior Lecturer & Academic Advisor",
    department: "Department of Computer Science",
    office: "Faculty Block B, Office 214",
    email: "aminu.galadima@nileuniversity.edu.ng",
    officeHours: "Tuesdays & Thursdays, 2:00 PM – 4:00 PM"
  },
  {
    id: "adv-02",
    name: "Prof. Halima Bello",
    title: "Faculty Dean & Institutional Patron",
    department: "Faculty of Natural & Applied Sciences",
    office: "Deanery Suite 101",
    email: "dean.fnas@nileuniversity.edu.ng",
    officeHours: "By appointment"
  }
];

export function ExecutiveLeadershipSection() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <section id="leadership-section" aria-labelledby="leadership-heading" className="space-y-6 animate-fade-in">
      {/* Executive Committee Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary shrink-0" />
          <h3 id="leadership-heading" className="text-sm font-bold text-foreground">
            Executive Committee (2025/2026 Academic Tenure)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXECUTIVE_OFFICERS.map((officer) => (
            <Card
              key={officer.id}
              className={`border-border/80 shadow-xs ${
                officer.isCurrentUser ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "bg-card"
              }`}
            >
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-primary font-mono">
                        {officer.role}
                      </span>
                      {officer.isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
                          YOU
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-foreground mt-0.5">{officer.name}</h4>
                    <p className="text-muted-foreground text-[11px]">
                      {officer.department} &bull; {officer.level}
                    </p>
                  </div>

                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      officer.isCurrentUser
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {officer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {officer.responsibilities}
                </p>

                <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{officer.email}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyEmail(officer.email)}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0 p-1 rounded hover:bg-primary/10 transition-colors"
                    title="Copy email address"
                  >
                    {copiedEmail === officer.email ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Faculty Advisors Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-sm font-bold text-foreground">
            Faculty Advisors &amp; Institutional Oversight
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FACULTY_ADVISORS.map((advisor) => (
            <Card key={advisor.id} className="border-border/80 bg-card shadow-xs">
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">
                      Faculty Advisor
                    </span>
                    <h4 className="font-bold text-sm text-foreground mt-0.5">{advisor.name}</h4>
                    <p className="text-muted-foreground text-[11px]">{advisor.title}</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="space-y-1 text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{advisor.office}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{advisor.officeHours}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{advisor.email}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyEmail(advisor.email)}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0 p-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    {copiedEmail === advisor.email ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
