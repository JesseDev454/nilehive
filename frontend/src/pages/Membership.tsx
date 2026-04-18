import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Loader2, Search, ShieldCheck, UserPlus, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";
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
  decideMembershipRequest,
  getClubPaymentSettings,
  getMembershipRequests,
  getMyDuePayments,
  getMyMembershipRequests,
  getPublicClubs,
  submitDuePaymentConfirmation,
  type ClubMemberRecord,
  type ClubRecord,
  type DuePaymentRecord,
  type MembershipRequestRecord
} from "@/lib/api";
import { resolveStorageFileUrl, uploadStorageFile } from "@/lib/storage";

const REQUEST_STATUSES = [
  "all",
  "pending",
  "approved_pending_dues",
  "active",
  "rejected",
  "cancelled"
] as const;

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

function getStatusLabel(status: MembershipRequestRecord["status"]) {
  return {
    pending: "Pending Review",
    approved_pending_dues: "Approved, Dues Required",
    active: "Active Member",
    rejected: "Rejected",
    cancelled: "Cancelled"
  }[status];
}

function MembershipStatusBadge({ status }: { status: MembershipRequestRecord["status"] }) {
  const className = {
    pending: "bg-warning/15 text-warning hover:bg-warning/15",
    approved_pending_dues: "bg-primary/15 text-primary hover:bg-primary/15",
    active: "bg-success/15 text-success hover:bg-success/15",
    rejected: "bg-destructive/15 text-destructive hover:bg-destructive/15",
    cancelled: "bg-muted text-muted-foreground hover:bg-muted"
  }[status];

  return <Badge className={className}>{getStatusLabel(status)}</Badge>;
}

function getClubName(clubId: string, clubs: ClubRecord[], request?: MembershipRequestRecord) {
  return request?.club?.name || clubs.find((club) => club.id === clubId)?.name || "Selected club";
}

