import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AdminFeedbackHeader,
  type FeedbackCategoryFilter,
} from "@/components/admin/feedback/AdminFeedbackHeader";
import { AdminFeedbackCard } from "@/components/admin/feedback/AdminFeedbackCard";
import { AdminFeedbackDetailModal } from "@/components/admin/feedback/AdminFeedbackDetailModal";
import { FeedbackDirectoryStatus } from "@/components/admin/feedback/FeedbackDirectoryStatus";
import { useAdminFeedbackData } from "@/components/admin/feedback/useAdminFeedbackData";
import type { AdminFeedbackView, FeedbackAuthorRole } from "@/lib/feedback/types";

export function AdminFeedbackWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminFeedbackData(reportAuthFailure);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategoryFilter>("all");
  const [selectedRole, setSelectedRole] = useState<"all" | FeedbackAuthorRole>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectingItem, setInspectingItem] = useState<AdminFeedbackView | null>(null);

  const filteredFeedback = useMemo(() => {
    return data.directory.items.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.authorName.toLowerCase().includes(query) ||
        (item.studentId && item.studentId.toLowerCase().includes(query)) ||
        (item.clubName && item.clubName.toLowerCase().includes(query));
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchesRole = selectedRole === "all" || item.authorRole === selectedRole;
      return matchesSearch && matchesCat && matchesRole;
    });
  }, [data.directory.items, selectedCategory, selectedRole, searchTerm]);

  const filteredEmpty =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    data.directory.items.length > 0 &&
    filteredFeedback.length === 0;
  const showGrid =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    filteredFeedback.length > 0;

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16"
      data-feedback-source={data.source}
    >
      <AdminFeedbackHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={data.directory.items.length}
      />

      <FeedbackDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
        onResetFilters={() => {
          setSelectedCategory("all");
          setSelectedRole("all");
          setSearchTerm("");
        }}
      />

      {showGrid ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedback.map((item) => (
            <AdminFeedbackCard key={item.id} feedback={item} onInspect={(fb) => setInspectingItem(fb)} />
          ))}
        </div>
      ) : null}

      <AdminFeedbackDetailModal
        feedback={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
      />
    </div>
  );
}
