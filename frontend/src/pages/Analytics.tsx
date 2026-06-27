import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, ShieldCheck } from "lucide-react";
import { NeoLoadingState, NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, getAnalyticsSummary } from "@/lib/api";

const labels: Record<string, string> = {
  club_discovery_view: "Club discovery views",
  club_detail_view: "Club detail views",
  event_view: "Event views",
  notifications_view: "Notification center views",
  feedback_view: "Feedback views",
  announcements_view: "Announcement views",
  dashboard_view: "Dashboard views",
  join_requests_started: "Join requests started",
  join_requests_completed: "Memberships activated",
  dues_proofs_submitted: "Dues proofs submitted",
  dues_proofs_verified: "Dues proofs verified",
  event_rsvps: "Event RSVPs",
  event_check_ins: "Event check-ins",
  feedback_submissions: "Feedback submissions"
};

export default function Analytics() {
  const { role } = useRole();
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const query = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => getAnalyticsSummary(days),
    enabled: role === "admin",
    retry: false
  });

  if (role !== "admin") {
    return <div className="nh-page"><NeoPageHeader eyebrow="Operations" title="Analytics" description="Privacy-safe Club Services usage insights." /><NeoStateCard icon={ShieldCheck} title="Analytics access is restricted" message="Your workspace does not include admin analytics." /></div>;
  }

  const errorMessage = query.error instanceof ApiClientError || query.error instanceof Error
    ? query.error.message
    : "Analytics are unavailable right now.";

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Operations"
        title="Analytics"
        description="Aggregate adoption and workflow activity. No search text or browsing histories are stored."
        actions={<div className="flex gap-2">{([7, 30, 90] as const).map((range) => <Button key={range} size="sm" variant={days === range ? "default" : "outline"} onClick={() => setDays(range)}>{range} days</Button>)}</div>}
      />
      {query.isLoading ? <NeoLoadingState title="Loading analytics" message="Counting recent Club Services activity." /> : query.isError ? (
        <NeoStateCard icon={BarChart3} title="Could not load analytics" message={errorMessage} tone="danger" />
      ) : query.data ? (
        <>
          <div className="nh-metric-grid">
            <NeoMetricCard title="Active Users" value={query.data.active_users} tone="navy" />
            <NeoMetricCard title="Discovery Views" value={query.data.features.club_discovery_view || 0} tone="green" />
            <NeoMetricCard title="Join Requests" value={query.data.operations.join_requests_started || 0} tone="gold" />
            <NeoMetricCard title="Event Check-ins" value={query.data.operations.event_check_ins || 0} tone="red" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-lg">Feature usage</CardTitle></CardHeader><CardContent className="space-y-3">{Object.entries(query.data.features).map(([key, count]) => <div key={key} className="flex justify-between border-b pb-2 text-sm"><span>{labels[key] || key}</span><strong>{count}</strong></div>)}{Object.keys(query.data.features).length === 0 ? <p className="text-sm text-muted-foreground">Usage will appear as people use Club Services.</p> : null}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-lg">Operational outcomes</CardTitle></CardHeader><CardContent className="space-y-3">{Object.entries(query.data.operations).map(([key, count]) => <div key={key} className="flex justify-between border-b pb-2 text-sm"><span>{labels[key] || key}</span><strong>{count}</strong></div>)}</CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" /> Usage by role</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-3">{Object.entries(query.data.usage_by_role).map(([key, count]) => <div key={key} className="nh-list-card min-w-36"><p className="text-xs uppercase text-muted-foreground">{key.replace("_", " ")}</p><p className="text-2xl font-black">{count}</p></div>)}{Object.keys(query.data.usage_by_role).length === 0 ? <p className="text-sm text-muted-foreground">No active users recorded for this period.</p> : null}</CardContent></Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
