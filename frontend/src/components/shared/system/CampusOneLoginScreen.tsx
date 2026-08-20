import { ArrowRight, Lock, School, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface CampusOneLoginScreenProps {
  onContinue?: () => void;
  statusMessage?: string;
}

export function CampusOneLoginScreen({
  onContinue,
  statusMessage = "Sign in with your Nile University Campus One institutional account to access your role-specific dashboard."
}: CampusOneLoginScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-md border-border/80 bg-card shadow-sm overflow-hidden text-left">
        {/* Header Ribbon */}
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground">OneClub</span>
              <span className="ml-1.5 rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
                Single Sign-On
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">Campus One</span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Continue with Campus One
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {statusMessage}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <School className="h-4 w-4 text-primary shrink-0" />
              <span>Nile University Identity Provider</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              OneClub uses your university Single Sign-On credentials. No separate password is required.
            </p>
          </div>

          <Button
            className="w-full h-11 text-xs font-bold gap-2 justify-center shadow-xs"
            onClick={onContinue}
          >
            <span>Continue with Campus One</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Secure university sign-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>Campus One managed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
