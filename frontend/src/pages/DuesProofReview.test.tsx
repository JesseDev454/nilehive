import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DuesProofReview from "./DuesProofReview";

const updateDuePayment = vi.fn();

vi.mock("@/contexts/RoleContext", () => ({
  useRole: () => ({ role: "admin" }),
}));

vi.mock("@/lib/api", () => ({
  ApiClientError: class ApiClientError extends Error {},
  getDuePayment: vi.fn().mockResolvedValue({
    id: "payment-1",
    club_id: "club-1",
    member_id: "member-1",
    amount: 10000,
    academic_session: "2025/2026",
    payment_reference: null,
    payment_account_name: null,
    payment_paid_at: null,
    payer_note: null,
    proof_url: "dues/student-1/proof.png",
    submitted_at: "2026-09-07T14:00:00.000Z",
    status: "submitted",
    verified_by: null,
    verified_at: null,
    created_at: "2026-09-07T14:00:00.000Z",
    updated_at: "2026-09-07T14:00:00.000Z",
    club: { id: "club-1", name: "Nile Tech Club", code: "NTC" },
    member: {
      id: "member-1",
      full_name: "Amina Yusuf",
      student_id: "221100001",
      email: "amina@example.edu",
      phone_number: null,
      club_role: "member",
      membership_status: "inactive",
    },
  }),
  updateDuePayment: (...args: unknown[]) => updateDuePayment(...args),
}));

vi.mock("@/lib/storage", () => ({
  resolveStorageFileUrl: vi.fn().mockResolvedValue("https://example.test/proof.png"),
}));

vi.mock("@/lib/notify", () => ({ actionError: vi.fn(), actionSuccess: vi.fn() }));

describe("DuesProofReview", () => {
  beforeEach(() => {
    updateDuePayment.mockReset();
  });

  it("shows saving only on the decision button the admin clicked", async () => {
    updateDuePayment.mockImplementation(() => new Promise(() => {}));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dues/payment-1"]}>
          <Routes>
            <Route path="/dues/:paymentId" element={<DuesProofReview />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const proof = await screen.findByAltText("Amina Yusuf dues payment proof");
    fireEvent.load(proof);
    const rejectButton = screen.getByRole("button", { name: "Reject Proof" });
    fireEvent.click(rejectButton);

    expect(await screen.findByRole("button", { name: "Saving..." })).toBe(rejectButton);
    expect(screen.getByRole("button", { name: "Verify Payment" })).toBeDisabled();
    expect(screen.queryAllByRole("button", { name: "Saving..." })).toHaveLength(1);
    expect(updateDuePayment).toHaveBeenCalledWith("payment-1", { status: "rejected" });
  });
});
