import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Info,
  Layers,
  School,
  ShieldAlert,
  ShieldCheck,
  UserCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { executiveMoreDestinations } from "@/lib/appNavigation";

export function ExecutiveMoreWorkspace() {
  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-more-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="executive-more-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/MORE
            </span>
          </div>

          <h1
            id="executive-more-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            More Executive Destinations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Access notification logs, institutional profile credentials, and role privileges for your assigned club.
          </p>
        </div>
      </header>

      {/* MORE DESTINATIONS LAUNCHER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {executiveMoreDestinations.map((dest) => {
          const Icon = dest.icon;
          return (
            <Link
              key={dest.title}
              to={dest.url}
              className="group block rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-4 space-y-1">
                <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {dest.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dest.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* EXECUTIVE GOVERNANCE & PERMISSION BOUNDARIES CARD */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Executive Role Permissions &amp; System Scope
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Strict boundaries enforced by Nile University Student Affairs &amp; Club Services
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allowed Capabilities */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Allowed Executive Capabilities
              </span>
              <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                <li>View assigned club details and accreditation status</li>
                <li>View read-only club member rosters</li>
                <li>View club event calendar, agendas, and venue details</li>
                <li>Manage own assigned action items (Pending, In Progress, Blocked, Completed)</li>
                <li>Log blocker notes for presidential unblocking</li>
                <li>Receive system and executive notification alerts</li>
                <li>Manage Campus One verified profile theme preferences</li>
              </ul>
            </div>

            {/* Forbidden Capabilities */}
            <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
              <span className="font-bold text-destructive flex items-center gap-1.5 text-xs">
                <ShieldAlert className="h-4 w-4" />
                Reserved &amp; Forbidden Operations
              </span>
              <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                <li><strong>No proposal approvals</strong> (Staff Advisor &amp; Admin only)</li>
                <li><strong>No administrative decisions</strong> (Student Affairs only)</li>
                <li><strong>No dues collection or waiver tools</strong> (Treasurer &amp; SA)</li>
                <li><strong>No join-request intake reviews</strong> (President only)</li>
                <li><strong>No role or leadership assignments</strong> (President &amp; SA)</li>
                <li><strong>No club creation or chartering</strong> (Administration only)</li>
                <li><strong>No attendance QR scanning/management</strong> (President/Check-in Lead)</li>
                <li><strong>No institutional announcement creation</strong> (President only)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
