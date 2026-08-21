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

export const E2E_OFFICIAL_CLUB_SEED = [
  ["club-nbc", "Nile Book Club", "NBC", "Arts"],
  ["club-nbuc", "Nile Business Club", "NBUC", "Entrepreneurship"],
  ["club-ncc", "Nile Charity Club", "NCC", "Volunteering"],
  ["club-ncic", "Nile Climate Initiatives Club", "NCIC", "Volunteering"],
  ["club-ncac", "Nile Creative Arts Club", "NCAC", "Arts"],
  ["club-ndc", "Nile Debate Club", "NDC", "Leadership"],
  ["club-ngc", "Nile Games Club", "NGC", "Gaming"],
  ["club-ngd", "Nile Google Developers", "NGD", "Tech"],
  ["club-nmun", "Nile Model United Nations Club", "NMUN", "Leadership"],
  ["club-npc", "Nile Photography Club", "NPC", "Media"],
  ["club-nsc", "Nile Startup Campus", "NSC", "Entrepreneurship"],
  ["club-ntc", "Nile Toastmaster's Club", "NTC", "Leadership"],
  ["club-tedx", "TEDx Nile Club", "TEDX", "Leadership"],
  ["club-wit", "Women in Tech Club", "WIT", "Tech"],
] as const;

export function e2eOfficialClubs() {
  return E2E_OFFICIAL_CLUB_SEED.map(([id, name, code, category]) => ({
    id,
    name,
    code,
    description: `${name} is one of Nile University's 14 official student organizations.`,
    advisor_id: null,
    dues_amount: 10000,
    is_public_signup: true,
    whatsapp_group_name: null,
    whatsapp_onboarding_notes: id === "club-ngd" ? "Private GDG onboarding notes." : null,
    categories: [category],
    skills_offered: [],
    career_goals: [],
    meeting_windows: [],
    weekly_commitment: null,
    logo_path: null,
    website_url: null,
    social_links: {},
    created_at: "2026-01-01T00:00:00.000Z",
  }));
}

export const E2E_CLUB_MEMBER = {
  id: "member-ngd-1",
  club_id: "club-ngd",
  profile_id: "person-e2e-president",
  full_name: "Farouk Aliyu",
  student_id: "NIL/2022/UG/0101",
  email: "farouk.aliyu@nileuniversity.edu.ng",
  phone_number: null,
  club_role: "president",
  membership_status: "active",
  dues_status: "paid",
  dues_paid: true,
  created_at: "2026-02-01T10:00:00.000Z",
  updated_at: "2026-02-01T10:00:00.000Z",
};

export const E2E_CLUB_PAYMENT = {
  id: "pay-ngd",
  club_id: "club-ngd",
  bank_name: "Providus Bank",
  account_number: "1305861314",
  account_name: "Nile Arts & Creative Hub",
  payment_instructions: "All students pay N10,000 per session.",
  fresher_dues_amount: 10000,
  returning_student_dues_amount: 10000,
};

