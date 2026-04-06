import { useParams, useNavigate } from "react-router-dom";
import { mockProposals } from "@/data/mockData";
import { ApprovalStepper } from "@/components/ApprovalStepper";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRole } from "@/contexts/RoleContext";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const [remarks, setRemarks] = useState("");

  const proposal = mockProposals.find((p) => p.id === id);
  if (!proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proposal not found</p>
      </div>
    );
  }

  const canReview = (role === "advisor" || role === "president") && proposal.status === "pending";

  const handleAction = (action: "approve" | "reject") => {
    toast.success(`Proposal ${action === "approve" ? "approved" : "rejected"}!`, {
      description: remarks ? `Remarks: ${remarks}` : undefined,
    });
    navigate(-1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{proposal.club} · {proposal.submittedBy}</p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1">{proposal.description}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <span className="text-muted-foreground">Event Date</span>
                  <p className="font-medium mt-1">{proposal.eventDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted</span>
                  <p className="font-medium mt-1">{proposal.submittedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {canReview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" placeholder="Add your review comments..."
                    rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleAction("approve")}
                    className="bg-success hover:bg-success/90 text-success-foreground">
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => handleAction("reject")}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalStepper steps={proposal.steps} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
