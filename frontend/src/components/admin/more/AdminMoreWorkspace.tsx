import { useMemo, useState } from "react";
import {
  ADMIN_LAUNCHER_DESTINATIONS,
  type AdminLauncherDestination
} from "@/data/adminMoreData";
import { AdminMoreHeader } from "@/components/admin/more/AdminMoreHeader";
import { AdminMoreCard } from "@/components/admin/more/AdminMoreCard";
import { Info, SearchX, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AdminMoreWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(ADMIN_LAUNCHER_DESTINATIONS.map((d) => d.category))
    );
    return ["All", ...unique];
  }, []);

  const filteredDestinations = useMemo(() => {
    return ADMIN_LAUNCHER_DESTINATIONS.filter((dest) => {
      const matchesCategory =
        selectedCategory === "All" || dest.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = dest.title.toLowerCase().includes(q);
      const inShortTitle = dest.shortTitle.toLowerCase().includes(q);
      const inCategory = dest.category.toLowerCase().includes(q);
      const inDesc = dest.description.toLowerCase().includes(q);
      const inKeywords = dest.keywords.some((k) => k.toLowerCase().includes(q));

      return inTitle || inShortTitle || inCategory || inDesc || inKeywords;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in pb-16">
      {/* Header with Search and Category Filters */}
      <AdminMoreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        totalResults={filteredDestinations.length}
      />

      {/* Destinations Grid or Empty Search State */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <AdminMoreCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-foreground">
            No matching destinations found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            No administrative portal matched &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;events&rdquo;, &ldquo;feedback&rdquo;, &ldquo;analytics&rdquo;, or &ldquo;profile&rdquo;.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4 text-xs h-8"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Institutional Policy & Scope Explanation */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>About More</span>
        </div>
        <p className="leading-relaxed">
          These tools sit outside your main navigation. You can change between light and dark mode on your <Link to="/admin/profile" className="text-primary hover:underline font-medium">Profile</Link> page.
        </p>
      </div>
    </div>
  );
}
