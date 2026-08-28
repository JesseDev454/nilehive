import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminProposalReview from "./AdminProposalReview";

const getAdminProposals = vi.fn();

vi.mock("@/lib/api", () => ({
  ApiClientError: class ApiClientError extends Error {},
  getAdminProposals: (...args: unknown[]) => getAdminProposals(...args),
  submitAdminDecision: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: null }),
}));

vi.mock("@/lib/notify", () => ({ actionError: vi.fn(), actionSuccess: vi.fn() }));

describe("AdminProposalReview", () => {
  beforeEach(() => {
    getAdminProposals.mockResolvedValue({
      items: [{
        id: "proposal-1",
        title: "Nile Tech Symposium",
        status: "pending_admin_review",
        event_date: "2026-09-12",
        submitted_at: "2026-08-27T10:00:00.000Z",
        location: "Conference Hall",
        created_at: "2026-08-20T10:00:00.000Z",
        updated_at: "2026-08-27T10:00:00.000Z",
      }],
      page: 1,
      page_size: 100,
      total: 1,
      has_next: false,
    });
  });

  it("loads the Campus One cookie-backed queue without a bearer token", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminProposalReview />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Nile Tech Symposium")).toBeInTheDocument();
    expect(screen.getByText("2026-09-12")).toBeInTheDocument();
    expect(getAdminProposals).toHaveBeenCalledWith({
      current_stage: "admin_review",
      page: 1,
      page_size: 100,
    });
  });
});
