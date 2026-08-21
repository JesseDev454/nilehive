import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listAdminAuditLogs } from "@/lib/api/audit";
import { isAbortError, normalizeAuditError, type AuditUiError } from "@/lib/audit/errors";
import { mockAuditLogs } from "@/lib/audit/mockAudit";
import type { AuditLogRecord } from "@/lib/audit/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type ActivityStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface ActivityFilters {
  q: string;
  action: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
  page: number;
}

const EMPTY_FILTERS: ActivityFilters = {
  q: "",
  action: "",
  entityType: "",
  dateFrom: "",
  dateTo: "",
  page: 1,
};

export function useAdminActivityData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS);
  const [status, setStatus] = useState<ActivityStatus>(mockMode ? "ready" : "idle");
  const [items, setItems] = useState<AuditLogRecord[]>(mockMode ? mockAuditLogs().items : []);
  const [total, setTotal] = useState(mockMode ? mockAuditLogs().total : 0);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<AuditUiError | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const source = mockMode ? "mock" : "integrated";

  const failRequest = useCallback(
    (caught: unknown): AuditUiError | "auth" | "abort" => {
      if (isAbortError(caught)) return "abort";
      if (reportAuthFailure(caught)) return "auth";
      return normalizeAuditError(caught);
    },
    [reportAuthFailure],
  );

  const load = useCallback(
    async (nextFilters: ActivityFilters, refreshing = false) => {
      if (mockMode) {
        const mocked = mockAuditLogs();
        const needle = nextFilters.q.trim().toLowerCase();
        const filtered = mocked.items.filter((item) => {
          const matchesQuery = !needle
            || item.action.includes(needle)
            || item.entity_type.includes(needle)
            || (item.remarks || "").toLowerCase().includes(needle)
            || (item.actor?.full_name || "").toLowerCase().includes(needle);
          const matchesAction = !nextFilters.action || item.action === nextFilters.action;
          const matchesEntity = !nextFilters.entityType || item.entity_type === nextFilters.entityType;
          const matchesFrom = !nextFilters.dateFrom || item.created_at >= `${nextFilters.dateFrom}T00:00:00.000Z`;
          const matchesTo = !nextFilters.dateTo || item.created_at <= `${nextFilters.dateTo}T23:59:59.999Z`;
          return matchesQuery && matchesAction && matchesEntity && matchesFrom && matchesTo;
        });
        setItems(filtered);
        setTotal(filtered.length);
        setHasNext(false);
        setStatus(filtered.length ? "ready" : "empty");
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
        const page = await listAdminAuditLogs({
          page: nextFilters.page,
          page_size: 20,
          q: nextFilters.q.trim() || undefined,
          action: nextFilters.action || undefined,
          entity_type: nextFilters.entityType || undefined,
          date_from: nextFilters.dateFrom || undefined,
          date_to: nextFilters.dateTo || undefined,
          signal: nextController.signal,
        });
        if (currentRequest !== requestId.current) return;
        setItems(page.items);
        setTotal(page.total);
        setHasNext(page.has_next);
        setStatus(page.items.length ? "ready" : "empty");
      } catch (caught) {
        if (currentRequest !== requestId.current) return;
        const mapped = failRequest(caught);
        if (mapped === "abort" || mapped === "auth") return;
        setStatus(mapped.kind === "forbidden" ? "forbidden" : "error");
        setError(mapped);
        if (mapped.kind === "forbidden") {
          setItems([]);
          setTotal(0);
        }
      }
    },
    [failRequest, mockMode],
  );

  useEffect(() => {
    void load(filters);
    return () => controller.current?.abort();
  }, [filters, load]);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.q || filters.action || filters.entityType || filters.dateFrom || filters.dateTo),
    [filters],
  );

  return {
    source,
    status,
    items,
    total,
    hasNext,
    error,
    filters,
    hasActiveFilters,
    isFetching: status === "loading" || status === "refreshing",
    setQuery: (q: string) => setFilters((current) => ({ ...current, q, page: 1 })),
    setAction: (action: string) => setFilters((current) => ({ ...current, action, page: 1 })),
    setEntityType: (entityType: string) => setFilters((current) => ({ ...current, entityType, page: 1 })),
    setDateFrom: (dateFrom: string) => setFilters((current) => ({ ...current, dateFrom, page: 1 })),
    setDateTo: (dateTo: string) => setFilters((current) => ({ ...current, dateTo, page: 1 })),
    nextPage: () => setFilters((current) => ({ ...current, page: current.page + 1 })),
    previousPage: () => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) })),
    resetFilters: () => setFilters(EMPTY_FILTERS),
    retry: () => void load(filters, true),
  };
}
