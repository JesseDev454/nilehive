import type { Page, Route } from "@playwright/test";
import { getTestProfileId } from "./auth";

type JsonValue = Record<string, unknown> | unknown[];

const now = "2026-06-22T10:00:00.000Z";

export function createE2EState() {
  const club = {
    id: "club-tech",
    name: "Nile Tech Club",
    code: "NTC",
    description: "A club for coding, software projects, robotics, and technology learning.",
    dues_amount: 10000,
    is_public_signup: true,
    whatsapp_group_name: "Nile Tech Onboarding",
    whatsapp_onboarding_notes: "Approved members receive onboarding details from the club team.",
    categories: ["Tech", "Academics"],
    logo_path: null,
    website_url: "https://clubs.campusone.com.ng/nile-tech",
    social_links: {
      instagram: "https://instagram.com/niletech"
    },
    gallery: [
      {
        id: "media-tech-1",
        club_id: "club-tech",
        storage_path: "/demo-club-gallery/nile-google-developers/coding-workshop.png",
        caption: "Demo preview: students presenting projects at Build Night",
        display_order: 0,
        uploaded_by: "e2e-president",
        created_at: now,
        updated_at: now
      }
    ],
    created_at: "2026-01-01T00:00:00.000Z"
  };
  const businessClub = {
    id: "club-business",
    name: "Nile Business Club",
    code: "NBUC",
    description: "A club for entrepreneurship, finance, startups, and business leadership.",
    dues_amount: 10000,
    is_public_signup: true,
    whatsapp_group_name: null,
    whatsapp_onboarding_notes: null,
    categories: ["Entrepreneurship"],
    logo_path: null,
    website_url: null,
    social_links: {},
    gallery: [],
    created_at: "2026-01-02T00:00:00.000Z"
  };
  const event = {
    id: "event-tech-demo",
    proposal_id: "proposal-tech-demo",
    club_id: club.id,
    title: "Build Night",
    proposal_title: "Build Night",
    description: "A student project night for demos and team formation.",
    event_date: "2026-06-25",
    event_time: "17:00:00",
    location: "Innovation Lab",
    number_of_participants: 40,
    budget_estimate: 0,
    status: "approved",
    current_stage: "approved",
    event_lifecycle: "upcoming",
    can_rsvp: true,
    can_submit_feedback: true,
    approved_at: now,
    created_at: now,
    updated_at: now
  };
  const todayEvent = {
    ...event,
    id: "event-tech-checkin",
    proposal_id: "proposal-tech-checkin",
    title: "Today Check-in Lab",
    proposal_title: "Today Check-in Lab",
    event_date: "2026-06-23",
    event_lifecycle: "happening_today"
  };
  const duePayment = {
    id: "due-tech-1",
    club_id: club.id,
    member_id: "member-pending-1",
    amount: 10000,
    academic_session: "2025/2026",
    payment_reference: "E2E-REF-001",
    payment_account_name: "E2E Student",
    payment_paid_at: "2026-06-22",
    payer_note: null,
    proof_url: "dues/e2e-student/proof.png",
    has_proof: true,
    submitted_at: now,
    status: "submitted",
    verified_by: null,
    verified_at: null,
    created_at: now,
    updated_at: now
  };
  const membership = {
    id: "membership-tech-1",
    profile_id: "e2e-student",
    club_id: club.id,
    requested_role: "member",
    status: "pending",
    remarks: null,
    decision_remarks: null,
    reviewed_by: null,
    reviewed_at: null,
    member_id: null,
    due_payment_id: duePayment.id,
    dues_amount: 10000,
    academic_session: "2025/2026",
    profile: {
      id: "e2e-student",
      full_name: "E2E Student",
      student_id: "123456789",
      phone_number: "08000000000",
      role: "student"
    },
    club: {
      id: club.id,
      name: club.name,
      code: club.code
    },
    due_payment: duePayment,
    whatsapp_onboarding_status: "not_ready",
    whatsapp_added_by: null,
    whatsapp_added_at: null,
    whatsapp_onboarding_notes: club.whatsapp_onboarding_notes,
    whatsapp_phone_number: "08000000000",
    whatsapp_chat_url: null,
    student_type: "returning",
    join_reason: "I want to build useful software with other students.",
    created_at: now,
    updated_at: now
  };
  const task = {
    id: "task-tech-1",
    club_id: club.id,
    assigned_by: "e2e-president",
    assigned_to: "e2e-executive",
    title: "Prepare check-in desk",
    description: "Set up the event desk and help students check in.",
    priority: "high",
    status: "pending",
    due_date: "2026-06-24",
    assigned_by_profile: {
      id: "e2e-president",
      full_name: "E2E President",
      student_id: "123456789",
      role: "president"
    },
    assigned_to_profile: {
      id: "e2e-executive",
      full_name: "E2E Executive",
      student_id: "123456789",
      role: "executive"
    },
    created_at: now,
    updated_at: now,
    status_history: []
  };
  const proposal = {
    id: "proposal-tech-demo",
    club_id: club.id,
    club: {
      id: club.id,
      name: club.name,
      code: club.code
    },
    submitted_by: "e2e-president",
    title: "Build Night Proposal",
    description: "A student project night for demos and team formation.",
    event_date: "2026-06-25",
    event_time: "17:00:00",
    location: "Innovation Lab",
    aim_objectives: "Help students form teams and ship useful prototypes.",
    proposed_activity: "Build Night",
    number_of_participants: 40,
    budget_estimate: 0,
    budget_line_items: [],
    responsible_members: [],
    status: "pending_advisor_review",
    current_stage: "advisor_review",
    current_owner_role: "advisor",
    submitted_at: now,
    created_at: now,
    updated_at: now
  };
  const announcement = {
    id: "announcement-1",
    club_id: "club-tech",
    created_by: "e2e-admin",
    title: "Welcome to Club Services",
    message: "This is a test announcement for E2E flows.",
    audience: "all_users",
    priority: "normal",
    target_role: null,
    is_read: false,
    read_at: null,
    created_at: now,
    updated_at: now
  };
  const notifications = [
    {
      id: "notification-announcement-1",
      user_id: "e2e-student",
      proposal_id: null,
      announcement_id: announcement.id,
      type: "announcement",
      message: "New club announcement: Welcome to Club Services",
      delivery_status: "unread",
      created_at: now
    },
    {
      id: "notification-dues-1",
      user_id: "e2e-student",
      proposal_id: null,
      announcement_id: null,
      type: "dues",
      message: "Dues proof approved for Nile Tech Club. No action needed.",
      delivery_status: "unread",
      created_at: now
    },
    {
      id: "notification-event-1",
      user_id: "e2e-student",
      proposal_id: todayEvent.proposal_id,
      announcement_id: null,
      type: "event",
      message: "Event reminder: Today Check-in Lab is ready for QR check-in.",
      delivery_status: "queued",
      created_at: now
    },
    {
      id: "notification-proposal-1",
      user_id: "e2e-advisor",
      proposal_id: proposal.id,
      announcement_id: null,
      type: "proposal",
      message: "Proposal needs advisor review: Build Night Proposal.",
      delivery_status: "unread",
      created_at: now
    },
    {
      id: "notification-task-1",
      user_id: "e2e-executive",
      proposal_id: null,
      announcement_id: null,
      type: "task",
      message: "Task assigned: Prepare check-in desk.",
      delivery_status: "unread",
      created_at: now
    }
  ];
  const feedback = {
    id: "feedback-1",
    club_id: null,
    proposal_id: null,
    submitted_by: "e2e-student",
    category: "general",
    rating: 5,
    comment: "Role: student\nIssue type: Suggestion\nImpact: medium\nTrying to do: test the app\nCompleted task: yes\nConfusing or broken: Not provided\nImprovement suggestion: Keep improving\nCan contact for follow-up: Yes",
    status: "open",
    proposal: null,
    created_at: now,
    updated_at: now
  };
  const adminUsers = [
    {
      id: "e2e-student",
      full_name: "E2E Student",
      student_id: "123456789",
      email: "e2e-student@nilehive.test",
      phone_number: "08000000000",
      role: "student",
      effective_role: "student",
      requested_role: "student",
      access_pending: false,
      club_id: null,
      club: null,
      advisor_assignments: [],
      created_at: now,
      updated_at: now
    },
    {
      id: "e2e-president",
      full_name: "E2E President",
      student_id: "123456789",
      email: "e2e-president@nilehive.test",
      phone_number: "08000000000",
      role: "president",
      effective_role: "president",
      requested_role: "president",
      access_pending: false,
      club_id: "club-tech",
      club: { id: "club-tech", name: "Nile Tech Club", code: "NTC" },
      advisor_assignments: [],
      created_at: now,
      updated_at: now
    }
  ];

  return {
    clubs: [club, businessClub],
    events: [event],
    todayEvent,
    proposals: [proposal],
    tasks: [task],
    announcements: [announcement],
    notifications,
    feedback: [feedback],
    adminUsers,
    studentMemberships: [] as typeof membership[],
    adminMemberships: [membership],
    studentDues: [] as typeof duePayment[],
    adminDues: [duePayment],
    rsvps: new Map<string, unknown>(),
    attendance: new Map<string, unknown>(),
    pushConfig: {
      enabled: true,
      public_key: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
    },
    pushSubscriptions: [] as Array<{
      id: string;
      user_id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      user_agent: string | null;
      created_at: string;
      updated_at: string;
      last_used_at: string | null;
    }>,
    pushSubscriptionRequests: [] as unknown[],
    removedPushEndpoints: [] as string[]
  };
}

