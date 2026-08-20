import { LayoutGrid, Search, Shield, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminMoreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  totalResults: number;
}

export function AdminMoreHeader({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalResults
}: AdminMoreHeaderProps) {
  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      {/* Title & Eyebrow */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>Admin</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          More
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Open the other tools you use less often.
        </p>
      </div>

      {/* Search Bar & Destination Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search More..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-10 text-xs sm:text-sm rounded-xl border-border bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>
            {totalResults} {totalResults === 1 ? "destination" : "destinations"} available
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-180 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
