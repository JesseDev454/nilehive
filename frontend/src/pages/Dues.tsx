import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Landmark, Loader2, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  createDuePayment,
  getClubMembers,
  getClubs,
  getClubPaymentSettings,
  getDuePayments,
  saveClubPaymentSettings,
  updateDuePayment,
  type DuePaymentRecord
} from "@/lib/api";
import { resolveStorageFileUrl, uploadStorageFile } from "@/lib/storage";
import { actionError, actionSuccess } from "@/lib/notify";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load dues right now.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function DueStatusBadge({ status }: { status: DuePaymentRecord["status"] }) {
  const className = {
    unpaid: "bg-muted text-muted-foreground hover:bg-muted",
    submitted: "bg-primary/15 text-primary hover:bg-primary/15",
    paid: "bg-success/15 text-success hover:bg-success/15",
    rejected: "bg-destructive/15 text-destructive hover:bg-destructive/15"
  }[status];

  return <Badge className={`${className} capitalize`}>{status}</Badge>;
}

export default function Dues() {
  const { user, profile } = useAuth();
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [amount, setAmount] = useState("");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadedProofName, setUploadedProofName] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofLinksByPaymentId, setProofLinksByPaymentId] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<DuePaymentRecord["status"]>("unpaid");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const canViewDues = role === "president" || role === "admin";
  const canManageDues = role === "president" || role === "admin";

  const {
    data: duesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["dues", role],
    queryFn: () => getDuePayments(),
    enabled: canViewDues,
    retry: false
  });
  const { data: members = [] } = useQuery({
    queryKey: ["club-members", role],
    queryFn: () => getClubMembers(),
    enabled: canViewDues,
    retry: false
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ["dues-form-clubs"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
    retry: false
  });
  const { data: paymentSettings } = useQuery({
    queryKey: ["club-payment-settings", role, selectedClubId],
    queryFn: () => getClubPaymentSettings(role === "admin" ? selectedClubId : undefined),
    enabled: canManageDues && (role !== "admin" || Boolean(selectedClubId)),
    retry: false
  });

  useEffect(() => {
    if (!paymentSettings) {
      return;
    }

    setBankName(paymentSettings.bank_name);
    setAccountNumber(paymentSettings.account_number);
    setAccountName(paymentSettings.account_name);
    setPaymentInstructions(paymentSettings.payment_instructions || "");
  }, [paymentSettings]);

  useEffect(() => {
    const payments = duesData?.payments || [];

    if (!payments.length) {
      setProofLinksByPaymentId({});
      return;
    }

    let cancelled = false;

    async function hydrateProofLinks() {
      const nextEntries = await Promise.all(
        payments.map(async (payment) => {
          const resolvedUrl = await resolveStorageFileUrl("dues-receipts", payment.proof_url);
          return [payment.id, resolvedUrl] as const;
        })
      );

      if (cancelled) {
        return;
      }

      setProofLinksByPaymentId(
        nextEntries.reduce<Record<string, string>>((acc, [paymentId, url]) => {
          if (url) {
            acc[paymentId] = url;
          }
          return acc;
        }, {})
      );
    }

    hydrateProofLinks();

    return () => {
      cancelled = true;
    };
  }, [duesData?.payments]);
  const memberNameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.full_name])),
    [members]
  );
  const selectedMember = useMemo(() => members.find((member) => member.id === memberId) || null, [members, memberId]);
  const createMutation = useMutation({
    mutationFn: () =>
      createDuePayment({
        club_id: role === "admin" ? selectedClubId : undefined,
        member_id: memberId,
        amount: Number(amount),
        academic_session: academicSession,
        payment_reference: paymentReference || null,
        proof_url: proofUrl || null,
        status
      }),
    onSuccess: async () => {
      actionSuccess("Dues record saved", "The payment record is now visible in the dues list.");
      setMemberId("");
      setSelectedClubId("");
      setAmount("");
      setPaymentReference("");
      setProofUrl("");
      setUploadedProofName("");
      setStatus("unpaid");
      await queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
    onError: (mutationError) => {
      actionError("Could not save dues record", mutationError, getErrorMessage(mutationError));
    }
  });
  const saveSettingsMutation = useMutation({
    mutationFn: () =>
      saveClubPaymentSettings({
        club_id: role === "admin" ? selectedClubId : undefined,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        payment_instructions: paymentInstructions || null
      }),
    onSuccess: async () => {
      actionSuccess("Payment details saved", "Students can now see where to pay their dues.");
      await queryClient.invalidateQueries({ queryKey: ["club-payment-settings"] });
    },
    onError: (mutationError) => {
      actionError("Could not save payment details", mutationError, getErrorMessage(mutationError));
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ payment, nextStatus }: { payment: DuePaymentRecord; nextStatus: DuePaymentRecord["status"] }) =>
      updateDuePayment(payment.id, {
        status: nextStatus
      }),
    onSuccess: async () => {
      actionSuccess("Dues status updated", "The member payment status has been saved.");
      await queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
    onError: (mutationError) => {
      actionError("Could not update dues status", mutationError, getErrorMessage(mutationError));
    }
  });

  function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  async function handleProofUpload(event: ChangeEvent<HTMLInputElement>) {
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

      const clubPathSegment =
        role === "admin"
          ? selectedClubId || selectedMember?.club_id || ""
          : profile?.club_id || selectedMember?.club_id || "";

      const memberPathSegment = selectedMember?.profile_id || selectedMember?.id || user?.id || "";

      if (!clubPathSegment || !memberPathSegment) {
        toast.error("Select member details first", {
          description: "Choose a member (and club for admins) before uploading receipt proof."
        });
        return;
      }

      const upload = await uploadStorageFile(file, "dues-receipts", {
        folder: `${clubPathSegment}/${memberPathSegment}`
      });

      setProofUrl(upload.path);
      setUploadedProofName(file.name);
      toast.success("Receipt uploaded", {
        description: "The file will be attached to this dues record."
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

  function handleSavePaymentSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSettingsMutation.mutate();
  }

  if (!canViewDues) {
    return (
      <div className="nh-page">
        <NeoPageHeader
          eyebrow="Finance"
          title="Dues & Payments"
          description="Dues tracking is available to club presidents and Club Services admins."
        />
        <NeoStateCard
          icon={CreditCard}
          title="Dues access is restricted"
          message="This role does not use dues tracking yet."
        />
      </div>
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Finance"
        title="Dues & Payment Tracking"
        description="Track dues, publish payment instructions, and verify submitted proof without leaving Club Services."
      />

      <div className="nh-metric-grid">
        <NeoMetricCard title="Expected" value={formatCurrency(duesData?.summary.expected_amount ?? 0)} icon={CreditCard} tone="navy" />
        <NeoMetricCard title="Collected" value={formatCurrency(duesData?.summary.collected_amount ?? 0)} icon={Receipt} tone="green" />
        <NeoMetricCard title="Paid" value={duesData?.summary.paid ?? 0} icon={Landmark} tone="gold" />
        <NeoMetricCard title="Collection Rate" value={`${duesData?.summary.collection_rate ?? 0}%`} icon={TrendingUp} />
      </div>

      {canManageDues ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Club Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePaymentSettings} className="nh-form-grid">
              {role === "admin" ? (
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="settings_club_id">Club</Label>
                  <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                    <SelectTrigger id="settings_club_id">
                      <SelectValue placeholder="Select club before saving payment details" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="Zenith Bank"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Nile University Club Account"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_instructions">Payment Instructions</Label>
                <Input
                  id="payment_instructions"
                  value={paymentInstructions}
                  onChange={(event) => setPaymentInstructions(event.target.value)}
                  placeholder="Use your student ID as narration/reference"
                />
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button type="submit" disabled={saveSettingsMutation.isPending || (role === "admin" && !selectedClubId)}>
                  {saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Payment Details"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canManageDues ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Dues Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePayment} className="nh-form-grid">
              {role === "admin" ? (
                <div className="space-y-2">
                  <Label htmlFor="club_id">Club</Label>
                  <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                    <SelectTrigger id="club_id">
                      <SelectValue placeholder="Select club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="member_id">Member</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger id="member_id">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} · {member.student_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_session">Academic Session</Label>
                <Input
                  id="academic_session"
                  value={academicSession}
                  onChange={(event) => setAcademicSession(event.target.value)}
                  placeholder="2025/2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_reference">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="Optional receipt/reference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof_upload">Upload proof (optional)</Label>
                <Input
                  id="proof_upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleProofUpload}
                  disabled={isUploadingProof}
                />
                {uploadedProofName ? (
                  <p className="text-xs text-muted-foreground">Uploaded: {uploadedProofName}</p>
                ) : null}
                {proofUrl ? (
                  <p className="text-xs text-muted-foreground break-all">Stored path: {proofUrl}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof_url">Proof URL or path (optional)</Label>
                <Input
                  id="proof_url"
                  value={proofUrl}
                  onChange={(event) => setProofUrl(event.target.value)}
                  placeholder="Paste an external URL or keep uploaded path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as DuePaymentRecord["status"])}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || isUploadingProof}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Dues Record"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dues Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading dues records...</p>
          ) : isError ? (
            <div className="nh-empty border-destructive bg-destructive/5">
              <p className="font-medium">Unable to load dues</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : !duesData?.payments.length ? (
            <div className="nh-empty">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No dues records yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a dues record above after adding club members.
              </p>
            </div>
          ) : (
            <div className="nh-table-wrap">
              <table className="nh-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Session</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {duesData.payments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-accent/50">
                      <td className="p-3">
                        <p className="font-medium">{memberNameById[payment.member_id] || "Unknown member"}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_reference || "No reference"}</p>
                        {payment.payment_account_name ? (
                          <p className="text-xs text-muted-foreground">Paid by {payment.payment_account_name}</p>
                        ) : null}
                        {proofLinksByPaymentId[payment.id] ? (
                          <a
                            className="text-xs text-primary underline"
                            href={proofLinksByPaymentId[payment.id]}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View proof
                          </a>
                        ) : null}
                      </td>
                      <td className="p-3 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{payment.academic_session}</td>
                      <td className="p-3">
                        {canManageDues ? (
                          <Select
                            value={payment.status}
                            disabled={updateMutation.isPending}
                            onValueChange={(value) =>
                              updateMutation.mutate({
                                payment,
                                nextStatus: value as DuePaymentRecord["status"]
                              })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <DueStatusBadge status={payment.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