type E2EState = ReturnType<typeof createE2EState>;

function getTestRole(page: Page) {
  return getTestProfileId(page)?.replace(/^e2e-/, "") || null;
}

function ok(route: Route, data: JsonValue | null = null) {
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data })
  });
}

function apiError(route: Route, status: number, message: string, code = "E2E_ERROR") {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ error: { message, code } })
  });
}

function paginated<T>(items: T[], pageSize = 100) {
  return {
    items,
    page: 1,
    page_size: pageSize,
    total: items.length,
    has_next: false
  };
}

function getPath(route: Route) {
  const url = new URL(route.request().url());
  return url.pathname.replace(/^\/api\/v1/, "") || "/";
}

function getAdminDashboard(state: E2EState) {
  return {
    role: "admin",
    generated_at: now,
    dues_comparison_context: {
      current_academic_session: "2025/2026",
      previous_academic_session: "2024/2025"
    },
    summary: {
      total_clubs: state.clubs.length,
      total_members: 12,
      active_members: 10,
      pending_proposals: 1,
      pending_admin_proposals: 1,
      pending_membership_requests: state.adminMemberships.length,
      submitted_dues_payments: state.adminDues.filter((payment) => payment.status === "submitted").length,
      approved_events: state.events.length,
      reports_submitted: 0,
      missing_reports: 0,
      dues_collected_amount: state.adminDues.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0),
      current_session_dues_collected: 0,
      previous_session_dues_collected: 0,
      dues_change_amount: 0,
      event_attendance_count: 0,
      event_rsvp_count: state.rsvps.size,
      attendance_rate: 0,
      feedback_count: 0,
      open_tasks: 0
    },
    pending_actions: [
      { type: "membership_requests", label: "Pending membership requests", count: state.adminMemberships.length },
      { type: "dues_verification", label: "Pending dues proofs", count: state.adminDues.filter((payment) => payment.status === "submitted").length }
    ],
    proposal_bottlenecks: [{ status: "pending_admin_review", label: "Admin review", count: 1 }],
    club_performance: [
      {
        club_id: "club-tech",
        club_name: "Nile Tech Club",
        club_code: "NTC",
        total_members: 12,
        active_members: 10,
        proposal_count: 2,
        pending_proposals: 1,
        approved_events: state.events.length,
        rejected_proposals: 0,
        pending_membership_requests: state.adminMemberships.length,
        dues_collection_rate: 75,
        dues_collected_amount: 0,
        current_session_dues_collected: 0,
        previous_session_dues_collected: 0,
        dues_change_amount: 0,
        rsvp_count: state.rsvps.size,
        attendance_count: 0,
        reports_submitted: 0,
        feedback_count: 0,
        open_tasks: 0,
        club_health_score: 80,
        club_health_label: "healthy",
        club_health_breakdown: { dues: 75, membership: 80, events: 90, reports: 70 },
        last_activity_at: now
      }
    ],
    missing_reports: [],
    recent_activity: [
      {
        id: "activity-1",
        type: "membership",
        club_id: "club-tech",
        club_name: "Nile Tech Club",
        title: "New join request",
        message: "E2E Student submitted a join request.",
        created_at: now
      }
    ]
  };
}

