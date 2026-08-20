import { AlertTriangle, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";

interface SignOutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOut: () => void;
  inlinePreview?: boolean;
}

export function SignOutConfirmationDialog({
  isOpen,
  onClose,
  onConfirmSignOut,
  inlinePreview = false
}: SignOutConfirmationDialogProps) {
  const content = (
    <div className="space-y-4 text-left text-xs">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <LogOut className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Sign Out of OneClub
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to end your active session? You will need your Nile University Campus One Single Sign-On credentials to access your club workspace again.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Campus One Session Termination</span>
        </div>
        <p>
          Local session tokens will be revoked across this browser session.
        </p>
      </div>

      <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
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
      </div>
    </div>
  );

  if (inlinePreview) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
        <Card className="w-full max-w-md border-border/80 bg-card p-5 shadow-sm">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" className="p-5 border-border/80 shadow-xl">
        {content}
      </DialogContent>
    </Dialog>
  );
}
