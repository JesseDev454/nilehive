import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const FIVE_MINUTES = 5 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 30_000,
      gcTime: FIVE_MINUTES
    }
  }
});

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "clubly-query-cache"
});

export const PERSIST_MAX_AGE = FIVE_MINUTES;
