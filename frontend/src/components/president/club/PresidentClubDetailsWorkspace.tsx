import { useState } from "react";
import {
  AlertCircle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Edit,
  ExternalLink,
  Globe,
  GraduationCap,
  HeartHandshake,
  Image as ImageIcon,
  Info,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  uploadedAt: string;
  caption: string;
}

export interface ClubProfileData {
  id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  category: string;
  faculty: string;
  department: string;
  meetingSchedule: string;
  venue: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  communityLink: string;
  githubUrl: string;
  memberCount: number;
  establishedYear: string;
  staffAdvisor: {
    name: string;
    title: string;
    department: string;
    email: string;
  };
  paymentInstructions: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    semesterDuesAmount: number;
    paymentNote: string;
  };
  gallery: GalleryItem[];
}

const INITIAL_CLUB_DATA: ClubProfileData = {
  id: "club-ngd-01",
  name: "Nile Google Developers",
  code: "NGD",
  tagline: "Empowering university developers with cloud, mobile, and AI engineering excellence.",
  description: "Nile Google Developers (NGD) is the premier engineering community at Nile University of Nigeria. We bridge the gap between academic theory and real-world tech industry practices through weekly hands-on workshops, cloud study jams, and annual hackathons.",
  category: "Technology & Software Engineering",
  faculty: "Faculty of Engineering",
  department: "Computer Engineering / Computer Science",
  meetingSchedule: "Every Wednesday & Saturday &bull; 2:00 PM - 5:00 PM",
  venue: "Engineering Computer Lab 3 & Main Auditorium",
  contactEmail: "gdg.nile@nileuniversity.edu.ng",
  contactPhone: "+234 803 555 0192",
  websiteUrl: "https://developers.nileuniversity.edu.ng",
  communityLink: "https://chat.whatsapp.com/NGD-Official-2025",
  githubUrl: "https://github.com/nile-google-devs",
  memberCount: 168,
  establishedYear: "2021",
  staffAdvisor: {
    name: "Dr. Aminu Galadima",
    title: "Senior Lecturer & Faculty Advisor",
    department: "Department of Computer Engineering",
    email: "a.galadima@nileuniversity.edu.ng"
  },
  paymentInstructions: {
    bankName: "Zenith Bank PLC",
    accountNumber: "1019948201",
    accountName: "Nile Univ Google Developers Club",
    semesterDuesAmount: 10000,
    paymentNote: "Include your Matriculation Number in the transfer narration (e.g. Dues-2021/0458). Note: Dues verification is audited by Student Affairs."
  },
  gallery: [
    {
      id: "gal-1",
      title: "DevFest Nile Keynote & Tech Stage",
      category: "Annual Keynote",
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      uploadedAt: "Oct 2024",
      caption: "Main auditorium developer keynote with 150+ students in attendance."
    },
    {
      id: "gal-2",
      title: "Google Cloud TechSprint Hands-on Lab",
      category: "Technical Workshop",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      uploadedAt: "Nov 2024",
      caption: "Engineering Lab 3 cloud deployment session with live sandbox testing."
    },
    {
      id: "gal-3",
      title: "Flutter Forward Mobile App Hackathon",
      category: "Hackathon",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      uploadedAt: "Feb 2025",
      caption: "Cross-platform mobile coding sprint teams demoing their student apps."
    }
  ]
};

