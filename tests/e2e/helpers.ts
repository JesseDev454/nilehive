import { expect, type Page } from "@playwright/test";

export interface ProfileFixture {
  effectiveRole: "student" | "admin" | "advisor" | "president" | "executive";
  fullName?: string;
}

export function profileResponse({ effectiveRole, fullName }: ProfileFixture) {
  const names: Record<ProfileFixture["effectiveRole"], string> = {
    admin: "Zainab Ahmed",
    advisor: "Dr. Kalu Okonkwo",
    president: "Farouk Aliyu",
    student: "Amina Bello",
    executive: "Chidi Nwosu",
  };
  const emails: Record<ProfileFixture["effectiveRole"], string> = {
    admin: "zainab.ahmed@nileuniversity.edu.ng",
    advisor: "kalu.okonkwo@nileuniversity.edu.ng",
    president: "farouk.aliyu@nileuniversity.edu.ng",
    student: "amina.bello@nileuniversity.edu.ng",
    executive: "chidi.nwosu@nileuniversity.edu.ng",
  };
  const email = emails[effectiveRole];

  return {
    data: {
      user: {
        id: `e2e-${effectiveRole}`,
        email,
        role: effectiveRole === "admin" || effectiveRole === "advisor" ? "staff" : "student",
      },
      profile: {
        id: `e2e-${effectiveRole}-profile`,
        email,
        portal_user_id: "portal-e2e",
        full_name: fullName || names[effectiveRole],
        role: effectiveRole,
        app_role: effectiveRole,
        effective_role: effectiveRole,
        portal_role: effectiveRole === "admin" || effectiveRole === "advisor" ? "staff" : "student",
        custom_roles: effectiveRole === "admin" ? ["club_services_admin"] : [],
        access_pending: false,
        role_sync_state: "active",
        club_id: null,
        student_id: "NIL/2023/UG/0458",
        requested_role: null,
        onboarding_status: "complete",
        account_status: "active",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      requires_profile_setup: false,
    },
  };
}

export async function mockProfileMe(
  page: Page,
  result:
    | { status: 200; profile: ProfileFixture }
    | { status: number; code: string; message: string },
) {
  await page.route("**/api/v1/profile/me", async (route) => {
    if ("profile" in result) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(profileResponse(result.profile)),
      });
      return;
    }

    await route.fulfill({
      status: result.status,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: result.code, message: result.message },
      }),
    });
  });

  if ("profile" in result) {
    await page.route("**/api/v1/auth/csrf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "Cache-Control": "no-store" },
        body: JSON.stringify({ data: { csrf_token: "e2e-csrf-token" } }),
      });
    });
  }
}

export const E2E_PROPOSAL = {
  id: "proposal-e2e-1",
  title: "Google Cloud Buildathon",
  description: "A practical buildathon for student teams.",
  club_id: "club-8",
  club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
  submitted_by: "president-1",
  event_date: "2026-09-12",
  location: "Technology Auditorium",
  aim_objectives: "Train students on responsible AI.",
  proposed_activity: "Buildathon",
  budget_estimate: 150000,
  status: "pending_admin_review",
  advisor_remarks: "Ready for Admin review.",
  submitted_at: "2026-08-10T10:00:00.000Z",
  approval_history: [],
};

export const E2E_JOIN = {
  id: "join-e2e-1",
  profile_id: "student-e2e-1",
  club_id: "club-4",
  status: "pending",
  join_reason: "I want to support sustainability projects.",
  created_at: "2026-08-18T14:30:00Z",
  profile: {
    id: "student-e2e-1",
    full_name: "Amina Bello",
    student_id: "NIL/2023/UG/0491",
    role: "student",
  },
  club: { id: "club-4", name: "Nile Climate Initiatives Club", code: "NCIC" },
  due_payment: { id: "due-e2e-1", status: "submitted", amount: 10000 },
  whatsapp_onboarding_status: "not_ready",
};

export const E2E_DUES = {
  id: "due-e2e-1",
  club_id: "club-2",
  member_id: "member-e2e-1",
  amount: 10000,
  payment_reference: "REF-NUB-984210",
  payment_account_name: null,
  proof_url: "/oneclub.svg",
  status: "submitted",
  submitted_at: "2026-08-18T16:15:00Z",
  club: { id: "club-2", name: "Nile Business Club", code: "NBUC" },
  member: {
    id: "member-e2e-1",
    full_name: "Fatima Aliyu",
    student_id: "NIL/2024/UG/1029",
    email: null,
  },
};

