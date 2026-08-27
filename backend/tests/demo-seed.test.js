const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateDemoEnvironment,
  verifyDemoSentinel,
  seedDemoDataset,
  resetDemoDataset,
  buildDemoRecords,
  SCOPED_RESET_DELETION_ORDER,
  DEMO_PERSONAS
} = require("../scripts/demo-seed");

test("validateDemoEnvironment fails closed when APP_ENV is not demo", () => {
  const result = validateDemoEnvironment({
    APP_ENV: "production",
    ALLOW_DEMO_SEED: "true",
    DEMO_SUPABASE_URL: "http://localhost:54321",
    DEMO_SUPABASE_SERVICE_ROLE_KEY: "mock-key"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Invalid APP_ENV")));
});

test("validateDemoEnvironment fails closed when ALLOW_DEMO_SEED is not true", () => {
  const result = validateDemoEnvironment({
    APP_ENV: "demo",
    ALLOW_DEMO_SEED: "false",
    DEMO_SUPABASE_URL: "http://localhost:54321",
    DEMO_SUPABASE_SERVICE_ROLE_KEY: "mock-key"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("ALLOW_DEMO_SEED must be explicitly set to \"true\"")));
});

test("validateDemoEnvironment refuses connection to production hostnames", () => {
  const productionUrls = [
    "https://nilehive.app",
    "https://api.campusone.nileuniversity.edu.ng",
    "https://xyzcompany.supabase.co"
  ];

  for (const url of productionUrls) {
    const result = validateDemoEnvironment({
      APP_ENV: "demo",
      ALLOW_DEMO_SEED: "true",
      DEMO_SUPABASE_URL: url,
      DEMO_SUPABASE_SERVICE_ROLE_KEY: "mock-key"
    });

    assert.equal(result.valid, false, `Expected refusal for URL: ${url}`);
    assert.ok(result.errors.some((e) => e.includes("matches production pattern") || e.includes("not in the demo host allowlist")));
  }
});

test("validateDemoEnvironment accepts valid localhost / demo URL with required credentials", () => {
  const result = validateDemoEnvironment({
    APP_ENV: "demo",
    ALLOW_DEMO_SEED: "true",
    DEMO_SUPABASE_URL: "http://127.0.0.1:54321",
    DEMO_SUPABASE_SERVICE_ROLE_KEY: "mock-service-key",
    DEMO_AUTH_PASSWORD: "runtime-only-secret"
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("validateDemoEnvironment refuses to seed without a runtime demo password", () => {
  const result = validateDemoEnvironment({
    APP_ENV: "demo",
    ALLOW_DEMO_SEED: "true",
    DEMO_SUPABASE_URL: "http://127.0.0.1:54321",
    DEMO_SUPABASE_SERVICE_ROLE_KEY: "mock-service-key"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("DEMO_AUTH_PASSWORD")));
});

test("buildDemoRecords uses the migrated database column contracts and stable ids", () => {
  const users = new Map(DEMO_PERSONAS.map((persona, index) => [
    persona.key,
    { id: `00000000-0000-0000-0000-00000000000${index + 1}`, email: persona.email }
  ]));
  const clubs = new Map([
    ["NGD", { id: "10000000-0000-0000-0000-000000000001", code: "NGD", name: "Nile Google Developers" }],
    ["NCIC", { id: "10000000-0000-0000-0000-000000000002", code: "NCIC", name: "Nile Climate Initiatives Club" }]
  ]);

  const first = buildDemoRecords({ usersByPersona: users, clubsByCode: clubs, now: new Date("2026-08-27T00:00:00Z") });
  const second = buildDemoRecords({ usersByPersona: users, clubsByCode: clubs, now: new Date("2026-08-27T00:00:00Z") });

  assert.deepEqual(first, second, "record ids and payloads must be deterministic");
  assert.equal(first.profiles.length, 5);
  for (const profile of first.profiles) {
    assert.equal("app_role" in profile, false);
    assert.equal("effective_role" in profile, false);
    assert.equal("portal_role" in profile, false);
    assert.equal("custom_roles" in profile, false);
  }
  for (const assignment of first.clubAdvisors) {
    assert.equal("status" in assignment, false);
  }
  for (const member of first.clubMembers) {
    assert.ok(member.full_name);
    assert.ok(member.student_id);
    assert.ok(member.club_role);
    assert.equal(member.membership_status, "active");
    assert.equal("role" in member, false);
    assert.equal("status" in member, false);
  }
  for (const proposal of first.proposals) {
    assert.ok(proposal.id);
    assert.ok(proposal.title);
    assert.ok(proposal.location);
    assert.equal("venue" in proposal, false);
    assert.equal("expected_attendance" in proposal, false);
    assert.equal("estimated_budget" in proposal, false);
    assert.equal("proposal_stage" in proposal, false);
  }
  assert.equal(first.tasks.length, 6);
  assert.equal(first.announcements.length, 2);
});

test("verifyDemoSentinel fails when sentinel table is missing or query errors", async () => {
  const mockClientWithError = {
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { message: "relation \"public.oneclub_demo_sentinel\" does not exist" }
          })
        })
      })
    })
  };

  const result = await verifyDemoSentinel(mockClientWithError);
  assert.equal(result.verified, false);
  assert.ok(result.error.includes("Failed to query demo sentinel table"));
});

