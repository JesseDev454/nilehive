import { useQuery } from "@tanstack/react-query";
import { ApiClientError, getPendingAdvisorProposals, type ProposalRecord } from "@/lib/api";

export interface AdvisorPendingProposal {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  submittedAt: string;
  status: "pending";
}

function getStoredAccessToken() {
  return (
    window.localStorage.getItem("nilehive_access_token")?.trim() ||
    window.sessionStorage.getItem("nilehive_access_token")?.trim() ||
    ""
  );
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
    status: "pending"
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
  const accessToken = getStoredAccessToken();

  return useQuery({
    queryKey: ["advisor-pending-proposals", accessToken],
    queryFn: async () => {
      if (!accessToken) {
        throw new ApiClientError("Missing advisor session", {
          status: 401,
          code: "AUTH_REQUIRED"
        });
      }

      const proposals = await getPendingAdvisorProposals(accessToken);
      return proposals.map(mapProposal);
    },
    enabled,
    retry: false
  });
}