function pageEnvelope<T>(items: T[]) {
  return { items, page: 1, page_size: 100, total: items.length, has_next: false };
}

export async function mockApprovalsApi(
  page: Page,
  options: {
    proposals?: unknown[];
    joins?: unknown[];
    dues?: unknown[];
    proposalStatus?: number;
    joinStatus?: number;
    duesStatus?: number;
    decision?: { status: number; body: unknown };
    duesDecision?: { status: number; body: unknown };
    membershipDecision?: { status: number; body: unknown };
  } = {},
) {
  const proposals = options.proposals ?? [E2E_PROPOSAL];
  const joins = options.joins ?? [E2E_JOIN];
  const dues = options.dues ?? [E2E_DUES];
  let proposalDecisionCount = 0;
  let membershipDecisionCount = 0;
  let duesDecisionCount = 0;

  await page.route("**/api/v1/proposals/admin**", async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() === "POST" && url.includes("/decision")) {
      proposalDecisionCount += 1;
      const result = options.decision ?? {
        status: 200,
        body: { data: { ...E2E_PROPOSAL, status: "approved" } },
      };
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        body: JSON.stringify(result.body),
      });
      return;
    }
    if (options.proposalStatus && options.proposalStatus !== 200) {
      await route.fulfill({
        status: options.proposalStatus,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "FORBIDDEN", message: "No access" } }),
      });
      return;
    }
    if (request.method() === "GET" && /\/proposals\/admin\/[^/?]+$/.test(new URL(url).pathname)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: proposals[0] || E2E_PROPOSAL }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: pageEnvelope(proposals) }),
    });
  });

  await page.route("**/api/v1/membership-requests**", async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() === "POST" && url.includes("/decision")) {
      membershipDecisionCount += 1;
      const result = options.membershipDecision ?? {
        status: 200,
        body: {
          data: {
            request: { ...E2E_JOIN, status: "active" },
            member: null,
            due_payment: { id: "due-e2e-1", status: "paid" },
          },
        },
      };
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        body: JSON.stringify(result.body),
      });
      return;
    }
    if (options.joinStatus && options.joinStatus !== 200) {
      await route.fulfill({
        status: options.joinStatus,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "FORBIDDEN", message: "No access" } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: pageEnvelope(joins) }),
    });
  });

  await page.route("**/api/v1/dues**", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      duesDecisionCount += 1;
      const result = options.duesDecision ?? {
        status: 200,
        body: { data: { ...E2E_DUES, status: "paid" } },
      };
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        body: JSON.stringify(result.body),
      });
      return;
    }
    if (options.duesStatus && options.duesStatus !== 200) {
      await route.fulfill({
        status: options.duesStatus,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "FORBIDDEN", message: "No access" } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { summary: { submitted: dues.length }, payments: pageEnvelope(dues) },
      }),
    });
  });

  return {
    counts: () => ({
      proposalDecisionCount,
      membershipDecisionCount,
      duesDecisionCount,
    }),
  };
}

export async function expectNoFeedbackManager(page: Page) {
  await expect(page.getByText("Feedback Manager")).toHaveCount(0);
}

