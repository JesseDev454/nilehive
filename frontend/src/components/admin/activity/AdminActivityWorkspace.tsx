import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminActivityData } from "@/lib/audit/useAdminActivityData";
import { actionLabel, actorDisplayName, entityLabel, ACTION_LABELS, ENTITY_LABELS } from "@/lib/audit/adapters";
import { formatLagosDateTime } from "@/lib/dashboard/adapters";
import type { AuditLogRecord } from "@/lib/audit/types";
import { ActivityDirectoryStatus } from "@/components/admin/activity/ActivityDirectoryStatus";
import { AdminActivityDetailDialog } from "@/components/admin/activity/AdminActivityDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, ScrollText } from "lucide-react";

export function AdminActivityWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminActivityData(reportAuthFailure);
  const [selected, setSelected] = useState<AuditLogRecord | null>(null);

  const showDirectory = data.status === "loading" || data.status === "forbidden" || data.status === "error"
    || (data.status === "empty");

  const actionOptions = useMemo(() => Object.entries(ACTION_LABELS), []);
  const entityOptions = useMemo(() => Object.entries(ENTITY_LABELS), []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in pb-16" data-activity-source={data.source}>
      <header className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <ScrollText className="h-3 w-3" />
            Directorate
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity Log</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Read-only audit history for Club Services mutations. Records cannot be edited, cleared, or replayed from this screen.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-2 text-xs"
          onClick={data.retry}
          disabled={data.isFetching}
          aria-label="Refresh activity log"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${data.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-3" aria-label="Activity filters">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="activity-search" className="text-[11px] uppercase tracking-wider text-muted-foreground">Search</Label>
            <Input
              id="activity-search"
              value={data.filters.q}
              onChange={(event) => data.setQuery(event.target.value)}
              placeholder="Action, resource, or remarks"
              className="h-10 text-xs"
              aria-label="Search activity log"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-action" className="text-[11px] uppercase tracking-wider text-muted-foreground">Action</Label>
            <select
              id="activity-action"
              value={data.filters.action}
              onChange={(event) => data.setAction(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">All actions</option>
              {actionOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-entity" className="text-[11px] uppercase tracking-wider text-muted-foreground">Resource</Label>
            <select
              id="activity-entity"
              value={data.filters.entityType}
              onChange={(event) => data.setEntityType(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">All resources</option>
              {entityOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-from" className="text-[11px] uppercase tracking-wider text-muted-foreground">From</Label>
            <Input id="activity-from" type="date" value={data.filters.dateFrom} onChange={(event) => data.setDateFrom(event.target.value)} className="h-10 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-to" className="text-[11px] uppercase tracking-wider text-muted-foreground">To</Label>
            <Input id="activity-to" type="date" value={data.filters.dateTo} onChange={(event) => data.setDateTo(event.target.value)} className="h-10 text-xs" />
          </div>
        </div>
      </section>

      {showDirectory ? (
        <ActivityDirectoryStatus
          status={data.status}
          error={data.error}
          filteredEmpty={data.status === "empty" && data.hasActiveFilters}
          onRetry={data.retry}
          onResetFilters={data.resetFilters}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 border-b border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Actor</span>
            <span>Action</span>
            <span>Resource</span>
            <span>When</span>
          </div>
          <ul className="divide-y divide-border/50">
            {data.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-hidden min-h-11"
                  aria-label={`Open details for ${actionLabel(item.action)}`}
                >
                  <div className="grid grid-cols-1 gap-1 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center md:gap-3">
                    <span className="text-xs font-semibold text-foreground">{actorDisplayName(item.actor)}</span>
                    <span className="text-xs text-foreground">{actionLabel(item.action)}</span>
                    <span className="text-xs text-muted-foreground">
                      {entityLabel(item.entity_type)}
                      {item.club?.name ? ` · ${item.club.name}` : ""}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formatLagosDateTime(item.created_at)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              Page {data.filters.page}
              {data.total ? ` · ${data.total} records` : ""}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs" disabled={data.filters.page <= 1} onClick={data.previousPage}>
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs" disabled={!data.hasNext} onClick={data.nextPage}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <AdminActivityDetailDialog record={selected} open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }} />
    </div>
  );
}
