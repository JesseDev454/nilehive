import { Filter, Lock, School, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminClubsHeaderProps {
  totalClubs: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function AdminClubsHeader({
  totalClubs,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}: AdminClubsHeaderProps) {
  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <School className="h-4 w-4 text-primary" />
            <span>Campus Organization Registry</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3 w-3" />
              Official 14 Clubs
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Club Registry &amp; Payment Directives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Maintain public profiles, cover media, dues settings, and bank transfer payment instructions across Nile University's 14 official clubs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-xl border border-border bg-card px-3 py-1.5 shadow-2xs text-center">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Institutional Clubs</span>
            <span className="text-sm font-bold text-foreground font-mono">{totalClubs} / 14 Active</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Chips */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by club name, code, president, tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-180 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
