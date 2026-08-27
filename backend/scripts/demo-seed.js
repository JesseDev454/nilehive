/**
 * OneClub Safe Portfolio Demo Seed & Reset Script
 * 
 * Strict safety rules:
 * 1. Fails closed unless APP_ENV === 'demo' and ALLOW_DEMO_SEED === 'true'
 * 2. Refuses any connection to production domains/refs
 * 3. Requires positive demo database sentinel (public.oneclub_demo_sentinel)
 * 4. Uses Supabase Admin Auth API (createUser/listUsers/deleteUser), never fixed auth inserts
 * 5. FK-ordered scoped deletion preserving official clubs and non-demo accounts
 */

const { createClient } = require("@supabase/supabase-js");

const ALLOWED_DEMO_HOST_PATTERNS = [
  "localhost",
  "127.0.0.1",
  "::1",
  "demo-supabase",
  "oneclub-demo"
];

const DISALLOWED_PRODUCTION_PATTERNS = [
  "nilehive.app",
  "campusone.nileuniversity.edu.ng",
  "supabase.co", // Disallow arbitrary live hosted supabase unless explicitly allowlisted as demo ref
];

const SCOPED_RESET_DELETION_ORDER = [
  "notification_deliveries",
  "notifications",
  "push_subscriptions",
  "event_attendance",
  "event_rsvps",
  "event_feedback",
  "event_reports",
  "task_status_history",
  "tasks",
  "due_payments",
  "membership_requests",
  "approvals",
  "proposals",
  "announcements",
  "club_members",
  "club_advisors",
  "profiles",
  "auth_users"
];

const DEMO_PERSONAS = [
  {
    key: "student",
    email: "amina.yusuf@demo.oneclub.internal",
    fullName: "Amina Yusuf",
    preferredName: "Amina",
    role: "student",
    appRole: "student",
    portalRole: "student",
    studentId: "U22/NAS/CSC/1042",
    department: "Computer Science",
    academicSession: "2025/2026",
    level: "300"
  },
  {
    key: "president",
    email: "daniel.okafor@demo.oneclub.internal",
    fullName: "Daniel Okafor",
    preferredName: "Daniel",
    role: "president",
    appRole: "president",
    portalRole: "student",
    studentId: "U21/NAS/CSC/0812",
    department: "Computer Science",
    academicSession: "2025/2026",
    level: "400",
    clubCode: "NGD"
  },
  {
    key: "executive",
    email: "zainab.musa@demo.oneclub.internal",
    fullName: "Zainab Musa",
    preferredName: "Zainab",
    role: "executive",
    appRole: "executive",
    portalRole: "student",
    studentId: "U22/NAS/CSC/1105",
    department: "Computer Science",
    academicSession: "2025/2026",
    level: "300",
    clubCode: "NGD"
  },
  {
    key: "advisor",
    email: "sarah.bello@demo.oneclub.internal",
    fullName: "Dr. Sarah Bello",
    preferredName: "Dr. Bello",
    role: "advisor",
    appRole: "advisor",
    portalRole: "staff",
    department: "Computer Science",
    assignedClubCodes: ["NGD", "NCIC"]
  },
  {
    key: "admin",
    email: "tobi.adeyemi@demo.oneclub.internal",
    fullName: "Tobi Adeyemi",
    preferredName: "Tobi",
    role: "admin",
    appRole: "admin",
    portalRole: "admin",
    department: "Student Affairs & Club Services"
  }
];

