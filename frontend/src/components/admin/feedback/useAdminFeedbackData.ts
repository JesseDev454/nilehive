import { useCallback, useEffect, useRef, useState } from "react";
import { listAdminFeedback } from "@/lib/api/feedback";
import { toAdminFeedbackView } from "@/lib/feedback/adapters";
import { isAbortError, normalizeFeedbackError, type FeedbackUiError } from "@/lib/feedback/errors";
import { mockAdminFeedback } from "@/lib/feedback/mockFeedback";
import type { AdminFeedbackView } from "@/lib/feedback/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type DirectoryStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface DirectoryState {
  status: DirectoryStatus;
  items: AdminFeedbackView[];
  error: FeedbackUiError | null;
}

const EMPTY_DIRECTORY: DirectoryState = { status: "idle", items: [], error: null };

function readyOrEmpty(total: number): DirectoryStatus {
  return total > 0 ? "ready" : "empty";
}

export function useAdminFeedbackData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [directory, setDirectory] = useState<DirectoryState>(
    mockMode ? { status: "ready", items: mockAdminFeedback(), error: null } : EMPTY_DIRECTORY,
  );
  const directoryController = useRef<AbortController | null>(null);
  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (error: unknown): FeedbackUiError | "auth" | "abort" => {
      if (isAbortError(error)) return "abort";
      if (reportAuthFailure(error)) return "auth";
      return normalizeFeedbackError(error);
    },
    [reportAuthFailure],
  );

  const loadDirectory = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        const items = mockAdminFeedback();
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
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
        const records = await listAdminFeedback({ signal: controller.signal });
        const items = records.map(toAdminFeedbackView);
        setDirectory({ status: readyOrEmpty(items.length), items, error: null });
      } catch (error) {
        const mapped = failRequest(error);
        if (mapped === "abort" || mapped === "auth") return;
        setDirectory((current) => ({
          status: mapped.kind === "forbidden" ? "forbidden" : "error",
          items: mapped.kind === "forbidden" ? [] : current.items,
          error: mapped,
        }));
      }
    },
    [failRequest, mockMode],
  );

  useEffect(() => {
    void loadDirectory();
    return () => directoryController.current?.abort();
  }, [loadDirectory]);

  return { source, directory, loadDirectory };
}