function getPresidentDashboard(state: E2EState) {
  const club = state.clubs[0];

  return {
    role: "president",
    club,
    club_id: club.id,
    summary: {
      total_proposals: state.proposals.length,
      pending_proposals: state.proposals.length,
      approved_proposals: state.events.length,
      rejected_proposals: 0,
      approval_rate: 50,
      upcoming_events: state.events.length,
      reminders: 1,
      executive_count: 1,
      club_health_score: 76,
      club_health_label: "Healthy",
      club_health_breakdown: { dues: 75, membership: 80, events: 90, reports: 70, tasks: 60, feedback: 65 }
    },
    recent_activity: [
      {
        id: "activity-president-1",
        proposal_id: state.proposals[0].id,
        title: "Proposal submitted",
        status: "pending_advisor_review",
        message: "Build Night Proposal is waiting for advisor review.",
        created_at: now
      }
    ],
    pending_proposals: state.proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      club_id: club.id,
      club_name: club.name,
      event_date: proposal.event_date,
      event_time: proposal.event_time,
      location: proposal.location,
      status: proposal.status,
      created_at: proposal.created_at,
      updated_at: proposal.updated_at
    })),
    upcoming_events: state.events,
    executive_team: [
      {
        id: "e2e-executive",
        full_name: "E2E Executive",
        role: "executive",
        club_id: club.id,
        created_at: now
      }
    ],
    notifications: state.notifications
  };
}

