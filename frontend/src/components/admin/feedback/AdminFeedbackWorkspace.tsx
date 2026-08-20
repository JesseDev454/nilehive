import { useState, useMemo } from "react";
import {
  INITIAL_ADMIN_FEEDBACK,
  type AdminFeedbackCategory,
  type AdminFeedbackItem,
  type FeedbackAuthorRole
} from "@/data/adminFeedbackData";
import {
  AdminFeedbackHeader,
  type FeedbackCategoryFilter
} from "@/components/admin/feedback/AdminFeedbackHeader";
import { AdminFeedbackCard } from "@/components/admin/feedback/AdminFeedbackCard";
import { AdminFeedbackDetailModal } from "@/components/admin/feedback/AdminFeedbackDetailModal";
import { MessageSquareOff, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminFeedbackWorkspace() {
  const [feedbackList] = useState<AdminFeedbackItem[]>(INITIAL_ADMIN_FEEDBACK);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategoryFilter>("all");
  const [selectedRole, setSelectedRole] = useState<"all" | FeedbackAuthorRole>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingItem, setInspectingItem] = useState<AdminFeedbackItem | null>(null);

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.authorName.toLowerCase().includes(query) ||
        (item.studentId && item.studentId.toLowerCase().includes(query)) ||
        (item.clubName && item.clubName.toLowerCase().includes(query));

      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesRole =
        selectedRole === "all" || item.authorRole === selectedRole;

      return matchesSearch && matchesCat && matchesRole;
    });
  }, [feedbackList, selectedCategory, selectedRole, searchTerm]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16">
      {/* Header, Transparency Statement & Filters */}
      <AdminFeedbackHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={feedbackList.length}
      />

      {/* Populated Grid or Empty State */}
      {filteredFeedback.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No feedback matching filters</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedRole("all");
              setSearchTerm("");
            }}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedback.map((item) => (
            <AdminFeedbackCard
              key={item.id}
              feedback={item}
              onInspect={(fb) => setInspectingItem(fb)}
            />
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <AdminFeedbackDetailModal
        feedback={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
      />
    </div>
  );
}
