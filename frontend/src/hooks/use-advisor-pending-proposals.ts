import { useQuery } from "@tanstack/react-query";
import { ApiClientError, getPendingAdvisorProposals, type ProposalRecord } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface AdvisorPendingProposal {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  submittedAt: string;
  status: string;
}

function toDateOnly(value: string) {
  return value ? value.slice(0, 10) : "";
}

function mapProposal(record: ProposalRecord): AdvisorPendingProposal {
  return {
    id: record.id,
    title: record.title,
    location: record.location,
    eventDate: record.event_date,
    submittedAt: toDateOnly(record.created_at),
    status: record.status
  };
}

export function getAdvisorPendingProposalsErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load pending proposals right now.";
}

export function useAdvisorPendingProposals(enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["advisor-pending-proposals", user?.id],
    queryFn: async () => {
      const proposals = await getPendingAdvisorProposals();
      return proposals.map(mapProposal);
    },
    enabled: enabled && !!user,
    retry: false
  });
}
