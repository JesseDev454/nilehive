import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listAdminUsers } from "@/lib/api/people";
import {
  getClub,
  getClubPaymentSettings,
  listClubMembers,
  listClubs,
  updateClub,
  upsertClubPaymentSettings,
} from "@/lib/api/clubs";
import { adaptAdminClubView, leaderFromAdminUser } from "@/lib/clubs/adapters";
import { isAbortError, normalizeClubsError, type ClubsUiError } from "@/lib/clubs/errors";
import { mockAdminClubs } from "@/lib/clubs/mockClubs";
import type { AdminClubView, ClubEditInput, ClubLeaderView, ClubRecord } from "@/lib/clubs/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import type { AdminUserRecord } from "@/lib/people/types";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: AdminClubView[];
  error: ClubsUiError | null;
}

const EMPTY_DIRECTORY: DirectoryState = {
  status: "idle",
  items: [],
  error: null,
};

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

function presidentsByClub(users: AdminUserRecord[]): Map<string, ClubLeaderView> {
  const map = new Map<string, ClubLeaderView>();
  users.forEach((user) => {
    if (user.role !== "president") return;
    const clubId = user.club_id || user.club?.id;
    if (!clubId || map.has(clubId)) return;
    map.set(clubId, leaderFromAdminUser(user));
  });
  return map;
}

function advisorsByClub(users: AdminUserRecord[]): Map<string, ClubLeaderView[]> {
  const map = new Map<string, ClubLeaderView[]>();
  const add = (clubId: string, leader: ClubLeaderView) => {
    const current = map.get(clubId) ?? [];
    if (current.some((item) => item.id === leader.id)) return;
    map.set(clubId, [...current, leader]);
  };

  users.forEach((user) => {
    if (user.role !== "advisor") return;
    const leader = leaderFromAdminUser(user);
    const assignments = Array.isArray(user.advisor_assignments) ? user.advisor_assignments : [];
    assignments.forEach((assignment) => {
      if (assignment.club_id) add(assignment.club_id, leader);
    });
    if (user.club_id) add(user.club_id, leader);
  });
  return map;
}

function attachLeadership(
  clubs: ClubRecord[],
  presidents: Map<string, ClubLeaderView>,
  advisors: Map<string, ClubLeaderView[]>,
): AdminClubView[] {
  return clubs.map((club) =>
    adaptAdminClubView(club, {
      president: presidents.get(club.id) ?? null,
      advisors: advisors.get(club.id) ?? [],
    }),
  );
}

