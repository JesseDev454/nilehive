import { useCallback, useEffect, useRef, useState } from "react";
import { listClubs } from "@/lib/api/clubs";
import { listAllAnnouncements, publishAdminAnnouncement } from "@/lib/api/announcements";
import { listAdminUsers } from "@/lib/api/people";
import {
  buildCreateAnnouncementPayload,
  toAdminAnnouncementView,
  validateAnnouncementComposer,
} from "@/lib/announcements/adapters";
import { isAbortError, normalizeAnnouncementsError, type AnnouncementsUiError } from "@/lib/announcements/errors";
import { mockAdminAnnouncements } from "@/lib/announcements/mockAnnouncements";
import type {
  AdminAnnouncementView,
  AnnouncementComposerInput,
  AnnouncementRecord,
} from "@/lib/announcements/types";
import type { ClubRecord } from "@/lib/clubs/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import type { AdminUserRecord } from "@/lib/people/types";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: AdminAnnouncementView[];
  error: AnnouncementsUiError | null;
}

const EMPTY_DIRECTORY: DirectoryState = {
  status: "idle",
  items: [],
  error: null,
};

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

function publisherMap(users: AdminUserRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  users.forEach((user) => {
    if (user.id && user.full_name) map.set(user.id, user.full_name);
  });
  return map;
}

export function useAdminAnnouncementsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode ? { status: "ready", items: mockAdminAnnouncements(), error: null } : EMPTY_DIRECTORY,
  );
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([]);
  const [publishError, setPublishError] = useState<AnnouncementsUiError | null>(null);
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);
  const [liveMessage, setLiveMessage] = useState("");
  const directoryController = useRef<AbortController | null>(null);
  const mockItemsRef = useRef(mockAdminAnnouncements());

  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (error: unknown): AnnouncementsUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizeAnnouncementsError(error);
    },
    [reportAuthFailure],
  );

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        setDirectory({
          status: readyOrEmpty(mockItemsRef.current.length),
          items: mockItemsRef.current,
          error: null,
        });
        setClubs(
          mockItemsRef.current
            .filter((item) => item.targetClubId && item.targetClubName)
            .map((item) => ({ id: item.targetClubId as string, name: item.targetClubName as string })),
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
        const announcements = await listAllAnnouncements({ signal: controller.signal });
        let clubRecords: ClubRecord[] = [];
        try {
          clubRecords = await listClubs(controller.signal);
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
        }
        setClubs(clubRecords.map((club) => ({ id: club.id, name: club.name })));
        const names = new Map(clubRecords.map((club) => [club.id, club.name]));

        let publishers = new Map<string, string>();
        try {
          const people = await listAdminUsers({ page: 1, page_size: 100, signal: controller.signal });
          publishers = publisherMap(people.items);
        } catch (error) {
          const mapped = failRequest(error);
          if (mapped === "abort" || mapped === "auth") return;
        }

        const items = announcements.map((record: AnnouncementRecord) =>
          toAdminAnnouncementView(record, {
            clubName: record.club_id ? names.get(record.club_id) ?? null : null,
            publisherName: record.created_by ? publishers.get(record.created_by) ?? null : null,
          }),
        );
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
        setLiveMessage(
          items.length
            ? `Loaded ${items.length} official announcements.`
            : "No official announcements are available.",
        );
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDirectory({
          status: mapped.kind === "forbidden" ? "forbidden" : "error",
          items: [],
          error: mapped,
        });
        setLiveMessage(mapped.message);
      }
    },
    [failRequest, mockMode],
  );

  const publish = useCallback(
    async (input: AnnouncementComposerInput) => {
      const fieldErrors = validateAnnouncementComposer(input);
      if (Object.keys(fieldErrors).length > 0) {
        return { ok: false as const, fieldErrors };
      }
      if (publishingRef.current) {
        return { ok: false as const, alreadyInFlight: true as const };
      }
      publishingRef.current = true;
      setPublishing(true);
      setPublishError(null);

      try {
        if (mockMode) {
          const published: AdminAnnouncementView = {
            id: `ann-${Date.now()}`,
            title: input.title.trim(),
            content: input.content.trim(),
            audience: input.audience,
            targetClubId: input.audience === "one_club" ? input.targetClubId : undefined,
            targetClubName:
              input.audience === "one_club"
                ? clubs.find((club) => club.id === input.targetClubId)?.name
                : undefined,
            targetRole: input.audience === "role" ? input.targetRole : undefined,
            priority: input.priority,
            publishedAt: new Date().toISOString(),
            publishedBy: "Directorate of Student Affairs",
            readCount: 0,
            totalRecipients: null,
          };
          mockItemsRef.current = [published, ...mockItemsRef.current];
          setDirectory({
            status: "ready",
            items: mockItemsRef.current,
            error: null,
          });
          setLiveMessage(`Published “${published.title}”.`);
          return { ok: true as const, announcement: published };
        }

        const record = await publishAdminAnnouncement(buildCreateAnnouncementPayload(input));
        await loadDirectory(true);
        const view = toAdminAnnouncementView(record, {
          clubName: record.club_id ? clubs.find((club) => club.id === record.club_id)?.name ?? null : null,
        });
        setLiveMessage(`Published “${view.title}”.`);
        return { ok: true as const, announcement: view };
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return { ok: false as const, error: mapped };
        setPublishError(mapped);
        return { ok: false as const, error: mapped };
      } finally {
        publishingRef.current = false;
        setPublishing(false);
      }
    },
    [clubs, failRequest, loadDirectory, mockMode],
  );

  useEffect(() => {
    void loadDirectory();
    return () => {
      directoryController.current?.abort();
    };
  }, [loadDirectory]);

  return {
    source,
    mockMode,
    directory,
    clubs,
    publishError,
    publishing,
    liveMessage,
    loadDirectory,
    publish,
  };
}
