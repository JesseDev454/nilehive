import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listClubs } from "@/lib/api/clubs";
import { getEventEngagement, listAllApprovedEvents, listEventReports, submitEventAttendance } from "@/lib/api/events";
import { listAdminUsers } from "@/lib/api/people";
import { mergeEventEngagement, toAdminEventView } from "@/lib/events/adapters";
import { isAbortError, normalizeEventsError, type EventsUiError } from "@/lib/events/errors";
import { getEventLifecycle } from "@/lib/events/lifecycle";
import { mockAdminEvents } from "@/lib/events/mockEvents";
import type { AdminEventView, AttendanceRecord, EventReportRecord } from "@/lib/events/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import type { ClubRecord } from "@/lib/clubs/types";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: AdminEventView[];
  error: EventsUiError | null;
}

const EMPTY_DIRECTORY: DirectoryState = {
  status: "idle",
  items: [],
  error: null,
};

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

function clubNameMap(clubs: ClubRecord[]): Map<string, string> {
  return new Map(clubs.map((club) => [club.id, club.name]));
}

function reportsByProposal(reports: EventReportRecord[]): Map<string, EventReportRecord> {
  return new Map(reports.map((report) => [report.proposal_id, report]));
}

export function useAdminEventsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode ? { status: "ready", items: mockAdminEvents(), error: null } : EMPTY_DIRECTORY,
  );
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<AdminEventView | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState<EventsUiError | null>(null);
  const [checkInError, setCheckInError] = useState<EventsUiError | null>(null);
  const [mutatingIds, setMutatingIds] = useState<string[]>([]);
  const mutatingIdsRef = useRef<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const directoryController = useRef<AbortController | null>(null);
  const detailController = useRef<AbortController | null>(null);
  const mockEventsRef = useRef(mockAdminEvents());
  const selectedIdRef = useRef<string | null>(null);

  const source = mockMode ? "mock" : "integrated";

  const lockMutation = (eventId: string) => {
    if (mutatingIdsRef.current.has(eventId)) return false;
    mutatingIdsRef.current.add(eventId);
    setMutatingIds([...mutatingIdsRef.current]);
    return true;
  };

  const unlockMutation = (eventId: string) => {
    mutatingIdsRef.current.delete(eventId);
    setMutatingIds([...mutatingIdsRef.current]);
  };

  const failRequest = useCallback(
    (error: unknown): EventsUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizeEventsError(error);
    },
    [reportAuthFailure],
  );

  const replaceEvent = useCallback((event: AdminEventView) => {
    setDirectory((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === event.id ? event : item)),
    }));
    setSelected((current) => (current?.id === event.id ? event : current));
  }, []);

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        setDirectory({
          status: readyOrEmpty(mockEventsRef.current.length),
          items: mockEventsRef.current,
          error: null,
        });
        setClubs(
          [...new Map(mockEventsRef.current.map((event) => [event.clubId, event.clubName])).entries()].map(
            ([id, name]) => ({ id, name }),
          ),
        );
        return;
      }

      directoryController.current?.abort();
      const controller = new AbortController();
      directoryController.current = controller;

      setDirectory((current) => ({
        ...current,
        status: refreshing && current.items.length ? "refreshing" : "loading",
        error: null,
      }));

      try {
        const events = await listAllApprovedEvents(controller.signal);
        let clubRecords: ClubRecord[] = [];
        try {
          clubRecords = await listClubs(controller.signal);
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
        }
        setClubs(clubRecords.map((club) => ({ id: club.id, name: club.name })));
        const names = clubNameMap(clubRecords);

        let reports: EventReportRecord[] = [];
        let reportsLoaded = true;
        try {
          const reportPage = await listEventReports({ page: 1, page_size: 100, signal: controller.signal });
          reports = reportPage.items;
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
          reportsLoaded = false;
        }
        const reportMap = reportsByProposal(reports);

        const items = events.map((event) =>
          toAdminEventView(event, {
            clubName: names.get(event.club_id) ?? null,
            report: reportMap.get(event.id) ?? null,
            reportsLoaded,
          }),
        );
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
        setLiveMessage(
          items.length
            ? `Loaded ${items.length} approved campus events.`
            : "No approved events are available.",
        );

        const selectedId = selectedIdRef.current;
        if (selectedId) {
          const nextSelected = items.find((item) => item.id === selectedId) ?? null;
          setSelected(nextSelected);
          if (!nextSelected) {
            selectedIdRef.current = null;
            setDetailStatus("idle");
          }
        }
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDirectory({
          status: mapped.kind === "forbidden" ? "forbidden" : "error",
          items: [],
          error: mapped,
        });
        setSelected(null);
        selectedIdRef.current = null;
        setLiveMessage(mapped.message);
      }
    },
    [failRequest, mockMode],
  );

  const openEvent = useCallback(
    async (event: AdminEventView) => {
      selectedIdRef.current = event.id;
      setSelected(event);
      setDetailError(null);
      setCheckInError(null);

      if (mockMode || event.engagementLoaded) {
        setDetailStatus("ready");
        return;
      }

      detailController.current?.abort();
      const controller = new AbortController();
      detailController.current = controller;
      setDetailStatus("loading");

      try {
        const engagement = await getEventEngagement(event.proposalId, controller.signal);
        const next = mergeEventEngagement(event, engagement);
        replaceEvent(next);
        setDetailStatus("ready");
        setLiveMessage(`Loaded roster for ${next.title}.`);
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        if (mapped.kind === "not_found") {
          setDirectory((current) => {
            const items = current.items.filter((item) => item.id !== event.id);
            return {
              ...current,
              items,
              status: readyOrEmpty(items.length),
            };
          });
        }
        setDetailStatus("error");
        setDetailError(mapped);
        setLiveMessage(mapped.message);
      }
    },
    [failRequest, mockMode, replaceEvent],
  );

  const closeEvent = useCallback(() => {
    selectedIdRef.current = null;
    setSelected(null);
    setDetailStatus("idle");
    setDetailError(null);
    detailController.current?.abort();
  }, []);

  const checkInStudent = useCallback(
    async (event: AdminEventView, input: { studentId: string; studentName: string }) => {
      if (!lockMutation(event.id)) return { ok: false as const, alreadyInFlight: true as const };
      setCheckInError(null);

      try {
        let current = event;
        if (!mockMode && !current.engagementLoaded) {
          const engagement = await getEventEngagement(event.proposalId);
          current = mergeEventEngagement(event, engagement);
          replaceEvent(current);
        }

        if (mockMode) {
          const already = event.attendanceRoster.some(
            (row) => row.studentId.toLowerCase() === input.studentId.trim().toLowerCase(),
          );
          if (already) {
            const mapped: EventsUiError = {
              kind: "conflict",
              status: 409,
              code: "ALREADY_CHECKED_IN",
              message: "This student is already verified and recorded in the attendance roster.",
              retryAfter: null,
            };
            setCheckInError(mapped);
            return { ok: false as const, error: mapped };
          }
          const record: AttendanceRecord = {
            id: `att-${Date.now()}`,
            userId: `mock-${input.studentId}`,
            studentId: input.studentId.trim().toUpperCase(),
            studentName: input.studentName.trim(),
            studentEmail: null,
            checkedInAt: new Date().toISOString(),
            checkInMethod: "manual_fallback",
            verifiedBy: "Directorate Admin",
          };
          const next: AdminEventView = {
            ...event,
            attendeesCount: (event.attendeesCount ?? 0) + 1,
            attendanceRoster: [record, ...event.attendanceRoster],
          };
          mockEventsRef.current = mockEventsRef.current.map((item) => (item.id === event.id ? next : item));
          replaceEvent(next);
          setLiveMessage(`Manually checked in ${record.studentName}.`);
          return { ok: true as const, event: next, attendee: record };
        }

        const lookup = await listAdminUsers({
          q: input.studentId.trim(),
          role: "student",
          page: 1,
          page_size: 20,
        });
        const match = lookup.items.find((person) => {
          const studentId = (person.student_id || "").trim().toLowerCase();
          return studentId === input.studentId.trim().toLowerCase() || person.id === input.studentId.trim();
        });
        if (!match) {
          const mapped: EventsUiError = {
            kind: "not_found",
            status: 404,
            code: "PROFILE_NOT_FOUND",
            message: "No student profile matches that matric / student ID.",
            field: "studentId",
            retryAfter: null,
          };
          setCheckInError(mapped);
          return { ok: false as const, error: mapped };
        }

        const already = current.attendanceRoster.some((row) => row.userId === match.id);
        if (already) {
          const mapped: EventsUiError = {
            kind: "conflict",
            status: 409,
            code: "ALREADY_CHECKED_IN",
            message: "This student is already verified and recorded in the attendance roster.",
            retryAfter: null,
          };
          setCheckInError(mapped);
          return { ok: false as const, error: mapped };
        }

        await submitEventAttendance(current.proposalId, { user_id: match.id, attended: true });
        const engagement = await getEventEngagement(current.proposalId);
        const next = mergeEventEngagement(current, engagement);
        replaceEvent(next);
        setLiveMessage(`Manually checked in ${match.full_name || "the student"}.`);
        return { ok: true as const, event: next };
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return { ok: false as const, error: mapped };
        setCheckInError(mapped);
        if (mapped.kind === "not_found") {
          await loadDirectory(true);
          setSelected(null);
          selectedIdRef.current = null;
        }
        return { ok: false as const, error: mapped };
      } finally {
        unlockMutation(event.id);
      }
    },
    [failRequest, loadDirectory, mockMode, replaceEvent],
  );

  useEffect(() => {
    void loadDirectory();
    return () => {
      directoryController.current?.abort();
      detailController.current?.abort();
    };
  }, [loadDirectory]);

  const counts = useMemo(() => {
    const items = directory.items;
    return {
      all: items.length,
      today: items.filter((event) => getEventLifecycle(event.eventDate) === "happening_today").length,
      upcoming: items.filter((event) => getEventLifecycle(event.eventDate) === "upcoming").length,
      past: items.filter((event) => getEventLifecycle(event.eventDate) === "past").length,
    };
  }, [directory.items]);

  return {
    source,
    mockMode,
    directory,
    clubs,
    counts,
    selected,
    detailStatus,
    detailError,
    checkInError,
    mutatingIds,
    liveMessage,
    loadDirectory,
    openEvent,
    closeEvent,
    checkInStudent,
    isMutating: (eventId: string) => mutatingIds.includes(eventId),
  };
}
