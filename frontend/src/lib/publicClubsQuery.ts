import { getPublicClubs } from "@/lib/api";

export const PUBLIC_CLUBS_QUERY_KEY = ["public-clubs"] as const;

export const publicClubsQueryOptions = {
  queryKey: PUBLIC_CLUBS_QUERY_KEY,
  queryFn: getPublicClubs,
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  retry: false
} as const;
