import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminAnalytics } from "@/lib/api/analytics";
import { emptyAnalyticsView, toAnalyticsPeriodView } from "@/lib/analytics/adapters";
import { isAbortError, normalizeAnalyticsError, type AnalyticsUiError } from "@/lib/analytics/errors";
import { mockAnalyticsSummary } from "@/lib/analytics/mockAnalytics";
import type { AnalyticsPeriodView, AnalyticsTimeRange } from "@/lib/analytics/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type AnalyticsStatus = "idle" | "loading" | "refreshing" | "ready" | "error" | "forbidden";

export function useAdminAnalyticsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [range, setRange] = useState<AnalyticsTimeRange>(30);
  const [status, setStatus] = useState<AnalyticsStatus>(mockMode ? "ready" : "idle");
  const [data, setData] = useState<AnalyticsPeriodView>(
    mockMode ? mockAnalyticsSummary(30) : emptyAnalyticsView(30),
  );
  const [error, setError] = useState<AnalyticsUiError | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (caught: unknown): AnalyticsUiError | "auth" | "abort" => {
      if (isAbortError(caught)) return "abort";
      if (reportAuthFailure(caught)) return "auth";
      return normalizeAnalyticsError(caught);
    },
    [reportAuthFailure],
  );

  const load = useCallback(
    async (nextRange: AnalyticsTimeRange, refreshing = false) => {
      if (mockMode) {
        setData(mockAnalyticsSummary(nextRange));
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
        const summary = await getAdminAnalytics(nextRange, nextController.signal);
        if (currentRequest !== requestId.current) return;
        setData(toAnalyticsPeriodView(summary));
        setStatus("ready");
      } catch (caught) {
        if (currentRequest !== requestId.current) return;
        const mapped = failRequest(caught);
        if (mapped === "abort" || mapped === "auth") return;
        setStatus(mapped.kind === "forbidden" ? "forbidden" : "error");
        setError(mapped);
        if (mapped.kind === "forbidden") setData(emptyAnalyticsView(nextRange));
      }
    },
    [failRequest, mockMode],
  );

  useEffect(() => {
    void load(range);
    return () => controller.current?.abort();
  }, [load, range]);

  const changeRange = useCallback((next: AnalyticsTimeRange) => {
    setRange(next);
  }, []);

  return {
    source,
    range,
    status,
    data,
    error,
    isFetching: status === "loading" || status === "refreshing",
    changeRange,
    retry: () => void load(range, true),
  };
}
