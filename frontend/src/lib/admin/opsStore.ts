let generation = 0;
let approvalsCount = 0;
const listeners = new Set<() => void>();

export function getAdminOpsGeneration(): number {
  return generation;
}

export function subscribeAdminOpsGeneration(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyAdminOpsChanged(): void {
  generation += 1;
  listeners.forEach((listener) => listener());
}

export function getAdminApprovalsCount(): number {
  return approvalsCount;
}

export function setAdminApprovalsCount(next: number): void {
  const safe = Number.isFinite(next) && next > 0 ? Math.floor(next) : 0;
  if (safe === approvalsCount) return;
  approvalsCount = safe;
  listeners.forEach((listener) => listener());
}

export function subscribeAdminApprovalsCount(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
