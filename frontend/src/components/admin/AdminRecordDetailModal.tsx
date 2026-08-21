import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export type HomeActivityInspection = {
  type: "activity";
  data: { title: string; clubName: string; actor: string; timestamp: string; detail?: string };
};

interface AdminRecordDetailModalProps {
  record: HomeActivityInspection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminRecordDetailModal({ record, open, onOpenChange }: AdminRecordDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Campus Record Audit</span>
            </div>
            <DialogTitle className="text-lg font-bold">{record.data.title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {record.data.clubName} • {record.data.timestamp}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              {record.data.detail || "This operational update was recorded from campus club activity."}
            </p>
            <p className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              Source: <strong className="text-foreground">{record.data.actor}</strong>
            </p>
          </div>

          <DialogFooter className="flex items-center justify-end pt-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