export function PresidentClubDetailsWorkspace() {
  const { profile } = useAuth();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";

  const [club, setClub] = useState<ClubProfileData>(INITIAL_CLUB_DATA);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    tagline: INITIAL_CLUB_DATA.tagline,
    description: INITIAL_CLUB_DATA.description,
    meetingSchedule: INITIAL_CLUB_DATA.meetingSchedule,
    venue: INITIAL_CLUB_DATA.venue,
    contactEmail: INITIAL_CLUB_DATA.contactEmail,
    contactPhone: INITIAL_CLUB_DATA.contactPhone,
    websiteUrl: INITIAL_CLUB_DATA.websiteUrl,
    communityLink: INITIAL_CLUB_DATA.communityLink,
    githubUrl: INITIAL_CLUB_DATA.githubUrl,
    bankName: INITIAL_CLUB_DATA.paymentInstructions.bankName,
    accountNumber: INITIAL_CLUB_DATA.paymentInstructions.accountNumber,
    accountName: INITIAL_CLUB_DATA.paymentInstructions.accountName,
    semesterDuesAmount: INITIAL_CLUB_DATA.paymentInstructions.semesterDuesAmount.toString(),
    paymentNote: INITIAL_CLUB_DATA.paymentInstructions.paymentNote
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Gallery Modal State
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: "",
    category: "Workshop Showcase",
    caption: "",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
  });
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  // Copy Bank Account feedback
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(club.paymentInstructions.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      setClub((prev) => ({
        ...prev,
        tagline: profileForm.tagline.trim(),
        description: profileForm.description.trim(),
        meetingSchedule: profileForm.meetingSchedule.trim(),
        venue: profileForm.venue.trim(),
        contactEmail: profileForm.contactEmail.trim(),
        contactPhone: profileForm.contactPhone.trim(),
        websiteUrl: profileForm.websiteUrl.trim(),
        communityLink: profileForm.communityLink.trim(),
        githubUrl: profileForm.githubUrl.trim(),
        paymentInstructions: {
          ...prev.paymentInstructions,
          bankName: profileForm.bankName.trim(),
          accountNumber: profileForm.accountNumber.trim(),
          accountName: profileForm.accountName.trim(),
          semesterDuesAmount: parseInt(profileForm.semesterDuesAmount) || prev.paymentInstructions.semesterDuesAmount,
          paymentNote: profileForm.paymentNote.trim()
        }
      }));

      setIsSavingProfile(false);
      setIsEditProfileOpen(false);
      setSuccessBanner("Club public profile and contact metadata updated successfully.");
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 400);
  };

  // Add Gallery Item Handler
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.title.trim()) return;

    setIsSavingMedia(true);
    setTimeout(() => {
      const newItem: GalleryItem = {
        id: `gal-${Date.now().toString().slice(-4)}`,
        title: mediaForm.title.trim(),
        category: mediaForm.category,
        url: mediaForm.url,
        uploadedAt: "Just now",
        caption: mediaForm.caption.trim()
      };

      setClub((prev) => ({
        ...prev,
        gallery: [newItem, ...prev.gallery]
      }));

      setIsSavingMedia(false);
      setIsAddMediaOpen(false);
      setMediaForm({
        title: "",
        category: "Workshop Showcase",
        caption: "",
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
      });
      setSuccessBanner("New showcase media added to club public gallery.");
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 350);
  };

  // Remove Gallery Item
  const handleRemoveMedia = (mediaId: string) => {
    setClub((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== mediaId)
    }));
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="club-details-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-club-details-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/CLUB_DETAILS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Own-Club Profile &bull; {club.code}
            </span>
          </div>
          <h1 id="club-details-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {club.name} ({club.code}) Profile &amp; Media
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Manage your assigned club’s public portal showcase, mission statement, meeting schedules, official media gallery, and student payment instruction notes.
          </p>
        </div>

        {/* Action Button: Edit Club Profile */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setIsEditProfileOpen(true)}
            size="sm"
            className="font-bold gap-1.5 text-xs shadow-xs"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Club Profile</span>
          </Button>
        </div>
      </header>

      {/* CONFIRMATION BANNER */}
      {successBanner && (
        <Banner
          variant="success"
          title="Profile Updated"
          description={successBanner}
          onClose={() => setSuccessBanner(null)}
        />
      )}

      {/* HERO SHOWCASE CARD */}
      <section aria-labelledby="hero-profile-heading" className="space-y-4">
        <Card className="border-border/80 overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card p-0">
          <div className="h-32 sm:h-40 bg-linear-to-r from-primary/20 via-primary/10 to-muted relative p-5 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-card border-2 border-primary/30 p-2 shadow-md flex items-center justify-center font-bold text-xl sm:text-2xl text-primary font-mono">
                {club.code}
              </div>
              <div className="text-foreground">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-background/80 px-2 py-0.5 rounded-full border border-border/60">
                  {club.category}
                </span>
                <h2 id="hero-profile-heading" className="text-lg sm:text-2xl font-bold mt-1 text-foreground">
                  {club.name}
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-background/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-border/80 text-xs">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-bold font-mono text-foreground">{club.memberCount} Members</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-primary">
                "{club.tagline}"
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {club.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{club.meetingSchedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{club.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono truncate">{club.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <a
                  href={club.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Portal Link</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* LEADERSHIP & PAYMENT INSTRUCTIONS SECTION */}
      <section aria-labelledby="leadership-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leadership & Faculty Advisor Card */}
        <Card className="border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 id="leadership-heading" className="text-sm font-bold text-foreground">
                Faculty Governance &amp; Officers
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Academic Oversight
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{club.staffAdvisor.name}</span>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Staff Advisor
                </span>
              </div>
              <p className="text-muted-foreground">{club.staffAdvisor.title} &bull; {club.staffAdvisor.department}</p>
              <p className="text-muted-foreground font-mono text-[11px]">{club.staffAdvisor.email}</p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{presidentName}</span>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  President &amp; Lead
                </span>
              </div>
              <p className="text-muted-foreground">Authorized Club Lead Organizer &bull; Nile University</p>
            </div>
          </div>
        </Card>

        {/* Student Payment Instructions Card (Read-Only Info Display) */}
        <Card className="border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Club Dues Instructions &amp; Bank Info
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              For Student Guidance
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="font-bold text-foreground">{club.paymentInstructions.bankName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary text-sm">
                    {club.paymentInstructions.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title="Copy Account Number"
                  >
                    {copiedBank ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Name:</span>
                <span className="font-semibold text-foreground truncate">{club.paymentInstructions.accountName}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Session dues:</span>
                <span className="font-mono font-bold text-foreground">₦{club.paymentInstructions.semesterDuesAmount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground bg-amber-500/10 text-amber-900 dark:text-amber-300 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
              <strong>Notice:</strong> {club.paymentInstructions.paymentNote}
            </p>
          </div>
        </Card>
      </section>

      {/* MEDIA & PHOTO GALLERY SHOWCASE */}
      <section aria-labelledby="gallery-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="gallery-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Official Media Showcase &amp; Gallery ({club.gallery.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Featured photos displayed on the Nile University student portal discover screen.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddMediaOpen(true)}
            className="text-xs font-bold gap-1 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Showcase Photo</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {club.gallery.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden border-border/80 group flex flex-col justify-between">
              <div className="relative h-44 bg-muted overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 rounded-md bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from showcase"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-3.5 space-y-1">
                <h3 className="text-xs font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {item.caption}
                </p>
                <div className="pt-1 text-[10px] font-mono text-muted-foreground/80 flex justify-between">
                  <span>Uploaded {item.uploadedAt}</span>
                  <span>Featured</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent maxWidth="lg" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
          <form onSubmit={handleSaveProfile} className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-border/80 bg-card space-y-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Edit {club.name} Public Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update public mission statement, meeting schedules, venue locations, and official contact channels.
              </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <TextField
                id="edit-tagline"
                label="Tagline / Motto"
                required
                value={profileForm.tagline}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, tagline: e.target.value }))}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Club Mission &amp; Overview
                </label>
                <textarea
                  rows={3}
                  required
                  value={profileForm.description}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  id="edit-schedule"
                  label="Meeting Schedule"
                  value={profileForm.meetingSchedule}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, meetingSchedule: e.target.value }))}
                />
                <TextField
                  id="edit-venue"
                  label="Primary Venue"
                  value={profileForm.venue}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, venue: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  id="edit-email"
                  label="Official Contact Email"
                  type="email"
                  value={profileForm.contactEmail}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                />
                <TextField
                  id="edit-phone"
                  label="Contact Phone"
                  value={profileForm.contactPhone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  id="edit-portal-link"
                  label="Club Website / Portal"
                  value={profileForm.websiteUrl}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                />
                <TextField
                  id="edit-community-link"
                  label="Community Group Chat Link"
                  value={profileForm.communityLink}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, communityLink: e.target.value }))}
                />
              </div>

              <div className="pt-2 border-t border-border/60 space-y-3">
                <h4 className="text-xs font-bold text-foreground">
                  Student Dues Reference (Bank Information)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <TextField
                    id="edit-bank"
                    label="Bank Name"
                    value={profileForm.bankName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  />
                  <TextField
                    id="edit-acct-num"
                    label="Account Number"
                    value={profileForm.accountNumber}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  />
                  <TextField
                    id="edit-dues-amount"
                    label="Session dues (₦)"
                    type="number"
                    value={profileForm.semesterDuesAmount}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, semesterDuesAmount: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/80 bg-card flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSavingProfile}
                className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSavingProfile ? "Saving Profile..." : "Save Changes"}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD MEDIA MODAL */}
      <Dialog open={isAddMediaOpen} onOpenChange={setIsAddMediaOpen}>
        <DialogContent maxWidth="md">
          <form onSubmit={handleAddMedia} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-foreground text-base">
                Add Photo to Showcase Gallery
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Upload or link a high-resolution workshop or keynote photo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <TextField
                id="media-title"
                label="Photo / Event Title"
                placeholder="e.g. AI Agent Hackathon Finale"
                required
                value={mediaForm.title}
                onChange={(e) => setMediaForm((prev) => ({ ...prev, title: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Event Category
                  </label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="Workshop Showcase">Workshop Showcase</option>
                    <option value="Annual Keynote">Annual Keynote</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>

                <TextField
                  id="media-url"
                  label="Image Web URL"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Photo Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of the keynote speaker, venue, or activity..."
                  value={mediaForm.caption}
                  onChange={(e) => setMediaForm((prev) => ({ ...prev, caption: e.target.value }))}
                  className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddMediaOpen(false)}
                className="w-full sm:w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingMedia || !mediaForm.title.trim()}
                className="w-full sm:w-1/2 text-xs font-bold gap-1 bg-primary text-primary-foreground"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{isSavingMedia ? "Adding..." : "Add to Gallery"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
