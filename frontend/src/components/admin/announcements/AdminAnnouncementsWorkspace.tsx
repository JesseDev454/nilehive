import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AdminAnnouncementsHeader,
  type AudienceFilterTab,
} from "@/components/admin/announcements/AdminAnnouncementsHeader";
import { AdminAnnouncementCard } from "@/components/admin/announcements/AdminAnnouncementCard";
import { AdminAnnouncementComposerDialog } from "@/components/admin/announcements/AdminAnnouncementComposerDialog";
import { AdminAnnouncementDetailModal } from "@/components/admin/announcements/AdminAnnouncementDetailModal";
import { AnnouncementsDirectoryStatus } from "@/components/admin/announcements/AnnouncementsDirectoryStatus";
import { useAdminAnnouncementsData } from "@/components/admin/announcements/useAdminAnnouncementsData";
import type { AdminAnnouncementView, AnnouncementPriorityLevel } from "@/lib/announcements/types";

export function AdminAnnouncementsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminAnnouncementsData(reportAuthFailure);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeAudienceTab, setActiveAudienceTab] = useState<AudienceFilterTab>("all");
  const [selectedPriority, setSelectedPriority] = useState<"all" | AnnouncementPriorityLevel>("all");
  const [selectedClubFilter, setSelectedClubFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<AdminAnnouncementView | null>(null);

  useEffect(() => {
    if (searchParams.get("compose") === "true" || searchParams.get("action") === "new") {
      setComposerOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("compose");
      next.delete("action");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredAnnouncements = useMemo(() => {
    return data.directory.items.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.publishedBy.toLowerCase().includes(query) ||
        (item.targetClubName && item.targetClubName.toLowerCase().includes(query));
      const matchesAudience = activeAudienceTab === "all" || item.audience === activeAudienceTab;
      const matchesPriority = selectedPriority === "all" || item.priority === selectedPriority;
      const matchesClub = selectedClubFilter === "all" || item.targetClubId === selectedClubFilter;
      return matchesSearch && matchesAudience && matchesPriority && matchesClub;
    });
  }, [activeAudienceTab, data.directory.items, searchTerm, selectedClubFilter, selectedPriority]);

  const filteredEmpty =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    data.directory.items.length > 0 &&
    filteredAnnouncements.length === 0;
  const showGrid =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    filteredAnnouncements.length > 0;

  const resetFilters = () => {
    setActiveAudienceTab("all");
    setSelectedPriority("all");
    setSelectedClubFilter("all");
    setSearchTerm("");
  };

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16"
      data-announcements-source={data.source}
    >
      <AdminAnnouncementsHeader
        activeAudienceTab={activeAudienceTab}
        onAudienceTabChange={setActiveAudienceTab}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedClubFilter={selectedClubFilter}
        onClubFilterChange={setSelectedClubFilter}
        clubs={data.clubs}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onComposeClick={() => setComposerOpen(true)}
        totalCount={data.directory.items.length}
      />

      <div className="sr-only" aria-live="polite">
        {data.liveMessage}
      </div>

      <AnnouncementsDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
        onResetFilters={resetFilters}
      />

      {showGrid ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((ann) => (
            <AdminAnnouncementCard
              key={ann.id}
              announcement={ann}
              onInspect={(item) => setInspectingItem(item)}
            />
          ))}
        </div>
      ) : null}

      <AdminAnnouncementComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        clubs={data.clubs}
        publishing={data.publishing}
        publishError={data.publishError}
        mockMode={data.mockMode}
        onPublish={data.publish}
      />

      <AdminAnnouncementDetailModal
        announcement={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
      />
    </div>
  );
}
