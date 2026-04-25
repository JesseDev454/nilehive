import { getPublicClubs } from "@/lib/api";

export const PUBLIC_CLUBS_QUERY_KEY = ["public-clubs"] as const;

export const publicClubsQueryOptions = {
  queryKey: PUBLIC_CLUBS_QUERY_KEY,
  queryFn: getPublicClubs,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 1
} as const;