export async function mockClubsApi(
  page: Page,
  options: {
    clubs?: Array<Record<string, unknown>>;
    listStatus?: number;
    detailStatus?: number;
    updateResult?: { status: number; body: unknown };
    members?: Array<Record<string, unknown>>;
  } = {},
) {
  const clubs = options.clubs ?? e2eOfficialClubs();
  const members = options.members ?? [E2E_CLUB_MEMBER];
  const patches: Array<{ csrf: string | null; body: unknown; url: string }> = [];
  const paymentPosts: Array<{ csrf: string | null; body: unknown; url: string }> = [];
  const listErrorStatus = options.listStatus && options.listStatus !== 200 ? options.listStatus : null;
  let failList = Boolean(listErrorStatus);

  await page.route("**/api/v1/admin/users**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const role = url.searchParams.get("role");
    const items =
      role === "president"
        ? [
            {
              id: "person-e2e-president",
              full_name: "Farouk Aliyu",
              email: "farouk.aliyu@nileuniversity.edu.ng",
              role: "president",
              app_role: "president",
              club_id: "club-ngd",
              student_id: "NIL/2022/UG/0101",
              advisor_assignments: [],
              club: { id: "club-ngd", name: "Nile Google Developers", code: "NGD" },
            },
          ]
        : role === "advisor"
          ? [
              {
                id: "person-e2e-advisor",
                full_name: "Dr. Kalu Okonkwo",
                email: "kalu.okonkwo@nileuniversity.edu.ng",
                role: "advisor",
                app_role: "advisor",
                club_id: "club-ngd",
                advisor_assignments: [
                  {
                    id: "assignment-ngd",
                    club_id: "club-ngd",
                    assigned_by: "admin-1",
                    remarks: null,
                    created_at: "2026-01-01T00:00:00.000Z",
                    club: { id: "club-ngd", name: "Nile Google Developers", code: "NGD" },
                  },
                ],
              },
            ]
          : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { items, page: 1, page_size: 100, total: items.length, has_next: false },
      }),
    });
  });

  await page.route("**/api/v1/members**", async (route) => {
    const url = new URL(route.request().url());
    const clubId = url.searchParams.get("club_id");
    const items = members.filter((member) => !clubId || member.club_id === clubId);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { items, page: 1, page_size: 100, total: items.length, has_next: false },
      }),
    });
  });

  await page.route("**/api/v1/dues/payment-settings**", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      paymentPosts.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: E2E_CLUB_PAYMENT }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: E2E_CLUB_PAYMENT }),
    });
  });

  await page.route("**/api/v1/clubs**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const clubId = url.pathname.split("/").pop();

    if (request.method() === "PATCH") {
      patches.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      const result = options.updateResult;
      if (result) {
        await route.fulfill({
          status: result.status,
          contentType: "application/json",
          headers: result.status === 429 ? { "Retry-After": "12" } : {},
          body: JSON.stringify(result.body),
        });
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      const current = clubs.find((club) => club.id === clubId) ?? clubs[0];
      const updated = { ...current, ...body };
      const index = clubs.findIndex((club) => club.id === clubId);
      if (index >= 0) clubs[index] = updated;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: updated }),
      });
      return;
    }

    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Clubs unavailable" } }),
      });
      return;
    }

    if (clubId && clubId !== "clubs") {
      if (options.detailStatus && options.detailStatus !== 200) {
        await route.fulfill({
          status: options.detailStatus,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "CLUB_NOT_FOUND", message: "Club not found" } }),
        });
        return;
      }
      const club = clubs.find((item) => item.id === clubId) ?? clubs[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { ...club, gallery: [] } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: clubs }),
    });
  });

  return {
    patches,
    paymentPosts,
    allowList() {
      failList = false;
    },
  };
}

export const E2E_EVENT = {
  id: "proposal-e2e-event-1",
  proposal_id: "proposal-e2e-event-1",
  club_id: "club-ngd",
  title: "Google Cloud Buildathon",
  proposal_title: "Google Cloud Buildathon",
  description: "A practical buildathon for student teams.",
  event_date: "2099-09-12",
  event_time: "10:00:00",
  location: "Technology Auditorium",
  number_of_participants: 150,
  budget_estimate: 150000,
  status: "approved",
  current_stage: "approved",
  event_lifecycle: "upcoming",
  can_rsvp: true,
  approved_at: "2026-08-10T10:00:00.000Z",
  created_at: "2026-08-01T10:00:00.000Z",
  updated_at: "2026-08-10T10:00:00.000Z",
};

export const E2E_PAST_EVENT = {
  ...E2E_EVENT,
  id: "proposal-e2e-event-past",
  proposal_id: "proposal-e2e-event-past",
  title: "Climate Showcase",
  event_date: "2020-01-15",
  event_lifecycle: "past",
  can_rsvp: false,
  club_id: "club-wit",
};

