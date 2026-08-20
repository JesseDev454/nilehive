let csrfToken: string | null = null;
let inFlight: Promise<string> | null = null;

export function getCachedCsrfToken(): string | null {
  return csrfToken;
}

export function setCachedCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getCsrfInFlight(): Promise<string> | null {
  return inFlight;
}

export function setCsrfInFlight(promise: Promise<string> | null): void {
  inFlight = promise;
}

export function clearCsrfToken(): void {
  csrfToken = null;
  inFlight = null;
}
