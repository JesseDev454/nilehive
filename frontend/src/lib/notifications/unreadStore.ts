let unreadCount = 0;
const listeners = new Set<() => void>();

export function getAdminUnreadCount(): number {
  return unreadCount;
}

export function setAdminUnreadCount(next: number): void {
  const safe = Number.isFinite(next) && next > 0 ? Math.floor(next) : 0;
  if (safe === unreadCount) return;
  unreadCount = safe;
  listeners.forEach((listener) => listener());
}

export function subscribeAdminUnreadCount(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
