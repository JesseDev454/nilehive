import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAdminProposal,
  listAdminDuesViews,
  listAdminProposalViews,
  listMembershipRequestViews,
  markMembershipWhatsAppAdded,
  submitAdminProposalDecision,
  submitDuesDecision,
  submitMembershipDecision,
} from "@/lib/api/approvals";
import { ApiClientError } from "@/lib/api/client";
import { adaptAdminProposal, adaptMembershipRequest } from "@/lib/approvals/adapters";
import { isAbortError, normalizeApprovalsError, type ApprovalsUiError } from "@/lib/approvals/errors";
import { MOCK_ADMIN_PROPOSALS, MOCK_DUES_PROOFS, MOCK_JOIN_REQUESTS } from "@/lib/approvals/mockApprovals";
import type {
  DuesProofApprovalView,
  JoinRequestApprovalView,
  ProposalApprovalView,
} from "@/lib/approvals/types";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export type QueueStatus = "idle" | "loading" | "refreshing" | "ready" | "empty" | "error" | "forbidden";

export interface QueueState<T> {
  status: QueueStatus;
  items: T[];
  error: ApprovalsUiError | null;
}

interface MutationState {
  id: string;
  kind: "proposal" | "join" | "dues" | "whatsapp";
}

const EMPTY_PROPOSALS: QueueState<ProposalApprovalView> = { status: "idle", items: [], error: null };
const EMPTY_JOINS: QueueState<JoinRequestApprovalView> = { status: "idle", items: [], error: null };
const EMPTY_DUES: QueueState<DuesProofApprovalView> = { status: "idle", items: [], error: null };

function readyOrEmpty<T>(items: T[]): QueueStatus {
  return items.length ? "ready" : "empty";
}

