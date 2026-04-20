import { mockProposals } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { NeoMetricCard, NeoPageHeader } from "@/components/NeoBrutal";

export default function Analytics() {
  const total = mockProposals.length;
  const approved = mockProposals.filter((p) => p.status === "approved").length;
  const pending = mockProposals.filter((p) => p.status === "pending").length;
  const rejected = mockProposals.filter((p) => p.status === "rejected").length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const triggerReminders = () => {
    toast.info("Reminders sent!", {
      description: `${pending} pending review(s) reminded.`,
    });
  };

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Operations"
        title="Analytics"
        description="Approval pipeline overview."
        actions={(
          <Button onClick={triggerReminders} variant="outline" className="text-warning">
          <Bell className="h-4 w-4 mr-2" />
          Trigger Reminders
          </Button>
        )}
      />

      <div className="nh-metric-grid">
        <NeoMetricCard title="Total Proposals" value={total} tone="navy" />
        <NeoMetricCard title="Approved" value={approved} tone="green" />
        <NeoMetricCard title="Pending" value={pending} tone="gold" />
        <NeoMetricCard title="Rejected" value={rejected} tone="red" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall approval rate</span>
              <span className="font-medium">{approvalRate}%</span>
            </div>
            <div className="h-4 overflow-hidden border-2 border-foreground bg-muted">
              <div className="h-full bg-success transition-all" style={{ width: `${approvalRate}%` }} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Pipeline Breakdown</h4>
            {[
              { label: "Approved", count: approved, color: "bg-success" },
              { label: "Pending", count: pending, color: "bg-warning" },
              { label: "Rejected", count: rejected, color: "bg-destructive" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`h-3 w-3 border border-foreground ${item.color}`} />
                <span className="text-sm flex-1">{item.label}</span>
                <span className="text-sm font-medium">{item.count}</span>
                <div className="h-3 w-24 overflow-hidden border border-foreground bg-muted">
                  <div className={`h-full ${item.color}`}
                    style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
