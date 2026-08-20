import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  WifiOff
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Banner } from "@/shared/components/Banner";
import { ClubProfileOverviewSection } from "./ClubProfileOverviewSection";
import { ClubMemberDirectorySection, type ClubMember } from "./ClubMemberDirectorySection";
import { ExecutiveLeadershipSection } from "./ExecutiveLeadershipSection";
import { MemberDetailModal } from "./MemberDetailModal";
import { ClubCharterModal } from "./ClubCharterModal";

export function ExecutiveClubWorkspace() {
  const executiveName = "Fatima Al-Hassan";
  const clubName = "Nile Google Developers";
  const clubCode = "NGD";

  const [activeTab, setActiveTab] = useState<"overview" | "members" | "leadership">("overview");
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [isCharterOpen, setIsCharterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Club directory and institutional records synchronized.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 500);
  };

  const handleCopyMeetingInfo = () => {
    navigator.clipboard?.writeText("Every Tuesday, 4:00 PM – 5:30 PM at Innovation Complex, Lab 2");
    setToastMessage("Meeting schedule and venue copied to clipboard.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-club-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-club-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/CLUB DETAILS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tier 1 Accredited Society
            </span>
          </div>

          <h1
            id="executive-club-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {clubName} ({clubCode})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Official club governance profile, accredited constitution bylaws, executive leadership team, and read-only member roster.
          </p>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold gap-1.5 h-8.5 px-3"
            aria-label="Refresh club records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button asChild size="sm" variant="outline" className="text-xs font-bold gap-1.5 h-8.5 bg-card hover:bg-muted">
            <Link to="/executive/work">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Assigned Club Actions</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* OFFLINE STATUS NOTIFICATION */}
      {isOffline && (
        <Banner
          variant="warning"
          title="Offline Mode Active"
          description="You are currently browsing cached student directory and charter records."
        />
      )}

      {/* TOAST NOTIFICATION FEEDBACK */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Notice"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* READ-ONLY BOUNDARY ADVISORY */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Executive Member Directory &amp; Governance Boundaries</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11px]">
          Club details, leadership, and member records are read-only here. OneClub hides membership and club-management actions from Executive accounts.
        </p>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Club Overview &amp; Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "members"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Member Roster (148 Read-Only)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leadership")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "leadership"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Executive Committee &amp; Advisors
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <ClubProfileOverviewSection
          clubName={clubName}
          clubCode={clubCode}
          category="Technology & Innovation"
          faculty="Faculty of Natural & Applied Sciences"
          meetingSchedule="Every Tuesday, 4:00 PM – 5:30 PM"
          meetingVenue="Innovation Complex, Lab 2"
          accreditationTier="Tier 1 Accredited Society"
          totalMembers={148}
          onOpenCharter={() => setIsCharterOpen(true)}
          onCopyMeetingInfo={handleCopyMeetingInfo}
        />
      )}

      {/* TAB CONTENT 2: READ-ONLY MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <ClubMemberDirectorySection
          onSelectMember={(mem) => setSelectedMember(mem)}
          isLoading={isRefreshing}
        />
      )}

      {/* TAB CONTENT 3: EXECUTIVE COMMITTEE & FACULTY ADVISORS */}
      {activeTab === "leadership" && (
        <ExecutiveLeadershipSection />
      )}

      {/* MODAL 1: STUDENT MEMBER DETAIL INSPECTION */}
      <MemberDetailModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      {/* MODAL 2: ACCREDITED CHARTER & CONSTITUTION VIEWER */}
      <ClubCharterModal
        isOpen={isCharterOpen}
        onClose={() => setIsCharterOpen(false)}
      />
    </main>
  );
}
export default ExecutiveClubWorkspace;
