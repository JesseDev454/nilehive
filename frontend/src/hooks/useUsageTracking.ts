import { useEffect } from "react";
import { recordUsage } from "@/lib/api";

export function useUsageTracking(feature: string) {
  useEffect(() => {
    void recordUsage(feature).catch(() => undefined);
  }, [feature]);
}
