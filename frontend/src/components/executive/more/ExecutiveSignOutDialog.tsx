import { AlertTriangle, LogOut, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";

interface ExecutiveSignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOut: () => void;
}

export function ExecutiveSignOutDialog({
  isOpen,
  onClose,
  onConfirmSignOut
}: ExecutiveSignOutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" className="p-5 border-border/80 shadow-xl">
        <div className="space-y-4 text-left text-xs">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Sign Out of Executive Session
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to end your current executive officer session? Any unsaved action draft will be cleared. You will need your Nile University Campus One credentials to log in again.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Campus One Single Sign-On</span>
            </div>
            <p>
              Session tokens are managed by Nile University central identity provider.
            </p>
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-1/2 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirmSignOut}
              className="w-full sm:w-1/2 text-xs font-bold gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
