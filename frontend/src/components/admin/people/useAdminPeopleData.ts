import { useCallback, useEffect, useRef, useState } from "react";
import {
  assignOneClubRole,
  getAdminUserView,
  listAdminUserViews,
  listClubsForAssignment,
  updateAdvisorAssignment,
} from "@/lib/api/people";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import { isAbortError, normalizePeopleError, type PeopleUiError } from "@/lib/people/errors";
import { mockAssignmentClubs, mockPersonDirectory } from "@/lib/people/mockPeople";
import type {
  AssignableOneClubRole,
  AssignmentClub,
  PersonDirectoryView,
  RoleUpdatePayload,
} from "@/lib/people/types";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: PersonDirectoryView[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  error: PeopleUiError | null;
}

export interface RoleCounts {
  presidents: number;
  executives: number;
  advisors: number;
  students: number;
}

interface MutationState {
  id: string;
  kind: "role" | "advisor";
}

export interface RoleAssignmentInput {
  profileId: string;
  role: AssignableOneClubRole;
  clubId: string | null;
  replaceExistingPresident?: boolean;
}

const EMPTY_DIRECTORY: DirectoryState = {
  status: "idle",
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  hasNext: false,
  error: null,
};

const EMPTY_COUNTS: RoleCounts = { presidents: 0, executives: 0, advisors: 0, students: 0 };

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