export function useAdminApprovalsData(reportAuthFailure: (error: unknown) => boolean) {
  const mockMode = isMockPreviewMode();
  const [proposals, setProposals] = useState<QueueState<ProposalApprovalView>>(
    mockMode ? { status: "ready", items: MOCK_ADMIN_PROPOSALS, error: null } : EMPTY_PROPOSALS,
  );
  const [joins, setJoins] = useState<QueueState<JoinRequestApprovalView>>(
    mockMode ? { status: "ready", items: MOCK_JOIN_REQUESTS, error: null } : EMPTY_JOINS,
  );
  const [dues, setDues] = useState<QueueState<DuesProofApprovalView>>(
    mockMode ? { status: "ready", items: MOCK_DUES_PROOFS, error: null } : EMPTY_DUES,
  );
  const [mutation, setMutation] = useState<MutationState | null>(null);
  const mutationRef = useRef<MutationState | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const controllers = useRef<AbortController[]>([]);

  const lockMutation = (next: MutationState) => {
    if (mutationRef.current) return false;
    mutationRef.current = next;
    setMutation(next);
    return true;
  };

  const unlockMutation = () => {
    mutationRef.current = null;
    setMutation(null);
  };

  const abortAll = useCallback(() => {
    controllers.current.forEach((controller) => controller.abort());
    controllers.current = [];
  }, []);

  const track = useCallback(() => {
    const controller = new AbortController();
    controllers.current.push(controller);
    return controller;
  }, []);

  const failQueue = useCallback((error: unknown): ApprovalsUiError | "auth" | "abort" => {
    if (isAbortError(error)) return "abort";
    if (reportAuthFailure(error)) return "auth";
    return normalizeApprovalsError(error);
  }, [reportAuthFailure]);

  const loadProposals = useCallback(async (refreshing = false) => {
    if (mockMode) return;
    const controller = track();
    setProposals((current) => ({
      ...current,
      status: refreshing && current.items.length ? "refreshing" : "loading",
      error: null,
    }));
    try {
      const page = await listAdminProposalViews({
        status: "pending_admin_review",
        page: 1,
        page_size: 100,
        signal: controller.signal,
      });
      setProposals({ status: readyOrEmpty(page.items), items: page.items, error: null });
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") return;
      setProposals((current) => ({
        status: mapped.kind === "forbidden" ? "forbidden" : "error",
        items: mapped.kind === "forbidden" ? [] : current.items,
        error: mapped,
      }));
    }
  }, [failQueue, mockMode, track]);

  const loadJoins = useCallback(async (refreshing = false) => {
    if (mockMode) return;
    const controller = track();
    setJoins((current) => ({
      ...current,
      status: refreshing && current.items.length ? "refreshing" : "loading",
      error: null,
    }));
    try {
      const page = await listMembershipRequestViews({
        status: "pending",
        page: 1,
        page_size: 100,
        signal: controller.signal,
      });
      setJoins({ status: readyOrEmpty(page.items), items: page.items, error: null });
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") return;
      setJoins((current) => ({
        status: mapped.kind === "forbidden" ? "forbidden" : "error",
        items: mapped.kind === "forbidden" ? [] : current.items,
        error: mapped,
      }));
    }
  }, [failQueue, mockMode, track]);

  const loadDues = useCallback(async (refreshing = false) => {
    if (mockMode) return;
    const controller = track();
    setDues((current) => ({
      ...current,
      status: refreshing && current.items.length ? "refreshing" : "loading",
      error: null,
    }));
    try {
      const page = await listAdminDuesViews({
        status: "submitted",
        page: 1,
        page_size: 100,
        signal: controller.signal,
      });
      setDues({ status: readyOrEmpty(page.items), items: page.items, error: null });
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") return;
      setDues((current) => ({
        status: mapped.kind === "forbidden" ? "forbidden" : "error",
        items: mapped.kind === "forbidden" ? [] : current.items,
        error: mapped,
      }));
    }
  }, [failQueue, mockMode, track]);

  const reloadAll = useCallback(async (refreshing = false) => {
    await Promise.all([loadProposals(refreshing), loadJoins(refreshing), loadDues(refreshing)]);
  }, [loadDues, loadJoins, loadProposals]);

  useEffect(() => {
    if (!mockMode) {
      void reloadAll(false);
    }
    return () => abortAll();
  }, [abortAll, mockMode, reloadAll]);

  const inspectProposal = useCallback(async (proposalId: string) => {
    if (mockMode) return proposals.items.find((item) => item.id === proposalId) ?? null;
    try {
      const record = await getAdminProposal(proposalId);
      const view = adaptAdminProposal(record);
      setProposals((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === view.id ? { ...item, ...view } : item)),
      }));
      return view;
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") return null;
      if (mapped.kind === "not_found" || mapped.kind === "conflict") {
        setLiveMessage(mapped.message);
        await loadProposals(true);
      }
      throw mapped;
    }
  }, [failQueue, loadProposals, mockMode, proposals.items]);

  const decideProposal = useCallback(async (
    proposalId: string,
    decision: "approve" | "reject",
    remarks?: string,
  ) => {
    if (!lockMutation({ id: proposalId, kind: "proposal" })) {
      throw new ApiClientError(409, "DECISION_IN_PROGRESS", "A decision is already in progress for this record.");
    }
    setLiveMessage("Saving the proposal decision.");
    try {
      if (mockMode) {
        setProposals((current) => {
          const items = current.items.filter((item) => item.id !== proposalId);
          return { ...current, items, status: readyOrEmpty(items) };
        });
        setLiveMessage("Proposal decision recorded in this UI preview.");
        return;
      }
      await submitAdminProposalDecision(proposalId, {
        decision,
        ...(remarks ? { remarks } : {}),
      });
      await Promise.all([loadProposals(true), loadJoins(true)]);
      setLiveMessage(decision === "approve" ? "Proposal approved." : "Proposal returned to the President.");
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") throw error;
      if (mapped.kind === "conflict" || mapped.kind === "not_found") {
        await loadProposals(true);
      }
      throw mapped;
    } finally {
      unlockMutation();
    }
  }, [failQueue, loadJoins, loadProposals, mockMode]);

  const decideJoin = useCallback(async (
    requestId: string,
    decision: "approve" | "reject",
    remarks?: string,
  ) => {
    if (!lockMutation({ id: requestId, kind: "join" })) {
      throw new ApiClientError(409, "DECISION_IN_PROGRESS", "A decision is already in progress for this record.");
    }
    setLiveMessage("Saving the membership decision.");
    try {
      if (mockMode) {
        setJoins((current) => {
          const items = current.items.filter((item) => item.id !== requestId);
          return { ...current, items, status: readyOrEmpty(items) };
        });
        setLiveMessage("Membership decision recorded in this UI preview.");
        return;
      }
      const result = await submitMembershipDecision(requestId, {
        decision,
        ...(remarks ? { remarks } : {}),
      });
      await Promise.all([loadJoins(true), loadDues(true)]);
      const persisted = adaptMembershipRequest(result.request);
      setLiveMessage(
        decision === "approve"
          ? `Student admitted. Membership is now ${persisted.status === "active" ? "active" : persisted.status}. Linked dues were marked paid.`
          : "Join request declined.",
      );
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") throw error;
      if (mapped.kind === "conflict" || mapped.kind === "not_found") {
        await loadJoins(true);
      }
      throw mapped;
    } finally {
      unlockMutation();
    }
  }, [failQueue, loadDues, loadJoins, mockMode]);

  const decideDues = useCallback(async (
    paymentId: string,
    status: "paid" | "rejected",
  ) => {
    if (!lockMutation({ id: paymentId, kind: "dues" })) {
      throw new ApiClientError(409, "DECISION_IN_PROGRESS", "A decision is already in progress for this record.");
    }
    setLiveMessage("Saving the dues decision.");
    try {
      if (mockMode) {
        setDues((current) => {
          const items = current.items.filter((item) => item.id !== paymentId);
          return { ...current, items, status: readyOrEmpty(items) };
        });
        setLiveMessage("Dues decision recorded in this UI preview.");
        return;
      }
      const record = await submitDuesDecision(paymentId, { status });
      await Promise.all([loadDues(true), loadJoins(true)]);
      setLiveMessage(record.status === "paid" ? "Dues proof verified." : "Dues proof rejected.");
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") throw error;
      if (mapped.kind === "conflict" || mapped.kind === "not_found") {
        await loadDues(true);
      }
      throw mapped;
    } finally {
      unlockMutation();
    }
  }, [failQueue, loadDues, loadJoins, mockMode]);

  const markWhatsApp = useCallback(async (requestId: string, added: boolean) => {
    const current = joins.items.find((item) => item.id === requestId);
    if (!current) return;
    if (mockMode) {
      setJoins((state) => ({
        ...state,
        items: state.items.map((item) =>
          item.id === requestId
            ? { ...item, whatsapp_added: added, whatsapp_onboarding_status: added ? "added" : "not_ready" }
            : item,
        ),
      }));
      setLiveMessage(added ? "Marked as added to WhatsApp." : "WhatsApp group status unmarked.");
      return;
    }
    if (!added) {
      setLiveMessage("WhatsApp added is recorded once and cannot be unmarked from this workspace.");
      return;
    }
    if (!current.whatsapp_ready) {
      setLiveMessage("Verify payment and admit the student before WhatsApp onboarding.");
      throw normalizeApprovalsError(new ApiClientError(409, "WHATSAPP_ONBOARDING_NOT_READY", "Verify the student's payment before WhatsApp onboarding."));
    }
    if (!lockMutation({ id: requestId, kind: "whatsapp" })) return;
    try {
      const record = await markMembershipWhatsAppAdded(requestId);
      const view = adaptMembershipRequest(record);
      setJoins((state) => ({
        ...state,
        items: state.items.map((item) => (item.id === view.id ? { ...item, ...view } : item)),
      }));
      setLiveMessage("Student marked as added to the official club WhatsApp group.");
    } catch (error) {
      const mapped = failQueue(error);
      if (mapped === "abort" || mapped === "auth") throw error;
      throw mapped;
    } finally {
      unlockMutation();
    }
  }, [failQueue, joins.items, mockMode]);

  const counts = useMemo(
    () => ({
      proposals: proposals.items.length,
      join_requests: joins.items.length,
      payment_proofs: dues.items.length,
    }),
    [dues.items.length, joins.items.length, proposals.items.length],
  );

  return {
    mockMode,
    source: mockMode ? "mock" : "integrated",
    proposals,
    joins,
    dues,
    counts,
    mutation,
    liveMessage,
    reloadAll,
    loadProposals,
    loadJoins,
    loadDues,
    inspectProposal,
    decideProposal,
    decideJoin,
    decideDues,
    markWhatsApp,
  };
}
