import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, Home, School, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface NotFoundScreenProps {
  requestedPath?: string;
  onGoHome?: () => void;
}

export function NotFoundScreen({
  requestedPath = "/unknown/route",
  onGoHome
}: NotFoundScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden text-center">
        <div className="bg-primary/5 border-b border-border/60 p-6 flex flex-col items-center justify-center relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/25 shadow-xs mb-2">
            <Compass className="h-7 w-7" />
          </div>
          <span className="font-mono text-4xl font-extrabold tracking-tight text-primary">
            404
          </span>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
            Page Not Found
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6 text-left">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              That destination is unavailable
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              The link you followed may be outdated, or the resource has been relocated under a different OneClub workspace.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Attempted URL Path
            </span>
            <p className="font-mono text-muted-foreground text-xs break-all">
              {requestedPath}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">
              Safe Campus Destinations:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                to="/"
                className="p-3 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-center block space-y-1"
              >
                <Home className="h-4 w-4 text-primary mx-auto" />
                <span className="text-xs font-bold text-foreground block">Dashboard</span>
                <span className="text-[10px] text-muted-foreground block">Primary hub</span>
              </Link>

              <Link
                to="/membership"
                className="p-3 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-center block space-y-1"
              >
                <School className="h-4 w-4 text-primary mx-auto" />
                <span className="text-xs font-bold text-foreground block">Clubs</span>
                <span className="text-[10px] text-muted-foreground block">Directory</span>
              </Link>

              <Link
                to="/"
                className="p-3 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors text-center block space-y-1"
              >
                <CalendarDays className="h-4 w-4 text-primary mx-auto" />
                <span className="text-xs font-bold text-foreground block">Events</span>
                <span className="text-[10px] text-muted-foreground block">Calendar</span>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-10 text-xs font-bold gap-2 justify-center shadow-xs"
              onClick={onGoHome}
              asChild={!onGoHome}
            >
              {!onGoHome ? (
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Return to OneClub Dashboard</span>
                </Link>
              ) : (
                <span>Return to OneClub Dashboard</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
