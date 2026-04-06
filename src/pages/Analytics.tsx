import { mockProposals } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";

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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Approval pipeline overview</p>
        </div>
        <Button onClick={triggerReminders} variant="outline"
          className="text-warning border-warning/30 hover:bg-warning/10">
          <Bell className="h-4 w-4 mr-2" />
          Trigger Reminders
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-success">{approved}</p>
            <p className="text-sm text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-warning">{pending}</p>
            <p className="text-sm text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-destructive">{rejected}</p>
            <p className="text-sm text-muted-foreground mt-1">Rejected</p>
          </CardContent>
        </Card>
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
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all" style={{ width: `${approvalRate}%` }} />
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
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm flex-1">{item.label}</span>
                <span className="text-sm font-medium">{item.count}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`}
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
