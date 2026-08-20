import {
  CalendarCheck,
  CheckCircle2,
  Database,
  Info,
  ShieldCheck,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  type AnalyticsTimeRange,
  type MetricDefinition
} from "@/data/adminAnalyticsData";

interface AdminAnalyticsMetricModalProps {
  definition: MetricDefinition | null;
  timeRange: AnalyticsTimeRange;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminAnalyticsMetricModal({
  definition,
  timeRange,
  open,
  onOpenChange
}: AdminAnalyticsMetricModalProps) {
  if (!definition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Metric Specification
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Window: {timeRange} Days
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground pt-1">
            {definition.label}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {definition.description}
          </p>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          {/* Tracking Methodology */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Data Source &amp; Extraction</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {definition.source}
            </p>
            <div className="pt-2 border-t border-border/60">
              <span className="text-muted-foreground font-medium block text-[11px]">Methodology:</span>
              <p className="text-xs text-foreground leading-relaxed">
                {definition.methodology}
              </p>
            </div>
          </div>

          {/* Institutional Relevance */}
          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1">
            <span className="text-foreground font-semibold text-xs block">
              Directorate Objective
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {definition.relevance}
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/15 p-3 text-[11px] text-foreground leading-relaxed">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              All metric values are computed strictly from verified database events without collecting personal device telemetry or private user browsing activity.
            </span>
          </div>

          {/* Close Button */}
          <div className="flex items-center justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Done Reading
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
