import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminEventsHeader, type EventTabFilter } from "@/components/admin/events/AdminEventsHeader";
import { AdminEventCard } from "@/components/admin/events/AdminEventCard";
import { AdminEventDetailModal } from "@/components/admin/events/AdminEventDetailModal";
import { AdminOrganizerQRModal } from "@/components/admin/events/AdminOrganizerQRModal";
import { AdminManualCheckInModal } from "@/components/admin/events/AdminManualCheckInModal";
import { EventsDirectoryStatus } from "@/components/admin/events/EventsDirectoryStatus";
import { useAdminEventsData } from "@/components/admin/events/useAdminEventsData";
import { getEventLifecycle } from "@/lib/events/lifecycle";
import type { AdminEventView } from "@/lib/events/types";

export function AdminEventsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const data = useAdminEventsData(reportAuthFailure);
  const [activeTab, setActiveTab] = useState<EventTabFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClubFilter, setSelectedClubFilter] = useState("all");
  const [qrModalEvent, setQrModalEvent] = useState<AdminEventView | null>(null);
  const [manualCheckInEvent, setManualCheckInEvent] = useState<AdminEventView | null>(null);

  const filteredEvents = useMemo(() => {
    return data.directory.items.filter((evt) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        evt.title.toLowerCase().includes(query) ||
        evt.venue.toLowerCase().includes(query) ||
        evt.clubName.toLowerCase().includes(query) ||
        (evt.organizerName || "").toLowerCase().includes(query);

      const lifecycle = getEventLifecycle(evt.eventDate);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "happening_today" && lifecycle === "happening_today") ||
        (activeTab === "upcoming" && lifecycle === "upcoming") ||
        (activeTab === "past" && lifecycle === "past");

      const matchesClub = selectedClubFilter === "all" || evt.clubId === selectedClubFilter;
      return matchesSearch && matchesTab && matchesClub;
    });
  }, [activeTab, data.directory.items, searchTerm, selectedClubFilter]);

  const filteredEmpty =
    (data.directory.status === "ready" || data.directory.status === "refreshing") &&
    data.directory.items.length > 0 &&
    filteredEvents.length === 0;
  const showGrid =
    (data.directory.status === "ready" || data.directory.status === "refreshing") && filteredEvents.length > 0;

  const resetFilters = () => {
    setActiveTab("all");
    setSearchTerm("");
    setSelectedClubFilter("all");
  };

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16"
      data-events-source={data.source}
    >
      <AdminEventsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={data.counts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClubFilter={selectedClubFilter}
        onClubFilterChange={setSelectedClubFilter}
        clubs={data.clubs}
      />

      <div className="sr-only" aria-live="polite">
        {data.liveMessage}
      </div>

      <EventsDirectoryStatus
        status={data.directory.status}
        error={data.directory.error}
        filteredEmpty={filteredEmpty}
        onRetry={() => void data.loadDirectory()}
        onResetFilters={resetFilters}
      />

      {showGrid ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <AdminEventCard
              key={evt.id}
              event={evt}
              onInspect={(event) => void data.openEvent(event)}
              onDisplayQR={(event) => setQrModalEvent(event)}
              onManualCheckIn={(event) => setManualCheckInEvent(event)}
            />
          ))}
        </div>
      ) : null}

      <AdminEventDetailModal
        event={data.selected}
        open={Boolean(data.selected)}
        onOpenChange={(open) => {
          if (!open) data.closeEvent();
        }}
        onDisplayQR={(event) => setQrModalEvent(event)}
        onManualCheckIn={(event) => setManualCheckInEvent(event)}
        detailStatus={data.detailStatus}
        detailError={data.detailError}
        onRetry={() => {
          if (data.selected) void data.openEvent(data.selected);
        }}
      />

      <AdminOrganizerQRModal
        event={qrModalEvent}
        open={!!qrModalEvent}
        onOpenChange={(open) => !open && setQrModalEvent(null)}
      />

      <AdminManualCheckInModal
        event={manualCheckInEvent}
        open={!!manualCheckInEvent}
        onOpenChange={(open) => {
          if (!open) setManualCheckInEvent(null);
        }}
        submitting={manualCheckInEvent ? data.isMutating(manualCheckInEvent.id) : false}
        error={data.checkInError}
        onSubmit={async (event, payload) => {
          const result = await data.checkInStudent(event, payload);
          return result.ok;
        }}
      />
    </div>
  );
}
