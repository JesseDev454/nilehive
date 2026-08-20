import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Compass, Home, Lock, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface UnauthorizedRoleScreenProps {
  currentRole?: string;
  requiredRole?: string;
  targetWorkspaceName?: string;
  onBackToDashboard?: () => void;
}

export function UnauthorizedRoleScreen({
  currentRole = "Executive Officer",
  requiredRole = "Club Services Admin",
  targetWorkspaceName = "Approvals",
  onBackToDashboard
}: UnauthorizedRoleScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm tracking-tight text-foreground">OneClub Access Control</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full">
            Restricted Role
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              No Access to this Workspace
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The <strong className="text-foreground">{targetWorkspaceName}</strong> workspace requires <strong className="text-foreground">{requiredRole}</strong> permissions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Your Current Role
              </span>
              <p className="font-bold text-primary text-xs">{currentRole}</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Required Authorization
              </span>
              <p className="font-bold text-foreground text-xs">{requiredRole}</p>
            </div>
          </div>

          {/* Suggested Workspaces for Current Role */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-foreground block">
              Authorized Hubs for Your Role:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Link
                to="/executive/work"
                className="p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-xs text-foreground">My Assigned Work</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>

              <Link
                to="/executive/club"
                className="p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Club &amp; Members</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              className="w-full sm:flex-1 h-10 text-xs font-bold gap-2 shadow-xs"
              onClick={onBackToDashboard}
              asChild={!onBackToDashboard}
            >
              {!onBackToDashboard ? (
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Return to My Dashboard</span>
                </Link>
              ) : (
                <span>Return to My Dashboard</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