function getExecutiveDashboard(state: E2EState) {
  return {
    role: "executive",
    club_id: state.clubs[0].id,
    summary: {
      total_tasks: state.tasks.length,
      pending_tasks: state.tasks.filter((task) => task.status === "pending").length,
      in_progress_tasks: state.tasks.filter((task) => task.status === "in_progress").length,
      completed_tasks: state.tasks.filter((task) => task.status === "completed").length,
      blocked_tasks: state.tasks.filter((task) => task.status === "blocked").length,
      upcoming_events: state.events.length,
      reminders: 1
    },
    action_items: [{ type: "task", label: "Update assigned task status" }],
    assigned_tasks: state.tasks,
    upcoming_events: state.events,
    reminders: [
      {
        id: "reminder-1",
        user_id: "e2e-executive",
        proposal_id: state.events[0].proposal_id,
        message: "Build Night is coming up.",
        remind_at: now,
        delivery_status: "queued",
        created_at: now
      }
    ],
    notifications: state.notifications
  };
}

export async function mockClubServicesApi(page: Page, state = createE2EState()) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const path = getPath(route);

    if (method === "GET" && path === "/clubs/public") {
      return ok(route, state.clubs);
    }

    if (method === "GET" && path === "/clubs") {
      const role = getTestRole(page);
      return ok(route, role === "president" ? state.clubs.filter((club) => club.id === "club-tech") : state.clubs);
    }

    if (method === "GET" && path.match(/^\/clubs\/[^/]+$/)) {
      const clubId = path.split("/")[2];
      const role = getTestRole(page);
      if (role === "president" && clubId !== "club-tech") {
        return apiError(route, 404, "Club not found", "CLUB_NOT_FOUND");
      }
      return ok(route, state.clubs.find((club) => club.id === clubId) || state.clubs[0]);
    }

    if (method === "POST" && path === "/clubs") {
      if (getTestRole(page) !== "admin") {
        return apiError(route, 403, "Only Club Services admins can manage clubs", "FORBIDDEN");
      }
      const body = request.postDataJSON() as Partial<typeof state.clubs[number]>;
      const created = {
        ...state.clubs[0],
        id: `club-created-${state.clubs.length + 1}`,
        name: body.name || "Created Club",
        code: body.code || null,
        description: body.description || "",
        is_public_signup: body.is_public_signup !== false,
        categories: body.categories || [],
        logo_path: body.logo_path || null,
        gallery: [],
        created_at: now
      };
      state.clubs = [...state.clubs, created];
      return ok(route, created);
    }

    if (method === "PATCH" && path.match(/^\/clubs\/[^/]+$/)) {
      if (getTestRole(page) !== "admin") {
        return apiError(route, 403, "Only Club Services admins can manage clubs", "FORBIDDEN");
      }
      const clubId = path.split("/")[2];
      const body = request.postDataJSON() as Partial<typeof state.clubs[number]>;
      state.clubs = state.clubs.map((club) => club.id === clubId ? { ...club, ...body } : club);
      return ok(route, state.clubs.find((club) => club.id === clubId) || state.clubs[0]);
    }

    if (method === "PATCH" && path.match(/^\/clubs\/[^/]+\/profile$/)) {
      const clubId = path.split("/")[2];
      if (getTestRole(page) !== "president" || clubId !== "club-tech") {
        return apiError(route, 403, "You can only manage content for your assigned club", "FORBIDDEN");
      }
      const body = request.postDataJSON() as Partial<typeof state.clubs[number]>;
      state.clubs = state.clubs.map((club) => club.id === clubId ? { ...club, ...body } : club);
      return ok(route, state.clubs.find((club) => club.id === clubId) || state.clubs[0]);
    }

    if (method === "POST" && path.match(/^\/clubs\/[^/]+\/media$/)) {
      const clubId = path.split("/")[2];
      const body = request.postDataJSON() as { storage_path?: string; caption?: string | null; display_order?: number };
      const media = {
        id: `media-${clubId}-${state.clubs.flatMap((club) => club.gallery || []).length + 1}`,
        club_id: clubId,
        storage_path: body.storage_path || `/demo-club-gallery/${clubId}/upload.png`,
        caption: body.caption || "Uploaded gallery image",
        display_order: body.display_order || 0,
        uploaded_by: getTestProfileId(page) || "e2e-user",
        created_at: now,
        updated_at: now
      };
      state.clubs = state.clubs.map((club) => club.id === clubId ? { ...club, gallery: [...(club.gallery || []), media] } : club);
      return ok(route, media);
    }

    if (method === "POST" && path === "/analytics/activity") {
      return route.fulfill({ status: 204 });
    }

    if (method === "GET" && path === "/analytics/admin") {
      return ok(route, {
        range_days: 30,
        active_users: 18,
        daily_active_users: [{ date: "2026-06-22", active_users: 8 }],
        usage_by_role: { student: 14, president: 2, admin: 2 },
        features: {
          club_discovery_view: 42,
          club_detail_view: 28,
          event_view: 19,
          notifications_view: 11
        },
        operations: {
          join_requests_started: 9,
          join_requests_completed: 5,
          dues_proofs_submitted: 6,
          dues_proofs_verified: 4,
          event_rsvps: 12,
          event_check_ins: 7,
          feedback_submissions: 3
        }
      });
    }

    if (method === "GET" && path === "/membership-requests/me") {
      return ok(route, state.studentMemberships);
    }

    if (method === "POST" && path === "/membership-requests") {
      const body = request.postDataJSON() as { club_id: string; proof_url?: string | null };
      const base = state.adminMemberships[0];
      const membership = {
        ...base,
        id: "membership-tech-created",
        club_id: body.club_id,
        due_payment: {
          ...base.due_payment,
          id: "due-tech-created",
          proof_url: body.proof_url || base.due_payment?.proof_url || null,
          status: "submitted"
        },
        due_payment_id: "due-tech-created",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      state.studentMemberships = [membership];
      state.studentDues = [membership.due_payment!];
      state.adminMemberships = [membership];
      state.adminDues = [membership.due_payment!];

      return ok(route, membership);
    }

    if (method === "GET" && path === "/dues/me") {
      return ok(route, { payments: state.studentDues });
    }

    if (method === "GET" && path === "/dues/payment-settings") {
      return ok(route, {
        id: "settings-tech",
        club_id: "club-tech",
        bank_name: "Test Bank",
        account_number: "0001112223",
        account_name: "Nile Club Services",
        payment_instructions: "Use the E2E reference for test proof uploads.",
        fresher_dues_amount: 10000,
        returning_student_dues_amount: 10000,
        created_at: now,
        updated_at: now
      });
    }

    if (method === "POST" && path === "/storage/upload") {
      const body = request.postDataJSON() as { bucket?: string; path?: string };
      return ok(route, {
        bucket: body.bucket || "dues-receipts",
        path: body.path || "dues/e2e-student/proof.png",
        url: `https://example.test/${body.path || "proof.png"}`
      });
    }

    if (method === "POST" && path === "/storage/signed-url") {
      return ok(route, {
        url: "https://example.test/proof.png"
      });
    }

    if (method === "GET" && path === "/events/approved") {
      return ok(route, paginated(state.events));
    }

    if (method === "GET" && path.match(/^\/events\/[^/]+\/engagement$/)) {
      const proposalId = path.split("/")[2];
      const event = [state.todayEvent, ...state.events].find((item) => item.proposal_id === proposalId) || state.events[0];
      if (proposalId === "missing-event") {
        return apiError(route, 404, "This check-in link does not match an event.", "EVENT_NOT_FOUND");
      }
      return ok(route, {
        event,
        summary: { total_rsvps: state.rsvps.size, going: state.rsvps.size, interested: 0, not_going: 0, cancelled: 0, attended: 0 },
        current_user_rsvp: state.rsvps.get(proposalId) || null,
        current_user_attendance: state.attendance.get(proposalId) || null,
        rsvps: Array.from(state.rsvps.values()),
        attendance: Array.from(state.attendance.values())
      });
    }

    if (method === "POST" && path.match(/^\/events\/[^/]+\/rsvp$/)) {
      const proposalId = path.split("/")[2];
      const rsvp = {
        id: `rsvp-${proposalId}`,
        proposal_id: proposalId,
        club_id: "club-tech",
        user_id: "e2e-student",
        status: "going",
        profile: { id: "e2e-student", full_name: "E2E Student", student_id: "123456789", role: "student" },
        created_at: now,
        updated_at: now
      };
      state.rsvps.set(proposalId, rsvp);
      return ok(route, rsvp);
    }

    if (method === "POST" && path.match(/^\/events\/[^/]+\/check-in$/)) {
      const proposalId = path.split("/")[2];
      const attendance = {
        id: `attendance-${proposalId}`,
        proposal_id: proposalId,
        club_id: "club-tech",
        user_id: "e2e-student",
        attended: true,
        checked_in_at: now,
        check_in_method: "self",
        profile: { id: "e2e-student", full_name: "E2E Student", student_id: "123456789", role: "student" },
        created_at: now,
        updated_at: now
      };
      state.attendance.set(proposalId, attendance);
      return ok(route, attendance);
    }

    if (method === "GET" && path === "/communications/announcements") {
      return ok(route, paginated(state.announcements, 8));
    }

    if (method === "POST" && path.match(/^\/communications\/announcements\/[^/]+\/read$/)) {
      const announcementId = path.split("/")[3];
      state.announcements = state.announcements.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, is_read: true, read_at: now }
          : announcement
      );
      return ok(route, state.announcements.find((announcement) => announcement.id === announcementId) || state.announcements[0]);
    }

    if (method === "GET" && path === "/communications/feedback") {
      return ok(route, state.feedback);
    }

    if (method === "POST" && path === "/communications/feedback") {
      const body = request.postDataJSON() as {
        category?: string;
        rating?: number | null;
        comment?: string;
        club_id?: string | null;
        proposal_id?: string | null;
      };
      const feedback = {
        id: `feedback-${state.feedback.length + 1}`,
        club_id: body.club_id || null,
        proposal_id: body.proposal_id || null,
        submitted_by: getTestProfileId(page) || "e2e-user",
        category: body.category || "general",
        rating: body.rating ?? null,
        comment: body.comment || "",
        status: "open",
        proposal: null,
        created_at: now,
        updated_at: now
      };

      state.feedback = [feedback, ...state.feedback];
      return ok(route, feedback);
    }

    if (method === "GET" && path === "/reminders") {
      return ok(route, []);
    }

    if (method === "GET" && path === "/dashboard/admin-operations") {
      return ok(route, getAdminDashboard(state));
    }

    if (method === "GET" && path === "/dashboard/president") {
      return ok(route, getPresidentDashboard(state));
    }

    if (method === "GET" && path === "/dashboard/executive") {
      return ok(route, getExecutiveDashboard(state));
    }

    if (method === "GET" && path === "/admin/users") {
      return ok(route, paginated(state.adminUsers, 10));
    }

    if (method === "GET" && path.match(/^\/admin\/users\/[^/]+$/)) {
      const profileId = path.split("/")[3];
      const user = state.adminUsers.find((item) => item.id === profileId);
      return user ? ok(route, user) : apiError(route, 404, "User not found", "USER_NOT_FOUND");
    }

    if (method === "POST" && path.match(/^\/admin\/users\/[^/]+\/role$/)) {
      const profileId = path.split("/")[3];
      const body = request.postDataJSON() as { role?: string; club_id?: string | null };
      state.adminUsers = state.adminUsers.map((user) =>
        user.id === profileId
          ? {
              ...user,
              role: (body.role || user.role) as typeof user.role,
              effective_role: body.role || user.effective_role,
              club_id: body.club_id || null,
              club: body.club_id ? { id: "club-tech", name: "Nile Tech Club", code: "NTC" } : null,
              updated_at: now
            }
          : user
      );
      return ok(route, {
        profile: state.adminUsers.find((item) => item.id === profileId) || state.adminUsers[0],
        history: null
      });
    }

    if (method === "GET" && path === "/proposals/pending-advisor") {
      return ok(route, state.proposals.filter((proposal) => proposal.status === "pending_advisor_review"));
    }

    if (method === "POST" && path.match(/^\/proposals\/[^/]+\/advisor-decision$/)) {
      const proposalId = path.split("/")[2];
      const body = request.postDataJSON() as { decision?: "approve" | "reject"; remarks?: string };
      state.proposals = state.proposals.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              status: body.decision === "approve" ? "pending_admin_review" : "rejected",
              current_stage: body.decision === "approve" ? "admin_review" : "closed",
              advisor_remarks: body.remarks || null,
              advisor_decided_at: now,
              updated_at: now
            }
          : proposal
      );
      return ok(route, state.proposals.find((proposal) => proposal.id === proposalId) || state.proposals[0]);
    }

    if (method === "GET" && path.match(/^\/proposals\/advisor\/[^/]+$/)) {
      const proposalId = path.split("/")[3];
      return ok(route, state.proposals.find((proposal) => proposal.id === proposalId) || state.proposals[0]);
    }

    if (method === "GET" && path === "/proposals") {
      return ok(route, paginated(state.proposals, 10));
    }

    if (method === "GET" && path.match(/^\/proposals\/[^/]+$/)) {
      const proposalId = path.split("/")[2];
      return ok(route, state.proposals.find((proposal) => proposal.id === proposalId) || state.proposals[0]);
    }

    if (method === "GET" && path === "/tasks") {
      return ok(route, paginated(state.tasks, 10));
    }

    if (method === "POST" && path.match(/^\/tasks\/[^/]+\/status$/)) {
      const taskId = path.split("/")[2];
      const body = request.postDataJSON() as { status?: "pending" | "in_progress" | "completed" | "blocked" };
      state.tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: body.status || task.status, updated_at: now } : task
      );
      return ok(route, state.tasks.find((task) => task.id === taskId) || state.tasks[0]);
    }

    if (method === "GET" && path === "/members") {
      return ok(route, paginated([
        {
          id: "member-tech-president",
          club_id: "club-tech",
          profile_id: "e2e-president",
          full_name: "E2E President",
          student_id: "123456789",
          email: "e2e-president@nilehive.test",
          phone_number: "08000000000",
          club_role: "president",
          membership_status: "active",
          club: { id: "club-tech", name: "Nile Tech Club", code: "NTC" },
          created_at: now,
          updated_at: now
        },
        {
          id: "member-tech-executive",
          club_id: "club-tech",
          profile_id: "e2e-executive",
          full_name: "E2E Executive",
          student_id: "123456789",
          email: "e2e-executive@nilehive.test",
          phone_number: "08000000000",
          club_role: "executive",
          membership_status: "active",
          club: { id: "club-tech", name: "Nile Tech Club", code: "NTC" },
          created_at: now,
          updated_at: now
        }
      ], 10));
    }

    if (method === "GET" && path === "/reports") {
      return ok(route, paginated([
        {
          id: "report-tech-1",
          proposal_id: "proposal-tech-demo",
          club_id: "club-tech",
          submitted_by: "e2e-president",
          attendance_count: 24,
          summary: "Students formed teams and demoed prototypes.",
          challenges: null,
          outcomes: "Three project teams formed.",
          budget_used: 0,
          media_urls: [],
          status: "submitted",
          submitted_at: now,
          created_at: now,
          updated_at: now,
          proposal: state.proposals[0]
        }
      ], 10));
    }

    if (method === "GET" && path === "/membership-requests") {
      const url = new URL(request.url());
      const status = url.searchParams.get("status");
      const clubId = url.searchParams.get("club_id");
      const memberships = state.adminMemberships.filter((membership) => {
        const matchesStatus = !status || membership.status === status;
        const matchesClub = !clubId || membership.club_id === clubId;

        return matchesStatus && matchesClub;
      });

      return ok(route, paginated(memberships, 10));
    }

    if (method === "GET" && path === "/dues") {
      return ok(route, {
        summary: {
          total_records: state.adminDues.length,
          paid: state.adminDues.filter((payment) => payment.status === "paid").length,
          unpaid: 0,
          submitted: state.adminDues.filter((payment) => payment.status === "submitted").length,
          rejected: 0,
          expected_amount: 10000,
          collected_amount: state.adminDues.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0),
          collection_rate: 0
        },
        payments: paginated(state.adminDues, 10)
      });
    }

    if (method === "POST" && path.match(/^\/dues\/[^/]+$/)) {
      const paymentId = path.split("/")[2];
      const body = request.postDataJSON() as { status?: "paid" | "rejected" | "submitted" | "unpaid" };
      state.adminDues = state.adminDues.map((payment) =>
        payment.id === paymentId
          ? { ...payment, status: body.status || payment.status, verified_at: now, verified_by: "e2e-admin" }
          : payment
      );
      return ok(route, state.adminDues.find((payment) => payment.id === paymentId) || state.adminDues[0]);
    }

    if (method === "GET" && path === "/notifications") {
      const profileId = getTestProfileId(page);
      const notifications = profileId
        ? state.notifications.filter((notification) => notification.user_id === profileId)
        : state.notifications;

      return ok(route, paginated(notifications));
    }

    if (method === "GET" && path === "/notifications/push-config") {
      return ok(route, state.pushConfig);
    }

    if (method === "POST" && path === "/notifications/push-subscriptions") {
      const profileId = getTestProfileId(page);
      const body = request.postDataJSON() as {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      const subscription = {
        id: `push-subscription-${state.pushSubscriptions.length + 1}`,
        user_id: profileId || "e2e-user",
        endpoint: body.endpoint || "https://push.example.test/e2e-subscription",
        p256dh: body.keys?.p256dh || "",
        auth: body.keys?.auth || "",
        user_agent: "Playwright E2E",
        created_at: now,
        updated_at: now,
        last_used_at: null
      };

      state.pushSubscriptionRequests.push(body);
      state.pushSubscriptions = [
        ...state.pushSubscriptions.filter((item) => item.endpoint !== subscription.endpoint),
        subscription
      ];

      return ok(route, subscription);
    }

    if (method === "POST" && path === "/notifications/push-subscriptions/remove") {
      const body = request.postDataJSON() as { endpoint?: string };
      const endpoint = body.endpoint || "";

      state.removedPushEndpoints.push(endpoint);
      state.pushSubscriptions = state.pushSubscriptions.filter((subscription) => subscription.endpoint !== endpoint);

      return ok(route, { removed: true });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: `Unhandled E2E API route: ${method} ${path}` } })
    });
  });

  return state;
}