test("verifyDemoSentinel fails when is_demo_database is not true", async () => {
  const mockClientWithFalseSentinel = {
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: async () => ({
            data: { is_demo_database: false, environment_name: "production" },
            error: null
          })
        })
      })
    })
  };

  const result = await verifyDemoSentinel(mockClientWithFalseSentinel);
  assert.equal(result.verified, false);
  assert.ok(result.error.includes("Refusing to seed non-demo database"));
});

test("verifyDemoSentinel succeeds when sentinel is valid", async () => {
  const mockClientWithValidSentinel = {
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: async () => ({
            data: { is_demo_database: true, environment_name: "oneclub_isolated_demo" },
            error: null
          })
        })
      })
    })
  };

  const result = await verifyDemoSentinel(mockClientWithValidSentinel);
  assert.equal(result.verified, true);
  assert.equal(result.environmentName, "oneclub_isolated_demo");
});

test("scoped reset deletion order respects foreign-key dependency hierarchy", () => {
  // Child tables MUST precede parent tables
  const indexOfAttendance = SCOPED_RESET_DELETION_ORDER.indexOf("event_attendance");
  const indexOfRsvps = SCOPED_RESET_DELETION_ORDER.indexOf("event_rsvps");
  const indexOfReports = SCOPED_RESET_DELETION_ORDER.indexOf("event_reports");
  const indexOfTasks = SCOPED_RESET_DELETION_ORDER.indexOf("tasks");
  const indexOfProposals = SCOPED_RESET_DELETION_ORDER.indexOf("proposals");
  const indexOfProfiles = SCOPED_RESET_DELETION_ORDER.indexOf("profiles");
  const indexOfAuthUsers = SCOPED_RESET_DELETION_ORDER.indexOf("auth_users");

  assert.ok(indexOfAttendance < indexOfProposals, "event_attendance must be deleted before proposals");
  assert.ok(indexOfRsvps < indexOfProposals, "event_rsvps must be deleted before proposals");
  assert.ok(indexOfReports < indexOfProposals, "event_reports must be deleted before proposals");
  assert.ok(indexOfTasks < indexOfProfiles, "tasks must be deleted before profiles");
  assert.ok(indexOfProposals < indexOfProfiles, "proposals must be deleted before profiles");
  assert.ok(indexOfProfiles < indexOfAuthUsers, "profiles must be deleted before auth_users");
});

test("demo personas contain all 5 distinct showcase roles with valid profiles", () => {
  const roles = DEMO_PERSONAS.map((p) => p.role);
  assert.ok(roles.includes("student"), "Missing student persona");
  assert.ok(roles.includes("president"), "Missing president persona");
  assert.ok(roles.includes("executive"), "Missing executive persona");
  assert.ok(roles.includes("advisor"), "Missing advisor persona");
  assert.ok(roles.includes("admin"), "Missing admin persona");

  for (const p of DEMO_PERSONAS) {
    assert.ok(p.email.endsWith("@demo.oneclub.internal"), `Persona email ${p.email} must use demo domain`);
    assert.ok(p.fullName, `Persona ${p.key} must have full name`);
    assert.ok(p.preferredName, `Persona ${p.key} must have preferred name`);
  }
});

test("seedDemoDataset and resetDemoDataset dry-run mode completes safely without DB mutation", async () => {
  const mockSupabase = {
    from: () => ({
      select: async () => ({
        data: [
          { id: "club-1", code: "NGD", name: "Nile Google Developers" },
          { id: "club-2", code: "NCIC", name: "Nile Climate Initiatives Club" }
        ],
        error: null
      })
    }),
    auth: {
      admin: {
        listUsers: async () => ({
          data: {
            users: [
              { id: "user-1", email: "amina.yusuf@demo.oneclub.internal" },
              { id: "user-2", email: "daniel.okafor@demo.oneclub.internal" }
            ]
          },
          error: null
        })
      }
    }
  };

  const seedResult = await seedDemoDataset({ supabase: mockSupabase, dryRun: true });
  assert.equal(seedResult.success, true);
  assert.equal(seedResult.dryRun, true);

  const resetResult = await resetDemoDataset({ supabase: mockSupabase, dryRun: true });
  assert.equal(resetResult.success, true);
  assert.equal(resetResult.dryRun, true);
  assert.equal(resetResult.demoUserIds.length, 2);
});
