import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Loader2, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface CampusOneCallbackScreenProps {
  returnTo?: string;
  onContinue?: () => void;
  onCancel?: () => void;
}

export function CampusOneCallbackScreen({
  returnTo = "/dashboard",
  onContinue,
  onCancel
}: CampusOneCallbackScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 600);
    const timer2 = setTimeout(() => setStep(3), 1300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <span className="font-bold text-sm tracking-tight text-foreground">OneClub</span>
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
              SSO Return
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">OIDC Active</span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0 border border-primary/25">
              {step < 3 ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {step === 1 && "Verifying Campus One Session..."}
                {step === 2 && "Syncing Institutional Permissions..."}
                {step === 3 && "Session Verified & Ready"}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nile University central identity provider has authenticated your credentials.
              </p>
            </div>
          </div>

          {/* Stepped progress indicators */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Authentication Steps</span>
              <span className="font-mono font-bold text-primary">Step {step} of 3</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
              <div className={`rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`rounded-full transition-all duration-300 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`rounded-full transition-all duration-300 ${step >= 3 ? "bg-emerald-500" : "bg-muted"}`} />
            </div>

            <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Return workspace destination:</span>
              <span className="font-mono font-bold text-foreground">{returnTo}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              className="w-full sm:flex-1 h-10 text-xs font-bold gap-1.5 shadow-xs"
              onClick={onContinue}
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto h-10 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onCancel}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Encrypted SAML/OIDC token received from Nile University SSO.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