function DuesConfirmationCard({
  request,
  payment
}: {
  request: MembershipRequestRecord;
  payment?: DuePaymentRecord;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState("");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [paymentProofLink, setPaymentProofLink] = useState<string | null>(null);
  const [note, setNote] = useState("");
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
      toast.success("Payment confirmation submitted", {
        description: "Your president or Club Services admin can now review it."
      });
      setAccountName("");
      setReference("");
      setPaidAt("");
      setProofUrl("");
      setProofFileName("");
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-dues"] }),
        queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not submit payment confirmation", {
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
        description: "The upload is ready to submit with your payment confirmation."
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
    return (
      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Approved. Dues payment required.</p>
        <p className="mt-1 text-muted-foreground">Your dues record is still being prepared. Please check again shortly.</p>
      </div>
    );
  }

  if (payment?.status === "submitted") {
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

  if (payment?.status === "paid") {
    return (
      <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-4 text-sm">
        <p className="font-semibold text-success">Dues verified. You are now an active member.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
      <div>
        <p className="font-semibold text-primary">Approved. Dues payment required.</p>
        <p className="mt-1 text-muted-foreground">
          Pay {formatCurrency(request.dues_amount)} for {request.academic_session || "the current session"}, then submit your payment details below.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        {isLoadingSettings ? (
          <p className="text-muted-foreground">Loading payment details...</p>
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
            {settings.payment_instructions ? (
              <p className="sm:col-span-2 text-muted-foreground">{settings.payment_instructions}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Payment account details have not been configured yet. Please contact your club president.
          </p>
        )}
      </div>

      {payment?.status === "rejected" ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          <p className="font-medium text-destructive">Previous payment confirmation was rejected.</p>
          <p className="mt-1 text-muted-foreground">Check your reference and submit corrected details.</p>
        </div>
      ) : null}

      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
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
          <Label htmlFor="membership_proof_upload">Upload receipt (optional)</Label>
          <Input
            id="membership_proof_upload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleReceiptUpload}
            disabled={isUploadingProof}
          />
          {proofFileName ? <p className="text-xs text-muted-foreground">Uploaded: {proofFileName}</p> : null}
          {proofUrl ? <p className="text-xs text-muted-foreground break-all">Stored path: {proofUrl}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Proof URL or path</Label>
          <Input value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="Optional receipt link" />
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
                Submitting...
              </>
            ) : (
              "I Have Paid"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StudentMembershipView() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedRoleByClub, setSelectedRoleByClub] = useState<Record<string, ClubMemberRecord["club_role"]>>({});
  const [remarksByClub, setRemarksByClub] = useState<Record<string, string>>({});
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery({
    queryKey: ["public-clubs"],
    queryFn: () => getPublicClubs(),
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
  const { data: myDuesData } = useQuery({
    queryKey: ["my-dues"],
    queryFn: () => getMyDuePayments(),
    retry: false
  });
  const paymentById = useMemo(
    () => new Map((myDuesData?.payments || []).map((payment) => [payment.id, payment])),
    [myDuesData?.payments]
  );
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
      [club.name, club.code].filter(Boolean).some((value) => value?.toLowerCase().includes(normalizedSearch))
    );
  }, [clubs, search]);
  const createRequestMutation = useMutation({
    mutationFn: (clubId: string) =>
      createMembershipRequest({
        club_id: clubId,
        requested_role: selectedRoleByClub[clubId] || "member",
        remarks: remarksByClub[clubId] || undefined
      }),
    onSuccess: async () => {
      toast.success("Membership request submitted", {
        description: "Your club leadership can now review your request."
      });
      await queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] });
    },
    onError: (mutationError) => {
      toast.error("Could not submit membership request", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="rounded-3xl bg-gradient-to-br from-[#000d27] via-[#003a70] to-[#0b6b3a] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-3 bg-white/15 text-white hover:bg-white/15">Student Membership</Badge>
            <h1 className="text-3xl font-bold">Discover clubs and track your membership</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Request to join a Nile University club. You become an official member only after your request is approved and dues are verified.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Signed in as</p>
            <p className="font-semibold">{profile?.full_name || "Student"}</p>
            <p className="text-sm text-white/70">{profile?.student_id || "University ID not set"}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            My Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <p className="text-sm text-muted-foreground">Loading your membership requests...</p>
          ) : requestsFailed ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load your membership requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(requestsError)}</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <UserPlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No membership request yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Choose a club below and submit your first request.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {myRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{getClubName(request.club_id, clubs, request)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Requested role: {request.requested_role}
                      </p>
                    </div>
                    <MembershipStatusBadge status={request.status} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</p>
                      <p className="font-medium">{formatDate(request.created_at)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Dues</p>
                      <p className="font-medium">{request.dues_amount ? formatCurrency(request.dues_amount) : "Not set yet"}</p>
                    </div>
                  </div>
                  {request.status === "approved_pending_dues" ? (
                    <DuesConfirmationCard request={request} payment={paymentById.get(request.due_payment_id || "")} />
                  ) : null}
                  {request.decision_remarks ? (
                    <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                      {request.decision_remarks}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Discover Clubs</h2>
          <p className="text-sm text-muted-foreground">Browse clubs and request to join the ones you care about.</p>
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

      {isLoadingClubs ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading clubs...</CardContent>
        </Card>
      ) : clubsFailed ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-medium">Unable to load clubs</p>
            <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(clubsError)}</p>
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
            const isRequesting = createRequestMutation.isPending && createRequestMutation.variables === club.id;

            return (
              <Card key={club.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-success/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{club.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{club.code || "Nile University club"}</p>
                    </div>
                    {existingRequest ? <MembershipStatusBadge status={existingRequest.status} /> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <p className="text-sm text-muted-foreground">
                    Join this club to receive updates, participate in approved events, and become part of its official member record.
                  </p>
                  {!existingRequest ? (
                    <form
                      className="space-y-3"
                      onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        createRequestMutation.mutate(club.id);
                      }}
                    >
                      <div className="space-y-2">
                        <Label>Requested role</Label>
                        <Select
                          value={selectedRoleByClub[club.id] || "member"}
                          onValueChange={(value) =>
                            setSelectedRoleByClub((current) => ({
                              ...current,
                              [club.id]: value as ClubMemberRecord["club_role"]
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="president">President</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Reason or note</Label>
                        <Textarea
                          value={remarksByClub[club.id] || ""}
                          onChange={(event) =>
                            setRemarksByClub((current) => ({
                              ...current,
                              [club.id]: event.target.value
                            }))
                          }
                          placeholder="Why do you want to join?"
                          rows={3}
                        />
                      </div>
                      <Button className="w-full" type="submit" disabled={isRequesting}>
                        {isRequesting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Request to Join"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                      You already have a {getStatusLabel(existingRequest.status).toLowerCase()} request for this club.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestReviewPanel({
  request,
  onClose
}: {
  request: MembershipRequestRecord;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [duesAmount, setDuesAmount] = useState("");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [remarks, setRemarks] = useState("");
  const decisionMutation = useMutation({
    mutationFn: () =>
      decideMembershipRequest(request.id, {
        decision,
        dues_amount: decision === "approve" ? Number(duesAmount) : undefined,
        academic_session: decision === "approve" ? academicSession : undefined,
        remarks: remarks || undefined
      }),
    onSuccess: async (result) => {
      toast.success(decision === "approve" ? "Request approved" : "Request rejected", {
        description:
          decision === "approve"
            ? "An inactive member and unpaid dues record were created."
            : "The student has been notified through the request status."
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["dues"] })
      ]);

      if (result.request.status !== "pending") {
        onClose();
      }
    },
    onError: (mutationError) => {
      toast.error("Could not review membership request", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">Review Membership Request</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Approving creates an inactive member and unpaid dues record. Membership activates only after dues are marked paid.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            decisionMutation.mutate();
          }}
        >
          <div className="rounded-2xl bg-muted/60 p-4 lg:col-span-2">
            <p className="font-semibold">{request.profile?.full_name || "Student"}</p>
            <p className="text-sm text-muted-foreground">
              {request.profile?.student_id || "No University ID"} - {request.club?.name || request.club_id}
            </p>
            <p className="mt-2 text-sm">
              Requested role: <span className="font-medium capitalize">{request.requested_role}</span>
            </p>
            {request.remarks ? <p className="mt-2 text-sm text-muted-foreground">{request.remarks}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Decision</Label>
            <Select value={decision} onValueChange={(value) => setDecision(value as "approve" | "reject")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {decision === "approve" ? (
            <>
              <div className="space-y-2">
                <Label>Dues amount</Label>
                <Input
                  type="number"
                  min="1"
                  value={duesAmount}
                  onChange={(event) => setDuesAmount(event.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Academic session</Label>
                <Input
                  value={academicSession}
                  onChange={(event) => setAcademicSession(event.target.value)}
                  placeholder="2025/2026"
                  required
                />
              </div>
            </>
          ) : null}
          <div className="space-y-2 lg:col-span-2">
            <Label>Decision remarks</Label>
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add a clear note for the student..."
              rows={3}
            />
          </div>
          <div className="flex justify-end lg:col-span-2">
            <Button type="submit" disabled={decisionMutation.isPending}>
              {decisionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : decision === "approve" ? (
                "Approve and Create Dues"
              ) : (
                "Reject Request"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviewerMembershipView() {
  const { role } = useRole();
  const [statusFilter, setStatusFilter] = useState<(typeof REQUEST_STATUSES)[number]>("pending");
  const [requestTypeFilter, setRequestTypeFilter] = useState<"all" | "member" | "leadership" | "executive" | "president">("all");
  const [clubFilter, setClubFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<MembershipRequestRecord | null>(null);
  const canReview = role === "president" || role === "admin";
  const { data: clubs = [] } = useQuery({
    queryKey: ["membership-request-clubs"],
    queryFn: () => getPublicClubs(),
    enabled: role === "admin",
    retry: false
  });
  const {
    data: requests = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["membership-requests", statusFilter, clubFilter, role],
    queryFn: () =>
      getMembershipRequests({
        status: statusFilter === "all" ? undefined : statusFilter,
        club_id: role === "admin" && clubFilter !== "all" ? clubFilter : undefined
      }),
    enabled: canReview,
    retry: false
  });
  const summary = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "pending").length,
      dues: requests.filter((request) => request.status === "approved_pending_dues").length,
      active: requests.filter((request) => request.status === "active").length,
      rejected: requests.filter((request) => request.status === "rejected").length
    }),
    [requests]
  );
  const filteredRequests = useMemo(() => {
    if (requestTypeFilter === "all") {
      return requests;
    }

    if (requestTypeFilter === "leadership") {
      return requests.filter((request) => request.requested_role === "executive" || request.requested_role === "president");
    }

    return requests.filter((request) => request.requested_role === requestTypeFilter);
  }, [requestTypeFilter, requests]);

  if (!canReview) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Membership review is for presidents and admins.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <Badge className="mb-3 bg-primary/15 text-primary hover:bg-primary/15">
          {role === "admin" ? "Institutional Oversight" : "Club Leadership"}
        </Badge>
        <h1 className="text-3xl font-bold">Membership Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review student requests, approve dues requirements, and activate official club membership after payment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Awaiting Dues</p>
            <p className="mt-1 text-2xl font-bold text-primary">{summary.dues}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-success">{summary.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{summary.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {selectedRequest ? <RequestReviewPanel request={selectedRequest} onClose={() => setSelectedRequest(null)} /> : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg">Request Queue</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row">
              {role === "admin" ? (
                <Select value={clubFilter} onValueChange={setClubFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filter by club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clubs</SelectItem>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Select value={requestTypeFilter} onValueChange={(value) => setRequestTypeFilter(value as typeof requestTypeFilter)}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All request types</SelectItem>
                  <SelectItem value="member">Ordinary members</SelectItem>
                  <SelectItem value="leadership">Leadership requests</SelectItem>
                  <SelectItem value="executive">Executive requests</SelectItem>
                  <SelectItem value="president">President requests</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved_pending_dues">Approved, Dues Required</SelectItem>
                  <SelectItem value="active">Active Member</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading membership requests...</p>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load membership requests</p>
              <p className="mt-1 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <Crown className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No requests match this view</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another status filter or wait for students to apply.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const isLeadershipRole = request.requested_role === "executive" || request.requested_role === "president";
                const presidentCannotApprove = role === "president" && isLeadershipRole;

                return (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-2xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{request.profile?.full_name || "Student"}</p>
                        <MembershipStatusBadge status={request.status} />
                        {isLeadershipRole ? (
                          <Badge className="bg-secondary/15 text-secondary hover:bg-secondary/15">
                            Leadership request
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.profile?.student_id || "No University ID"} - {request.club?.name || request.club_id}
                      </p>
                      <p className="text-sm">
                        Wants to join as <span className="font-medium capitalize">{request.requested_role}</span>
                      </p>
                      {request.remarks ? <p className="text-sm text-muted-foreground">{request.remarks}</p> : null}
                      {request.dues_amount ? (
                        <p className="text-sm text-muted-foreground">
                          Dues: {formatCurrency(request.dues_amount)} for {request.academic_session}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:items-center">
                      <p className="text-xs text-muted-foreground">{formatDate(request.created_at)}</p>
                      {request.status === "pending" ? (
                        <Button
                          type="button"
                          disabled={presidentCannotApprove}
                          onClick={() => setSelectedRequest(request)}
                        >
                          Review
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={() => setSelectedRequest(request)}>
                          View
                        </Button>
                      )}
                    </div>
                    {presidentCannotApprove ? (
                      <p className="text-xs text-muted-foreground lg:max-w-[220px]">
                        Executive and president role requests require admin approval.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <WalletCards className="h-9 w-9 rounded-xl bg-primary/10 p-2 text-primary" />
            <div>
              <p className="font-semibold">Dues activation happens on the Dues page</p>
              <p className="text-sm text-muted-foreground">
                After approval, mark the created dues record as paid to activate official membership.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href="/dues">Open Dues</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Membership() {
  const { role } = useRole();

  if (role === "student") {
    return <StudentMembershipView />;
  }

  return <ReviewerMembershipView />;
}