export function useAdminPeopleData(
  reportAuthFailure: (error: unknown) => boolean,
  filters: { search: string; role: string; clubId: string; page: number },
) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode
      ? {
          ...EMPTY_DIRECTORY,
          status: "ready",
          items: mockPersonDirectory(),
          total: mockPersonDirectory().length,
          pageSize: mockPersonDirectory().length || 20,
        }
      : EMPTY_DIRECTORY,
  );
  const [clubs, setClubs] = useState<AssignmentClub[]>(mockMode ? mockAssignmentClubs() : []);
  const [counts, setCounts] = useState<RoleCounts>(EMPTY_COUNTS);
  const [selected, setSelected] = useState<PersonDirectoryView | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState<PeopleUiError | null>(null);
  const [mutatingIds, setMutatingIds] = useState<string[]>([]);
  const mutatingIdsRef = useRef<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const controllers = useRef<AbortController[]>([]);
  const directoryController = useRef<AbortController | null>(null);
  const mockUsersRef = useRef(mockPersonDirectory());

  const lockMutation = (next: MutationState) => {
    if (mutatingIdsRef.current.has(next.id)) return false;
    mutatingIdsRef.current.add(next.id);
    setMutatingIds([...mutatingIdsRef.current]);
    return true;
  };

  const unlockMutation = (profileId: string) => {
    mutatingIdsRef.current.delete(profileId);
    setMutatingIds([...mutatingIdsRef.current]);
  };

  const abortAuxiliary = useCallback(() => {
    controllers.current.forEach((controller) => controller.abort());
    controllers.current = [];
  }, []);

  const track = useCallback(() => {
    const controller = new AbortController();
    controllers.current.push(controller);
    return controller;
  }, []);

  const failRequest = useCallback(
    (error: unknown): PeopleUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizePeopleError(error);
    },
    [reportAuthFailure],
  );

  const applyMockFilters = useCallback(() => {
    const users = mockUsersRef.current;
    const needle = filters.search.trim().toLowerCase();
    const visible = users.filter((user) => {
      const matchesRole = filters.role === "all" || user.oneClubRole === filters.role;
      const matchesClub =
        filters.clubId === "all" ||
        user.assignedClubId === filters.clubId ||
        user.advisorAssignments.some((assignment) => assignment.club_id === filters.clubId);
      const haystack = `${user.fullName} ${user.campusId ?? ""} ${user.email ?? ""} ${user.assignedClubName ?? ""}`.toLowerCase();
      return matchesRole && matchesClub && haystack.includes(needle);
    });
    setDirectory({
      status: readyOrEmpty(visible.length),
      items: visible,
      page: 1,
      pageSize: visible.length || 20,
      total: visible.length,
      hasNext: false,
      error: null,
    });
    setCounts({
      presidents: users.filter((user) => user.oneClubRole === "president").length,
      executives: users.filter((user) => user.oneClubRole === "executive").length,
      advisors: users.filter((user) => user.oneClubRole === "advisor").length,
      students: users.filter((user) => user.oneClubRole === "student").length,
    });
  }, [filters.clubId, filters.role, filters.search]);

  const loadCounts = useCallback(async () => {
    if (mockMode) return;
    const controller = track();
    const roles = ["president", "executive", "advisor", "student"] as const;
    try {
      const pages = await Promise.all(
        roles.map((role) =>
          listAdminUserViews({
            role,
            page: 1,
            page_size: 1,
            signal: controller.signal,
          }),
        ),
      );
      setCounts({
        presidents: pages[0].total,
        executives: pages[1].total,
        advisors: pages[2].total,
        students: pages[3].total,
      });
    } catch (error) {
      const mapped = failRequest(error);
      if (mapped === "abort" || mapped === "auth") return;
    }
  }, [failRequest, mockMode, track]);

  const loadClubs = useCallback(async () => {
    if (mockMode) return;
    const controller = track();
    try {
      setClubs(await listClubsForAssignment(controller.signal));
    } catch (error) {
      const mapped = failRequest(error);
      if (mapped === "abort" || mapped === "auth") return;
    }
  }, [failRequest, mockMode, track]);

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        applyMockFilters();
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
        const page = await listAdminUserViews({
          page: filters.page,
          page_size: 20,
          sort: "full_name",
          order: "asc",
          role: filters.role !== "all" ? filters.role : undefined,
          club_id: filters.clubId !== "all" ? filters.clubId : undefined,
          q: filters.search.trim() || undefined,
          signal: controller.signal,
        });
        setDirectory({
          status: readyOrEmpty(page.total),
          items: page.items,
          page: page.page,
          pageSize: page.page_size,
          total: page.total,
          hasNext: page.has_next,
          error: null,
        });
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDirectory((current) => ({
          status: mapped.kind === "forbidden" ? "forbidden" : "error",
          items: mapped.kind === "forbidden" ? [] : current.items,
          page: current.page,
          pageSize: current.pageSize,
          total: mapped.kind === "forbidden" ? 0 : current.total,
          hasNext: false,
          error: mapped,
        }));
      }
    },
    [applyMockFilters, failRequest, filters.clubId, filters.page, filters.role, filters.search, mockMode],
  );

  const openPerson = useCallback(
    async (person: PersonDirectoryView) => {
      setSelected(person);
      setDetailError(null);
      if (mockMode) {
        setDetailStatus("ready");
        return;
      }
      setDetailStatus("loading");
      const controller = track();
      try {
        const detail = await getAdminUserView(person.id, controller.signal);
        setSelected(detail);
        setDetailStatus("ready");
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDetailStatus("error");
        setDetailError(mapped);
        if (mapped.kind === "not_found") {
          setSelected(null);
          void loadDirectory(true);
        }
      }
    },
    [failRequest, loadDirectory, mockMode, track],
  );

  const closePerson = useCallback(() => {
    setSelected(null);
    setDetailStatus("idle");
    setDetailError(null);
  }, []);

  const refreshAfterMutation = useCallback(
    async (profileId: string) => {
      await Promise.all([loadDirectory(true), loadCounts()]);
      if (selected?.id === profileId && !mockMode) {
        try {
          const detail = await getAdminUserView(profileId);
          setSelected(detail);
          setDetailStatus("ready");
        } catch {
          // Directory refresh remains authoritative if detail reload fails.
        }
      }
    },
    [loadCounts, loadDirectory, mockMode, selected?.id],
  );

  const saveAssignment = useCallback(
    async (input: RoleAssignmentInput): Promise<PeopleUiError | null> => {
      if (!lockMutation({ id: input.profileId, kind: "role" })) {
        return {
          kind: "conflict",
          status: 409,
          code: "DECISION_IN_PROGRESS",
          message: "This assignment is already being saved.",
          retryAfter: null,
        };
      }
      setLiveMessage(`Saving OneClub role for ${input.profileId}`);
      try {
        if (mockMode) {
          const club = clubs.find((item) => item.id === input.clubId) ?? null;
          mockUsersRef.current = mockUsersRef.current.map((user) =>
            user.id === input.profileId
              ? {
                  ...user,
                  oneClubRole: input.role,
                  assignedClubId: input.role === "student" ? null : input.clubId,
                  assignedClubName: input.role === "student" ? null : club?.name ?? user.assignedClubName,
                  advisorAssignments:
                    input.role === "advisor" && input.clubId
                      ? [
                          {
                            id: `assignment-${input.profileId}`,
                            club_id: input.clubId,
                            club_name: club?.name || "Club unavailable",
                          },
                        ]
                      : input.role === "advisor"
                        ? user.advisorAssignments
                        : [],
                  effectiveRole: input.role,
                }
              : user,
          );
          applyMockFilters();
          const updated = mockUsersRef.current.find((user) => user.id === input.profileId) ?? null;
          if (updated) setSelected(updated);
          setLiveMessage("Assignment saved in this UI preview.");
          return null;
        }

        if (input.role === "advisor") {
          const current = directory.items.find((item) => item.id === input.profileId) || selected;
          if (current?.oneClubRole !== "advisor") {
            await assignOneClubRole(input.profileId, { role: "advisor" });
          }
          const alreadyAssigned = (current?.advisorAssignments ?? []).some(
            (assignment) => assignment.club_id === input.clubId,
          );
          if (input.clubId && !alreadyAssigned) {
            await updateAdvisorAssignment(input.profileId, { club_id: input.clubId });
          }
        } else {
          const payload: RoleUpdatePayload = { role: input.role };
          if (input.role === "president" || input.role === "executive") {
            payload.club_id = input.clubId;
          }
          if (input.replaceExistingPresident) {
            payload.replace_existing_president = true;
          }
          await assignOneClubRole(input.profileId, payload);
        }

        await refreshAfterMutation(input.profileId);
        setLiveMessage("OneClub role saved.");
        return null;
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return null;
        setLiveMessage(mapped.message);
        if (mapped.kind === "conflict" && mapped.code !== "PRESIDENT_ALREADY_EXISTS") {
          await loadDirectory(true);
        }
        return mapped;
      } finally {
        unlockMutation(input.profileId);
      }
    },
    [applyMockFilters, clubs, directory.items, failRequest, loadDirectory, mockMode, refreshAfterMutation, selected],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadDirectory();
    }, mockMode ? 0 : filters.search ? 300 : 0);
    return () => window.clearTimeout(handle);
  }, [filters.search, filters.role, filters.clubId, filters.page, loadDirectory, mockMode]);

  useEffect(() => {
    void loadClubs();
    void loadCounts();
    return () => {
      abortAuxiliary();
      directoryController.current?.abort();
    };
  }, [abortAuxiliary, loadClubs, loadCounts]);

  const source = mockMode ? "mock" : "integrated";

  return {
    source,
    mockMode,
    directory,
    clubs,
    counts,
    selected,
    detailStatus,
    detailError,
    mutatingIds,
    liveMessage,
    loadDirectory,
    openPerson,
    closePerson,
    saveAssignment,
    setSelected,
  };
}
