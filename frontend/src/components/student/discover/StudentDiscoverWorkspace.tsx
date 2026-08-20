import { useState, useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";
import { Skeleton } from "@/shared/components/Skeleton";
import { OFFICIAL_CLUBS, type Club } from "@/shared/mock/clubs";

export interface StudentMembershipApplication {
  id: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  duesAmount: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  proofRef: string;
  senderAccountName: string;
  studentType: "fresher" | "returning";
  department: string;
  phone: string;
  reason: string;
}

const INITIAL_REQUESTS: StudentMembershipApplication[] = [
  {
    id: "req-wit-01",
    clubId: "club-14",
    clubName: "Women in Tech Club",
    clubCode: "WIT",
    duesAmount: 10000,
    status: "pending",
    submittedAt: "Yesterday at 3:45 PM",
    proofRef: "TXN-WIT-2025-9941",
    senderAccountName: "Amina Bello",
    studentType: "returning",
    department: "Computer Engineering",
    phone: "+234 803 123 4567",
    reason: "Interested in female cloud computing workshops and mentorship circles."
  }
];

export function StudentDiscoverWorkspace() {
  const { profile, user } = useAuth();

  // Campus One Verified Student Profile (Read-only defaults)
  const studentIdentity = {
    fullName: profile?.full_name || "Amina Bello",
    studentId: profile?.student_id || "2021/0458",
    matricNo: "NUG/ENG/21/0458",
    email: user?.email || "a.bello@nileuniversity.edu.ng",
    defaultDept: profile?.department || "Computer Engineering",
    defaultPhone: profile?.phone_number || "+234 803 123 4567"
  };

  // Enrolled clubs (Initial state: NGD and NBC)
  const [enrolledClubCodes, setEnrolledClubCodes] = useState<Set<string>>(
    new Set(["NGD", "NBC"])
  );

  const [applications, setApplications] = useState<StudentMembershipApplication[]>(INITIAL_REQUESTS);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Workflow Dialog State
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<Club | null>(null);
  const [selectedClubForJoin, setSelectedClubForJoin] = useState<Club | null>(null);

  // Join Form State
  const [studentType, setStudentType] = useState<"fresher" | "returning">("returning");
  const [phone, setPhone] = useState(studentIdentity.defaultPhone);
  const [department, setDepartment] = useState(studentIdentity.defaultDept);
  const [joinReason, setJoinReason] = useState("");
  const [senderAccountName, setSenderAccountName] = useState(studentIdentity.fullName);
  const [bankTxnRef, setBankTxnRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Category List extracted from official clubs
  const categories = useMemo(() => {
    const set = new Set<string>();
    OFFICIAL_CLUBS.forEach((c) => set.add(c.category));
    return ["All", ...Array.from(set)];
  }, []);

  // Filtered official clubs (Strictly the 14 official clubs)
  const filteredClubs = useMemo(() => {
    return OFFICIAL_CLUBS.filter((club) => {
      const matchesCategory = selectedCategory === "All" || club.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        club.name.toLowerCase().includes(query) ||
        club.code.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query) ||
        club.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Helpers to check status
  const isClubEnrolled = (clubCode: string) => enrolledClubCodes.has(clubCode);
  const getOpenApplication = (clubCode: string) =>
    applications.find((app) => app.clubCode === clubCode && app.status === "pending");

  // Open Details Modal (Value before effort)
  const handleOpenDetails = (club: Club) => {
    setSelectedClubForDetails(club);
  };

  // Open Join Modal (Prefilled with safe defaults)
  const handleOpenJoin = (club: Club) => {
    setSelectedClubForJoin(club);
    setFormError(null);
    setBankTxnRef("");
    setSenderAccountName(studentIdentity.fullName);
    setReceiptFile(null);
    setJoinReason("");
  };

  // Handle Form Submit
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForJoin) return;

    if (!senderAccountName.trim()) {
      setFormError("Please provide the sender bank account name on the transfer receipt.");
      return;
    }

    if (!bankTxnRef.trim()) {
      setFormError("Please enter the bank transaction reference number or session ID.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    setTimeout(() => {
      const newApp: StudentMembershipApplication = {
        id: `req-${Date.now()}`,
        clubId: selectedClubForJoin.id,
        clubName: selectedClubForJoin.name,
        clubCode: selectedClubForJoin.code,
        duesAmount: selectedClubForJoin.dues,
        status: "pending",
        submittedAt: "Just now",
        proofRef: bankTxnRef,
        senderAccountName,
        studentType,
        department,
        phone,
        reason: joinReason
      };

      setApplications((prev) => [newApp, ...prev]);
      setIsSubmitting(false);
      setSelectedClubForJoin(null);
      setSelectedClubForDetails(null);
      setToastBanner(
        `Membership request submitted for ${selectedClubForJoin.name}. Payment receipt is in the Club Services verification queue.`
      );
    }, 700);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="discover-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-discover-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/DISCOVER
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              14 Official Nile Clubs &bull; Ordinary Membership
            </span>
          </div>
          <h1 id="discover-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Club Directory &amp; Membership
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Explore official Nile University student clubs, review meeting times and dues, and submit your membership request with transfer receipt proof.
          </p>
        </div>

        {/* Membership Summary */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 rounded-xl px-3 py-1.5 border border-primary/20">
            <UserCheck className="h-3.5 w-3.5" />
            {enrolledClubCodes.size} Enrolled
          </span>
          {applications.filter((a) => a.status === "pending").length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-xl px-3 py-1.5 border border-amber-500/20">
              <Clock className="h-3.5 w-3.5" />
              {applications.filter((a) => a.status === "pending").length} In Review
            </span>
          )}
        </div>
      </header>

      {/* Global Success Banner */}
      {toastBanner && (
        <Banner
          variant="success"
          title="Application Received"
          description={toastBanner}
          onDismiss={() => setToastBanner(null)}
        />
      )}

      {/* Applications in Progress (If Any) */}
      {applications.length > 0 && (
        <section aria-labelledby="applications-tracker-heading">
          <Card className="border-border/80">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h2 id="applications-tracker-heading" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Your Membership Applications ({applications.length})
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-3 divide-y divide-border/60">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{app.clubName}</span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                        {app.clubCode}
                      </span>
                      <StatusBadge
                        variant={app.status === "approved" ? "success" : app.status === "rejected" ? "error" : "warning"}
                        dot
                        label={app.status === "approved" ? "Approved" : app.status === "rejected" ? "Rejected" : "Under Review"}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Ref: <span className="font-mono">{app.proofRef}</span> &bull; Submitted {app.submittedAt} &bull; Dues: ₦{app.duesAmount.toLocaleString()}
                    </p>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    Club Services Accounting Queue
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Directory Search & Category Filters */}
      <section aria-labelledby="search-directory-heading" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="club-search-input"
              type="text"
              placeholder="Search 14 official clubs by name, code, or focus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist" aria-label="Club categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 14 Official Clubs Grid (Value Before Effort: Card displays details first) */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubs.map((club) => {
              const enrolled = isClubEnrolled(club.code);
              const pendingApp = getOpenApplication(club.code);

              return (
                <Card
                  key={club.id}
                  hoverable
                  className="flex flex-col justify-between border-border/80"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {club.category}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {club.code}
                      </span>
                    </div>
                    <CardTitle className="text-base mt-1.5 text-foreground">{club.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                      {club.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 space-y-3">
                    {/* Club Metadata Preview */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                          Session dues
                        </span>
                        <span className="font-bold text-foreground">₦{club.dues.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                          Meetings
                        </span>
                        <span className="font-medium text-foreground truncate block" title={club.meetingSchedule}>
                          {club.meetingSchedule.split(",")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Details First, then Join */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(club)}
                        className="flex-1 text-xs"
                      >
                        View Details
                      </Button>

                      {enrolled ? (
                        <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20 flex-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Joined
                        </span>
                      ) : pendingApp ? (
                        <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-xl px-2.5 py-1.5 border border-amber-500/20 flex-1">
                          <Clock className="h-3.5 w-3.5" />
                          In Review
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenJoin(club)}
                          className="flex-1 text-xs gap-1"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <Search className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Official Clubs Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No matching organizations found for &ldquo;{searchQuery}&rdquo;. Try another keyword or switch category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* DIALOG 1: Club Details (Value Before Effort) */}
      <Dialog
        open={!!selectedClubForDetails}
        onOpenChange={(open) => !open && setSelectedClubForDetails(null)}
      >
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {selectedClubForDetails?.category}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {selectedClubForDetails?.code}
              </span>
            </div>
            <DialogTitle className="text-xl mt-1 text-foreground">
              {selectedClubForDetails?.name}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              {selectedClubForDetails?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedClubForDetails && (
            <div className="space-y-4 py-2 text-xs">
              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Meeting Schedule
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForDetails.meetingSchedule}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Meeting Venue
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForDetails.location}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Club President
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForDetails.president}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Faculty Advisor
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForDetails.advisor}
                  </p>
                </div>
              </div>

              {/* Dues & Focus Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                <div>
                  <span className="font-bold text-foreground text-sm">
                    Semester Ordinary Dues: ₦{selectedClubForDetails.dues.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Covers workshop materials, guest lectures, and semester projects.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClubForDetails.tags.map((t) => (
                    <span key={t} className="rounded-md bg-card px-2 py-0.5 text-[10px] font-medium text-foreground border border-border/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status or Join Callout */}
              {isClubEnrolled(selectedClubForDetails.code) ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>You hold active ordinary membership in this club.</span>
                </div>
              ) : getOpenApplication(selectedClubForDetails.code) ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Your membership application is currently under review by Club Services.</span>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedClubForDetails(null)}
            >
              Close
            </Button>
            {selectedClubForDetails &&
              !isClubEnrolled(selectedClubForDetails.code) &&
              !getOpenApplication(selectedClubForDetails.code) && (
                <Button
                  onClick={() => {
                    const club = selectedClubForDetails;
                    setSelectedClubForDetails(null);
                    handleOpenJoin(club);
                  }}
                  className="gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Request Ordinary Membership</span>
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Request Ordinary Membership & Submit Proof */}
      <Dialog
        open={!!selectedClubForJoin}
        onOpenChange={(open) => !open && setSelectedClubForJoin(null)}
      >
        <DialogContent maxWidth="md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Ordinary Membership
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {selectedClubForJoin?.code}
              </span>
            </div>
            <DialogTitle className="text-lg mt-1 text-foreground">
              Join {selectedClubForJoin?.name}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Session dues: <strong>₦{selectedClubForJoin?.dues.toLocaleString()}</strong>. Submit transfer proof to complete your application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-4 py-2">
            {formError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {formError}
              </div>
            )}

            {/* Read-Only Campus One Identity */}
            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Campus One Verified Identity (Read-Only)
                </span>
                <span className="text-[10px] font-semibold text-primary">SSO Locked</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-foreground">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Full Name</span>
                  <span className="font-semibold">{studentIdentity.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Student ID</span>
                  <span className="font-mono font-semibold">{studentIdentity.studentId}</span>
                </div>
              </div>
            </div>

            {/* Optional / Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Student Type *
                </label>
                <select
                  value={studentType}
                  onChange={(e) => setStudentType(e.target.value as "fresher" | "returning")}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  <option value="returning">Returning Student (200L - 500L)</option>
                  <option value="fresher">Fresher (100L / Direct Entry)</option>
                </select>
              </div>

              <TextField
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Engineering"
              />
            </div>

            <TextField
              label="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +234 803 123 4567"
            />

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Reason for Joining (Optional)
              </label>
              <textarea
                rows={2}
                value={joinReason}
                onChange={(e) => setJoinReason(e.target.value)}
                placeholder="Why do you want to join this club?"
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Proof of Payment Section */}
            <div className="space-y-3 pt-3 border-t border-border/70">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1 text-foreground">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Transfer Dues Outside OneClub</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Transfer <strong>₦{selectedClubForJoin?.dues.toLocaleString()}</strong> to Providus Bank <strong>1305861314</strong> (Nile University Student Clubs). Club Services reviews the uploaded proof before granting access.
                </p>
              </div>

              <TextField
                label="Name on Bank Account (Sender Name) *"
                placeholder="e.g. Amina Bello"
                value={senderAccountName}
                onChange={(e) => setSenderAccountName(e.target.value)}
                required
              />

              <TextField
                label="Bank Transaction Reference / Session ID *"
                placeholder="e.g. 00001398248912"
                value={bankTxnRef}
                onChange={(e) => setBankTxnRef(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Upload Receipt Proof (Image or PDF) *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedClubForJoin(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !senderAccountName || !bankTxnRef}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit Application with Proof"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
