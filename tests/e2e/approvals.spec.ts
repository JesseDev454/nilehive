import { expect, test } from "@playwright/test";
import {
  E2E_DUES,
  E2E_JOIN,
  E2E_PROPOSAL,
  mockApprovalsApi,
  mockProfileMe,
} from "./helpers";

test("Admin proposal queue loads backend-shaped data and approves with CSRF", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockApprovalsApi(page);
  const decisions: Array<{ url: string; csrf: string | null; body: unknown }> = [];

  await page.route("**/api/v1/proposals/admin/*/decision", async (route) => {
    const request = route.request();
    decisions.push({
      url: request.url(),
      csrf: await request.headerValue("x-csrf-token"),
      body: request.postDataJSON(),
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { ...E2E_PROPOSAL, status: "approved" } }),
    });
  });

  await page.goto("/admin/approvals");
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon", level: 2 })).toBeVisible();
  await expect(page.getByText("Ready for Admin review.")).toBeVisible();
  await page.getByRole("button", { name: "Approve proposal: Google Cloud Buildathon" }).click();
  await expect(page.getByRole("heading", { name: "Authorize Event Proposal" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm Authorization" }).click({ force: true });
  await expect(page.getByText("Decision saved.")).toBeVisible();
  expect(decisions).toHaveLength(1);
  expect(decisions[0].csrf).toBe("e2e-csrf-token");
  expect(decisions[0].body).toEqual({ decision: "approve" });
  expect(decisions[0].url).toContain("/api/v1/proposals/admin/proposal-e2e-1/decision");
  void api;
});

test("Admin proposal rejection requires remarks and keeps them after failure", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page);
  const bodies: unknown[] = [];
  await page.route("**/api/v1/proposals/admin/*/decision", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { ...E2E_PROPOSAL, status: "admin_rejected" } }),
    });
  });
  await page.goto("/admin/approvals");
  await page.getByRole("button", { name: "Reject proposal: Google Cloud Buildathon" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Return Proposal with Remarks" }).click({ force: true });
  await expect(page.getByText("Remarks are required to proceed with this decision.")).toBeVisible();
  await page.getByLabel(/Required Return/).fill("Venue conflict with convocation week.");
  await page.getByRole("dialog").getByRole("button", { name: "Return Proposal with Remarks" }).click({ force: true });
  await expect(page.getByText("Decision saved.")).toBeVisible();
  expect(bodies).toEqual([{ decision: "reject", remarks: "Venue conflict with convocation week." }]);
});

test("stale proposal decision shows conflict and retry", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page, {
    decision: {
      status: 409,
      body: { error: { code: "INVALID_PROPOSAL_STATE", message: "Proposal is not awaiting admin review" } },
    },
  });
  await page.goto("/admin/approvals");
  await page.getByRole("button", { name: "Approve proposal: Google Cloud Buildathon" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm Authorization" }).click({ force: true });
  await expect(page.locator("#admin-decision-remarks-error")).toContainText("This record was already changed");
  await expect(page.getByRole("heading", { name: "Authorize Event Proposal" })).toBeVisible();
});

test("proposal queue 403 removes protected content", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page, { proposalStatus: 403, proposals: [] });
  await page.goto("/admin/approvals");
  await expect(page.getByRole("heading", { name: "No access to this approvals queue" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon", level: 2 })).toHaveCount(0);
});

test("proposal queue 500 offers retry without mock records", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page, { proposals: [], joins: [], dues: [] });
  let failProposals = true;
  await page.route("**/api/v1/proposals/admin**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    if (failProposals) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER", message: "Broken" } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { items: [E2E_PROPOSAL], page: 1, page_size: 100, total: 1, has_next: false } }),
    });
  });
  await page.goto("/admin/approvals");
  await expect(page.getByText("This queue could not be loaded")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon", level: 2 })).toHaveCount(0);
  failProposals = false;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("heading", { name: "Google Cloud Buildathon", level: 2 })).toBeVisible();
});

