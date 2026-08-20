import { AlertOctagon, HelpCircle, Mail, MapPin, Phone, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface AccountSuspendedScreenProps {
  status?: "suspended" | "inactive" | "pending_review";
  matricNumber?: string;
  name?: string;
  onSignOut?: () => void;
}

export function AccountSuspendedScreen({
  status = "suspended",
  matricNumber = "NUG/NAS/21/0312",
  name = "Fatima Al-Hassan",
  onSignOut
}: AccountSuspendedScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-destructive/30 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <span className="font-bold text-sm tracking-tight text-foreground">OneClub Governance</span>
          </div>
          <span className="text-[10px] font-bold text-destructive bg-destructive/15 border border-destructive/25 px-2 py-0.5 rounded-full uppercase">
            {status}
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Account Temporarily Unavailable
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              OneClub access for <strong className="text-foreground">{name}</strong> ({matricNumber}) is temporarily unavailable.
            </p>
          </div>

          {/* Reason details */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-xs">
            <span className="font-bold text-destructive flex items-center gap-1.5 text-xs">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>Administrative Hold Notice</span>
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Contact the Club Services team to confirm your account status and the next step.
            </p>
          </div>

          {/* Contact Directory */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
            <span className="font-bold text-foreground block text-xs">
              Direct Inquiries &amp; Resolution:
            </span>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Club Services support desk, Block B</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-mono">studentaffairs@nileuniversity.edu.ng</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Nile Campus Extension: 2410 / 2412</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-bold gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={onSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Safely</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
