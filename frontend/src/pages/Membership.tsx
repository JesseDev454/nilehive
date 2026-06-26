import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Filter, ImageIcon, Loader2, Search, Share2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { DataPagination } from "@/components/DataPagination";
import { NhStudentId } from "@/components/NhStudentId";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import {
  ApiClientError,
  createMembershipRequest,
  getAnnouncements,
  getApprovedEvents,
  getClubDetail,
  getClubs,
  getClubPaymentSettings,
  getMembershipRequests,
  getMyMembershipRequests,
  submitDuePaymentConfirmation,
  type AnnouncementRecord,
  type ApprovedEventRecord,
  type ClubPaymentSettingsRecord,
  type ClubRecord,
  type DuePaymentRecord,
  type MembershipRequestRecord
} from "@/lib/api";
import {
  CLUB_INTEREST_CATEGORIES,
  getClubInterestCategories,
  getStudentInterestCategories,
  type ClubInterestCategory
} from "@/lib/clubDiscovery";
import { clearJoinFormDraft, readJoinFormDraft, writeJoinFormDraft } from "@/lib/joinFormDraftStorage";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";
import { buildAppUrl, shareOrCopy } from "@/lib/share";
import { isValidStudentId, normalizeStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";
import { resolveStorageFileUrl, uploadStorageFile } from "@/lib/storage";

const REQUEST_STATUSES = ["all", "pending", "active", "rejected", "cancelled"] as const;
const STUDENT_TYPES = [
  { value: "fresher", label: "Fresher" },
  { value: "returning", label: "Returning Student" }
] as const;
const DUES_FILTERS = [
  { value: "all", label: "Any dues" },
  { value: "required", label: "Dues required" },
  { value: "free", label: "No dues" }
] as const;
const MEMBERSHIP_OPEN_FILTERS = [
  { value: "all", label: "Any signup status" },
  { value: "open", label: "Open for membership" },
  { value: "closed", label: "Not open yet" }
] as const;
const EVENT_FILTERS = [
  { value: "all", label: "Any event status" },
  { value: "upcoming", label: "Upcoming event available" }
] as const;
const SORT_FILTERS = [
  { value: "recommended", label: "Recommended" },
  { value: "active", label: "Active clubs" },
  { value: "new", label: "New clubs" },
  { value: "name", label: "A-Z" }
] as const;
const CLUB_DESCRIPTION_OVERRIDES: Record<string, string> = {
  "Nile Book Club":
    "Dive into the world of literature with fellow bookworms. Discover new genres, share your favourite reads, and engage in lively discussions that will broaden your horizons.",
  "Nile Business Club":
    "Explore the world of entrepreneurship and business. This club offers networking opportunities, workshops, and events to help you develop your entrepreneurial skills and business acumen.",
  "Nile Charity Club":
    "Make a meaningful impact on the community by participating in philanthropic endeavours. Join hands with fellow students to contribute to social causes and promote compassion.",
  "Nile Climate Initiatives Club":
    "Be part of the solution to environmental challenges. Join this club to engage in sustainability projects, raise awareness about climate issues, and work towards a greener future.",
  "Nile Creative Arts Club":
    "Unleash your creativity and explore various forms of artistic expression. This club is a hub for aspiring artists, musicians, and performers to collaborate and showcase their talents.",
  "Nile Debate Club":
    "Sharpen your argumentative skills, engage in thought-provoking discussions, and let your voice be heard. Whether you are passionate about politics and philosophy or simply love a good debate, this club is the perfect platform for you.",
  "Nile Games Club":
    "Embrace your competitive spirit and love for games. Whether you're into board games, video games, or sports, this club offers a fun way to relax and connect with others who share your passion.",
  "Nile Google Developers":
    "Join a global community of developers and tech enthusiasts. This club offers opportunities to learn, collaborate on projects, and stay updated with the latest in technology from Google.",
  "Nile Model United Nations Club":
    "Become a global diplomat and tackle pressing international issues. Model UN offers you a chance to develop your negotiation, research, and diplomacy skills while simulating the workings of the United Nations.",
  "Nile Photography Club":
    "Capture the world through your lens. Whether you're a seasoned photographer or a novice with a camera, this club is the perfect place to learn and showcase your photography skills.",
  "Nile Startup Campus":
    "Dive into the world of startups, innovation, and entrepreneurship. Connect with like-minded individuals, learn from successful entrepreneurs, and turn your ideas into reality.",
  "Nile Toastmaster's Club":
    "Unleash your inner orator and conquer your fear of public speaking. Toastmasters is where you can refine your communication skills, boost your confidence, and become a captivating speaker.",
  "TEDx Nile Club":
    "Inspire and be inspired. This club brings the power of TED Talks to your university, allowing you to organize and participate in TEDx events that showcase groundbreaking ideas.",
  "Women in Tech Club":
    "Break boundaries and inspire innovation. Join a community of like-minded women who are shaping the future of technology and making strides in a traditionally male-dominated field."
};

function ClubLogo({ club, className = "h-14 w-14" }: { club: ClubRecord; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void resolveStorageFileUrl("club-logos", club.logo_path).then((value) => {
      if (active) setUrl(value);
    });
    return () => { active = false; };
  }, [club.logo_path]);

  return url ? <img src={url} alt={`${club.name} logo`} className={`${className} shrink-0 rounded-lg border-2 border-foreground object-cover`} /> : (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-muted`} aria-label={`${club.name} logo unavailable`}>
      <ImageIcon className="h-6 w-6" />
    </div>
  );
}

function GalleryImage({ path, caption }: { path: string; caption: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void resolveStorageFileUrl("club-media", path).then((value) => {
      if (active) setUrl(value);
    });
    return () => { active = false; };
  }, [path]);
  return url ? <figure><img src={url} alt={caption || "Club activity"} className="aspect-square w-full rounded-lg border-2 border-foreground object-cover" />{caption ? <figcaption className="mt-1 text-xs text-muted-foreground">{caption}</figcaption> : null}</figure> : <div className="aspect-square animate-pulse rounded-lg bg-muted" />;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to complete this membership action right now.";
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium"
  }).format(new Date(value));
}

type ResolvedMembershipStatus =
  | "under_review"
  | "payment_under_review"
  | "pending_payment"
  | "active"
  | "needs_new_payment_details"
  | "rejected"
  | "cancelled";

function resolveMembershipStatus(
  request?: MembershipRequestRecord,
  payment?: DuePaymentRecord
): ResolvedMembershipStatus {
  if (!request) {
    return "under_review";
  }

  if (request.status === "cancelled") {
    return "cancelled";
  }

  if (payment?.status === "paid" || request.status === "active") {
    return "active";
  }

  if (payment?.status === "submitted") {
    return "payment_under_review";
  }

  if (payment?.status === "rejected") {
    return "needs_new_payment_details";
  }

  if (payment?.status === "unpaid" || request.status === "approved_pending_dues") {
    return "pending_payment";
  }

  if (request.status === "rejected") {
    return "rejected";
  }

  return "under_review";
}

function getStatusLabel(status: ResolvedMembershipStatus) {
  return {
    under_review: "Under Review",
    payment_under_review: "Payment Under Review",
    pending_payment: "Pending Payment",
    active: "Active Member",
    needs_new_payment_details: "Needs New Payment Details",
    rejected: "Rejected",
    cancelled: "Cancelled"
  }[status];
}

function MembershipStatusBadge({
  request,
  payment
}: {
  request: MembershipRequestRecord;
  payment?: DuePaymentRecord;
}) {
  const status = resolveMembershipStatus(request, payment);
  const className = {
    under_review: "bg-warning/15 text-warning hover:bg-warning/15",
    payment_under_review: "bg-warning/15 text-warning hover:bg-warning/15",
    pending_payment: "bg-primary/15 text-primary hover:bg-primary/15",
    active: "bg-success/15 text-success hover:bg-success/15",
    needs_new_payment_details: "bg-destructive/15 text-destructive hover:bg-destructive/15",
    rejected: "bg-destructive/15 text-destructive hover:bg-destructive/15",
    cancelled: "bg-muted text-muted-foreground hover:bg-muted"
  }[status];

  return <Badge className={className}>{getStatusLabel(status)}</Badge>;
}

function ReviewRequestStatusBadge({ status }: { status: MembershipRequestRecord["status"] }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending Review",
      className: "bg-warning/15 text-warning hover:bg-warning/15"
    },
    approved_pending_dues: {
      label: "Pending Payment",
      className: "bg-primary/15 text-primary hover:bg-primary/15"
    },
    active: {
      label: "Active Member",
      className: "bg-success/15 text-success hover:bg-success/15"
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive/15 text-destructive hover:bg-destructive/15"
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground hover:bg-muted"
    }
  };
  const config = statusConfig[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground hover:bg-muted"
  };

  return <Badge className={config.className}>{config.label}</Badge>;
}

function getStudentTypeLabel(value: "fresher" | "returning" | null | undefined) {
  return value === "fresher" ? "Fresher" : "Returning Student";
}

function getClubDescription(club: ClubRecord) {
  return club.description?.trim() || CLUB_DESCRIPTION_OVERRIDES[club.name] || "Learn more about this club and the kind of community it offers before you continue to the join form.";
}

function getClubDescriptionPreview(description: string, maxLength = 180) {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength).trimEnd()}...`;
}

function getClubInviteReason(club: ClubRecord, nextEvent?: ApprovedEventRecord) {
  if (nextEvent) {
    return `${nextEvent.title} is coming up on ${formatDate(nextEvent.event_date)}.`;
  }

  return getClubDescriptionPreview(getClubDescription(club), 120);
}

function getClubShareUrl(clubId: string) {
  return buildAppUrl(`/membership/clubs/${clubId}`);
}

function getClubDuesLabel(club: ClubRecord) {
  return club.dues_amount > 0 ? formatCurrency(club.dues_amount) : "No dues";
}

function isDuesRequired(club: ClubRecord, settings?: ClubPaymentSettingsRecord | null) {
  return club.dues_amount > 0 || Boolean(settings && (settings.fresher_dues_amount > 0 || settings.returning_student_dues_amount > 0));
}

function getClubDuesRequirementLabel(club: ClubRecord, settings?: ClubPaymentSettingsRecord | null) {
  if (!isDuesRequired(club, settings)) {
    return "Not required";
  }

  if (settings) {
    return `Required: ${formatCurrency(settings.returning_student_dues_amount)} returning / ${formatCurrency(settings.fresher_dues_amount)} freshers`;
  }

  return `Required: ${getClubDuesLabel(club)}`;
}

function getClubMemberCount(club: ClubRecord) {
  const maybeClub = club as ClubRecord & {
    member_count?: number;
    members_count?: number;
    active_members_count?: number;
    total_members?: number;
  };

  return maybeClub.member_count ?? maybeClub.members_count ?? maybeClub.active_members_count ?? maybeClub.total_members;
}

function getNextClubEvent(clubId: string, events: ApprovedEventRecord[]) {
  return events
    .filter((event) => event.club_id === clubId)
    .sort((first, second) => `${first.event_date} ${first.event_time || ""}`.localeCompare(`${second.event_date} ${second.event_time || ""}`))[0];
}

function getClubCtaLabel(existingRequest?: MembershipRequestRecord) {
  if (!existingRequest) {
    return "View Club";
  }

  const status = resolveMembershipStatus(existingRequest, existingRequest.due_payment || undefined);

  if (status === "pending_payment" || status === "needs_new_payment_details") {
    return "Continue Setup";
  }

  return "View Club";
}

function getClubSearchFields(club: ClubRecord, categories: ClubInterestCategory[]) {
  return [club.name, club.code, getClubDescription(club), ...categories].filter(Boolean).join(" ").toLowerCase();
}

function getDuesStateLabel(club: ClubRecord, request?: MembershipRequestRecord, payment?: DuePaymentRecord, settings?: ClubPaymentSettingsRecord | null) {
  if (!isDuesRequired(club, settings)) {
    return "Not required";
  }

  if (!request || request.status === "pending") {
    return "Required, proof not uploaded";
  }

  if (request.status === "active") {
    return "Approved";
  }

  if (!payment || payment.status === "unpaid") {
    return "Required, proof not uploaded";
  }

  if (payment.status === "submitted") {
    return "Proof submitted, under review";
  }

  if (payment.status === "paid") {
    return "Approved";
  }

  return "Rejected, upload again";
}

function getMembershipNextStep(status: ResolvedMembershipStatus, duesRequired: boolean) {
  if (status === "active") {
    return "Membership active. Check onboarding notes and club announcements.";
  }

  if (status === "payment_under_review") {
    return "Wait for Club Services to verify your dues proof.";
  }

  if (status === "pending_payment" || status === "needs_new_payment_details") {
    return duesRequired ? "Upload or update your dues proof so verification can continue." : "Wait for Club Services to finish activation.";
  }

  if (status === "rejected") {
    return "Review the decision note, then choose another club or contact Club Services.";
  }

  if (status === "cancelled") {
    return "This request is closed. You can return to Discover Clubs.";
  }

  return "Wait for Club Services to review your join request.";
}

function getJoinFlowSteps(status: ResolvedMembershipStatus | "not_started", duesRequired: boolean) {
  const paymentDone = status === "payment_under_review" || status === "active";

  return [
    {
      label: "Request to join",
      done: status !== "not_started",
      current: status === "not_started" || status === "under_review"
    },
    {
      label: duesRequired ? "Upload dues proof" : "Dues not required",
      done: !duesRequired || paymentDone,
      current: duesRequired && (status === "pending_payment" || status === "needs_new_payment_details")
    },
    {
      label: "Club Services verification",
      done: status === "active",
      current: status === "payment_under_review"
    },
    {
      label: "Membership active",
      done: status === "active",
      current: false
    },
    {
      label: "Onboarding instructions",
      done: status === "active",
      current: status === "active"
    }
  ];
}

function getWhatsAppStatusLabel(request?: MembershipRequestRecord) {
  if (!request) {
    return "Available after approval";
  }

  if (request.whatsapp_onboarding_status === "added") {
    return "Added to onboarding group";
  }

  if (request.whatsapp_onboarding_status === "ready") {
    return "Ready for onboarding";
  }

  return "Waiting for approval";
}

function getAnnouncementPriorityClass(priority: AnnouncementRecord["priority"]) {
  return {
    low: "bg-muted text-muted-foreground",
    normal: "bg-accent text-foreground",
    high: "bg-warning/15 text-warning",
    urgent: "bg-destructive/15 text-destructive"
  }[priority];
}

function resolveJoinAmount(
  studentType: "fresher" | "returning",
  settings?: { fresher_dues_amount: number; returning_student_dues_amount: number } | null
) {
  if (studentType === "fresher") {
    return settings?.fresher_dues_amount ?? 10000;
  }

  return settings?.returning_student_dues_amount ?? 10000;
}

function DuesConfirmationCard({
  request,
  payment,
  club,
  settings
}: {
  request: MembershipRequestRecord;
  payment?: DuePaymentRecord;
  club: ClubRecord;
  settings?: ClubPaymentSettingsRecord | null;
}) {
  const resolvedStatus = resolveMembershipStatus(request, payment);
  const duesRequired = isDuesRequired(club, settings);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState(payment?.payment_account_name || "");
  const [paidAt, setPaidAt] = useState(payment?.payment_paid_at?.slice(0, 10) || "");
  const [proofUrl, setProofUrl] = useState(payment?.proof_url || "");
  const [proofFileName, setProofFileName] = useState("");
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [paymentProofLink, setPaymentProofLink] = useState<string | null>(null);
  const submitMutation = useMutation({
    mutationFn: () =>
      submitDuePaymentConfirmation(request.due_payment_id || "", {
        payment_account_name: accountName,
        payment_reference: null,
        payment_paid_at: paidAt || null,
        proof_url: proofUrl || null,
        payer_note: null
      }),
    onSuccess: async () => {
      toast.success("Payment details sent again", {
        description: "Your updated payment details are back in the Club Services review queue."
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-dues"] }),
        queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not resend payment details", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveProofLink() {
      const resolved = await resolveStorageFileUrl("dues-receipts", payment?.proof_url);

      if (!cancelled) {
        setPaymentProofLink(resolved);
      }
    }

    resolveProofLink();

    return () => {
      cancelled = true;
    };
  }, [payment?.proof_url]);

  function clearReceiptSelection() {
    setProofUrl("");
    setProofFileName("");
    setPaymentProofLink(null);

    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
  }

  async function handleReceiptUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Receipt is too large", {
        description: "Please upload a file smaller than 5MB."
      });
      return;
    }

    try {
      setIsUploadingProof(true);

      if (!user?.id) {
        toast.error("You are not signed in", {
          description: "Please sign in again and retry uploading your dues proof."
        });
        return;
      }

      const upload = await uploadStorageFile(file, "dues-receipts", {
        folder: `${request.club_id}/${user.id}`
      });

      setProofUrl(upload.path);
      setProofFileName(file.name);
      toast.success("Receipt uploaded", {
        description: "The upload is ready to attach to your payment update."
      });
    } catch (uploadError) {
      toast.error("Could not upload dues proof", {
        description: getErrorMessage(uploadError)
      });
    } finally {
      setIsUploadingProof(false);
      event.target.value = "";
    }
  }

  if (!request.due_payment_id) {
    return (
      <div className="mt-4 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm">
        <p className="font-semibold text-warning">{duesRequired ? "Dues proof not uploaded yet" : "Dues are not required"}</p>
        <p className="mt-1 text-muted-foreground">
          {duesRequired
            ? "Club Services will show the upload step once this request is ready for payment confirmation."
            : "Your request can move through verification without dues proof."}
        </p>
      </div>
    );
  }

  if (resolvedStatus === "payment_under_review") {
    return (
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Payment submitted for review</p>
        <p className="mt-1 text-muted-foreground">
          {payment.payment_account_name ? `Paid by ${payment.payment_account_name}` : "Receipt submitted for review."}
        </p>
        {paymentProofLink ? (
          <a className="mt-2 inline-block text-primary underline" href={paymentProofLink} target="_blank" rel="noreferrer">
            View submitted dues proof
          </a>
        ) : null}
      </div>
    );
  }

  if (resolvedStatus === "active") {
    return (
      <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-4 text-sm">
        <p className="font-semibold text-success">Dues verified. You are now an active member.</p>
        <p className="mt-1 text-muted-foreground">
          Club Services has confirmed your payment. Any extra community access instructions will be shared separately.
        </p>
      </div>
    );
  }

  if (resolvedStatus === "under_review") {
    return (
      <div className="mt-4 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm">
        <p className="font-semibold text-warning">Your join request is under review.</p>
        <p className="mt-1 text-muted-foreground">
          Club Services is checking your request. You will see the next step here once review is complete.
        </p>
      </div>
    );
  }

  if (resolvedStatus === "rejected") {
    return (
      <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
        <p className="font-semibold text-destructive">This join request was not approved.</p>
        <p className="mt-1 text-muted-foreground">
          {request.decision_remarks || "Check the discover clubs page if you would like to try another club."}
        </p>
      </div>
    );
  }

  if (resolvedStatus === "cancelled") {
    return (
      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <p className="font-semibold text-foreground">This request has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
      <div>
        <p className="font-semibold text-primary">
          {resolvedStatus === "pending_payment" ? "Complete your payment details" : "Update your payment details"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {resolvedStatus === "needs_new_payment_details"
            ? "Your earlier payment details were rejected. Correct them below and resend for review."
            : "Pay your club dues, then send the payment details below so your membership can move forward."}
        </p>
        {resolvedStatus === "needs_new_payment_details" ? (
          <p className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
            {request.decision_remarks || "Club Services rejected the previous proof. No detailed rejection note was provided."}
          </p>
        ) : null}
      </div>

      <div className="nh-card-soft p-4">
        {settings ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bank</p>
              <p className="font-semibold">{settings.bank_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Number</p>
              <p className="font-semibold">{settings.account_number}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Name</p>
              <p className="font-semibold">{settings.account_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Freshers</p>
              <p className="font-semibold">{formatCurrency(settings.fresher_dues_amount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Returning Students</p>
              <p className="font-semibold">{formatCurrency(settings.returning_student_dues_amount)}</p>
            </div>
            {settings.payment_instructions ? (
              <p className="sm:col-span-2 text-muted-foreground">{settings.payment_instructions}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Shared payment details have not been published yet. Please contact Club Services.
          </p>
        )}
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!proofUrl) {
            toast.error("Receipt required", {
              description: "Please upload your dues proof before resending payment details."
            });
            return;
          }
          submitMutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={`membership_account_name_${request.id}`}>Name on account used</Label>
          <Input id={`membership_account_name_${request.id}`} value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`membership_payment_date_${request.id}`}>Payment date</Label>
          <Input id={`membership_payment_date_${request.id}`} type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`membership_proof_upload_${request.id}`}>Upload dues proof</Label>
          <Input
            ref={proofInputRef}
            id={`membership_proof_upload_${request.id}`}
            type="file"
            accept="image/*,.pdf"
            onChange={handleReceiptUpload}
            disabled={isUploadingProof}
          />
          {proofFileName ? <p className="text-xs text-muted-foreground">Uploaded: {proofFileName}</p> : null}
          {proofUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Dues proof ready to submit.</p>
              <Button type="button" variant="outline" size="sm" onClick={clearReceiptSelection}>
                Remove dues proof
              </Button>
            </div>
          ) : null}
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={submitMutation.isPending || isUploadingProof}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Submit Dues Proof"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function JoinFlowStepper({
  status,
  duesRequired
}: {
  status: ResolvedMembershipStatus | "not_started";
  duesRequired: boolean;
}) {
  const steps = getJoinFlowSteps(status, duesRequired);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Join Progress</CardTitle>
        <p className="text-sm text-muted-foreground">Every club membership moves through Club Services verification before activation.</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`rounded-xl border-2 p-3 text-sm ${
              step.done
                ? "border-success bg-success/10 text-success"
                : step.current
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">Step {index + 1}</p>
            <p className="mt-1 font-semibold">{step.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ClubDetailOverview({
  club,
  categories,
  existingRequest,
  settings,
  nextEvent,
  clubEvents,
  announcements,
  announcementsLoading,
  announcementsFailed,
  announcementsError
}: {
  club: ClubRecord;
  categories: ClubInterestCategory[];
  existingRequest?: MembershipRequestRecord;
  settings?: ClubPaymentSettingsRecord | null;
  nextEvent?: ApprovedEventRecord;
  clubEvents: ApprovedEventRecord[];
  announcements: AnnouncementRecord[];
  announcementsLoading: boolean;
  announcementsFailed: boolean;
  announcementsError: unknown;
}) {
  const payment = existingRequest?.due_payment || undefined;
  const membershipStatus = existingRequest ? resolveMembershipStatus(existingRequest, payment) : "not_started";
  const duesRequired = isDuesRequired(club, settings);
  const active = membershipStatus === "active";
  const canInvite = club.is_public_signup !== false;

  function handleInviteFriend() {
    const reason = getClubInviteReason(club, nextEvent);

    void shareOrCopy({
      title: `Join ${club.name}`,
      text: `Hey, join ${club.name} on Campus One. ${reason}`,
      url: getClubShareUrl(club.id),
      successTitle: "Club invite ready",
      fallbackTitle: "Club invite copied"
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3"><ClubLogo club={club} /><div><CardTitle className="text-2xl">{club.name}</CardTitle><p className="text-sm text-muted-foreground">{club.code || "Nile University club"}</p></div></div>
            </div>
            {existingRequest ? (
              <MembershipStatusBadge request={existingRequest} payment={payment} />
            ) : (
              <Badge variant="outline">Not joined</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canInvite ? (
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleInviteFriend}>
                <Share2 className="mr-2 h-4 w-4" />
                Invite Friend
              </Button>
            ) : (
              <Badge variant="outline">Invites open when membership opens</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="bg-accent/25">
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">{getClubDescription(club)}</p>
          {(club.website_url || Object.keys(club.social_links || {}).length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {club.website_url ? <Button asChild size="sm" variant="outline"><a href={club.website_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Website</a></Button> : null}
              {Object.entries(club.social_links || {}).map(([network, url]) => <Button key={network} asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer">{network}</a></Button>)}
            </div>
          ) : null}
          {club.gallery?.length ? (
            <div><h3 className="mb-3 font-black">Club gallery</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{club.gallery.map((media) => <GalleryImage key={media.id} path={media.storage_path} caption={media.caption} />)}</div></div>
          ) : null}
          <div>
            <h3 className="mb-3 font-black">Approved events</h3>
            {clubEvents.length ? <div className="space-y-2">{clubEvents.slice(0, 6).map((event) => <div key={event.proposal_id} className="rounded-lg border p-3"><p className="font-semibold">{event.title}</p><p className="text-sm text-muted-foreground">{formatDate(event.event_date)} · {event.event_lifecycle === "past" ? "Past event" : "Upcoming"}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No approved events have been published for this club yet.</p>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dues requirement</p>
              <p className="mt-1 font-semibold">{getClubDuesRequirementLabel(club, settings)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{getDuesStateLabel(club, existingRequest, payment, settings)}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Next event / meeting</p>
              <p className="mt-1 font-semibold">
                {nextEvent ? `${nextEvent.title} - ${formatDate(nextEvent.event_date)}` : "No upcoming event yet"}
              </p>
              {nextEvent?.event_time || nextEvent?.location ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[nextEvent.event_time?.slice(0, 5), nextEvent.location].filter(Boolean).join(" - ")}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Next step</p>
              <p className="mt-1 font-semibold">
                {membershipStatus === "not_started" ? "Submit your join request." : getMembershipNextStep(membershipStatus, duesRequired)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp / onboarding</p>
              <p className="mt-1 font-semibold">{getWhatsAppStatusLabel(existingRequest)}</p>
              {active && existingRequest?.whatsapp_chat_url ? (
                <a className="mt-2 inline-block text-sm text-primary underline" href={existingRequest.whatsapp_chat_url} target="_blank" rel="noreferrer">
                  Open onboarding chat
                </a>
              ) : null}
            </div>
          </div>
          {(club.whatsapp_group_name || club.whatsapp_onboarding_notes || existingRequest?.whatsapp_onboarding_notes) ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-primary">Contact / onboarding note</p>
              {club.whatsapp_group_name ? <p className="mt-1 text-muted-foreground">Group: {club.whatsapp_group_name}</p> : null}
              <p className="mt-1 text-muted-foreground">
                {existingRequest?.whatsapp_onboarding_notes || club.whatsapp_onboarding_notes || "Instructions will appear here after approval."}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Announcements Preview</CardTitle>
          <p className="text-sm text-muted-foreground">Recent updates visible to you for this club.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcementsLoading ? (
            <NeoLoadingState title="Loading announcements" message="Checking recent club updates." compact />
          ) : announcementsFailed ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {getErrorMessage(announcementsError)}
            </div>
          ) : announcements.length === 0 ? (
            <p className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">No announcements for this club yet.</p>
          ) : (
            announcements.slice(0, 3).map((announcement) => (
              <Link key={announcement.id} to="/communications" className="block">
                <div className="nh-list-card transition-colors hover:bg-accent/15">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold leading-5">{announcement.title}</p>
                    <Badge className={getAnnouncementPriorityClass(announcement.priority)}>{announcement.priority}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{announcement.message}</p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JoinClubPanel({
  club,
  existingRequest,
  settings,
  defaultStudentType,
  defaultPhoneNumber,
  defaultDepartment
}: {
  club: ClubRecord;
  existingRequest?: MembershipRequestRecord;
  settings?: ClubPaymentSettingsRecord | null;
  defaultStudentType?: "fresher" | "returning" | null;
  defaultPhoneNumber?: string | null;
  defaultDepartment?: string | null;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Draft persistence ────────────────────────────────────────────────────
  // Initialise state from a saved draft first, then fall back to profile
  // defaults. This means the form survives page refreshes or accidental
  // navigations away before the user submits.
  const userId = user?.id ?? "";
  const savedDraft = userId ? readJoinFormDraft(userId, club.id) : null;

  const [studentType, setStudentType] = useState<"fresher" | "returning">(
    savedDraft?.studentType ?? defaultStudentType ?? "returning"
  );
  const [studentId, setStudentId] = useState(savedDraft?.studentId ?? "");
  const [phoneNumber, setPhoneNumber] = useState(savedDraft?.phoneNumber ?? defaultPhoneNumber ?? "");
  const [department, setDepartment] = useState(savedDraft?.department ?? defaultDepartment ?? "");
  const [joinReason, setJoinReason] = useState(savedDraft?.joinReason ?? "");
  const [accountName, setAccountName] = useState(savedDraft?.accountName ?? "");
  const [paidAt, setPaidAt] = useState(savedDraft?.paidAt ?? "");
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Apply profile defaults only once when they first arrive (e.g. on slow load)
  // but don't overwrite what the user has already typed or what came from the draft.
  const profileDefaultsApplied = useRef(false);
  useEffect(() => {
    if (profileDefaultsApplied.current || savedDraft) {
      return;
    }

    if (defaultStudentType) setStudentType(defaultStudentType);
    if (defaultPhoneNumber) setPhoneNumber(defaultPhoneNumber);
    if (defaultDepartment) setDepartment(defaultDepartment);
    profileDefaultsApplied.current = true;
  }, [defaultStudentType, defaultPhoneNumber, defaultDepartment, savedDraft]);

  // Persist draft on every field change (debounced via useCallback identity).
  const persistDraft = useCallback(() => {
    if (!userId) {
      return;
    }

    writeJoinFormDraft(userId, club.id, {
      studentType,
      studentId,
      phoneNumber,
      department,
      joinReason,
      accountName,
      paidAt
    });
  }, [userId, club.id, studentType, studentId, phoneNumber, department, joinReason, accountName, paidAt]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);
  // ── End draft persistence ────────────────────────────────────────────────

  const duesRequired = isDuesRequired(club, settings);
  const joinAmount = duesRequired ? resolveJoinAmount(studentType, settings) : 0;
  const normalizedStudentId = normalizeStudentId(studentId);

  const createRequestMutation = useMutation({
    mutationFn: () =>
      createMembershipRequest({
        club_id: club.id,
        requested_role: "member",
        student_id: normalizedStudentId || null,
        phone_number: phoneNumber || null,
        department: department || null,
        student_type: studentType,
        join_reason: joinReason || null,
            payment_account_name: accountName,
        payment_reference: null,
        payment_paid_at: paidAt || null,
        proof_url: proofUrl || null,
        payer_note: null
      }),
    onSuccess: async () => {
      toast.success("Join request submitted", {
        description: "Your payment details were attached and the club can now review your membership."
      });
      // Clear the persisted draft now that it has been successfully submitted.
      if (userId) {
        clearJoinFormDraft(userId, club.id);
      }
      setStudentId("");
      setPhoneNumber("");
      setDepartment("");
      setJoinReason("");
      setAccountName("");
      setPaidAt("");
      setProofUrl("");
      setProofFileName("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["my-dues"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not submit join request", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  async function handleReceiptUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Receipt is too large", {
        description: "Please upload a file smaller than 5MB."
      });
      return;
    }

    try {
      setIsUploadingProof(true);

      if (!user?.id) {
        toast.error("You are not signed in", {
          description: "Please sign in again and retry uploading your dues proof."
        });
        return;
      }

      const upload = await uploadStorageFile(file, "dues-receipts", {
        folder: `${club.id}/${user.id}`
      });

      setProofUrl(upload.path);
      setProofFileName(file.name);
      toast.success("Receipt uploaded", {
        description: "The upload will be attached to your join request."
      });
    } catch (uploadError) {
      toast.error("Could not upload dues proof", {
        description: getErrorMessage(uploadError)
      });
    } finally {
      setIsUploadingProof(false);
      event.target.value = "";
    }
  }

  function clearReceiptSelection() {
    setProofUrl("");
    setProofFileName("");

    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b-2 border-foreground bg-primary/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{club.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{club.code || "Nile University club"}</p>
          </div>
          {existingRequest ? <MembershipStatusBadge request={existingRequest} payment={existingRequest.due_payment || undefined} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-3 rounded-xl border-2 border-foreground bg-warning/10 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Student type</p>
            <Select
              value={studentType}
              onValueChange={(value) => setStudentType(value as "fresher" | "returning")}
              disabled={Boolean(existingRequest)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STUDENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Join dues</p>
            <p className="mt-1 text-lg font-bold">{duesRequired ? formatCurrency(joinAmount) : "Not required"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {duesRequired
                ? "Pay first, then upload your dues proof with your join request."
                : "Submit your join request first. Club Services will review and activate it if approved."}
            </p>
          </div>
        </div>

        {duesRequired && settings ? (
          <div className="nh-card-soft space-y-2 p-4 text-sm">
            <p className="font-semibold">Club Services Account</p>
            <p><span className="text-muted-foreground">Bank:</span> {settings.bank_name}</p>
            <p><span className="text-muted-foreground">Account:</span> {settings.account_number}</p>
            <p><span className="text-muted-foreground">Name:</span> {settings.account_name}</p>
            {settings.payment_instructions ? (
              <p className="text-muted-foreground">{settings.payment_instructions}</p>
            ) : null}
          </div>
        ) : duesRequired ? (
          <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            Shared payment account details have not been published yet. Please contact Club Services before paying.
          </div>
        ) : null}

        {!existingRequest ? (
          <form
            className="space-y-3"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              if (normalizedStudentId && !isValidStudentId(normalizedStudentId)) {
                toast.error("Check your University ID", {
                  description: STUDENT_ID_ERROR_MESSAGE
                });
                return;
              }
              if (!normalizedStudentId) {
                toast.error("University ID required", {
                  description: "Please enter your 9-digit University ID before sending this join request."
                });
                return;
              }
              if (duesRequired && !proofUrl) {
                toast.error("Receipt required", {
                  description: "Please upload your dues proof before sending this join request."
                });
                return;
              }
              createRequestMutation.mutate();
            }}
          >
            <p className="text-xs text-muted-foreground">
              These details will be saved to your profile so you don't have to retype them for future club joins.
            </p>
            <div className="space-y-2">
              <Label htmlFor={`join-student-id-${club.id}`}>Student ID</Label>
              <NhStudentId
                id={`join-student-id-${club.id}`}
                value={studentId}
                onChange={setStudentId}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`join-phone-${club.id}`}>Phone Number</Label>
              <Input
                id={`join-phone-${club.id}`}
                placeholder="08000000000"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`join-department-${club.id}`}>Department</Label>
              <Input
                id={`join-department-${club.id}`}
                placeholder="Computer Science"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Why did you join this club? (Optional)</Label>
              <Textarea value={joinReason} onChange={(event) => setJoinReason(event.target.value)} rows={3} />
            </div>
            {duesRequired ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor={`join-account-name-${club.id}`}>Name on account used</Label>
                  <Input id={`join-account-name-${club.id}`} value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`join-payment-date-${club.id}`}>Payment date</Label>
                  <Input id={`join-payment-date-${club.id}`} type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`join-proof-${club.id}`}>Upload dues proof</Label>
                  <Input
                    ref={proofInputRef}
                    id={`join-proof-${club.id}`}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    disabled={isUploadingProof}
                  />
                  {proofFileName ? <p className="text-xs text-muted-foreground">Uploaded: {proofFileName}</p> : null}
                  {proofUrl ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Dues proof ready to submit.</p>
                      <Button type="button" variant="outline" size="sm" onClick={clearReceiptSelection}>
                        Remove dues proof
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
            <Button className="w-full" type="submit" disabled={createRequestMutation.isPending || isUploadingProof}>
              {createRequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending request...
                </>
              ) : (
                "Join Club"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current request: {getStatusLabel(resolveMembershipStatus(existingRequest, existingRequest.due_payment || undefined))}.
            </p>
            <DuesConfirmationCard
              request={existingRequest}
              payment={existingRequest.due_payment || undefined}
              club={club}
              settings={settings}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscoverClubCard({
  club,
  existingRequest,
  categories,
  nextEvent
}: {
  club: ClubRecord;
  existingRequest?: MembershipRequestRecord;
  categories: ClubInterestCategory[];
  nextEvent?: ApprovedEventRecord;
}) {
  const description = getClubDescription(club);
  const buttonLabel = getClubCtaLabel(existingRequest);
  const memberCount = getClubMemberCount(club);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="border-b-2 border-foreground bg-primary/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3"><ClubLogo club={club} className="h-12 w-12" /><div><CardTitle className="text-lg">{club.name}</CardTitle><p className="text-sm text-muted-foreground">{club.code || "Nile University club"}</p></div></div>
          </div>
          {existingRequest ? <MembershipStatusBadge request={existingRequest} payment={existingRequest.due_payment || undefined} /> : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="outline" className="bg-accent/25">
              {category}
            </Badge>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {getClubDescriptionPreview(description)}
        </p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dues</p>
            <p className="font-semibold">{getClubDuesLabel(club)}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Membership</p>
            <p className="font-semibold">{club.is_public_signup === false ? "Not open yet" : "Open"}</p>
          </div>
          {typeof memberCount === "number" ? (
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Members</p>
              <p className="font-semibold">{memberCount}</p>
            </div>
          ) : null}
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Next event</p>
            <p className="font-semibold">{nextEvent ? `${formatDate(nextEvent.event_date)}${nextEvent.event_time ? `, ${nextEvent.event_time.slice(0, 5)}` : ""}` : "No event yet"}</p>
          </div>
        </div>
        <Button asChild className="mt-auto w-full sm:w-auto">
          <Link to={`/membership/clubs/${club.id}`}>{buttonLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StudentClubJoinPage({
  clubs,
  events,
  myRequests,
  isLoadingClubs,
  isLoadingRequests,
  clubsFailed,
  clubsError,
  requestsFailed,
  requestsError,
  defaultStudentType,
  defaultPhoneNumber,
  defaultDepartment
}: {
  clubs: ClubRecord[];
  events: ApprovedEventRecord[];
  myRequests: MembershipRequestRecord[];
  isLoadingClubs: boolean;
  isLoadingRequests: boolean;
  clubsFailed: boolean;
  clubsError: unknown;
  requestsFailed: boolean;
  requestsError: unknown;
  defaultStudentType?: "fresher" | "returning" | null;
  defaultPhoneNumber?: string | null;
  defaultDepartment?: string | null;
}) {
  const { clubId } = useParams();
  const listedClub = clubs.find((item) => item.id === clubId);
  const { data: detailedClub } = useQuery({
    queryKey: ["club-detail", clubId],
    queryFn: () => getClubDetail(clubId as string),
    enabled: Boolean(clubId),
    retry: false
  });
  const club = detailedClub || listedClub;
  const existingRequest = myRequests.find((request) => request.club_id === clubId);
  const { data: settings } = useQuery({
    queryKey: ["club-payment-settings", club?.id],
    queryFn: () => getClubPaymentSettings(club?.id),
    enabled: Boolean(club?.id),
    retry: false
  });
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: announcementsLoading,
    isError: announcementsFailed,
    error: announcementsError
  } = useQuery({
    queryKey: ["club-detail-announcements", club?.id],
    queryFn: () => getAnnouncements({ club_id: club?.id, page: 1, page_size: 5 }),
    enabled: Boolean(club?.id),
    retry: false
  });
  const categories = club ? getClubInterestCategories(club) : [];
  const nextEvent = club ? getNextClubEvent(club.id, events) : undefined;
  const clubEvents = club ? events.filter((event) => event.club_id === club.id) : [];
  const membershipStatus = existingRequest ? resolveMembershipStatus(existingRequest, existingRequest.due_payment || undefined) : "not_started";
  const duesRequired = club ? isDuesRequired(club, settings) : false;

  return (
    <div className="nh-page">
      <div className="flex items-center">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/membership">
            <ArrowLeft className="h-4 w-4" />
            Discover Clubs
          </Link>
        </Button>
      </div>

      {isLoadingClubs || isLoadingRequests ? (
        <NeoLoadingState title="Opening club join form" message="We are loading the club details and your current request status." compact />
      ) : clubsFailed ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load clubs</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(clubsError)}</p>
          </CardContent>
        </Card>
      ) : requestsFailed ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load your membership requests</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(requestsError)}</p>
          </CardContent>
        </Card>
      ) : !club ? (
        <NeoStateCard
          icon={Users}
          title="Club not found"
          message="We couldn't find that club. Please go back to the discover page and choose another one."
        />
      ) : (
        <>
          <NeoPageHeader
            eyebrow="Membership"
            title={`Join ${club.name}`}
            description={getClubDescription(club)}
          />
          <ClubDetailOverview
            club={club}
            categories={categories}
            existingRequest={existingRequest}
            settings={settings}
            nextEvent={nextEvent}
            clubEvents={clubEvents}
            announcements={announcementsPage.items}
            announcementsLoading={announcementsLoading}
            announcementsFailed={announcementsFailed}
            announcementsError={announcementsError}
          />
          <JoinFlowStepper status={membershipStatus} duesRequired={duesRequired} />
          <JoinClubPanel
            club={club}
            existingRequest={existingRequest}
            settings={settings}
            defaultStudentType={defaultStudentType}
            defaultPhoneNumber={defaultPhoneNumber}
            defaultDepartment={defaultDepartment}
          />
        </>
      )}
    </div>
  );
}

function StudentMembershipView() {
  const { profile } = useAuth();
  const { clubId } = useParams();
  useUsageTracking(clubId ? "club_detail_view" : "club_discovery_view");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ClubInterestCategory | "all">("all");
  const [duesFilter, setDuesFilter] = useState<(typeof DUES_FILTERS)[number]["value"]>("all");
  const [membershipOpenFilter, setMembershipOpenFilter] = useState<(typeof MEMBERSHIP_OPEN_FILTERS)[number]["value"]>("all");
  const [eventFilter, setEventFilter] = useState<(typeof EVENT_FILTERS)[number]["value"]>("all");
  const [sortFilter, setSortFilter] = useState<(typeof SORT_FILTERS)[number]["value"]>("recommended");
  const [recommendationsDismissed, setRecommendationsDismissed] = useState(() => sessionStorage.getItem("club-recommendations-dismissed") === "true");
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery(publicClubsQueryOptions);
  const {
    data: eventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isError: eventsFailed,
    error: eventsError
  } = useQuery({
    queryKey: ["membership-discovery-events"],
    queryFn: () => getApprovedEvents({ page: 1, page_size: 100 }),
    retry: false
  });
  const {
    data: myRequests = [],
    isLoading: isLoadingRequests,
    isError: requestsFailed,
    error: requestsError
  } = useQuery({
    queryKey: ["my-membership-requests"],
    queryFn: () => getMyMembershipRequests(),
    retry: false
  });
  const requestByClubId = useMemo(
    () => new Map(myRequests.map((request) => [request.club_id, request])),
    [myRequests]
  );
  const clubCategoriesById = useMemo(
    () => new Map(clubs.map((club) => [club.id, getClubInterestCategories(club)] as const)),
    [clubs]
  );
  const upcomingEvents = useMemo(
    () => eventsPage.items.filter((event) => event.event_lifecycle === "upcoming" || event.event_lifecycle === "happening_today"),
    [eventsPage.items]
  );
  const nextEventByClubId = useMemo(
    () => new Map(clubs.map((club) => [club.id, getNextClubEvent(club.id, upcomingEvents)] as const)),
    [clubs, upcomingEvents]
  );
  const recommendedCategories = useMemo(() => getStudentInterestCategories(profile), [profile]);
  const filteredClubs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clubs
      .filter((club) => {
        const categories = clubCategoriesById.get(club.id) ?? ["Other"];
        const hasUpcomingEvent = Boolean(nextEventByClubId.get(club.id));

        if (normalizedSearch && !getClubSearchFields(club, categories).includes(normalizedSearch)) {
          return false;
        }

        if (categoryFilter !== "all" && !categories.includes(categoryFilter)) {
          return false;
        }

        if (duesFilter === "required" && club.dues_amount <= 0) {
          return false;
        }

        if (duesFilter === "free" && club.dues_amount > 0) {
          return false;
        }

        if (membershipOpenFilter === "open" && club.is_public_signup === false) {
          return false;
        }

        if (membershipOpenFilter === "closed" && club.is_public_signup !== false) {
          return false;
        }

        if (eventFilter === "upcoming" && !hasUpcomingEvent) {
          return false;
        }

        return true;
      })
      .sort((first, second) => {
        if (sortFilter === "name") {
          return first.name.localeCompare(second.name);
        }

        if (sortFilter === "new") {
          return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
        }

        if (sortFilter === "active") {
          return Number(Boolean(nextEventByClubId.get(second.id))) - Number(Boolean(nextEventByClubId.get(first.id)));
        }

        const firstRecommended = recommendedCategories.some((category) => clubCategoriesById.get(first.id)?.includes(category));
        const secondRecommended = recommendedCategories.some((category) => clubCategoriesById.get(second.id)?.includes(category));

        return Number(secondRecommended) - Number(firstRecommended) || Number(Boolean(nextEventByClubId.get(second.id))) - Number(Boolean(nextEventByClubId.get(first.id))) || first.name.localeCompare(second.name);
      });
  }, [categoryFilter, clubCategoriesById, clubs, duesFilter, eventFilter, membershipOpenFilter, nextEventByClubId, recommendedCategories, search, sortFilter]);
  const recommendedClubs = useMemo(() => {
    const candidateCategories = recommendedCategories.length > 0 ? recommendedCategories : CLUB_INTEREST_CATEGORIES.filter((category) => category !== "Other");

    return clubs
      .filter((club) => {
        const categories = clubCategoriesById.get(club.id) ?? ["Other"];

        return candidateCategories.some((category) => categories.includes(category)) || Boolean(nextEventByClubId.get(club.id));
      })
      .sort((first, second) => Number(Boolean(nextEventByClubId.get(second.id))) - Number(Boolean(nextEventByClubId.get(first.id))) || first.name.localeCompare(second.name))
      .slice(0, 3);
  }, [clubCategoriesById, clubs, nextEventByClubId, recommendedCategories]);
  const activeFilterCount = [categoryFilter !== "all", duesFilter !== "all", membershipOpenFilter !== "all", eventFilter !== "all", search.trim().length > 0].filter(Boolean).length;

  function clearDiscoveryFilters() {
    setSearch("");
    setCategoryFilter("all");
    setDuesFilter("all");
    setMembershipOpenFilter("all");
    setEventFilter("all");
    setSortFilter("recommended");
  }

  if (clubId) {
    return (
      <StudentClubJoinPage
        clubs={clubs}
        events={eventsPage.items}
        myRequests={myRequests}
        isLoadingClubs={isLoadingClubs}
        isLoadingRequests={isLoadingRequests}
        clubsFailed={clubsFailed}
        clubsError={clubsError}
        requestsFailed={requestsFailed}
        requestsError={requestsError}
        defaultStudentType={profile?.student_type || undefined}
        defaultPhoneNumber={profile?.phone_number ?? null}
        defaultDepartment={profile?.department ?? null}
      />
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Membership"
        title="Discover Clubs"
        description="Find clubs that fit your interests, dues preference, and next campus activity."
      />

      <Card>
        <CardHeader className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                What clubs fit me?
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search by name or choose interests to narrow the club directory.
              </p>
            </div>
            <div className="relative lg:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clubs, categories, or descriptions..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              All interests
            </Button>
            {CLUB_INTEREST_CATEGORIES.map((category) => (
              <Button
                key={category}
                type="button"
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>Dues</Label>
              <Select value={duesFilter} onValueChange={(value) => setDuesFilter(value as typeof duesFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUES_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Membership</Label>
              <Select value={membershipOpenFilter} onValueChange={(value) => setMembershipOpenFilter(value as typeof membershipOpenFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_OPEN_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <Select value={eventFilter} onValueChange={(value) => setEventFilter(value as typeof eventFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort</Label>
              <Select value={sortFilter} onValueChange={(value) => setSortFilter(value as typeof sortFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredClubs.length} clubs match{activeFilterCount ? ` with ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : ""}.</span>
            </div>
            {activeFilterCount ? (
              <Button type="button" variant="outline" size="sm" onClick={clearDiscoveryFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {isLoadingClubs || isLoadingRequests ? (
        <NeoLoadingState title="Checking club membership status" message="We are loading clubs and your current requests." compact />
      ) : clubsFailed ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load clubs</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(clubsError)}</p>
          </CardContent>
        </Card>
      ) : requestsFailed ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load your membership requests</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(requestsError)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {eventsFailed ? (
            <Card>
              <CardContent className="p-5">
                <p className="font-medium">Club event hints could not load</p>
                <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(eventsError)}</p>
              </CardContent>
            </Card>
          ) : null}

          {recommendedClubs.length && !recommendationsDismissed ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3"><CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {recommendedCategories.length ? "Recommended Clubs" : "Explore by Interest"}
                </CardTitle><Button type="button" size="sm" variant="ghost" onClick={() => { sessionStorage.setItem("club-recommendations-dismissed", "true"); setRecommendationsDismissed(true); }}>Dismiss</Button></div>
                <p className="text-sm text-muted-foreground">
                  {recommendedCategories.length
                    ? `Based on your profile signals: ${recommendedCategories.slice(0, 3).join(", ")}.`
                    : "A quick starting point using active clubs and inferred interest areas."}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recommendedClubs.map((club) => (
                    <DiscoverClubCard
                      key={club.id}
                      club={club}
                      existingRequest={requestByClubId.get(club.id)}
                      categories={clubCategoriesById.get(club.id) ?? ["Other"]}
                      nextEvent={nextEventByClubId.get(club.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {filteredClubs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No clubs match those filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another interest, clear filters, or search by club name.</p>
                <Button type="button" variant="outline" className="mt-4" onClick={clearDiscoveryFilters}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredClubs.map((club) => {
                const existingRequest = requestByClubId.get(club.id);

                return (
                  <DiscoverClubCard
                    key={club.id}
                    club={club}
                    existingRequest={existingRequest}
                    categories={clubCategoriesById.get(club.id) ?? ["Other"]}
                    nextEvent={nextEventByClubId.get(club.id)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {myRequests.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Current Club Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRequests.map((request) => (
              <div key={request.id} className="nh-list-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{request.club?.name || "Selected club"}</p>
                    <p className="text-sm text-muted-foreground">
                      {getStudentTypeLabel(request.student_type)} - {formatCurrency(request.dues_amount)}
                    </p>
                    {request.join_reason ? (
                      <p className="mt-2 text-sm text-muted-foreground">{request.join_reason}</p>
                    ) : null}
                  </div>
                  <MembershipStatusBadge request={request} payment={request.due_payment || undefined} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

    </div>
  );
}

function ReviewerMembershipView() {
  const { role } = useRole();
  const [searchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const initialStatusFilter = REQUEST_STATUSES.includes(requestedStatus as (typeof REQUEST_STATUSES)[number])
    ? (requestedStatus as (typeof REQUEST_STATUSES)[number])
    : "all";
  const [statusFilter, setStatusFilter] = useState<(typeof REQUEST_STATUSES)[number]>(initialStatusFilter);
  const [clubFilter, setClubFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [clubFilter, statusFilter]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const { data: clubs = [] } = useQuery({
    queryKey: ["membership-review-clubs"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });
  const {
    data: requestsPage = emptyPaginatedResponse<MembershipRequestRecord>(),
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["membership-requests", role, statusFilter, clubFilter, page],
    queryFn: () =>
      getMembershipRequests({
        status: statusFilter === "all" ? undefined : statusFilter,
        club_id: role === "admin" && clubFilter !== "all" ? clubFilter : undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE
      }),
    enabled: role === "admin",
    retry: false
  });
  const visibleRequests = requestsPage.items.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesClub = clubFilter === "all" || request.club_id === clubFilter;

    return matchesStatus && matchesClub;
  });

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Membership"
        title="Membership Review"
        description="Students submit paid join requests first. Use the dues table to confirm the payment and activate the membership."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Join Requests</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-auto">
              {role === "admin" ? (
                <div className="space-y-2 sm:w-72">
                  <Label htmlFor="membership_club_filter">Club</Label>
                  <Select value={clubFilter} onValueChange={setClubFilter}>
                    <SelectTrigger id="membership_club_filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All clubs</SelectItem>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}{club.code ? ` (${club.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2 sm:w-72">
                <Label htmlFor="membership_status_filter">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as (typeof REQUEST_STATUSES)[number])}>
                  <SelectTrigger id="membership_status_filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All requests</SelectItem>
                    <SelectItem value="pending">Pending review</SelectItem>
                    <SelectItem value="active">Active members</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NeoLoadingState title="Loading membership requests" message="We are preparing the payment-backed join queue." compact />
          ) : isError ? (
            <div className="nh-empty border-destructive bg-destructive/5">
              <p className="font-medium">Unable to load membership requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="nh-empty">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No join requests match this view</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New student signups and club joins will appear here after they attach payment details.
              </p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {visibleRequests.map((request) => (
                  <div key={request.id} className="nh-list-card">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{request.profile?.full_name || "Student"}</p>
                          <ReviewRequestStatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.club?.name || "Selected club"} - {getStudentTypeLabel(request.student_type)} - {formatCurrency(request.dues_amount)}
                        </p>
                        {request.due_payment?.payment_account_name ? (
                          <p className="text-sm text-muted-foreground">
                            Paid by: {request.due_payment.payment_account_name}
                          </p>
                        ) : null}
                        {request.join_reason ? (
                          <p className="text-sm text-muted-foreground">{request.join_reason}</p>
                        ) : null}
                        {request.decision_remarks ? (
                          <p className="text-sm text-muted-foreground">Last note: {request.decision_remarks}</p>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                        <p className="font-semibold text-primary">Next step</p>
                        <p className="mt-1 text-muted-foreground">
                          Open the Dues &amp; Payment Review page to confirm or reject the payment record for this request.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DataPagination
                page={requestsPage.page}
                pageSize={requestsPage.page_size}
                total={requestsPage.total}
                hasNext={requestsPage.has_next}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Membership() {
  const { role } = useRole();

  if (role === "student" || role === "executive") {
    return <StudentMembershipView />;
  }

  if (role === "admin") {
    return <ReviewerMembershipView />;
  }

  return (
    <div className="nh-page">
      <NeoStateCard
        icon={Users}
        title="Membership tools are not available here"
        message="This role does not use the membership workflow."
      />
    </div>
  );
}
