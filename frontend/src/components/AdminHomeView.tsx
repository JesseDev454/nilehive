import { useAuth } from "@/contexts/AuthContext";
import { useAdminHomeData } from "@/lib/dashboard/useAdminHomeData";
import { formatLagosDateTime } from "@/lib/dashboard/adapters";
import { AdminHomeHeader } from "@/components/admin/AdminHomeHeader";
import { AdminAttentionGrid } from "@/components/admin/AdminAttentionGrid";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";
import { AdminAnnouncementComposer } from "@/components/admin/AdminAnnouncementComposer";
import { AdminRecordDetailModal } from "@/components/admin/AdminRecordDetailModal";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DashboardRecentActivity } from "@/lib/dashboard/types";

export function AdminHomeView() {
  const { reportAuthFailure, profile } = useAuth();
  const navigate = useNavigate();
  const { source, status, data, error, isFetching, refresh } = useAdminHomeData(reportAuthFailure);
  const [isAnnouncementComposerOpen, setIsAnnouncementComposerOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<DashboardRecentActivity | null>(null);
  const firstName = (profile.full_name || "Administrator").split(" ")[0];

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 pb-12" data-home-source={source} role="status" aria-live="polite">
        <div className="h-24 rounded-2xl border border-dashed border-border bg-muted/20 animate-pulse" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-40 rounded-xl border border-dashed border-border bg-muted/20 animate-pulse" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Loading campus operations.</p>
      </div>
    );
  }

  if (status === "forbidden" || status === "error") {
    return (
      <div className="mx-auto w-full max-w-4xl py-12 text-center space-y-4" data-home-source={source} role="alert">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {status === "forbidden" ? "No access to Admin Home" : "Could not load campus operations"}
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error?.message || "An error occurred while connecting to Nile University Club Services."}
        </p>
        {status === "error" ? (
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2 text-xs h-11">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 animate-fade-in pb-12" data-home-source={source}>
      <AdminHomeHeader
        greetingName={firstName}
        clubCount={data.totalClubs}
        lastUpdatedLabel={data.generatedAt ? formatLagosDateTime(data.generatedAt) : null}
        onOpenAnnouncementComposer={() => setIsAnnouncementComposerOpen(true)}
        onRefresh={refresh}
        isRefreshing={isFetching}
      />

      <AdminAttentionGrid
        items={data.attention}
        onSelectAction={(id) => {
          const card = data.attention.find((item) => item.id === id);
          if (card) navigate(card.url);
        }}
      />

      <AdminRecentActivity
        activities={data.recentActivity}
        onInspectActivity={(activity) => setActiveActivity(activity)}
      />

      <AdminAnnouncementComposer
        open={isAnnouncementComposerOpen}
        onOpenChange={setIsAnnouncementComposerOpen}
        onPublished={() => {
          void refresh();
        }}
      />

      <AdminRecordDetailModal
        record={
          activeActivity
            ? {
                type: "activity",
                data: {
                  title: activeActivity.title,
                  clubName: activeActivity.club_name || "Campus club",
                  actor: "Campus operations",
                  timestamp: formatLagosDateTime(activeActivity.created_at),
                  detail: activeActivity.message,
                },
              }
            : null
        }
        open={!!activeActivity}
        onOpenChange={(open) => {
          if (!open) setActiveActivity(null);
        }}
      />

      {isFetching ? (
        <p className="sr-only" aria-live="polite">
          Refreshing campus operations
        </p>
      ) : null}
    </div>
  );
}