test("membership queue approves and prevents duplicate clicks", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  const api = await mockApprovalsApi(page);
  const bodies: unknown[] = [];
  await page.route("**/api/v1/membership-requests/*/decision", async (route) => {
    bodies.push(route.request().postDataJSON());
    expect(await route.request().headerValue("x-csrf-token")).toBe("e2e-csrf-token");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          request: { ...E2E_JOIN, status: "active" },
          member: null,
          due_payment: { id: "due-e2e-1", status: "paid" },
        },
      }),
    });
  });

  await page.goto("/admin/approvals");
  await page.getByRole("tab", { name: /Join Requests/ }).click();
  await expect(page.getByText("Pending Membership Applications")).toBeVisible();
  await page.getByRole("button", { name: "Approve membership request from Amina Bello" }).click();
  await expect(page.getByRole("heading", { name: "Admit Student to Club" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm Admission" }).dblclick();
  await expect(page.getByText("Decision saved.")).toBeVisible();
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toEqual({ decision: "approve" });
  void api;
});

test("empty membership and dues queues render approved empty states", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page, { proposals: [], joins: [], dues: [] });
  await page.goto("/admin/approvals");
  await expect(page.getByText("No proposals waiting for authorization")).toBeVisible();
  await page.getByRole("tab", { name: /Join Requests/ }).click();
  await expect(page.getByText("No join requests pending")).toBeVisible();
  await page.getByRole("tab", { name: /Payment Proofs/ }).click();
  await expect(page.getByText("No payment proofs awaiting review")).toBeVisible();
});

test("dues proof viewer and verify request use the record id", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page);
  const duesPosts: Array<{ url: string; body: unknown; csrf: string | null }> = [];
  await page.route("**/api/v1/dues/**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    duesPosts.push({
      url: route.request().url(),
      body: route.request().postDataJSON(),
      csrf: await route.request().headerValue("x-csrf-token"),
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { ...E2E_DUES, status: "paid" } }),
    });
  });

  await page.goto("/admin/approvals");
  await page.getByRole("tab", { name: /Payment Proofs/ }).click();
  await expect(page.getByText("Dues Proofs Waiting Review")).toBeVisible();
  await expect(page.getByAltText("Dues receipt for Fatima Aliyu")).toBeVisible();
  await page.getByRole("button", { name: "Verify dues payment for Fatima Aliyu" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm Payment Verification" }).click();
  await expect(page.getByText("Decision saved.")).toBeVisible();
  expect(duesPosts).toHaveLength(1);
  expect(duesPosts[0].url).toContain("/api/v1/dues/due-e2e-1");
  expect(duesPosts[0].body).toEqual({ status: "paid" });
  expect(duesPosts[0].csrf).toBe("e2e-csrf-token");
});

test("missing dues proof shows an honest empty viewer", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page, {
    dues: [{ ...E2E_DUES, proof_url: null }],
  });
  await page.goto("/admin/approvals");
  await page.getByRole("tab", { name: /Payment Proofs/ }).click();
  await expect(page.getByText("No authorized proof file was returned for this record.")).toBeVisible();
});

test("student and president cannot open Admin Approvals", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "student" } });
  await page.goto("/admin/approvals");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();

  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "president" } });
  await page.goto("/admin/approvals");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
});

test("advisor is denied the Admin Approvals workspace", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "advisor" } });
  await page.goto("/admin/approvals");
  await expect(page.getByRole("heading", { name: "No Access to this Workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Authorize Proposal" })).toHaveCount(0);
});

test("expired session on Approvals shows the session expired screen", async ({ page }) => {
  await mockProfileMe(page, {
    status: 401,
    code: "SESSION_EXPIRED",
    message: "Your session has expired",
  });
  await page.goto("/admin/approvals");
  await expect(page.getByRole("heading", { name: "Your session has expired" })).toBeVisible();
  await expect(page.getByText("Google Cloud Buildathon")).toHaveCount(0);
});

test("desktop and mobile light and dark Approvals layouts stay intact", async ({ page }) => {
  await mockProfileMe(page, { status: 200, profile: { effectiveRole: "admin" } });
  await mockApprovalsApi(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/approvals");
  await expect(page.getByText("Campus Approvals & Verifications")).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByText("Awaiting Final Decision")).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("Campus Approvals & Verifications")).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByRole("button", { name: "Approve proposal: Google Cloud Buildathon" })).toBeVisible();
});
