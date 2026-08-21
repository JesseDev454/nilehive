import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminOperationsDashboard } from "@/lib/api/dashboard";
import { notifyAdminOpsChanged } from "@/lib/admin/opsStore";
import { emptyAdminHomeView } from "@/lib/dashboard/adapters";
import { isAbortError, normalizeDashboardError, type DashboardUiError } from "@/lib/dashboard/errors";
import { mockAdminHomeView } from "@/lib/dashboard/mockDashboard";
import type { AdminHomeViewModel } from "@/lib/dashboard/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type HomeStatus = "idle" | "loading" | "refreshing" | "ready" | "error" | "forbidden";

export function useAdminHomeData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [status, setStatus] = useState<HomeStatus>(mockMode ? "ready" : "idle");
  const [data, setData] = useState<AdminHomeViewModel>(mockMode ? mockAdminHomeView() : emptyAdminHomeView());
  const [error, setError] = useState<DashboardUiError | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (caught: unknown): DashboardUiError | "auth" | "abort" => {
      if (isAbortError(caught)) return "abort";
      if (reportAuthFailure(caught)) return "auth";
      return normalizeDashboardError(caught);
    },
    [reportAuthFailure],
  );

  const load = useCallback(
    async (refreshing = false) => {
      if (mockMode) {
        setData(mockAdminHomeView());
        setStatus("ready");
        setError(null);
        return;
      }

      controller.current?.abort();
      const nextController = new AbortController();
      controller.current = nextController;
      const currentRequest = requestId.current + 1;
      requestId.current = currentRequest;
      setStatus(refreshing ? "refreshing" : "loading");
      setError(null);

      try {
        const next = await getAdminOperationsDashboard(nextController.signal);
        if (currentRequest !== requestId.current) return;
        setData(next);
        setStatus("ready");
        notifyAdminOpsChanged();
      } catch (caught) {
        if (currentRequest !== requestId.current) return;
        const mapped = failRequest(caught);
        if (mapped === "abort" || mapped === "auth") return;
        setStatus(mapped.kind === "forbidden" ? "forbidden" : "error");
        setError(mapped);
        if (mapped.kind === "forbidden") setData(emptyAdminHomeView());
      }
    },
    [failRequest, mockMode],
  );

  useEffect(() => {
    void load(false);
    return () => controller.current?.abort();
  }, [load]);

  return {
    source,
    status,
    data,
    error,
    isFetching: status === "loading" || status === "refreshing",
    refresh: () => void load(true),
  };
}
