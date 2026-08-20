import { Filter, Search, X } from "lucide-react";

export type NotificationCategoryFilter = "all" | "unread" | "task" | "event" | "directive" | "institutional";

interface NotificationFilterBarProps {
  activeFilter: NotificationCategoryFilter;
  onFilterChange: (filter: NotificationCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    unread: number;
    task: number;
    event: number;
    directive: number;
    institutional: number;
  };
}

export function NotificationFilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts
}: NotificationFilterBarProps) {
  const filterTabs: Array<{ id: NotificationCategoryFilter; label: string; count: number }> = [
    { id: "all", label: "All Alerts", count: counts.all },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "task", label: "Tasks", count: counts.task },
    { id: "event", label: "Events", count: counts.event },
    { id: "directive", label: "Directives", count: counts.directive },
    { id: "institutional", label: "Institutional", count: counts.institutional }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : tab.id === "unread" && tab.count > 0
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="relative md:w-64">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-border/80 bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
