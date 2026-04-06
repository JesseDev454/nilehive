import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  getAdvisorPendingProposalsErrorMessage,
  useAdvisorPendingProposals
} from "@/hooks/use-advisor-pending-proposals";

export default function Approvals() {
  const { data: pending = [], isLoading, isError, error } = useAdvisorPendingProposals();

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {pending.length} proposal{pending.length !== 1 ? "s" : ""} awaiting your review
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Loading pending approvals...</p>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="font-medium">Unable to load pending approvals</p>
            <p className="text-sm text-muted-foreground mt-2">
              {getAdvisorPendingProposalsErrorMessage(error)}
            </p>
          </CardContent>
        </Card>
      ) : pending.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{proposal.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {proposal.location} · Event {proposal.eventDate} · Submitted {proposal.submittedAt}
                  </p>
                </div>
                <StatusBadge status={proposal.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
