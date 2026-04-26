import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Landmark, Loader2, Receipt, TrendingUp } from "lucide-react";
import { NeoLoadingState, NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  updateDuePayment,
  type DuePaymentRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { resolveStorageFileUrl } from "@/lib/storage";

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

export default function Dues() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [fresherAmount, setFresherAmount] = useState("10000");
  const [returningAmount, setReturningAmount] = useState("5000");
  const [bankName, setBankName] = useState("Providus Bank");
  const [accountNumber, setAccountNumber] = useState("1305861314");
  const [accountName, setAccountName] = useState("Nile Arts & Creative Hub");
  const [paymentInstructions, setPaymentInstructions] = useState(
    "Freshers pay N10,000. Returning students pay N5,000. Submit the payment reference and proof used for Club Services review."
  );
  const [proofLinksByPaymentId, setProofLinksByPaymentId] = useState<Record<string, string>>({});
  const canViewDues = role === "president" || role === "admin";
  const canManageSharedProfile = role === "admin";

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
    if (!sharedPaymentSettings) {
      return;
    }

    setFresherAmount(String(sharedPaymentSettings.fresher_dues_amount ?? 10000));
    setReturningAmount(String(sharedPaymentSettings.returning_student_dues_amount ?? 5000));
    setBankName(sharedPaymentSettings.bank_name);
    setAccountNumber(sharedPaymentSettings.account_number);
    setAccountName(sharedPaymentSettings.account_name);
    setPaymentInstructions(sharedPaymentSettings.payment_instructions || "");
  }, [sharedPaymentSettings]);

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

  const clubNameById = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs]
  );

  const saveSharedProfileMutation = useMutation({
    mutationFn: () =>
      applyClubPaymentProfileToAll({
        fresher_dues_amount: Number(fresherAmount),
        returning_student_dues_amount: Number(returningAmount),
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        payment_instructions: paymentInstructions || null
      }),
    onSuccess: async (result) => {
      actionSuccess(
        "Shared payment profile updated",
        `Applied the Club Services account and freshers/returning dues amounts to ${result.clubs_updated} clubs.`
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

  const updateMutation = useMutation({
    mutationFn: ({ payment, nextStatus }: { payment: DuePaymentRecord; nextStatus: DuePaymentRecord["status"] }) =>
      updateDuePayment(payment.id, {
        status: nextStatus
      }),
    onSuccess: async () => {
      actionSuccess("Dues status updated", "The dues review has been saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dues"] }),
        queryClient.invalidateQueries({ queryKey: ["membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["my-dues"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not update dues status", mutationError, getErrorMessage(mutationError));
    }
  });

  function handleSaveSharedProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSharedProfileMutation.mutate();
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
        title="Dues & Payment Review"
        description="Students attach payment details when they sign up or join a club. Presidents and Club Services verify those dues records here."
      />

      <div className="nh-metric-grid">
        <NeoMetricCard title="Expected" value={formatCurrency(duesData?.summary.expected_amount ?? 0)} icon={CreditCard} tone="navy" />
        <NeoMetricCard title="Collected" value={formatCurrency(duesData?.summary.collected_amount ?? 0)} icon={Receipt} tone="green" />
        <NeoMetricCard title="Paid" value={duesData?.summary.paid ?? 0} icon={Landmark} tone="gold" />
        <NeoMetricCard title="Collection Rate" value={`${duesData?.summary.collection_rate ?? 0}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shared Club Services Payment Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            All clubs use one payment destination. Freshers and returning students are charged from this shared profile.
          </p>
        </CardHeader>
        <CardContent>
          {canManageSharedProfile ? (
            <form onSubmit={handleSaveSharedProfile} className="nh-form-grid">
              <div className="space-y-2">
                <Label htmlFor="fresher_dues_amount">Freshers Dues</Label>
                <Input
                  id="fresher_dues_amount"
                  type="number"
                  min="0"
                  value={fresherAmount}
                  onChange={(event) => setFresherAmount(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returning_dues_amount">Returning Students Dues</Label>
                <Input
                  id="returning_dues_amount"
                  type="number"
                  min="0"
                  value={returningAmount}
                  onChange={(event) => setReturningAmount(event.target.value)}
                  required
                />
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
                <Textarea
                  id="payment_instructions"
                  value={paymentInstructions}
                  onChange={(event) => setPaymentInstructions(event.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex lg:col-span-2 justify-stretch sm:justify-end">
                <Button
                  type="submit"
                  disabled={saveSharedProfileMutation.isPending}
                  className="w-full max-w-full whitespace-normal break-words text-center sm:w-auto"
                >
                  {saveSharedProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply to all clubs"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="nh-card-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Freshers Dues</p>
                <p className="mt-1 font-semibold">{formatCurrency(sharedPaymentSettings?.fresher_dues_amount ?? 10000)}</p>
              </div>
              <div className="nh-card-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Returning Students Dues</p>
                <p className="mt-1 font-semibold">{formatCurrency(sharedPaymentSettings?.returning_student_dues_amount ?? 5000)}</p>
              </div>
              <div className="nh-card-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Bank</p>
                <p className="mt-1 font-semibold">{sharedPaymentSettings?.bank_name || "Not set yet"}</p>
              </div>
              <div className="nh-card-soft p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Number</p>
                <p className="mt-1 font-semibold">{sharedPaymentSettings?.account_number || "Not set yet"}</p>
              </div>
              <div className="nh-card-soft p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Name</p>
                <p className="mt-1 font-semibold">{sharedPaymentSettings?.account_name || "Not set yet"}</p>
                {sharedPaymentSettings?.payment_instructions ? (
                  <p className="mt-2 text-sm text-muted-foreground">{sharedPaymentSettings.payment_instructions}</p>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dues Records</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review the submitted payment details here. Mark paid when the transfer is confirmed. Mark rejected when the details need correction.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NeoLoadingState title="Loading dues records" message="We are checking payment status and receipts." compact />
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
                New student joins and signups will create dues records automatically.
              </p>
            </div>
          ) : (
            <div className="nh-table-wrap">
              <table className="nh-table">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Payment Details</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Session</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {duesData.payments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-accent/50">
                      <td className="p-3">
                        <p className="font-medium">{clubNameById.get(payment.club_id) || "Unknown club"}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_paid_at || payment.created_at}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{payment.payment_account_name || "Name on account not submitted"}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_reference || "No reference yet"}</p>
                        {payment.payer_note ? (
                          <p className="text-xs text-muted-foreground">{payment.payer_note}</p>
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
