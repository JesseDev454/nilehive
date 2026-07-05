import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CreditCard, Receipt } from "lucide-react";
import { AccessDenied } from "@/components/AccessDenied";
import { DataPagination } from "@/components/DataPagination";
import {
  ClublyLoadingState,
  ClublyMetaChip,
  ClublyPageHeader,
  ClublyProgressHero,
  ClublySectionHeader,
  ClublyStateCard
} from "@/components/Clubly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  applyClubPaymentProfileToAll,
  getClubPaymentSettings,
  getClubs,
  getDuePayments,
  type DuePaymentRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";

const DUES_PAGE_SIZE = 10;
const DUE_STATUS_FILTERS = ["all", "unpaid", "submitted", "paid", "rejected"] as const;

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

function getPaymentStatusLabel(status: DuePaymentRecord["status"]) {
  return {
    unpaid: "Unpaid",
    submitted: "Submitted",
    paid: "Paid",
    rejected: "Rejected"
  }[status];
}

function getPaymentStatusClassName(status: DuePaymentRecord["status"]) {
  return {
    unpaid: "bg-muted text-muted-foreground hover:bg-muted",
    submitted: "bg-warning/15 text-warning hover:bg-warning/15",
    paid: "bg-success/15 text-success hover:bg-success/15",
    rejected: "bg-destructive/15 text-destructive hover:bg-destructive/15"
  }[status];
}

function getSubmittedName(payment: DuePaymentRecord) {
  return payment.member?.full_name || payment.payment_account_name || "Name not submitted";
}

