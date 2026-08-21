import { useCallback, useEffect, useRef, useState } from "react";
import { listAllNotifications, markNotificationRead } from "@/lib/api/notifications";
import { toAdminNotificationView } from "@/lib/notifications/adapters";
import { isAbortError, normalizeNotificationsError, type NotificationsUiError } from "@/lib/notifications/errors";
import { mockAdminNotifications } from "@/lib/notifications/mockNotifications";
import type { AdminNotificationView } from "@/lib/notifications/types";
import { setAdminUnreadCount } from "@/lib/notifications/unreadStore";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: AdminNotificationView[];
  error: NotificationsUiError | null;
}

const EMPTY_DIRECTORY: DirectoryState = { status: "idle", items: [], error: null };

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

function unreadFrom(items: AdminNotificationView[]): number {
  return items.filter((item) => !item.isRead).length;
}

export function useAdminNotificationsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode ? { status: "ready", items: mockAdminNotifications(), error: null } : EMPTY_DIRECTORY,
  );
  const [mutatingIds, setMutatingIds] = useState<string[]>([]);
  const mutatingIdsRef = useRef<Set<string>>(new Set());
  const [liveMessage, setLiveMessage] = useState("");
  const directoryController = useRef<AbortController | null>(null);
  const mockItemsRef = useRef(mockAdminNotifications());
  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (error: unknown): NotificationsUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizeNotificationsError(error);
    },
    [reportAuthFailure],
  );

  const publishUnread = useCallback((items: AdminNotificationView[]) => {
    setAdminUnreadCount(unreadFrom(items));
  }, []);

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        setDirectory({
          status: readyOrEmpty(mockItemsRef.current.length),
          items: mockItemsRef.current,
          error: null,
        });
        publishUnread(mockItemsRef.current);
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
        const records = await listAllNotifications(controller.signal);
        const items = records.map(toAdminNotificationView);
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
        publishUnread(items);
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDirectory((current) => ({
          status: mapped.kind === "forbidden" ? "forbidden" : "error",
          items: mapped.kind === "forbidden" ? [] : current.items,
          error: mapped,
        }));
        if (mapped.kind === "forbidden") setAdminUnreadCount(0);
      }
    },
    [failRequest, mockMode, publishUnread],
  );

  useEffect(() => {
    void loadDirectory();
    return () => directoryController.current?.abort();
  }, [loadDirectory]);

  const markRead = useCallback(
    async (item: AdminNotificationView) => {
      if (item.isRead) return true;
      if (mutatingIdsRef.current.has(item.id)) return false;
      mutatingIdsRef.current.add(item.id);
      setMutatingIds([...mutatingIdsRef.current]);

      setDirectory((current) => {
        const items = current.items.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry));
        publishUnread(items);
        return { ...current, items };
      });

      try {
        if (mockMode) {
          mockItemsRef.current = mockItemsRef.current.map((entry) =>
            entry.id === item.id ? { ...entry, isRead: true } : entry,
          );
          setLiveMessage(`${item.title} marked read.`);
          return true;
        }

        const persisted = toAdminNotificationView(await markNotificationRead(item.id));
        setDirectory((current) => {
          const items = current.items.map((entry) => (entry.id === persisted.id ? persisted : entry));
          publishUnread(items);
          return { ...current, items };
        });
        setLiveMessage(`${item.title} marked read.`);
        return true;
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return false;
        const missing = mapped.kind === "not_found";
        setDirectory((current) => {
          let items = current.items.map((entry) => (entry.id === item.id ? { ...entry, isRead: false } : entry));
          if (missing) items = items.filter((entry) => entry.id !== item.id);
          publishUnread(items);
          return {
            ...current,
            items,
            status: items.length ? current.status : "empty",
            error: missing ? mapped : current.error,
          };
        });
        setLiveMessage(missing ? "This notification is no longer available." : mapped.message);
        return false;
      } finally {
        mutatingIdsRef.current.delete(item.id);
        setMutatingIds([...mutatingIdsRef.current]);
      }
    },
    [failRequest, mockMode, publishUnread],
  );

  return {
    source,
    directory,
    mutatingIds,
    liveMessage,
    loadDirectory,
    markRead,
  };
}
