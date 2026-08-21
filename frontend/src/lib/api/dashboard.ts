import { apiRequest } from "./client";
import { adaptAdminOperationsDashboard, adaptNavCounts } from "@/lib/dashboard/adapters";
import type { AdminHomeViewModel, AdminNavCountsRecord } from "@/lib/dashboard/types";

export async function getAdminOperationsDashboard(signal?: AbortSignal): Promise<AdminHomeViewModel> {
  const payload = await apiRequest<{ data: unknown }>("/dashboard/admin-operations", { signal });
  return adaptAdminOperationsDashboard(payload.data);
}

export async function getAdminNavCounts(signal?: AbortSignal): Promise<AdminNavCountsRecord> {
  const payload = await apiRequest<{ data: unknown }>("/dashboard/nav-counts", { signal });
  return adaptNavCounts(payload.data);
}
