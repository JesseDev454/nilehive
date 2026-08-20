export type OneClubMode = "mock" | "integrated";

export function getOneClubMode(): OneClubMode {
  const value = String(import.meta.env.VITE_ONECLUB_MODE ?? "").trim().toLowerCase();
  return value === "mock" ? "mock" : "integrated";
}

export function isMockPreviewMode(): boolean {
  return getOneClubMode() === "mock";
}
