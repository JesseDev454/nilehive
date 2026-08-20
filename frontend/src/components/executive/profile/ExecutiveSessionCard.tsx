import { useState } from "react";
import { AlertCircle, Clock, KeyRound, Laptop, LogOut, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";

interface ExecutiveSessionCardProps {
  onSignOut: () => void;
}

export function ExecutiveSessionCard({ onSignOut }: ExecutiveSessionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmSignOut = () => {
    setIsDialogOpen(false);
    onSignOut();
  };

  return (
    <>
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <span>Campus One SSO Session &amp; Security</span>
            </CardTitle>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active Session
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Authentication Method
              </span>
              <p className="font-semibold text-foreground text-xs">Nile University Identity Provider (OIDC)</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Session Token Expiry
              </span>
              <p className="font-mono text-muted-foreground text-xs">Valid for 8 Hours</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-muted-foreground">
              Ending session revokes temporary client tokens on this browser.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="text-xs font-bold gap-1.5 h-8.5 text-destructive hover:bg-destructive/10 border-destructive/30 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Session</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent maxWidth="sm" className="p-5 border-border/80 shadow-xl">
          <div className="space-y-4 text-left text-xs">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                  <LogOut className="h-4 w-4" />
                </div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Sign Out of Executive Account
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to end your current session? You will need your Nile University Campus One single sign-on credentials to log in again.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-1/2 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmSignOut}
                className="w-full sm:w-1/2 text-xs font-bold gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Confirm Sign Out</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
