import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building,
  Check,
  CheckCircle2,
  Compass,
  Cpu,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  MessageSquare,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { OFFICIAL_14_CLUBS, OfficialClub } from "@/shared/mock/clubs";

interface InterestChip {
  id: string;
  label: string;
  category: string;
  matchedClubCodes: string[];
}

const INTEREST_CHIPS: InterestChip[] = [
  {
    id: "tech_ai",
    label: "AI, Cloud & Mobile Dev",
    category: "Technology",
    matchedClubCodes: ["NGD"]
  },
  {
    id: "robotics",
    label: "Robotics & Hardware Systems",
    category: "Technology",
    matchedClubCodes: ["NRS"]
  },
  {
    id: "women_stem",
    label: "Women in STEM & Engineering",
    category: "Technology",
    matchedClubCodes: ["WIT"]
  },
  {
    id: "debate",
    label: "Public Speaking & Debate",
    category: "Leadership",
    matchedClubCodes: ["NDC"]
  },
  {
    id: "literature",
    label: "Literature & Creative Writing",
    category: "Arts",
    matchedClubCodes: ["NBC"]
  },
  {
    id: "business",
    label: "Finance & Venture Strategy",
    category: "Business",
    matchedClubCodes: ["NBUC"]
  },
  {
    id: "charity",
    label: "Community Outreach & Health",
    category: "Impact",
    matchedClubCodes: ["NCC"]
  },
  {
    id: "chess",
    label: "Chess & Strategic Games",
    category: "Recreation",
    matchedClubCodes: ["NC"]
  },
  {
    id: "media",
    label: "Photography & Digital Arts",
    category: "Arts",
    matchedClubCodes: ["NPS"]
  }
];

export function StudentOnboardingWorkspace() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const studentName = profile?.full_name || "Amina Bello";
  const studentId = profile?.student_id || "2021/0458";
  const department = profile?.department || "Computer Engineering";
  const email = profile?.email || "amina.bello@nileuniversity.edu.ng";

  const [selectedInterests, setSelectedInterests] = useState<string[]>(["tech_ai", "women_stem"]);
  const [isSaving, setIsSaving] = useState(false);

  // Toggle interest chip
  const handleToggleInterest = (chipId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(chipId)
        ? prev.filter((id) => id !== chipId)
        : [...prev, chipId]
    );
  };

  // Matched official clubs from selected interests (Filtered strictly from OFFICIAL_14_CLUBS)
  const matchedClubs = useMemo(() => {
    if (selectedInterests.length === 0) return [];

    const matchedCodes = new Set<string>();
    INTEREST_CHIPS.forEach((chip) => {
      if (selectedInterests.includes(chip.id)) {
        chip.matchedClubCodes.forEach((code) => matchedCodes.add(code));
      }
    });

    return OFFICIAL_14_CLUBS.filter((club) => matchedCodes.has(club.code));
  }, [selectedInterests]);

  // Save interests & go to home
  const handleSaveAndContinue = () => {
    setIsSaving(true);
    // Transient interest cache for discovery ranking
    try {
      localStorage.setItem("oneclub_student_interests", JSON.stringify(selectedInterests));
    } catch {
      // Storage fallback
    }

    setTimeout(() => {
      setIsSaving(false);
      navigate("/");
    }, 400);
  };

  // Skip goes directly to home
  const handleSkip = () => {
    navigate("/");
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="onboarding-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-onboarding-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/ONBOARDING
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Welcome Setup &bull; {studentId}
            </span>
          </div>
          <h1 id="onboarding-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome to OneClub, {studentName.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Your place for club memberships, event QR check-ins, session dues proof, and campus updates.
          </p>
        </div>

        {/* Skip button (Explicitly Skips to Home) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground self-start sm:self-auto"
        >
          <span>Skip to Home</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </header>

      {/* VERIFIED CAMPUS ONE IDENTITY SUMMARY (Complete Context, Not Fake Progress) */}
      <section aria-labelledby="identity-heading">
        <Card className="border-border/80 bg-gradient-to-r from-primary/5 via-card to-card">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
                {studentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="identity-heading" className="text-base font-bold text-foreground">
                    {studentName}
                  </h2>
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                    {studentId}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Campus One SSO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {department} &bull; {email}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/60">
              <span>Account Standing: </span>
              <strong className="text-foreground">Enrolled Student</strong>
            </div>
          </div>
        </Card>
      </section>

      {/* OPTIONAL INTEREST CHIPS */}
      <section aria-labelledby="interests-heading" className="space-y-3">
        <div className="space-y-0.5">
          <h2 id="interests-heading" className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Select Your Campus Interests (Optional)</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Tap the topics you care about to personalize your upcoming event and club recommendations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {INTEREST_CHIPS.map((chip) => {
            const isSelected = selectedInterests.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleToggleInterest(chip.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MATCHED OFFICIAL 14 CLUBS PREVIEW */}
      {matchedClubs.length > 0 && (
        <section aria-labelledby="matched-heading" className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 id="matched-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suggested Official Nile Clubs ({matchedClubs.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Official Nile University Registered Organizations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {matchedClubs.map((club) => (
              <Card key={club.id} className="border-border/80 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-primary/10 text-primary font-mono text-[10px] font-bold px-1.5 py-0.2">
                        {club.code}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">
                        {club.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {club.category} &bull; {club.memberCount} active members
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground font-mono shrink-0">
                    ₦{club.duesAmount.toLocaleString()}/session
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {club.description}
                </p>

                <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Schedule: {club.meetingSchedule}</span>
                  <span className="font-semibold text-primary">Discover in Portal &rarr;</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* DOMINANT ACTION BUTTONS */}
      <footer className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground text-center sm:text-left">
          <span>Preferences are saved for smart event ranking. You can browse all 14 clubs anytime in Discover.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="w-full sm:w-auto text-xs"
          >
            Skip for Now
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            className="w-full sm:w-auto text-xs font-bold gap-1.5"
          >
            <span>{isSaving ? "Opening Home..." : "Continue to Student Home"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </footer>
    </main>
  );
}
