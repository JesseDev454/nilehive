import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AccessDenied } from "@/components/AccessDenied";
import { ClublyLoadingState, ClublyPageHeader, ClublyStateCard } from "@/components/Clubly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getDuePayment, updateDuePayment, type DuePaymentRecord } from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { resolveStorageFileUrl } from "@/lib/storage";

type ReturnLocationState = {
  returnTo?: string;
};

type ProofKind = "image" | "pdf" | "document";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load this dues proof right now.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
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

function getProofKind(value?: string | null): ProofKind {
  const proofPath = (value || "").split("?")[0].toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(proofPath)) {
    return "image";
  }

  if (/\.pdf$/i.test(proofPath)) {
    return "pdf";
  }

  return "document";
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-muted/35 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "-"}</p>
    </div>
  );
}

export default function DuesProofReview() {
  const { role } = useRole();
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoadError, setProofLoadError] = useState<string | null>(null);
  const [proofLoaded, setProofLoaded] = useState(false);
  const returnTo = useMemo(() => {
    const state = location.state as ReturnLocationState | null;
    const requestedReturnTo = state?.returnTo;

    return requestedReturnTo?.startsWith("/dues") || requestedReturnTo === "/membership"
      ? requestedReturnTo
      : "/dues?status=submitted";
  }, [location.state]);
  const returnLabel = returnTo === "/membership" ? "Back to Membership Review" : "Back to Dues";

  const {
    data: payment,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["due-payment", paymentId],
    queryFn: () => getDuePayment(paymentId || ""),
    enabled: role === "admin" && Boolean(paymentId),
    retry: false
  });

  useEffect(() => {
    let cancelled = false;

    setProofUrl(null);
    setProofLoadError(null);
    setProofLoaded(false);

    if (!payment?.proof_url) {
      if (payment) {
        setProofLoadError("This dues record does not have an uploaded proof file.");
      }
      return () => {
        cancelled = true;
      };
    }

    async function hydrateProofUrl() {
      const resolvedUrl = await resolveStorageFileUrl("dues-receipts", payment.proof_url);

      if (cancelled) {
        return;
      }

      if (!resolvedUrl) {
        setProofLoadError("We could not prepare the uploaded proof document.");
        return;
      }

      setProofUrl(resolvedUrl);
    }

    void hydrateProofUrl();

    return () => {
      cancelled = true;
    };
  }, [payment]);

  const updateMutation = useMutation({
    mutationFn: (nextStatus: DuePaymentRecord["status"]) =>
      updateDuePayment(paymentId || "", {
        status: nextStatus
      }),
    onSuccess: async (_updatedPayment, nextStatus) => {
      actionSuccess(
        nextStatus === "paid" ? "Dues proof verified" : "Dues proof rejected",
        "The student's dues record has been updated."
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["due-payment", paymentId] }),
        queryClient.invalidateQueries({ queryKey: ["dues"] }),
        queryClient.invalidateQueries({ queryKey: ["membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["club-members"] }),
        queryClient.invalidateQueries({ queryKey: ["my-membership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["my-dues"] }),
        queryClient.invalidateQueries({ queryKey: ["navigation-counts"] })
      ]);
      navigate(returnTo, { replace: true });
    },
    onError: (mutationError) => {
      actionError("Could not update dues status", mutationError, getErrorMessage(mutationError));
    }
  });

  if (role !== "admin") {
    return (
      <div className="clb-screen">
        <ClublyPageHeader
          eyebrow="Finance"
          title="Dues Proof"
          description="Dues proof review is available only to Clubly admins."
        />
        <AccessDenied
          icon={CreditCard}
          title="Dues proof access is restricted"
          reason="This role cannot review payment proofs."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="clb-screen">
        <ClublyLoadingState title="Loading payment proof" message="We are opening the submitted receipt." />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="clb-screen">
        <ClublyPageHeader
          eyebrow="Finance"
          title="Dues Proof"
          description="Review submitted payment evidence."
        />
        <ClublyStateCard
          icon={Receipt}
          title="Unable to load proof"
          message={getErrorMessage(error)}
          tone="danger"
        >
          <Button asChild variant="outline">
            <Link to={returnTo}>{returnLabel}</Link>
          </Button>
        </ClublyStateCard>
      </div>
    );
  }

  const studentName = payment.member?.full_name || payment.payment_account_name || "Name not submitted";
  const proofKind = getProofKind(payment.proof_url);
  const canVerify = Boolean(proofUrl) && proofLoaded && !proofLoadError && payment.status !== "paid";
  const canReject = Boolean(proofUrl) && proofLoaded && !proofLoadError && payment.status !== "rejected";

  return (
    <div className="clb-screen">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ClublyPageHeader
          eyebrow="Finance"
          title="Payment Proof Review"
          description="Review the uploaded receipt document, then verify or reject this student's dues payment."
        />
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={returnTo}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {returnLabel}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-h-[70vh] overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Uploaded receipt</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {studentName} - {payment.club?.name || "Unknown club"}
                </p>
              </div>
              <Badge className={getPaymentStatusClassName(payment.status)}>
                {getPaymentStatusLabel(payment.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[62vh] items-center justify-center bg-muted/30 p-3 sm:p-6">
            {proofLoadError ? (
              <div className="clb-empty w-full max-w-xl border-destructive bg-destructive/5">
                <Receipt className="mx-auto h-10 w-10 text-destructive" />
                <p className="mt-3 font-medium">Proof document unavailable</p>
                <p className="mt-1 text-sm text-muted-foreground">{proofLoadError}</p>
              </div>
            ) : proofUrl && proofKind === "image" ? (
              <img
                src={proofUrl}
                alt={`${studentName} dues payment proof`}
                className="max-h-[72vh] w-full rounded-xl object-contain"
                onLoad={() => setProofLoaded(true)}
                onError={() => {
                  setProofLoaded(false);
                  setProofLoadError("The uploaded proof image could not be displayed.");
                }}
              />
            ) : proofUrl ? (
              <div className="flex h-[72vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-background">
                <iframe
                  title={`${studentName} dues payment proof`}
                  src={proofUrl}
                  className="min-h-0 flex-1 border-0"
                  onLoad={() => setProofLoaded(true)}
                />
                <div className="flex flex-col gap-2 border-t border-border bg-background p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {proofKind === "pdf"
                      ? "PDF receipt loaded. If the preview is blank, open it in a new tab."
                      : "Document preview loaded. If it does not display, open it in a new tab."}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <a href={proofUrl} target="_blank" rel="noreferrer" onClick={() => setProofLoaded(true)}>
                      Open Proof
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <ClublyLoadingState title="Preparing proof document" message="We are creating a secure proof view." compact />
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review decision</CardTitle>
              <p className="text-sm text-muted-foreground">
                Buttons unlock after the receipt document has loaded.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <DetailRow label="Student" value={studentName} />
                <DetailRow label="Student ID" value={payment.member?.student_id} />
                <DetailRow label="Contact" value={payment.member?.phone_number || payment.member?.email} />
                <DetailRow label="Club" value={payment.club?.name} />
                <DetailRow label="Amount" value={formatCurrency(payment.amount)} />
                <DetailRow label="Session" value={payment.academic_session} />
                <DetailRow label="Submitted" value={formatDate(payment.submitted_at || payment.updated_at)} />
              </div>

              <div className="grid gap-2">
                <Button
                  type="button"
                  disabled={!canVerify || updateMutation.isPending}
                  onClick={() => updateMutation.mutate("paid")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : "Verify Payment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canReject || updateMutation.isPending}
                  onClick={() => updateMutation.mutate("rejected")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : "Reject Proof"}
                </Button>
              </div>

              {!proofLoaded && !proofLoadError ? (
                <p className="text-xs text-muted-foreground">
                  The review actions will become available once the proof document finishes loading.
                </p>
              ) : null}
              {proofLoadError ? (
                <p className="text-xs text-destructive">
                  Resolve the missing or broken proof before changing this payment status.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {payment.payer_note ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Student note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{payment.payer_note}</p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
