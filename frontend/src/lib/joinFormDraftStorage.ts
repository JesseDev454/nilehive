const JOIN_FORM_DRAFT_VERSION = 1;
const JOIN_FORM_DRAFT_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export interface JoinFormDraft {
  version: number;
  userId: string;
  clubId: string;
  savedAt: string;
  studentType: "fresher" | "returning";
  studentId: string;
  phoneNumber: string;
  department: string;
  joinReason: string;
  accountName: string;
  reference: string;
  paidAt: string;
  note: string;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function getDraftKey(userId: string, clubId: string) {
  return `join-form-draft:${userId}:${clubId}`;
}

export function readJoinFormDraft(userId: string, clubId: string): JoinFormDraft | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const key = getDraftKey(userId, clubId);
  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as JoinFormDraft;

    if (
      !parsed ||
      parsed.version !== JOIN_FORM_DRAFT_VERSION ||
      parsed.userId !== userId ||
      parsed.clubId !== clubId ||
      typeof parsed.savedAt !== "string"
    ) {
      storage.removeItem(key);
      return null;
    }

    const savedAt = new Date(parsed.savedAt);

    if (Number.isNaN(savedAt.getTime()) || Date.now() - savedAt.getTime() > JOIN_FORM_DRAFT_TTL_MS) {
      storage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeJoinFormDraft(
  userId: string,
  clubId: string,
  fields: Omit<JoinFormDraft, "version" | "userId" | "clubId" | "savedAt">
) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const draft: JoinFormDraft = {
    version: JOIN_FORM_DRAFT_VERSION,
    userId,
    clubId,
    savedAt: new Date().toISOString(),
    ...fields
  };

  storage.setItem(getDraftKey(userId, clubId), JSON.stringify(draft));
}

export function clearJoinFormDraft(userId: string, clubId: string) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(getDraftKey(userId, clubId));
}