export default function Dues() {
  const { role } = useRole();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const requestedStatus = searchParams.get("status");
  const initialStatusFilter = DUE_STATUS_FILTERS.includes(requestedStatus as (typeof DUE_STATUS_FILTERS)[number])
    ? (requestedStatus as (typeof DUE_STATUS_FILTERS)[number])
    : "all";
  const [studentFeeAmount, setStudentFeeAmount] = useState("10000");
  const [bankName, setBankName] = useState("Providus Bank");
  const [accountNumber, setAccountNumber] = useState("1305861314");
  const [accountName, setAccountName] = useState("Nile Arts & Creative Hub");
  const [paymentInstructions, setPaymentInstructions] = useState(
    "All students pay N10,000 per session. Submit a receipt or proof of payment for Clubly review."
  );
  const [duesPage, setDuesPage] = useState(1);
  const [selectedClubId, setSelectedClubId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<(typeof DUE_STATUS_FILTERS)[number]>(initialStatusFilter);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const canViewDues = role === "admin";
  const duesClubFilter = role === "admin" && selectedClubId !== "all" ? selectedClubId : undefined;
  const duesStatusFilter = statusFilter === "all" ? undefined : statusFilter;
  const returnTo = `${location.pathname}${location.search}`;
  const submittedProofsReturnTo = "/dues?status=submitted";

  const {
    data: duesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["dues", role, duesPage, duesClubFilter || "all", duesStatusFilter || "all"],
    queryFn: () =>
      getDuePayments({
        page: duesPage,
        page_size: DUES_PAGE_SIZE,
        club_id: duesClubFilter,
        status: duesStatusFilter
      }),
    enabled: canViewDues,
    retry: false
  });
  const { data: sharedPaymentSettings } = useQuery({
    queryKey: ["shared-club-payment-settings"],
    queryFn: () => getClubPaymentSettings(),
    enabled: canViewDues,
    retry: false
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ["dues-clubs"],
    queryFn: () => getClubs(),
    enabled: canViewDues,
    retry: false
  });

  useEffect(() => {
    setDuesPage(1);
  }, [duesClubFilter, duesStatusFilter]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (!sharedPaymentSettings) {
      return;
    }

    setStudentFeeAmount(
      String(sharedPaymentSettings.fresher_dues_amount ?? sharedPaymentSettings.returning_student_dues_amount ?? 10000)
    );
    setBankName(sharedPaymentSettings.bank_name);
    setAccountNumber(sharedPaymentSettings.account_number);
    setAccountName(sharedPaymentSettings.account_name);
    setPaymentInstructions(sharedPaymentSettings.payment_instructions || "");
  }, [sharedPaymentSettings]);

  useEffect(() => {
    if (duesPage > 1 && duesData && duesData.payments.total > 0 && duesData.payments.items.length === 0) {
      setDuesPage(duesPage - 1);
    }
  }, [duesData, duesPage]);

  const clubNameById = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs]
  );
  const visiblePayments = duesData?.payments.items || [];
  const pendingProofs = visiblePayments.filter((payment) => payment.status === "submitted");

  const saveSharedProfileMutation = useMutation({
    mutationFn: () =>
      applyClubPaymentProfileToAll({
        fresher_dues_amount: Number(studentFeeAmount),
        returning_student_dues_amount: Number(studentFeeAmount),
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        payment_instructions: paymentInstructions || null
      }),
    onSuccess: async (result) => {
      setIsApplyDialogOpen(false);
      actionSuccess(
        "Shared payment profile updated",
        `Applied the Clubly account and student fee amount to ${result.clubs_updated} clubs.`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["shared-club-payment-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["club-payment-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["dues-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["public-clubs"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not update the shared payment profile", mutationError, getErrorMessage(mutationError));
    }
  });

  function handleSaveSharedProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsApplyDialogOpen(true);
  }

  if (!canViewDues) {
    return (
      <div className="clb-screen">
        <ClublyPageHeader
          eyebrow="Finance"
          title="Dues & Payments"
          description="Dues tracking is available only to Clubly admins."
        />
        <AccessDenied
          icon={CreditCard}
          title="Dues access is restricted"
          reason="Dues tracking is available only to Clubly admins."
        />
      </div>
    );
  }

  const summary = duesData?.summary;
  const expectedAmount = summary?.expected_amount ?? 0;
  const collectedAmount = summary?.collected_amount ?? 0;
  const collectionRate = summary?.collection_rate ?? 0;
  const affectedClubLabel = clubs.length === 1 ? "1 club" : clubs.length > 1 ? `${clubs.length} clubs` : "all configured clubs";

  return (
    <div className="clb-screen">
      <ClublyPageHeader
        eyebrow="Finance"
        title="Dues & Payment Review"
        description="Open each submitted receipt, review the image, then verify or reject the payment."
      />

      <ClublyProgressHero
        eyebrow="Collection progress"
        title="Semester dues"
        value={`${formatCurrency(collectedAmount)} / ${formatCurrency(expectedAmount)}`}
        progress={collectionRate}
        detail="Submitted proofs are surfaced below so admins can clear the queue from the full-page proof viewer."
        stats={[
          { label: "collected", value: `${Math.round(collectionRate)}%` },
          { label: "to verify", value: pendingProofs.length },
          { label: "paid", value: summary?.paid ?? 0 },
          { label: "unpaid", value: summary?.unpaid ?? 0 }
        ]}
      />

      <Card>
        <CardHeader>
          <ClublySectionHeader
            title="Pending proofs"
            description="Open a student's uploaded receipt before changing their dues status."
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ClublyLoadingState title="Loading dues records" message="We are checking payment proofs." compact />
          ) : isError ? (
            <ClublyStateCard title="Unable to load dues" message={getErrorMessage(error)} tone="danger" />
          ) : pendingProofs.length === 0 ? (
            <ClublyStateCard icon={Receipt} title="No submitted proofs" message="Submitted dues proofs will appear here before they enter the full ledger." />
          ) : (
            <div className="space-y-3">
              {pendingProofs.map((payment) => (
                <div key={payment.id} className="clb-list-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{getSubmittedName(payment)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {payment.club?.name || clubNameById.get(payment.club_id) || "Unknown club"} - {formatCurrency(payment.amount)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ClublyMetaChip label="Session" value={payment.academic_session} />
                      {payment.member?.student_id ? <ClublyMetaChip label="Student ID" value={payment.member.student_id} /> : null}
                      <Badge className={getPaymentStatusClassName(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 md:shrink-0">
                    {payment.proof_url ? (
                      <Button asChild size="sm">
                        <Link to={`/dues/${payment.id}/proof`} state={{ returnTo: submittedProofsReturnTo }}>
                          View Proof
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="outline">No proof file</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ClublySectionHeader
            title="All members"
            description="A simpler dues ledger with only the columns needed for review."
          />
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="dues_club_filter">Club</Label>
              <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                <SelectTrigger id="dues_club_filter"><SelectValue placeholder="All clubs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clubs</SelectItem>
                  {clubs.map((club) => <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dues_status_filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as (typeof DUE_STATUS_FILTERS)[number])}>
                <SelectTrigger id="dues_status_filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="submitted">Submitted proofs</SelectItem>
                  <SelectItem value="rejected">Rejected proofs</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? (
            <ClublyLoadingState title="Loading dues records" message="We are checking payment status and receipts." compact />
          ) : isError ? (
            <ClublyStateCard title="Unable to load dues" message={getErrorMessage(error)} tone="danger" />
          ) : !visiblePayments.length ? (
            <ClublyStateCard icon={CreditCard} title="No dues records yet" message="New student joins and signups will create dues records automatically." />
          ) : (
            <div className="clb-table-wrap">
              <table className="clb-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Club</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Session</th>
                    <th>Status</th>
                    <th>Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePayments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-accent/50">
                      <td className="p-3">
                        <p className="font-medium">{getSubmittedName(payment)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.member?.student_id || payment.member?.phone_number || payment.payment_paid_at || "No student details"}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{payment.club?.name || clubNameById.get(payment.club_id) || "Unknown club"}</p>
                      </td>
                      <td className="p-3 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{payment.academic_session}</td>
                      <td className="p-3">
                        <Badge className={`${getPaymentStatusClassName(payment.status)} capitalize`}>
                          {getPaymentStatusLabel(payment.status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {payment.proof_url ? (
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/dues/${payment.id}/proof`} state={{ returnTo }}>
                              View Proof
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No proof</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DataPagination
                page={duesData?.payments.page ?? 1}
                pageSize={duesData?.payments.page_size ?? DUES_PAGE_SIZE}
                total={duesData?.payments.total ?? 0}
                hasNext={duesData?.payments.has_next ?? false}
                onPageChange={setDuesPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clubly Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Shared payment destination used by all clubs.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSharedProfile} className="clb-form-grid">
            <div className="space-y-2">
              <Label htmlFor="student_fee_amount">Student Fee</Label>
              <Input id="student_fee_amount" type="number" min="0" value={studentFeeAmount} readOnly required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input id="bank_name" value={bankName} onChange={(event) => setBankName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input id="account_number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input id="account_name" value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="payment_instructions">Payment Instructions</Label>
              <Textarea id="payment_instructions" value={paymentInstructions} onChange={(event) => setPaymentInstructions(event.target.value)} rows={3} />
            </div>
            <div className="flex justify-end lg:col-span-2">
              <Button type="submit" disabled={saveSharedProfileMutation.isPending}>
                {saveSharedProfileMutation.isPending ? "Applying..." : "Apply to all clubs"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply payment profile to all clubs?</DialogTitle>
            <DialogDescription>
              This will update the shared bank details, student fee amount, and payment instructions for {affectedClubLabel}.
              Club-specific payment settings will use this profile after you confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <p className="font-semibold">{formatCurrency(Number(studentFeeAmount))}</p>
            <p className="mt-1 text-muted-foreground">
              {bankName} - {accountNumber} - {accountName}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplyDialogOpen(false)}
              disabled={saveSharedProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => saveSharedProfileMutation.mutate()}
              disabled={saveSharedProfileMutation.isPending}
            >
              {saveSharedProfileMutation.isPending ? "Applying..." : "Apply to all clubs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
