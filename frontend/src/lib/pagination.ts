import type { PaginatedResponse } from "@/lib/api";

export const DEFAULT_PAGE_SIZE = 20;

export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    total: 0,
    has_next: false
  };
}
