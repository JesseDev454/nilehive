import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Home, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface RecoverableErrorScreenProps {
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function RecoverableErrorScreen({
  errorTitle = "Something needs another try",
  errorMessage = "OneClub encountered an unexpected response while communicating with the campus service. Your unsaved drafts are safely preserved in browser cache.",
  onRetry,
  onGoHome
}: RecoverableErrorScreenProps) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRetry = () => {
    setIsRecovering(true);
    setTimeout(() => {
      setIsRecovering(false);
      onRetry?.();
    }, 600);
  };

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm tracking-tight text-foreground">OneClub Service Response</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
            Recoverable
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {errorTitle}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Safe-Work Guarantee</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              No entered form inputs or draft notes have been cleared. Retrying will re-attempt the transmission with your active data intact.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              className="w-full sm:flex-1 h-10 text-xs font-bold gap-2 shadow-xs"
              onClick={handleRetry}
              disabled={isRecovering}
            >
              {isRecovering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Re-attempting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto h-10 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onGoHome}
              asChild={!onGoHome}
            >
              {!onGoHome ? (
                <Link to="/">
                  <Home className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Home className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