function validateDemoEnvironment(env = process.env) {
  const errors = [];

  if (env.APP_ENV !== "demo") {
    errors.push(`Invalid APP_ENV: expected "demo", received "${env.APP_ENV || ""}"`);
  }

  if (env.ALLOW_DEMO_SEED !== "true") {
    errors.push(`ALLOW_DEMO_SEED must be explicitly set to "true", received "${env.ALLOW_DEMO_SEED || ""}"`);
  }

  const supabaseUrl = env.DEMO_SUPABASE_URL || env.SUPABASE_URL || "";
  if (!supabaseUrl) {
    errors.push("Missing database URL: DEMO_SUPABASE_URL or SUPABASE_URL must be provided");
  } else {
    try {
      const parsed = new URL(supabaseUrl);
      const hostname = parsed.hostname.toLowerCase();

      // Check disallowed production hosts
      for (const pattern of DISALLOWED_PRODUCTION_PATTERNS) {
        if (hostname.includes(pattern) && !env.DEMO_PROJECT_REF_ALLOWLIST?.includes(hostname)) {
          errors.push(`Target URL hostname "${hostname}" matches production pattern "${pattern}". Operation refused.`);
        }
      }

      // If not matching explicit allowlist or local patterns
      const isAllowed =
        ALLOWED_DEMO_HOST_PATTERNS.some((p) => hostname.includes(p)) ||
        (env.DEMO_PROJECT_REF_ALLOWLIST && env.DEMO_PROJECT_REF_ALLOWLIST.split(",").map(s => s.trim()).includes(hostname));

      if (!isAllowed) {
        errors.push(`Target URL hostname "${hostname}" is not in the demo host allowlist.`);
      }
    } catch {
      errors.push(`Invalid database URL format: "${supabaseUrl}"`);
    }
  }

  const serviceKey = env.DEMO_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey) {
    errors.push("Missing Supabase Service Role Key (DEMO_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY)");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function verifyDemoSentinel(supabaseClient) {
  try {
    const { data, error } = await supabaseClient
      .from("oneclub_demo_sentinel")
      .select("is_demo_database, environment_name")
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        verified: false,
        error: `Failed to query demo sentinel table: ${error.message}. Ensure "public.oneclub_demo_sentinel" exists only in the isolated demo database.`
      };
    }

    if (!data || data.is_demo_database !== true) {
      return {
        verified: false,
        error: `Sentinel record missing or is_demo_database is not true. Refusing to seed non-demo database.`
      };
    }

    return {
      verified: true,
      environmentName: data.environment_name || "demo"
    };
  } catch (err) {
    return {
      verified: false,
      error: `Sentinel verification exception: ${err.message}`
    };
  }
}

