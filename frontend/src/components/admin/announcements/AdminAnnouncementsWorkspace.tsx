import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  INITIAL_ADMIN_ANNOUNCEMENTS,
  type AdminAnnouncementItem,
  type AnnouncementAudienceType,
  type AnnouncementPriorityLevel
} from "@/data/adminAnnouncementsData";
import {
  AdminAnnouncementsHeader,
  type AudienceFilterTab
} from "@/components/admin/announcements/AdminAnnouncementsHeader";
import { AdminAnnouncementCard } from "@/components/admin/announcements/AdminAnnouncementCard";
import { AdminAnnouncementComposerDialog } from "@/components/admin/announcements/AdminAnnouncementComposerDialog";
import { AdminAnnouncementDetailModal } from "@/components/admin/announcements/AdminAnnouncementDetailModal";
import { MegaphoneOff, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminAnnouncementsWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<AdminAnnouncementItem[]>(
    INITIAL_ADMIN_ANNOUNCEMENTS
  );

  const [activeAudienceTab, setActiveAudienceTab] = useState<AudienceFilterTab>("all");
  const [selectedPriority, setSelectedPriority] = useState<"all" | AnnouncementPriorityLevel>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Composer & Inspection Dialog States
  const [composerOpen, setComposerOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<AdminAnnouncementItem | null>(null);

  // Check if deep-linked to compose from Home primary action
  useEffect(() => {
    if (searchParams.get("compose") === "true" || searchParams.get("action") === "new") {
      setComposerOpen(true);
    }
  }, [searchParams]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.publishedBy.toLowerCase().includes(query) ||
        (item.targetClubName && item.targetClubName.toLowerCase().includes(query));

      const matchesAudience =
        activeAudienceTab === "all" || item.audience === activeAudienceTab;

      const matchesPriority =
        selectedPriority === "all" || item.priority === selectedPriority;

      return matchesSearch && matchesAudience && matchesPriority;
    });
  }, [announcements, activeAudienceTab, selectedPriority, searchTerm]);

  const handlePublished = (newAnnouncement: AdminAnnouncementItem) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16">
      {/* Header, Filters & Primary Publish Action */}
      <AdminAnnouncementsHeader
        activeAudienceTab={activeAudienceTab}
        onAudienceTabChange={setActiveAudienceTab}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onComposeClick={() => setComposerOpen(true)}
        totalCount={announcements.length}
      />

      {/* Populated Grid or Empty Results */}
      {filteredAnnouncements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No announcements found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No official broadcasts match your current audience or priority filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveAudienceTab("all");
              setSelectedPriority("all");
              setSearchTerm("");
            }}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((ann) => (
            <AdminAnnouncementCard
              key={ann.id}
              announcement={ann}
              onInspect={(item) => setInspectingItem(item)}
            />
          ))}
        </div>
      )}

      {/* Broadcast Composer Dialog */}
      <AdminAnnouncementComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        onPublished={handlePublished}
      />

      {/* Detail Inspection Modal */}
      <AdminAnnouncementDetailModal
        announcement={inspectingItem}
        open={!!inspectingItem}
        onOpenChange={(open) => !open && setInspectingItem(null)}
      />
    </div>
  );
}
