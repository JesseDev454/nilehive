import { Calendar, CalendarDays, Filter, Flame, History, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OFFICIAL_14_CLUBS } from "@/data/mockData";

export type EventTabFilter = "all" | "happening_today" | "upcoming" | "past";

interface AdminEventsHeaderProps {
  activeTab: EventTabFilter;
  onTabChange: (tab: EventTabFilter) => void;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    past: number;
  };
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedClubFilter: string;
  onClubFilterChange: (val: string) => void;
}

export function AdminEventsHeader({
  activeTab,
  onTabChange,
  counts,
  searchTerm,
  onSearchChange,
  selectedClubFilter,
  onClubFilterChange
}: AdminEventsHeaderProps) {
  const tabs = [
    { id: "all" as const, label: "All Approved Events", count: counts.all, icon: Calendar },
    { id: "happening_today" as const, label: "Happening Today", count: counts.today, icon: Flame },
    { id: "upcoming" as const, label: "Upcoming", count: counts.upcoming, icon: CalendarDays },
    { id: "past" as const, label: "Past Events", count: counts.past, icon: History }
  ];

  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Campus Events &amp; Attendance Operations</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Authorized Campus Events
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
          Monitor approved event proposals, display official Organizer QR check-in codes, review live attendance rosters, and audit post-event compliance reports.
        </p>
      </div>

      {/* 4 Lifecycle Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isTodayTab = tab.id === "happening_today";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-180 ${
                isActive
                  ? isTodayTab
                    ? "bg-amber-600 text-white shadow-2xs scale-[1.01]"
                    : "bg-primary text-primary-foreground shadow-2xs scale-[1.01]"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background text-foreground border border-border/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Club Filtering */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search events by title, venue, organizer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={selectedClubFilter} onValueChange={onClubFilterChange}>
            <SelectTrigger className="w-[200px] text-xs h-9 bg-background">
              <SelectValue placeholder="All 14 Official Clubs" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All 14 Official Clubs</SelectItem>
              {OFFICIAL_14_CLUBS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
