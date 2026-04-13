import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  createDuePayment,
  getClubMembers,
  getClubs,
  getDuePayments,
  updateDuePayment,
  type DuePaymentRecord
} from "@/lib/api";

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
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [amount, setAmount] = useState("");
  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [paymentReference, setPaymentReference] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [status, setStatus] = useState<DuePaymentRecord["status"]>("unpaid");
  const canViewDues = role === "president" || role === "executive" || role === "admin";
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
  const memberNameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.full_name])),
    [members]
  );
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
      toast.success("Dues record saved");
      setMemberId("");
      setSelectedClubId("");
      setAmount("");
      setPaymentReference("");
      setProofUrl("");
      setStatus("unpaid");
      await queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
    onError: (mutationError) => {
      toast.error("Could not save dues record", {
        description: getErrorMessage(mutationError)
      });
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ payment, nextStatus }: { payment: DuePaymentRecord; nextStatus: DuePaymentRecord["status"] }) =>
      updateDuePayment(payment.id, {
        status: nextStatus
      }),
    onSuccess: async () => {
      toast.success("Dues status updated");
      await queryClient.invalidateQueries({ queryKey: ["dues"] });
    },
    onError: (mutationError) => {
      toast.error("Could not update dues status", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  if (!canViewDues) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Dues & Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Dues tracking is available to executives, presidents, and admins.</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">This role does not use dues tracking yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Dues & Payment Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track member dues manually for now. No payment gateway is connected yet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Expected</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(duesData?.summary.expected_amount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(duesData?.summary.collected_amount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold mt-1">{duesData?.summary.paid ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Collection Rate</p>
            <p className="text-2xl font-bold mt-1">{duesData?.summary.collection_rate ?? 0}%</p>
          </CardContent>
        </Card>
      </div>

      {canManageDues ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Dues Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePayment} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <Label htmlFor="proof_url">Proof URL</Label>
                <Input
                  id="proof_url"
                  value={proofUrl}
                  onChange={(event) => setProofUrl(event.target.value)}
                  placeholder="Optional link to receipt"
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
                <Button type="submit" disabled={createMutation.isPending}>
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
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load dues</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : !duesData?.payments.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No dues records yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a dues record above after adding club members.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Member</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Session</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {duesData.payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{memberNameById[payment.member_id] || "Unknown member"}</p>
                        <p className="text-xs text-muted-foreground">{payment.payment_reference || "No reference"}</p>
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