export function useAdminClubsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode
      ? { status: "ready", items: mockAdminClubs(), error: null }
      : EMPTY_DIRECTORY,
  );
  const [selected, setSelected] = useState<AdminClubView | null>(null);
  const [editing, setEditing] = useState<AdminClubView | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState<ClubsUiError | null>(null);
  const [saveError, setSaveError] = useState<ClubsUiError | null>(null);
  const [mutatingIds, setMutatingIds] = useState<string[]>([]);
  const mutatingIdsRef = useRef<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const directoryController = useRef<AbortController | null>(null);
  const detailController = useRef<AbortController | null>(null);
  const mockClubsRef = useRef(mockAdminClubs());
  const selectedIdRef = useRef<string | null>(null);
  const editingIdRef = useRef<string | null>(null);

  const lockMutation = (clubId: string) => {
    if (mutatingIdsRef.current.has(clubId)) return false;
    mutatingIdsRef.current.add(clubId);
    setMutatingIds([...mutatingIdsRef.current]);
    return true;
  };

  const unlockMutation = (clubId: string) => {
    mutatingIdsRef.current.delete(clubId);
    setMutatingIds([...mutatingIdsRef.current]);
  };

  const failRequest = useCallback(
    (error: unknown): ClubsUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizeClubsError(error);
    },
    [reportAuthFailure],
  );

  const replaceClub = useCallback((club: AdminClubView) => {
    setDirectory((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === club.id ? { ...item, ...club } : item)),
    }));
    setSelected((current) => (current?.id === club.id ? { ...current, ...club } : current));
    setEditing((current) => (current?.id === club.id ? { ...current, ...club } : current));
  }, []);

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        setDirectory({ status: readyOrEmpty(mockClubsRef.current.length), items: mockClubsRef.current, error: null });
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
        const clubs = await listClubs(controller.signal);
        let presidentsPage = { items: [] as AdminUserRecord[] };
        let advisorsPage = { items: [] as AdminUserRecord[] };
        try {
          [presidentsPage, advisorsPage] = await Promise.all([
            listAdminUsers({ role: "president", page: 1, page_size: 100, signal: controller.signal }),
            listAdminUsers({ role: "advisor", page: 1, page_size: 100, signal: controller.signal }),
          ]);
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
        }
        const items = attachLeadership(
          clubs,
          presidentsByClub(presidentsPage.items),
          advisorsByClub(advisorsPage.items),
        );
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
        setLiveMessage(
          items.length ? `Loaded ${items.length} official clubs.` : "No clubs are available in this directory.",
        );

        const selectedId = selectedIdRef.current;
        if (selectedId) {
          const nextSelected = items.find((club) => club.id === selectedId) ?? null;
          setSelected(nextSelected);
          if (!nextSelected) {
            selectedIdRef.current = null;
            setDetailStatus("idle");
          }
        }
        const editingId = editingIdRef.current;
        if (editingId) {
          const nextEditing = items.find((club) => club.id === editingId) ?? null;
          setEditing(nextEditing);
          if (!nextEditing) editingIdRef.current = null;
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

  const loadClubDetails = useCallback(
    async (club: AdminClubView) => {
      if (mockMode) {
        const full = mockClubsRef.current.find((item) => item.id === club.id) ?? club;
        setSelected((current) => (current?.id === club.id || selectedIdRef.current === club.id ? full : current));
        setEditing((current) => (current?.id === club.id || editingIdRef.current === club.id ? full : current));
        setDetailStatus("ready");
        setDetailError(null);
        return;
      }

      detailController.current?.abort();
      const controller = new AbortController();
      detailController.current = controller;
      setDetailStatus("loading");
      setDetailError(null);
      setLiveMessage(`Loading ${club.name} details.`);

      try {
        const record = await getClub(club.id, controller.signal);
        let membersPage: { items: AdminClubView["members"]; total: number } | null = null;
        let payment = null;
        try {
          const [members, settings] = await Promise.all([
            listClubMembers({ club_id: club.id, page: 1, page_size: 100, signal: controller.signal }),
            getClubPaymentSettings(club.id, controller.signal),
          ]);
          membersPage = members;
          payment = settings;
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
        }
        const scopedMembers = (membersPage?.items ?? []).filter((member) => member.clubId === club.id);
        const executives = scopedMembers
          .filter((member) => member.clubRole === "executive")
          .map((member) => ({
            id: member.profileId || member.id,
            fullName: member.fullName,
            email: member.email,
            studentId: member.studentId,
          }));
        const next = adaptAdminClubView(record, {
          president: club.presidentId
            ? {
                id: club.presidentId,
                fullName: club.presidentName || "Not assigned",
                email: club.presidentEmail,
                studentId: null,
              }
            : null,
          advisors: club.advisors,
          executives,
          members: scopedMembers,
          memberCount: membersPage ? membersPage.total : null,
          payment,
          paymentLoaded: true,
        });
        replaceClub(next);
        setDetailStatus("ready");
        setLiveMessage(`${club.name} details loaded.`);
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        if (mapped.kind === "not_found") {
          setDirectory((current) => ({
            ...current,
            items: current.items.filter((item) => item.id !== club.id),
          }));
        }
        setDetailStatus("error");
        setDetailError(mapped);
        setLiveMessage(mapped.message);
      }
    },
    [failRequest, mockMode, replaceClub],
  );

  const openClub = useCallback(
    (club: AdminClubView) => {
      selectedIdRef.current = club.id;
      setSelected(club);
      void loadClubDetails(club);
    },
    [loadClubDetails],
  );

  const closeClub = useCallback(() => {
    detailController.current?.abort();
    selectedIdRef.current = null;
    setSelected(null);
    setDetailStatus("idle");
    setDetailError(null);
  }, []);

  const openEditor = useCallback(
    (club: AdminClubView) => {
      editingIdRef.current = club.id;
      setEditing(club);
      setSaveError(null);
      if (!mockMode) {
        void loadClubDetails(club);
      }
    },
    [loadClubDetails, mockMode],
  );

  const closeEditor = useCallback(() => {
    editingIdRef.current = null;
    setEditing(null);
    setSaveError(null);
  }, []);

  const saveClub = useCallback(
    async (club: AdminClubView, input: ClubEditInput) => {
      if (!lockMutation(club.id)) return false;
      setSaveError(null);
      setLiveMessage(`Saving ${club.name}.`);

      try {
        if (mockMode) {
          const next: AdminClubView = {
            ...club,
            description: input.description.trim(),
            isPublicSignup: input.isPublicSignup,
            duesAmount: input.duesAmount,
            adminOnlyWhatsAppNotes: input.adminOnlyWhatsAppNotes.trim() || null,
            location: club.supportsLocation ? input.location?.trim() || club.location : club.location,
            meetingSchedule: club.supportsMeetingSchedule
              ? input.meetingSchedule?.trim() || club.meetingSchedule
              : club.meetingSchedule,
            coverImage: club.supportsCoverUrl ? input.coverImage?.trim() || club.coverImage : club.coverImage,
            tags: club.supportsFreeformTags && input.tags?.length ? input.tags : club.tags,
            bankDetails: {
              bankName: input.bankName.trim(),
              accountNumber: input.accountNumber.trim(),
              accountName: input.accountName.trim(),
              narrationGuideline: club.bankDetails?.narrationGuideline || "",
              proofInstructions: input.paymentInstructions.trim(),
            },
            paymentLoaded: true,
          };
          mockClubsRef.current = mockClubsRef.current.map((item) => (item.id === club.id ? next : item));
          replaceClub(next);
          setLiveMessage(`${club.name} settings saved.`);
          return true;
        }

        const clubPatch: Parameters<typeof updateClub>[1] = {};
        if (input.description.trim() !== club.description) clubPatch.description = input.description.trim();
        if (input.isPublicSignup !== club.isPublicSignup) clubPatch.is_public_signup = input.isPublicSignup;
        if (input.duesAmount !== club.duesAmount) clubPatch.dues_amount = input.duesAmount;
        const nextNotes = input.adminOnlyWhatsAppNotes.trim() || null;
        if (nextNotes !== (club.adminOnlyWhatsAppNotes || null)) {
          clubPatch.whatsapp_onboarding_notes = nextNotes;
        }

        const bankChanged =
          input.bankName.trim() !== (club.bankDetails?.bankName || "") ||
          input.accountNumber.trim() !== (club.bankDetails?.accountNumber || "") ||
          input.accountName.trim() !== (club.bankDetails?.accountName || "") ||
          input.paymentInstructions.trim() !== (club.bankDetails?.proofInstructions || "");

        if (Object.keys(clubPatch).length) {
          await updateClub(club.id, clubPatch);
        }

        if (bankChanged) {
          await upsertClubPaymentSettings({
            bank_name: input.bankName.trim(),
            account_number: input.accountNumber.trim(),
            account_name: input.accountName.trim(),
            payment_instructions: input.paymentInstructions.trim() || null,
          });
        }

        await loadDirectory(true);
        if (selectedIdRef.current === club.id) {
          const latest = {
            ...club,
            description: input.description.trim(),
            isPublicSignup: input.isPublicSignup,
            duesAmount: input.duesAmount,
          };
          void loadClubDetails(latest);
        }
        setLiveMessage(`${club.name} settings saved.`);
        return true;
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return false;
        setSaveError(mapped);
        setLiveMessage(mapped.message);
        if (mapped.kind === "not_found") {
          editingIdRef.current = null;
          setEditing(null);
          await loadDirectory(true);
        }
        return false;
      } finally {
        unlockMutation(club.id);
      }
    },
    [failRequest, loadClubDetails, loadDirectory, mockMode, replaceClub],
  );

  useEffect(() => {
    void loadDirectory();
    return () => {
      directoryController.current?.abort();
      detailController.current?.abort();
    };
  }, [loadDirectory]);

  const isMutating = useCallback((clubId: string) => mutatingIds.includes(clubId), [mutatingIds]);

  const categories = useMemo(() => {
    const values = new Set<string>();
    directory.items.forEach((club) => {
      if (club.categoryLabel && club.categoryLabel !== "Uncategorized") values.add(club.categoryLabel);
      club.categories.forEach((category) => values.add(category));
    });
    return ["All", ...Array.from(values)];
  }, [directory.items]);

  return {
    source: mockMode ? "mock" : "integrated",
    directory,
    categories,
    selected,
    editing,
    detailStatus,
    detailError,
    saveError,
    liveMessage,
    loadDirectory,
    loadClubDetails,
    openClub,
    closeClub,
    openEditor,
    closeEditor,
    saveClub,
    isMutating,
  };
}
