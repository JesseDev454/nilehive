export function getEventCheckInPath(proposalId: string) {
  return `/events/${proposalId}/check-in`;
}

export function getEventCheckInUrl(proposalId: string) {
  const path = getEventCheckInPath(proposalId);

  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
