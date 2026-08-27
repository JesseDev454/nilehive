import { MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getRoleNavItems, isNavItemActive } from "@/lib/appNavigation";
import { useRole } from "@/contexts/RoleContext";

export function MobileBottomNavigation() {
  const { role } = useRole();
  const { pathname, search } = useLocation();
  const items = getRoleNavItems(role);
  const visible = role === "admin" ? items.slice(0, 4) : items.slice(0, 5);
  const hasMore = items.length > visible.length;
  const isProfileActive = isNavItemActive("/profile", pathname, search);

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 shadow-[0_-6px_20px_rgba(16,42,67,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5">
        {visible.map((item) => {
          const active = isNavItemActive(item.url, pathname, search);
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              to={item.url}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                active ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate">{item.shortTitle ?? item.title}</span>
            </Link>
          );
        })}
        {hasMore ? (
          <Link
            to="/profile"
            aria-current={isProfileActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              isProfileActive ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span>More</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
