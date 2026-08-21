import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AuditLogRecord } from "@/lib/audit/types";
import { actionLabel, actorDisplayName, entityLabel, isRedactedValue } from "@/lib/audit/adapters";
import { formatLagosDateTime } from "@/lib/dashboard/adapters";
import { useState } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";

interface AdminActivityDetailDialogProps {
  record: AuditLogRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MetadataRows({ value, path = "" }: { value: unknown; path?: string }) {
  if (isRedactedValue(value)) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{path || "field"}</span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5" />
          Protected field
        </span>
      </div>
    );
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object") {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{path || "value"}</span>
        <span className="text-xs font-medium text-foreground break-all text-right">{String(value)}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <MetadataRows key={`${path}-${index}`} value={item} path={path ? `${path}[${index}]` : `[${index}]`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(value as Record<string, unknown>).map(([key, nested]) => (
        <MetadataRows key={`${path}.${key}`} value={nested} path={path ? `${path}.${key}` : key} />
      ))}
    </div>
  );
}

export function AdminActivityDetailDialog({ record, open, onOpenChange }: AdminActivityDetailDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        {record ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{actionLabel(record.action)}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Immutable audit record · {formatLagosDateTime(record.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <p><span className="text-muted-foreground">Actor:</span> <strong className="text-foreground">{actorDisplayName(record.actor)}</strong></p>
                <p><span className="text-muted-foreground">Resource:</span> <strong className="text-foreground">{entityLabel(record.entity_type)}</strong></p>
                {record.club?.name ? (
                  <p><span className="text-muted-foreground">Club:</span> <strong className="text-foreground">{record.club.name}</strong></p>
                ) : null}
                {record.remarks ? (
                  <p className="leading-relaxed"><span className="text-muted-foreground">Remarks:</span> {record.remarks}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {record.id ? (
                  <Button type="button" variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => void copy("Record ID", record.id)} aria-label="Copy record ID">
                    {copied === "Record ID" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy record ID
                  </Button>
                ) : null}
                {record.entity_id ? (
                  <Button type="button" variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => void copy("Resource ID", record.entity_id || "")} aria-label="Copy resource ID">
                    {copied === "Resource ID" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy resource ID
                  </Button>
                ) : null}
              </div>
              <p className="sr-only" aria-live="polite">{copied ? `${copied} copied` : ""}</p>

              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Safe metadata</h3>
                {Object.keys(record.metadata).length ? (
                  <MetadataRows value={record.metadata} />
                ) : (
                  <p className="text-muted-foreground">No additional metadata was returned for this record.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
