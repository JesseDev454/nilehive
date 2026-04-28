const PROPOSAL_DRAFT_VERSION = 1;
const PROPOSAL_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type ProposalDraftMode = "create" | "edit";

export interface ProposalDraftState<TForm, TBudgetItem, TResponsibleMember> {
  version: number;
  mode: ProposalDraftMode;
  proposalId: string | null;
  userId: string;
  savedAt: string;
  step: number;
  form: TForm;
  budgetItems: TBudgetItem[];
  responsibleMembers: TResponsibleMember[];
}

interface ProposalDraftKeyOptions {
  mode: ProposalDraftMode;
  userId: string;
  proposalId?: string | null;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getProposalDraftStorageKey({ mode, userId, proposalId }: ProposalDraftKeyOptions) {
  if (mode === "edit") {
    return `proposal-draft:edit:${proposalId || "unknown"}:${userId}`;
  }

  return `proposal-draft:create:${userId}`;
}

export function readProposalDraft<TForm, TBudgetItem, TResponsibleMember>(
  options: ProposalDraftKeyOptions
) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storageKey = getProposalDraftStorageKey(options);
  const rawValue = storage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as ProposalDraftState<TForm, TBudgetItem, TResponsibleMember>;

    if (
      !parsed ||
      parsed.version !== PROPOSAL_DRAFT_VERSION ||
      parsed.mode !== options.mode ||
      parsed.userId !== options.userId ||
      (options.mode === "edit" && parsed.proposalId !== (options.proposalId || null)) ||
      typeof parsed.savedAt !== "string"
    ) {
      storage.removeItem(storageKey);
      return null;
    }

    const savedAt = new Date(parsed.savedAt);

    if (Number.isNaN(savedAt.getTime()) || Date.now() - savedAt.getTime() > PROPOSAL_DRAFT_TTL_MS) {
      storage.removeItem(storageKey);
      return null;
    }

    if (
      typeof parsed.step !== "number" ||
      parsed.form === undefined ||
      !Array.isArray(parsed.budgetItems) ||
      !Array.isArray(parsed.responsibleMembers)
    ) {
      storage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

export function writeProposalDraft<TForm, TBudgetItem, TResponsibleMember>(
  options: ProposalDraftKeyOptions,
  payload: Omit<ProposalDraftState<TForm, TBudgetItem, TResponsibleMember>, "version">
) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const storageKey = getProposalDraftStorageKey(options);

  storage.setItem(
    storageKey,
    JSON.stringify({
      ...payload,
      version: PROPOSAL_DRAFT_VERSION
    } satisfies ProposalDraftState<TForm, TBudgetItem, TResponsibleMember>)
  );
}

export function clearProposalDraft(options: ProposalDraftKeyOptions) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(getProposalDraftStorageKey(options));
}

export function formatProposalDraftSavedAt(savedAt: string) {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
