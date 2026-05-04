import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, ShieldCheck, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
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
import {
  ApiClientError,
  createMembershipRequest,
  getClubs,
  getClubPaymentSettings,
  getMembershipRequests,
  getMyDuePayments,
  getMyMembershipRequests,
  submitDuePaymentConfirmation,
  type ClubRecord,
  type DuePaymentRecord,
  type MembershipRequestRecord
} from "@/lib/api";
import { clearJoinFormDraft, readJoinFormDraft, writeJoinFormDraft } from "@/lib/joinFormDraftStorage";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";
import { isValidStudentId, normalizeStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";
import { resolveStorageFileUrl, uploadStorageFile } from "@/lib/storage";

const REQUEST_STATUSES = ["all", "pending", "active", "rejected", "cancelled"] as const;
const STUDENT_TYPES = [
  { value: "fresher", label: "Fresher" },
  { value: "returning", label: "Returning Student" }
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

function resolveJoinAmount(
  studentType: "fresher" | "returning",
  settings?: { fresher_dues_amount: number; returning_student_dues_amount: number } | null
) {
  if (studentType === "fresher") {
    return settings?.fresher_dues_amount ?? 10000;
  }

  return settings?.returning_student_dues_amount ?? 5000;
}

function DuesConfirmationCard({
  request,
  payment
}: {
  request: MembershipRequestRecord;
  payment?: DuePaymentRecord;
}) {
  const resolvedStatus = resolveMembershipStatus(request, payment);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState(payment?.payment_account_name || "");
  const [reference, setReference] = useState(payment?.payment_reference || "");
  const [paidAt, setPaidAt] = useState(payment?.payment_paid_at?.slice(0, 10) || "");
  const [proofUrl, setProofUrl] = useState(payment?.proof_url || "");
  const [proofFileName, setProofFileName] = useState("");
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [paymentProofLink, setPaymentProofLink] = useState<string | null>(null);
  const [note, setNote] = useState(payment?.payer_note || "");
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["club-payment-settings", request.club_id],
    queryFn: () => getClubPaymentSettings(request.club_id),
    retry: false
  });
  const submitMutation = useMutation({
    mutationFn: () =>
      submitDuePaymentConfirmation(request.due_payment_id || "", {
        payment_account_name: accountName,
        payment_reference: reference,
        payment_paid_at: paidAt || null,
        proof_url: proofUrl || null,
        payer_note: note || null
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
          description: "Please sign in again and retry uploading your receipt."
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
      toast.error("Could not upload receipt", {
        description: getErrorMessage(uploadError)
      });
    } finally {
      setIsUploadingProof(false);
      event.target.value = "";
    }
  }

  if (!request.due_payment_id) {
    return null;
  }

  if (resolvedStatus === "payment_under_review") {
    return (
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Payment submitted for review</p>
        <p className="mt-1 text-muted-foreground">
          Reference: {payment.payment_reference || "-"} {payment.payment_account_name ? `- Paid by ${payment.payment_account_name}` : ""}
        </p>
        {paymentProofLink ? (
          <a className="mt-2 inline-block text-primary underline" href={paymentProofLink} target="_blank" rel="noreferrer">
            View submitted receipt
          </a>
        ) : null}
      </div>
    );
  }

  if (resolvedStatus === "active") {
    return (
      <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-4 text-sm">
        <p className="font-semibold text-success">Dues verified. You are now an active member.</p>
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
          Check the discover clubs page if you would like to try another club.
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
      </div>

      <div className="nh-card-soft p-4">
        {isLoadingSettings ? (
          <NeoLoadingState title="Loading payment details" message="We are checking the Club Services bank instructions." compact />
        ) : settings ? (
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
              description: "Please upload your receipt before resending payment details."
            });
            return;
          }
          submitMutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label>Name on account used</Label>
          <Input value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Payment reference / transaction ID</Label>
          <Input value={reference} onChange={(event) => setReference(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Payment date</Label>
          <Input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`membership_proof_upload_${request.id}`}>Upload receipt</Label>
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
              <p className="text-xs text-muted-foreground break-all">Stored path: {proofUrl}</p>
              <Button type="button" variant="outline" size="sm" onClick={clearReceiptSelection}>
                Remove receipt
              </Button>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Note</Label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for verification" />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={submitMutation.isPending || isUploadingProof}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Payment Details"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function JoinClubPanel({
  club,
  existingRequest,
  defaultStudentType,
  defaultStudentId,
  defaultPhoneNumber,
  defaultDepartment
}: {
  club: ClubRecord;
  existingRequest?: MembershipRequestRecord;
  defaultStudentType?: "fresher" | "returning" | null;
  defaultStudentId?: string | null;
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
  const [studentId, setStudentId] = useState(savedDraft?.studentId ?? defaultStudentId ?? "");
  const [phoneNumber, setPhoneNumber] = useState(savedDraft?.phoneNumber ?? defaultPhoneNumber ?? "");
  const [department, setDepartment] = useState(savedDraft?.department ?? defaultDepartment ?? "");
  const [joinReason, setJoinReason] = useState(savedDraft?.joinReason ?? "");
  const [accountName, setAccountName] = useState(savedDraft?.accountName ?? "");
  const [reference, setReference] = useState(savedDraft?.reference ?? "");
  const [paidAt, setPaidAt] = useState(savedDraft?.paidAt ?? "");
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const [note, setNote] = useState(savedDraft?.note ?? "");
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Apply profile defaults only once when they first arrive (e.g. on slow load)
  // but don't overwrite what the user has already typed or what came from the draft.
  const profileDefaultsApplied = useRef(false);
  useEffect(() => {
    if (profileDefaultsApplied.current || savedDraft) {
      return;
    }

    if (defaultStudentType) setStudentType(defaultStudentType);
    if (defaultStudentId) setStudentId(defaultStudentId);
    if (defaultPhoneNumber) setPhoneNumber(defaultPhoneNumber);
    if (defaultDepartment) setDepartment(defaultDepartment);
    profileDefaultsApplied.current = true;
  }, [defaultStudentType, defaultStudentId, defaultPhoneNumber, defaultDepartment, savedDraft]);

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
      reference,
      paidAt,
      note
    });
  }, [userId, club.id, studentType, studentId, phoneNumber, department, joinReason, accountName, reference, paidAt, note]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);
  // ── End draft persistence ────────────────────────────────────────────────

  const { data: settings } = useQuery({
    queryKey: ["club-payment-settings", club.id],
    queryFn: () => getClubPaymentSettings(club.id),
    retry: false
  });

  const joinAmount = resolveJoinAmount(studentType, settings);
  const normalizedStudentId = normalizeStudentId(studentId);
  const normalizedDefaultStudentId = normalizeStudentId(defaultStudentId ?? "");
  const hasSavedValidStudentId = isValidStudentId(normalizedDefaultStudentId);

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
        payment_reference: reference,
        payment_paid_at: paidAt || null,
        proof_url: proofUrl || null,
        payer_note: note || null
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
      setReference("");
      setPaidAt("");
      setProofUrl("");
      setProofFileName("");
      setNote("");
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
          description: "Please sign in again and retry uploading your receipt."
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
      toast.error("Could not upload receipt", {
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
            <p className="mt-1 text-lg font-bold">{formatCurrency(joinAmount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay first, then send the transaction details with your join request.
            </p>
          </div>
        </div>

        {settings ? (
          <div className="nh-card-soft space-y-2 p-4 text-sm">
            <p className="font-semibold">Club Services Account</p>
            <p><span className="text-muted-foreground">Bank:</span> {settings.bank_name}</p>
            <p><span className="text-muted-foreground">Account:</span> {settings.account_number}</p>
            <p><span className="text-muted-foreground">Name:</span> {settings.account_name}</p>
            {settings.payment_instructions ? (
              <p className="text-muted-foreground">{settings.payment_instructions}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            Shared payment account details have not been published yet. Please contact Club Services before paying.
          </div>
        )}

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
              if (!normalizedStudentId && !hasSavedValidStudentId) {
                toast.error("University ID required", {
                  description: "Please enter your 9-digit University ID before sending this join request."
                });
                return;
              }
              if (!proofUrl) {
                toast.error("Receipt required", {
                  description: "Please upload your receipt before sending this join request."
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
                required={!hasSavedValidStudentId}
              />
              {hasSavedValidStudentId ? (
                <p className="text-xs text-muted-foreground">
                  Your saved University ID can be reused here, but you can still update it if needed.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`join-phone-${club.id}`}>Phone Number (WhatsApp)</Label>
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
            <div className="space-y-2">
              <Label>Name on account used</Label>
              <Input value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Payment reference / transaction ID</Label>
              <Input value={reference} onChange={(event) => setReference(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Payment date</Label>
              <Input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`join-proof-${club.id}`}>Upload proof</Label>
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
                  <p className="text-xs text-muted-foreground break-all">Stored path: {proofUrl}</p>
                  <Button type="button" variant="outline" size="sm" onClick={clearReceiptSelection}>
                    Remove receipt
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
            </div>
            <Button className="w-full" type="submit" disabled={createRequestMutation.isPending || isUploadingProof}>
              {createRequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending request...
                </>
              ) : (
                "Submit Paid Join Request"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current request: {getStatusLabel(resolveMembershipStatus(existingRequest, existingRequest.due_payment || undefined))}.
            </p>
            <DuesConfirmationCard request={existingRequest} payment={existingRequest.due_payment || undefined} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscoverClubCard({
  club,
  existingRequest
}: {
  club: ClubRecord;
  existingRequest?: MembershipRequestRecord;
}) {
  const description = getClubDescription(club);
  const buttonLabel = existingRequest ? "Open request" : "Open join form";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b-2 border-foreground bg-primary/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg">{club.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{club.code || "Nile University club"}</p>
          </div>
          {existingRequest ? <MembershipStatusBadge request={existingRequest} payment={existingRequest.due_payment || undefined} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {getClubDescriptionPreview(description)}
        </p>
        <Button asChild className="w-full sm:w-auto">
          <Link to={`/membership/clubs/${club.id}`}>{buttonLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StudentClubJoinPage({
  clubs,
  myRequests,
  isLoadingClubs,
  isLoadingRequests,
  clubsFailed,
  clubsError,
  requestsFailed,
  requestsError,
  defaultStudentType,
  defaultStudentId,
  defaultPhoneNumber,
  defaultDepartment
}: {
  clubs: ClubRecord[];
  myRequests: MembershipRequestRecord[];
  isLoadingClubs: boolean;
  isLoadingRequests: boolean;
  clubsFailed: boolean;
  clubsError: unknown;
  requestsFailed: boolean;
  requestsError: unknown;
  defaultStudentType?: "fresher" | "returning" | null;
  defaultStudentId?: string | null;
  defaultPhoneNumber?: string | null;
  defaultDepartment?: string | null;
}) {
  const { clubId } = useParams();
  const club = clubs.find((item) => item.id === clubId);
  const existingRequest = myRequests.find((request) => request.club_id === clubId);

  return (
    <div className="nh-page">
      <div className="flex items-center">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/membership">
            <ArrowLeft className="h-4 w-4" />
            Back to clubs
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
          <JoinClubPanel
            club={club}
            existingRequest={existingRequest}
            defaultStudentType={defaultStudentType}
            defaultStudentId={defaultStudentId}
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
  const [search, setSearch] = useState("");
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery(publicClubsQueryOptions);
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
  const { data: myDuesData } = useQuery({
    queryKey: ["my-dues"],
    queryFn: () => getMyDuePayments(),
    retry: false
  });

  const requestByClubId = useMemo(
    () => new Map(myRequests.map((request) => [request.club_id, request])),
    [myRequests]
  );
  const filteredClubs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return clubs;
    }

    return clubs.filter((club) =>
      [club.name, club.code, getClubDescription(club)].filter(Boolean).some((value) => value?.toLowerCase().includes(normalizedSearch))
    );
  }, [clubs, search]);

  if (clubId) {
    return (
      <StudentClubJoinPage
        clubs={clubs}
        myRequests={myRequests}
        isLoadingClubs={isLoadingClubs}
        isLoadingRequests={isLoadingRequests}
        clubsFailed={clubsFailed}
        clubsError={clubsError}
        requestsFailed={requestsFailed}
        requestsError={requestsError}
        defaultStudentType={profile?.student_type || undefined}
        defaultStudentId={profile?.student_id ?? null}
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
        description="Explore each club first, then open its join form when you are ready to submit your payment details."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Clubs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tap any club to read more and continue to its dedicated join form.
              </p>
            </div>
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clubs..."
                className="pl-9"
              />
            </div>
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
      ) : filteredClubs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No clubs found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another search term.</p>
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
              />
            );
          })}
        </div>
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

      {myDuesData?.payments.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Dues Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myDuesData.payments.map((payment) => (
              <div key={payment.id} className="nh-list-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Session {payment.academic_session} - Paid on {formatDate(payment.payment_paid_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.payment_reference || "No reference submitted yet"}
                    </p>
                  </div>
                  <Badge className="capitalize">{payment.status}</Badge>
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
  const [statusFilter, setStatusFilter] = useState<(typeof REQUEST_STATUSES)[number]>("all");
  const [clubFilter, setClubFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [clubFilter, statusFilter]);

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
    enabled: role === "president" || role === "admin",
    retry: false
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
          ) : requestsPage.items.length === 0 ? (
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
                {requestsPage.items.map((request) => (
                  <div key={request.id} className="nh-list-card">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{request.profile?.full_name || "Student"}</p>
                          <MembershipStatusBadge request={request} payment={request.due_payment || undefined} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.club?.name || "Selected club"} - {getStudentTypeLabel(request.student_type)} - {formatCurrency(request.dues_amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Payment reference: {request.due_payment?.payment_reference || "Not submitted yet"}
                        </p>
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

  if (role === "president" || role === "admin") {
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