export const E2E_ANNOUNCEMENT = {
  id: "ann-e2e-1",
  club_id: null,
  created_by: "e2e-admin-profile",
  title: "Grant Guidelines",
  message: "Review the approved proposal calendar before disbursement this semester.",
  audience: "all_users",
  priority: "high",
  target_role: null,
  is_read: false,
  read_at: null,
  created_at: "2026-08-18T14:30:00.000Z",
  updated_at: "2026-08-18T14:30:00.000Z",
};

export const E2E_CHECKIN_STUDENT = {
  id: "student-e2e-checkin",
  full_name: "Ibrahim Sani",
  email: "ibrahim.sani@nileuniversity.edu.ng",
  role: "student",
  app_role: "student",
  club_id: "club-ngd",
  student_id: "NIL/2023/UG/0491",
  advisor_assignments: [],
  club: { id: "club-ngd", name: "Nile Google Developers", code: "NGD" },
};

export async function mockEventsApi(
  page: Page,
  options: {
    events?: Array<Record<string, unknown>>;
    listStatus?: number;
    engagementStatus?: number;
    attendanceResult?: { status: number; body: unknown };
    reports?: Array<Record<string, unknown>>;
  } = {},
) {
  const events = options.events ?? [E2E_EVENT, E2E_PAST_EVENT];
  const clubs = e2eOfficialClubs();
  const attendancePosts: Array<{ csrf: string | null; body: unknown; url: string }> = [];
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
      body: JSON.stringify({ data: clubs }),
    });
  });

  await page.route("**/api/v1/admin/users**", async (route) => {
    const url = new URL(route.request().url());
    const query = (url.searchParams.get("q") || "").toLowerCase();
    const items = query && E2E_CHECKIN_STUDENT.student_id.toLowerCase().includes(query)
      ? [E2E_CHECKIN_STUDENT]
      : query
        ? []
        : [E2E_CHECKIN_STUDENT];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { items, page: 1, page_size: 20, total: items.length, has_next: false },
      }),
    });
  });

  await page.route("**/api/v1/reports**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          items: options.reports ?? [],
          page: 1,
          page_size: 100,
          total: (options.reports ?? []).length,
          has_next: false,
        },
      }),
    });
  });

  await page.route("**/api/v1/events/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === "POST" && url.pathname.endsWith("/attendance")) {
      attendancePosts.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      const result = options.attendanceResult ?? {
        status: 200,
        body: {
          data: {
            id: "att-e2e-1",
            proposal_id: E2E_EVENT.id,
            club_id: "club-ngd",
            user_id: E2E_CHECKIN_STUDENT.id,
            attended: true,
            checked_in_by: "e2e-admin-profile",
            checked_in_at: "2026-08-20T10:14:00.000Z",
            profile: {
              id: E2E_CHECKIN_STUDENT.id,
              full_name: E2E_CHECKIN_STUDENT.full_name,
              student_id: E2E_CHECKIN_STUDENT.student_id,
              role: "student",
            },
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

    if (request.method() === "GET" && url.pathname.endsWith("/engagement")) {
      if (options.engagementStatus && options.engagementStatus !== 200) {
        await route.fulfill({
          status: options.engagementStatus,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "APPROVED_EVENT_NOT_FOUND", message: "Approved event not found" } }),
        });
        return;
      }
      const proposalId = url.pathname.split("/").slice(-2, -1)[0];
      const event = events.find((item) => item.id === proposalId) ?? events[0];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            event,
            summary: { total_rsvps: 2, going: 1, interested: 1, not_going: 0, cancelled: 0, attended: 1 },
            rsvps: [
              {
                id: "rsvp-e2e-1",
                proposal_id: event.id,
                club_id: event.club_id,
                user_id: E2E_CHECKIN_STUDENT.id,
                status: "going",
                profile: {
                  id: E2E_CHECKIN_STUDENT.id,
                  full_name: E2E_CHECKIN_STUDENT.full_name,
                  student_id: E2E_CHECKIN_STUDENT.student_id,
                  role: "student",
                },
              },
            ],
            attendance: [
              {
                id: "att-e2e-existing",
                proposal_id: event.id,
                club_id: event.club_id,
                user_id: E2E_CHECKIN_STUDENT.id,
                attended: true,
                checked_in_by: E2E_CHECKIN_STUDENT.id,
                checked_in_at: "2026-08-20T10:00:00.000Z",
                profile: {
                  id: E2E_CHECKIN_STUDENT.id,
                  full_name: E2E_CHECKIN_STUDENT.full_name,
                  student_id: E2E_CHECKIN_STUDENT.student_id,
                  role: "student",
                },
              },
            ],
          },
        }),
      });
      return;
    }

    if (request.method() === "GET" && url.pathname.endsWith("/approved")) {
      if (failList) {
        await route.fulfill({
          status: listErrorStatus || 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Events unavailable" } }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { items: events, page: 1, page_size: 100, total: events.length, has_next: false },
        }),
      });
      return;
    }

    await route.continue();
  });

  return {
    attendancePosts,
    allowList() {
      failList = false;
    },
  };
}

