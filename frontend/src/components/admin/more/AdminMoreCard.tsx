import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { type AdminLauncherDestination } from "@/data/adminMoreData";

interface AdminMoreCardProps {
  destination: AdminLauncherDestination;
}

export function AdminMoreCard({ destination }: AdminMoreCardProps) {
  const Icon = destination.icon;

  return (
    <Link
      id={`admin-launcher-${destination.id}`}
      to={destination.url}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-180 hover:border-primary/50 hover:bg-muted/20 hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="space-y-3">
        {/* Card Header: Icon, Category & Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-180 group-hover:scale-105 ${destination.accentClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {destination.category}
              </span>
              <h2 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                {destination.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {destination.description}
        </p>
      </div>

      {/* Footer Details: Badge & Launch Action */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        {destination.badge ? (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {destination.badge}
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
          <span>Open Portal</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-180 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
