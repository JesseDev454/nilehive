import { Clock, CreditCard, FileCheck2, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminAttentionCard, AttentionQueueId } from "@/lib/dashboard/types";

const ICONS = {
  proposals: Clock,
  join_requests: UserPlus,
  proofs: CreditCard,
  reports: FileCheck2,
} as const;

interface AdminAttentionGridProps {
  items: AdminAttentionCard[];
  onSelectAction?: (id: AttentionQueueId) => void;
}

export function AdminAttentionGrid({ items, onSelectAction }: AdminAttentionGridProps) {
  const displayItems = items.slice(0, 4);
  const totalCount = displayItems.reduce((acc, item) => acc + item.count, 0);

  if (totalCount === 0) {
    return (
      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="attention-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Items Requiring Attention
          </h2>
          <span className="text-[11px] text-muted-foreground">Queue clear</span>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-2xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">Nothing needs your attention</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            There are no pending proposals, join requests, dues proofs, or missing reports waiting for Directorate authorization.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="attention-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="attention-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Items Requiring Attention
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {displayItems.filter((item) => item.count > 0).length} active queue{displayItems.filter((item) => item.count > 0).length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {displayItems.map((item) => {
          const Icon = ICONS[item.id];
          const hasWaiting = item.count > 0;

          return (
            <div
              key={item.id}
              id={`attention-card-${item.id}`}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs transition-all duration-180 hover:border-primary/40 hover:shadow-xs focus-within:ring-2 focus-within:ring-primary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      hasWaiting ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-2">
                  <div
                    className="text-3xl font-bold tracking-tight text-foreground font-mono"
                    aria-label={`${item.count} ${item.label}`}
                  >
                    {item.count}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.whatNext}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <Link
                  to={item.url}
                  onClick={() => onSelectAction?.(item.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors focus-visible:outline-hidden min-h-11"
                  aria-label={`${item.actionLabel}. ${item.count} ${item.label}`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