async function getOrCreateDemoUser(supabase, persona, defaultPassword = "DemoPassword2026!") {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users via Admin Auth API: ${listError.message}`);
  }

  const existing = listData?.users?.find(
    (u) => u.email?.toLowerCase() === persona.email.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: persona.email,
    password: process.env.DEMO_AUTH_PASSWORD || defaultPassword,
    email_confirm: true,
    user_metadata: {
      full_name: persona.fullName,
      preferred_name: persona.preferredName,
      first_name: persona.preferredName,
      role: persona.role,
      app_role: persona.appRole,
      portal_role: persona.portalRole,
      student_id: persona.studentId,
      department: persona.department
    }
  });

  if (createError) {
    throw new Error(`Failed to create demo user "${persona.email}": ${createError.message}`);
  }

  return createData.user;
}

async function seedDemoDataset({ supabase, dryRun = false }) {
  console.log("Starting deterministic OneClub showcase demo seed...");

  // 1. Locate Official Clubs
  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("id, code, name");

  if (clubsError || !clubs || clubs.length === 0) {
    throw new Error(`Failed to load clubs: ${clubsError?.message || "No clubs found"}`);
  }

  const clubsByCode = new Map(clubs.map((c) => [c.code, c]));
  const ngdClub = clubsByCode.get("NGD");
  const ncicClub = clubsByCode.get("NCIC");

  if (!ngdClub) {
    throw new Error(`Official club "Nile Google Developers" (code: NGD) not found in database.`);
  }

  // 2. Create / Locate Demo Users via Admin Auth API
  const usersByPersona = new Map();
  for (const persona of DEMO_PERSONAS) {
    if (dryRun) {
      usersByPersona.set(persona.key, { id: `mock-uuid-${persona.key}`, email: persona.email });
      continue;
    }
    const user = await getOrCreateDemoUser(supabase, persona);
    usersByPersona.set(persona.key, user);
  }

  if (dryRun) {
    return { success: true, dryRun: true, personas: Array.from(usersByPersona.keys()) };
  }

  // 3. Upsert Profiles
  for (const persona of DEMO_PERSONAS) {
    const user = usersByPersona.get(persona.key);
    const assignedClub = persona.clubCode ? clubsByCode.get(persona.clubCode) : null;

    const profilePayload = {
      id: user.id,
      full_name: persona.fullName,
      role: persona.role,
      app_role: persona.appRole,
      effective_role: persona.appRole,
      portal_role: persona.portalRole,
      student_id: persona.studentId || null,
      department: persona.department || null,
      club_id: assignedClub ? assignedClub.id : null,
      onboarding_status: "completed",
      account_status: "active",
      custom_roles: persona.role === "admin" ? ["club_services_admin"] : []
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      throw new Error(`Failed to upsert profile for ${persona.email}: ${profileError.message}`);
    }
  }

  const studentUser = usersByPersona.get("student");
  const presidentUser = usersByPersona.get("president");
  const executiveUser = usersByPersona.get("executive");
  const advisorUser = usersByPersona.get("advisor");

  // 4. Assign Advisor to NGD and NCIC
  if (advisorUser) {
    await supabase.from("club_advisors").upsert(
      [
        { club_id: ngdClub.id, advisor_profile_id: advisorUser.id, status: "active" },
        ...(ncicClub ? [{ club_id: ncicClub.id, advisor_profile_id: advisorUser.id, status: "active" }] : [])
      ],
      { onConflict: "club_id,advisor_profile_id" }
    );
  }

  // 5. Active Club Memberships for President, Executive, and Student
  const memberEntries = [
    { club_id: ngdClub.id, profile_id: presidentUser.id, role: "president", status: "active" },
    { club_id: ngdClub.id, profile_id: executiveUser.id, role: "executive", status: "active" },
    { club_id: ngdClub.id, profile_id: studentUser.id, role: "member", status: "active" }
  ];

  for (const m of memberEntries) {
    await supabase.from("club_members").upsert(m, { onConflict: "club_id,profile_id" });
  }

  // 6. Multi-Stage Proposals Connected to NGD
  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const futureDate2 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const futureDate3 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const proposalsToInsert = [
    {
      club_id: ngdClub.id,
      submitted_by: presidentUser.id,
      proposed_activity: "Annual Nile Innovation & Hackathon 2026",
      description: "A 48-hour campus hackathon fostering collaborative software development and product design.",
      event_date: futureDate1,
      expected_attendance: 150,
      target_audience: "All STEM and Design Students",
      venue: "Lab 3 & Student Innovation Hub",
      estimated_budget: 450000,
      status: "approved",
      proposal_stage: "completed"
    },
    {
      club_id: ngdClub.id,
      submitted_by: presidentUser.id,
      proposed_activity: "Inter-University Coding Marathon",
      description: "Competitive algorithmic programming contest with partner universities.",
      event_date: futureDate2,
      expected_attendance: 80,
      target_audience: "Competitive Programmers",
      venue: "Computing Hall A",
      estimated_budget: 200000,
      status: "pending_admin_review",
      proposal_stage: "admin_review"
    },
    {
      club_id: ngdClub.id,
      submitted_by: presidentUser.id,
      proposed_activity: "Nile Tech Symposium & Career Fair",
      description: "Industry panel and recruitment networking with top tech organizations in Abuja.",
      event_date: futureDate3,
      expected_attendance: 250,
      target_audience: "All University Students",
      venue: "Main Auditorium",
      estimated_budget: 600000,
      status: "pending_advisor_review",
      proposal_stage: "advisor_review"
    },
    {
      club_id: ngdClub.id,
      submitted_by: presidentUser.id,
      proposed_activity: "Off-Campus Unsanctioned Overnight Trip",
      description: "Proposed overnight retreat outside campus boundaries.",
      event_date: futureDate1,
      expected_attendance: 30,
      target_audience: "Club Executives",
      venue: "Off-Campus Resort",
      estimated_budget: 350000,
      status: "advisor_rejected",
      proposal_stage: "advisor_review"
    }
  ];

  const seededProposals = [];
  for (const prop of proposalsToInsert) {
    const { data: propData, error: propErr } = await supabase
      .from("proposals")
      .insert(prop)
      .select()
      .single();

    if (propErr) {
      console.warn(`Warning inserting proposal "${prop.proposed_activity}":`, propErr.message);
    } else if (propData) {
      seededProposals.push(propData);
    }
  }

  const approvedHackathon = seededProposals.find((p) => p.status === "approved");

  // 7. Seed 6 Assigned Executive Tasks for Zainab Musa (100% matched distribution)
  if (approvedHackathon && executiveUser) {
    const tasksToInsert = [
      // 2 Pending
      {
        club_id: ngdClub.id,
        title: "Finalize event banner & digital badges",
        description: "Design social media banners, event flyers, and participant digital badges.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "pending",
        due_date: futureDate1
      },
      {
        club_id: ngdClub.id,
        title: "Coordinate speaker lodging & transport",
        description: "Confirm arrival times and arrange university guest housing vouchers.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "pending",
        due_date: futureDate1
      },
      // 3 In Progress
      {
        club_id: ngdClub.id,
        title: "Set up Lab 3 networking & backup power",
        description: "Verify dedicated high-speed Wi-Fi SSID and reserve UPS backup stations.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "in_progress",
        due_date: futureDate1
      },
      {
        club_id: ngdClub.id,
        title: "Design RSVP QR check-in posters",
        description: "Generate OneClub attendance QR code stands for the entrance hall.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "in_progress",
        due_date: futureDate1
      },
      {
        club_id: ngdClub.id,
        title: "Order catering & refreshments",
        description: "Finalize meal packages and hydration stations with Nile cafeteria services.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "in_progress",
        due_date: futureDate1
      },
      // 1 Completed
      {
        club_id: ngdClub.id,
        title: "Draft initial budget breakdown",
        description: "Itemized spreadsheet submitted to Club Services.",
        assigned_to: executiveUser.id,
        assigned_by: presidentUser.id,
        status: "completed",
        due_date: futureDate1
      }
    ];

    for (const t of tasksToInsert) {
      await supabase.from("tasks").insert(t);
    }
  }

  // 8. Seed Dues and Announcements
  await supabase.from("announcements").insert([
    {
      club_id: ngdClub.id,
      title: "Welcome to Nile Google Developers 2026 Session",
      message: "Check the events tab for upcoming workshops and the Annual Nile Hackathon.",
      audience: "club",
      created_by: presidentUser.id
    },
    {
      club_id: null,
      title: "OneClub Showcase Demo Ready",
      message: "Explore multi-role club management across Nile University.",
      audience: "all_users",
      created_by: usersByPersona.get("admin").id
    }
  ]);

  console.log("Demo seed successfully completed!");
  return {
    success: true,
    seededProposalsCount: seededProposals.length,
    personasCount: DEMO_PERSONAS.length
  };
}

async function resetDemoDataset({ supabase, dryRun = false }) {
  console.log("Starting scoped demo data reset (preserving official clubs and production records)...");

  // Locate demo persona accounts
  const demoEmails = DEMO_PERSONAS.map((p) => p.email.toLowerCase());
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(`Failed to list users for reset: ${listError.message}`);
  }

  const demoUsers = (listData?.users || []).filter((u) =>
    demoEmails.includes(u.email?.toLowerCase())
  );
  const demoUserIds = demoUsers.map((u) => u.id);

  if (demoUserIds.length === 0) {
    console.log("No demo persona users found to reset.");
    return { success: true, deletedCount: 0 };
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      deletionOrder: SCOPED_RESET_DELETION_ORDER,
      demoUserIds
    };
  }

  // Execute FK-ordered child-to-parent deletion
  for (const table of SCOPED_RESET_DELETION_ORDER) {
    if (table === "auth_users") {
      for (const userId of demoUserIds) {
        await supabase.auth.admin.deleteUser(userId);
      }
      continue;
    }

    if (table === "profiles") {
      await supabase.from("profiles").delete().in("id", demoUserIds);
      continue;
    }

    if (table === "club_advisors") {
      await supabase.from("club_advisors").delete().in("advisor_profile_id", demoUserIds);
      continue;
    }

    if (table === "club_members") {
      await supabase.from("club_members").delete().in("profile_id", demoUserIds);
      continue;
    }

    if (table === "tasks") {
      await supabase.from("tasks").delete().in("assigned_to", demoUserIds);
      continue;
    }

    if (table === "proposals") {
      await supabase.from("proposals").delete().in("submitted_by", demoUserIds);
      continue;
    }

    if (table === "announcements") {
      await supabase.from("announcements").delete().in("created_by", demoUserIds);
      continue;
    }

    if (table === "notifications") {
      await supabase.from("notifications").delete().in("user_id", demoUserIds);
      continue;
    }
  }

  console.log("Scoped demo reset completed successfully.");
  return { success: true, deletedDemoUsersCount: demoUserIds.length };
}

// CLI runner
if (require.main === module) {
  const isReset = process.argv.includes("reset") || process.argv.includes("--reset");
  const validation = validateDemoEnvironment();

  if (!validation.valid) {
    console.error(" Demo environment validation failed:");
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const supabaseUrl = process.env.DEMO_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  (async () => {
    const sentinel = await verifyDemoSentinel(supabase);
    if (!sentinel.verified) {
      console.error(` Demo Sentinel check failed: ${sentinel.error}`);
      process.exit(1);
    }

    if (isReset) {
      await resetDemoDataset({ supabase });
    } else {
      await seedDemoDataset({ supabase });
    }
  })().catch((err) => {
    console.error("Demo script failed:", err);
    process.exit(1);
  });
}

module.exports = {
  ALLOWED_DEMO_HOST_PATTERNS,
  DISALLOWED_PRODUCTION_PATTERNS,
  DEMO_PERSONAS,
  SCOPED_RESET_DELETION_ORDER,
  validateDemoEnvironment,
  verifyDemoSentinel,
  seedDemoDataset,
  resetDemoDataset
};
