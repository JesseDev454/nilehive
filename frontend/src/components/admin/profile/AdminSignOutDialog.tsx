import { useState } from "react";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AdminSignOutDialog() {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (err) {
      // Fallback
      toast.info("Session ended");
      navigate("/login");
    } finally {
      setIsSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <div
      id="admin-session-security-card"
      className="space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6 shadow-2xs"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-bold text-foreground">
              Session Termination
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            Sign out of your active Nile University administrative session on this device.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-2 text-xs font-semibold h-9 shrink-0 self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of OneClub</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive pb-1">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Session Confirmation
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Sign out of OneClub?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                You are about to sign out of your administrative session. To access proposal approvals, club registries, or student communications again, you will need to re-authenticate with your Campus One Microsoft account.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isSigningOut}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="gap-1.5 text-xs h-9"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Confirm Sign Out</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