export const E2E_CLUBS = [
  { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
  { id: "club-2", name: "Nile Business Club", code: "NBUC" },
];

export const E2E_PERSON = {
  id: "person-e2e-1",
  full_name: "Amina Bello",
  email: "amina.bello@nileuniversity.edu.ng",
  portal_user_id: "campus-amina",
  department: "Computer Science",
  student_type: "undergraduate",
  role: "student",
  app_role: "student",
  effective_role: "student",
  portal_role: null,
  custom_roles: [],
  club_id: null,
  student_id: "NIL/2023/UG/0458",
  requested_role: null,
  onboarding_status: "complete",
  account_status: "active",
  club: null,
  advisor_assignments: [],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export const E2E_ADVISOR = {
  id: "person-e2e-advisor",
  full_name: "Dr. Kalu Okonkwo",
  email: "kalu.okonkwo@nileuniversity.edu.ng",
  portal_user_id: "campus-kalu",
  department: "Computer Science",
  student_type: "staff",
  role: "advisor",
  app_role: "advisor",
  effective_role: "advisor",
  portal_role: null,
  custom_roles: [],
  club_id: "club-8",
  student_id: "NIL/STAFF/FNS/044",
  requested_role: null,
  onboarding_status: "complete",
  account_status: "active",
  club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
  advisor_assignments: [
    {
      id: "assignment-e2e-1",
      club_id: "club-8",
      assigned_by: "admin-1",
      remarks: null,
      created_at: "2026-01-01T00:00:00.000Z",
      club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
    },
  ],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export async function mockPeopleApi(
  page: Page,
  options: {
    people?: Array<Record<string, unknown>>;
    listStatus?: number;
    detailStatus?: number;
    roleResult?: { status: number; body: unknown };
    advisorResult?: { status: number; body: unknown };
  } = {},
) {
  const people = options.people ?? [E2E_PERSON, E2E_ADVISOR];
  const rolePosts: Array<{ csrf: string | null; body: unknown; url: string }> = [];
  const advisorPosts: Array<{ csrf: string | null; body: unknown; url: string }> = [];
  const listErrorStatus = options.listStatus && options.listStatus !== 200 ? options.listStatus : null;
  let failList = Boolean(listErrorStatus);

  await page.route("**/api/v1/clubs**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: E2E_CLUBS }),
    });
  });

  await page.route("**/api/v1/admin/users**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (request.method() === "POST" && path.endsWith("/role")) {
      rolePosts.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      const result = options.roleResult ?? {
        status: 200,
        body: {
          data: {
            profile: {
              ...E2E_PERSON,
              role: "president",
              app_role: "president",
              club_id: "club-8",
              club: E2E_CLUBS[0],
            },
            history: { id: "history-e2e-1" },
          },
        },
      };
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        headers: result.status === 429 ? { "Retry-After": "12" } : {},
        body: JSON.stringify(result.body),
      });
      return;
    }

    if (request.method() === "POST" && path.endsWith("/advisor-assignment")) {
      advisorPosts.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      const result = options.advisorResult ?? {
        status: 200,
        body: {
          data: {
            profile: {
              ...E2E_ADVISOR,
              advisor_assignments: [
                ...E2E_ADVISOR.advisor_assignments,
                {
                  id: "assignment-e2e-2",
                  club_id: "club-2",
                  assigned_by: "admin-1",
                  remarks: null,
                  created_at: "2026-08-20T00:00:00.000Z",
                  club: E2E_CLUBS[1],
                },
              ],
            },
            club: E2E_CLUBS[1],
            history: { id: "history-e2e-2" },
          },
        },
      };
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        body: JSON.stringify(result.body),
      });
      return;
    }

    if (request.method() === "GET" && /\/admin\/users\/[^/]+$/.test(path)) {
      if (options.detailStatus && options.detailStatus !== 200) {
        await route.fulfill({
          status: options.detailStatus,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "PROFILE_NOT_FOUND", message: "Profile not found" } }),
        });
        return;
      }
      const id = path.split("/").at(-1);
      const person = people.find((item) => item.id === id) ?? people[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: person }),
      });
      return;
    }

    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: listErrorStatus === 403 ? "FORBIDDEN" : "SERVER", message: "No access" },
        }),
      });
      return;
    }

    const role = url.searchParams.get("role");
    const query = (url.searchParams.get("q") || "").toLowerCase();
    const clubId = url.searchParams.get("club_id");
    let items = people.slice();
    if (role) items = items.filter((item) => item.role === role || item.app_role === role);
    if (query) {
      items = items.filter((item) =>
        `${item.full_name ?? ""} ${item.student_id ?? ""} ${item.email ?? ""}`.toLowerCase().includes(query),
      );
    }
    if (clubId) items = items.filter((item) => item.club_id === clubId);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          items,
          page: Number(url.searchParams.get("page") || 1),
          page_size: Number(url.searchParams.get("page_size") || 20),
          total: items.length,
          has_next: false,
        },
      }),
    });
  });

  return {
    rolePosts,
    advisorPosts,
    allowList() {
      failList = false;
    },
  };
}