export async function mockAnnouncementsApi(
  page: Page,
  options: {
    announcements?: Array<Record<string, unknown>>;
    listStatus?: number;
    publishResult?: { status: number; body: unknown };
  } = {},
) {
  const announcements = [...(options.announcements ?? [E2E_ANNOUNCEMENT])];
  const clubs = e2eOfficialClubs();
  const publishes: Array<{ csrf: string | null; body: unknown; url: string }> = [];
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
      body: JSON.stringify({ data: clubs }),
    });
  });

  await page.route("**/api/v1/admin/users**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          items: [
            {
              id: "e2e-admin-profile",
              full_name: "Zainab Ahmed",
              role: "admin",
              app_role: "admin",
              student_id: null,
              advisor_assignments: [],
            },
          ],
          page: 1,
          page_size: 100,
          total: 1,
          has_next: false,
        },
      }),
    });
  });

  await page.route("**/api/v1/communications/announcements**", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      publishes.push({
        csrf: await request.headerValue("x-csrf-token"),
        body: request.postDataJSON(),
        url: request.url(),
      });
      const result = options.publishResult;
      if (result) {
        await route.fulfill({
          status: result.status,
          contentType: "application/json",
          headers: result.status === 429 ? { "Retry-After": "12" } : {},
          body: JSON.stringify(result.body),
        });
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      const created = {
        id: `ann-e2e-${publishes.length}`,
        club_id: body.club_id ?? null,
        created_by: "e2e-admin-profile",
        title: body.title,
        message: body.message,
        audience: body.audience === "all" ? "all_users" : body.audience,
        priority: body.priority ?? "normal",
        target_role: body.target_role ?? null,
        created_at: "2026-08-20T11:00:00.000Z",
        updated_at: "2026-08-20T11:00:00.000Z",
      };
      announcements.unshift(created);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ data: created }),
      });
      return;
    }

    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Announcements unavailable" } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { items: announcements, page: 1, page_size: 100, total: announcements.length, has_next: false },
      }),
    });
  });

  return {
    publishes,
    allowList() {
      failList = false;
    },
  };
}

export const E2E_NOTIFICATION = {
  id: "notif-e2e-1",
  user_id: "e2e-admin-profile",
  proposal_id: "proposal-e2e-1",
  announcement_id: null,
  type: "pending_admin_review",
  message: "Nile Google Developers submitted Google Cloud Buildathon for Admin review.",
  delivery_status: "stored",
  read_at: null,
  created_at: "2026-08-20T10:00:00.000Z",
};

export const E2E_FEEDBACK = {
  id: "fb-e2e-1",
  club_id: "club-8",
  proposal_id: null,
  submitted_by: "student-e2e-1",
  category: "dues_payment",
  rating: 4,
  comment: "Bank-transfer proof review time for session dues",
  status: "open",
  club: { id: "club-8", name: "Nile Google Developers", code: "NGDC" },
  submitter: {
    id: "student-e2e-1",
    full_name: "Tariq Ibrahim",
    role: "student",
    student_id: "210103044",
  },
  created_at: "2026-08-18T11:20:00.000Z",
  updated_at: "2026-08-18T11:20:00.000Z",
};

