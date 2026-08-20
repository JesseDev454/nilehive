import { useState, useMemo } from "react";
import {
  INITIAL_ADMIN_EVENTS,
  type AdminEventRecord,
  type AttendanceRecord,
  computeEventLifecycle
} from "@/data/adminEventsData";
import {
  AdminEventsHeader,
  type EventTabFilter
} from "@/components/admin/events/AdminEventsHeader";
import { AdminEventCard } from "@/components/admin/events/AdminEventCard";
import { AdminEventDetailModal } from "@/components/admin/events/AdminEventDetailModal";
import { AdminOrganizerQRModal } from "@/components/admin/events/AdminOrganizerQRModal";
import { AdminManualCheckInModal } from "@/components/admin/events/AdminManualCheckInModal";
import { CalendarX, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminEventsWorkspace() {
  const [events, setEvents] = useState<AdminEventRecord[]>(INITIAL_ADMIN_EVENTS);
  const [activeTab, setActiveTab] = useState<EventTabFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClubFilter, setSelectedClubFilter] = useState("all");

  // Inspection, QR, and Check-In modals
  const [inspectingEvent, setInspectingEvent] = useState<AdminEventRecord | null>(null);
  const [qrModalEvent, setQrModalEvent] = useState<AdminEventRecord | null>(null);
  const [manualCheckInEvent, setManualCheckInEvent] = useState<AdminEventRecord | null>(null);

  // Counts
  const counts = useMemo(() => {
    return {
      all: events.length,
      today: events.filter((e) => computeEventLifecycle(e.eventDate) === "happening_today").length,
      upcoming: events.filter((e) => computeEventLifecycle(e.eventDate) === "upcoming").length,
      past: events.filter((e) => computeEventLifecycle(e.eventDate) === "past").length
    };
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        evt.title.toLowerCase().includes(query) ||
        evt.venue.toLowerCase().includes(query) ||
        evt.clubName.toLowerCase().includes(query) ||
        evt.organizerName.toLowerCase().includes(query);

      const lifecycle = computeEventLifecycle(evt.eventDate);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "happening_today" && lifecycle === "happening_today") ||
        (activeTab === "upcoming" && lifecycle === "upcoming") ||
        (activeTab === "past" && lifecycle === "past");

      const matchesClub =
        selectedClubFilter === "all" || evt.clubId === selectedClubFilter;

      return matchesSearch && matchesTab && matchesClub;
    });
  }, [events, activeTab, searchTerm, selectedClubFilter]);

  // Manual Check-In Callback
  const handleCheckInSuccess = (eventId: string, newAttendee: AttendanceRecord) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedRoster = [newAttendee, ...e.attendanceRoster];
          return {
            ...e,
            attendeesCount: updatedRoster.length,
            attendanceRoster: updatedRoster
          };
        }
        return e;
      })
    );

    // If currently inspecting, update the inspected event object too
    if (inspectingEvent && inspectingEvent.id === eventId) {
      setInspectingEvent((current) =>
        current
          ? {
              ...current,
              attendeesCount: current.attendeesCount + 1,
              attendanceRoster: [newAttendee, ...current.attendanceRoster]
            }
          : null
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in pb-16">
      {/* Header & Tabs */}
      <AdminEventsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClubFilter={selectedClubFilter}
        onClubFilterChange={setSelectedClubFilter}
      />

      {/* Populated Grid or Empty Results */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No events found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No approved events match your current filter settings or search query.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTab("all");
              setSearchTerm("");
              setSelectedClubFilter("all");
            }}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <AdminEventCard
              key={evt.id}
              event={evt}
              onInspect={(e) => setInspectingEvent(e)}
              onDisplayQR={(e) => setQrModalEvent(e)}
              onManualCheckIn={(e) => setManualCheckInEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Detailed Event Inspection Modal */}
      <AdminEventDetailModal
        event={inspectingEvent}
        open={!!inspectingEvent}
        onOpenChange={(open) => !open && setInspectingEvent(null)}
        onDisplayQR={(e) => setQrModalEvent(e)}
        onManualCheckIn={(e) => setManualCheckInEvent(e)}
      />

      {/* Organizer QR Code Modal */}
      <AdminOrganizerQRModal
        event={qrModalEvent}
        open={!!qrModalEvent}
        onOpenChange={(open) => !open && setQrModalEvent(null)}
      />

      {/* Manual Check-In Modal */}
      <AdminManualCheckInModal
        event={manualCheckInEvent}
        open={!!manualCheckInEvent}
        onOpenChange={(open) => !open && setManualCheckInEvent(null)}
        onCheckInSuccess={handleCheckInSuccess}
      />
    </div>
  );
}
