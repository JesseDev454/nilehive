import { Link } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  UserCircle,
  type LucideIcon
} from "lucide-react";

interface NavTileItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
  badgeType?: "urgent" | "normal" | "primary";
}

interface ExecutiveMoreNavGridProps {
  unreadNotificationCount?: number;
}

export function ExecutiveMoreNavGrid({ unreadNotificationCount = 2 }: ExecutiveMoreNavGridProps) {
  const destinations: NavTileItem[] = [
    {
      title: "Notifications",
      url: "/executive/notifications",
      icon: Bell,
      description: "See task updates, event notices, and club messages.",
      badge: unreadNotificationCount > 0 ? `${unreadNotificationCount} Unread` : undefined,
      badgeType: "urgent"
    },
    {
      title: "Profile",
      url: "/executive/profile",
      icon: UserCircle,
      description: "View your read-only Campus One identity and club appointment.",
      badge: "Verified",
      badgeType: "primary"
    }
  ];

  return (
    <section id="more-destinations-section" aria-labelledby="more-destinations-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="more-destinations-heading" className="text-sm font-bold text-foreground">
          Account
        </h3>
        <span className="text-[11px] text-muted-foreground font-mono">
          {destinations.length} destinations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {destinations.map((dest) => {
          const Icon = dest.icon;
          return (
            <Link
              key={dest.title}
              to={dest.url}
              className="group block rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-primary/50 hover:bg-muted/10 hover:shadow-sm relative"
            >
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {dest.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        dest.badgeType === "urgent"
                          ? "bg-destructive/15 text-destructive border border-destructive/25"
                          : dest.badgeType === "primary"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {dest.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="mt-3.5 space-y-1">
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {dest.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {dest.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