export function e2eAnalyticsSummary(days: 7 | 30 | 90, zeros = false) {
  return {
    range_days: days,
    active_users: zeros ? 0 : days === 7 ? 12 : days === 90 ? 48 : 24,
    daily_active_users: zeros
      ? Array.from({ length: days }, (_, index) => ({ date: `2026-08-${String(index + 1).padStart(2, "0")}`, active_users: 0 }))
      : [{ date: "2026-08-20", active_users: 4 }],
    usage_by_role: zeros ? {} : { student: 8, admin: 1 },
    features: zeros ? {} : { dashboard_view: 5 },
    operations: {
      join_requests_started: zeros ? 0 : 6,
      join_requests_completed: zeros ? 0 : 2,
      dues_proofs_submitted: zeros ? 0 : 5,
      dues_proofs_verified: zeros ? 0 : 3,
      event_rsvps: zeros ? 0 : 9,
      event_check_ins: zeros ? 0 : 7,
      feedback_submissions: zeros ? 0 : 4,
    },
  };
}

export async function mockNotificationsApi(
  page: Page,
  options: {
    notifications?: Array<Record<string, unknown>>;
    listStatus?: number;
    readStatus?: number;
  } = {},
) {
  const notifications = [...(options.notifications ?? [E2E_NOTIFICATION])];
  const reads: Array<{ id: string; csrf: string | null }> = [];
  const listErrorStatus = options.listStatus && options.listStatus !== 200 ? options.listStatus : null;
  let failList = Boolean(listErrorStatus);

  await page.route("**/api/v1/notifications**", async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() === "PATCH" && url.includes("/read")) {
      const id = url.split("/notifications/")[1]?.split("/read")[0] ?? "";
      reads.push({ id, csrf: await request.headerValue("x-csrf-token") });
      if (options.readStatus && options.readStatus !== 200) {
        await route.fulfill({
          status: options.readStatus,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: options.readStatus === 404 ? "NOTIFICATION_NOT_FOUND" : "SERVER_ERROR", message: "Unavailable" } }),
        });
        return;
      }
      const current = notifications.find((item) => item.id === id);
      if (!current) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "NOTIFICATION_NOT_FOUND", message: "Notification not found" } }),
        });
        return;
      }
      current.read_at = "2026-08-21T10:00:00.000Z";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: current }),
      });
      return;
    }

    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Notifications unavailable" } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { items: notifications, page: 1, page_size: 100, total: notifications.length, has_next: false },
      }),
    });
  });

  return {
    reads,
    allowList() {
      failList = false;
    },
  };
}

export async function mockFeedbackApi(
  page: Page,
  options: {
    feedback?: Array<Record<string, unknown>>;
    listStatus?: number;
  } = {},
) {
  const feedback = [...(options.feedback ?? [E2E_FEEDBACK])];
  const listErrorStatus = options.listStatus && options.listStatus !== 200 ? options.listStatus : null;
  let failList = Boolean(listErrorStatus);

  await page.route("**/api/v1/communications/feedback**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Feedback unavailable" } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: feedback }),
    });
  });

  return {
    allowList() {
      failList = false;
    },
  };
}

export async function mockAnalyticsApi(
  page: Page,
  options: {
    zeros?: boolean;
    listStatus?: number;
  } = {},
) {
  const requests: string[] = [];
  const listErrorStatus = options.listStatus && options.listStatus !== 200 ? options.listStatus : null;
  let failList = Boolean(listErrorStatus);

  await page.route("**/api/v1/analytics/admin**", async (route) => {
    const url = route.request().url();
    requests.push(url);
    if (failList) {
      await route.fulfill({
        status: listErrorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "SERVER_ERROR", message: "Analytics unavailable" } }),
      });
      return;
    }
    const days = url.includes("days=7") ? 7 : url.includes("days=90") ? 90 : 30;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: e2eAnalyticsSummary(days, options.zeros) }),
    });
  });

  return {
    requests,
    allowList() {
      failList = false;
    },
  };
}


