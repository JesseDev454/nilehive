import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AdminClubsHeader } from "./AdminClubsHeader";
import { AdminClubCard } from "./AdminClubCard";
import { AdminClubDetailModal } from "./AdminClubDetailModal";
import { AdminClubEditSheet } from "./AdminClubEditSheet";
import { ClubsDirectoryStatus } from "./ClubsDirectoryStatus";
import { useAdminClubsData } from "./useAdminClubsData";
import type { AdminClubView } from "@/lib/clubs/types";

export function AdminClubsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminClubsData(reportAuthFailure);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const visible = useMemo(
    () =>
      data.directory.items.filter((club) => {
        const matchesCategory =
          category === "All" || club.categoryLabel === category || club.categories.includes(category);
        const haystack = `${club.name} ${club.code ?? ""} ${club.presidentName ?? ""} ${club.tags.join(" ")} ${club.categories.join(" ")}`.toLowerCase();
        return matchesCategory && haystack.includes(search.toLowerCase());
      }),
    [category, data.directory.items, search],
  );

  const filteredEmpty =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    data.directory.items.length > 0 &&
    visible.length === 0;
  const showGrid = (data.directory.status === "ready" || data.directory.status === "refreshing") && visible.length > 0;

  const openEditor = (club: AdminClubView) => {
    data.closeClub();
    data.openEditor(club);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 pb-16" data-clubs-source={data.source}>
      <AdminClubsHeader
        totalClubs={data.directory.items.length}
        searchTerm={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        categories={data.categories}
      />

      <div className="sr-only" aria-live="polite">
        {data.liveMessage}
      </div>

      <ClubsDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
      />

      {showGrid ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((club) => (
            <AdminClubCard key={club.id} club={club} onInspect={data.openClub} onEdit={openEditor} />
          ))}
        </div>
      ) : null}

      <AdminClubDetailModal
        club={data.selected}
        open={Boolean(data.selected)}
        onOpenChange={(open) => {
          if (!open) data.closeClub();
        }}
        onEditClub={openEditor}
        detailStatus={data.detailStatus}
        detailError={data.detailError}
        onRetry={() => {
          if (data.selected) void data.loadClubDetails(data.selected);
        }}
      />
      <AdminClubEditSheet
        club={data.editing}
        open={Boolean(data.editing)}
        onOpenChange={(open) => {
          if (!open) data.closeEditor();
        }}
        onSaveClub={async (club, input) => {
          const saved = await data.saveClub(club, input);
          if (saved) toast.success(`Updated settings & payment directives for ${club.name}.`);
          return saved;
        }}
        saving={Boolean(data.editing && data.isMutating(data.editing.id))}
        saveError={data.saveError}
      />
    </section>
  );
}
