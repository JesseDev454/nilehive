import { mockProposals } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

export default function Approvals() {
  const pending = mockProposals.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {pending.length} proposal{pending.length !== 1 ? "s" : ""} awaiting your review
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <Link key={p.id} to={`/proposals/${p.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {p.submittedBy} · {p.club} · Submitted {p.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={p.status} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
