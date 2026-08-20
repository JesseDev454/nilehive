import { useState } from "react";
import { Check, Loader2, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface OfflineRetryScreenProps {
  onRetry?: () => void;
  cachedSectionTitle?: string;
  hasCachedData?: boolean;
}

export function OfflineRetryScreen({
  onRetry,
  cachedSectionTitle = "Executive Task Directives & Member Records",
  hasCachedData = true
}: OfflineRetryScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryResult(null);
    setTimeout(() => {
      setIsRetrying(false);
      if (navigator.onLine) {
        setRetryResult("Network connected! Synchronizing latest data...");
        onRetry?.();
      } else {
        setRetryResult("Still offline. Using cached student and club records.");
      }
    }, 800);
  };

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-amber-500/30 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm tracking-tight text-foreground">Network Disconnected</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
            Offline Mode
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              You are currently offline
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              OneClub has preserved your workspace state and active form inputs in local device cache. You can continue reviewing records while reconnecting.
            </p>
          </div>

          {hasCachedData && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Retained Local Cache:</span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Saved Locally
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {cachedSectionTitle}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Edits will queue and synchronize automatically upon reconnection.</span>
              </div>
            </div>
          )}

          {retryResult && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-semibold text-foreground">
              {retryResult}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              className="w-full sm:flex-1 h-10 text-xs font-bold gap-2 shadow-xs"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking Network...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry Connection</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
