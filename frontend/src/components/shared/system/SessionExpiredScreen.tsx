import { ArrowRight, Clock, Lock, LogOut, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface SessionExpiredScreenProps {
  lastActiveWorkspace?: string;
  onContinue?: () => void;
  onSignOut?: () => void;
}

export function SessionExpiredScreen({
  lastActiveWorkspace = "/tasks",
  onContinue,
  onSignOut
}: SessionExpiredScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-md border-border/80 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm tracking-tight text-foreground">OneClub Security</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
            Token Expired
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Your session has expired
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your 8-hour Campus One single sign-on token has elapsed for security compliance. Re-authenticate to return directly to your work.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Saved Return Route
            </span>
            <p className="font-mono font-bold text-foreground text-xs">
              {lastActiveWorkspace}
            </p>
            <p className="text-[11px] text-muted-foreground pt-1">
              Your draft states and in-flight inputs have been cached safely.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              className="w-full h-11 text-xs font-bold gap-2 justify-center shadow-xs"
              onClick={onContinue}
            >
              <span>Continue with Campus One</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full h-9 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out completely</span>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Campus One SSO token expiration protects academic records.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
