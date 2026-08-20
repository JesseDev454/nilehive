import { LogOut, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";

interface AdvisorSignOutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AdvisorSignOutDialog({
  isOpen,
  onOpenChange,
  onConfirm
}: AdvisorSignOutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-left">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <LogOut className="h-5 w-5" />
            </div>
            <span>Confirm Staff Sign Out</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Are you sure you want to end your active OneClub Staff Advisor session on this device?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Session Termination Notice:</p>
          <p>
            You will be signed out of Campus One Single Sign-On. Any pending proposal reviews can be resumed upon your next authentication.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onConfirm}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            Confirm Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
