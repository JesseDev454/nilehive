import { actionError, actionSuccess } from "@/lib/notify";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
  successTitle?: string;
  fallbackTitle?: string;
}

export function buildAppUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

export async function shareOrCopy(payload: SharePayload) {
  const nav = typeof navigator === "undefined" ? null : navigator;
  const shareData = {
    title: payload.title,
    text: payload.text,
    url: payload.url
  };
  const clipboardText = `${payload.text}\n${payload.url}`;

  try {
    if (nav && "share" in nav) {
      await nav.share(shareData);
      actionSuccess(payload.successTitle ?? "Ready to share", "Your invite is ready to send.");
      return;
    }

    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(clipboardText);
      actionSuccess(payload.fallbackTitle ?? "Invite copied", "Paste it into WhatsApp, Outlook, or any chat.");
      return;
    }

    throw new Error("Clipboard sharing is not available in this browser.");
  } catch (error) {
    if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    actionError("Could not share", error, "Please copy the page link manually.");
  }
}
