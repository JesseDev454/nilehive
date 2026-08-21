/*
 * Staging-only E2E data lifecycle utility.
 *
 * This script intentionally refuses the application's normal SUPABASE_* vars.
 * CI must provide the E2E_STAGING_* equivalents and an explicit reset phrase.
 */
const { createClient } = require("@supabase/supabase-js");

const PRODUCT_ROLES = ["student", "president", "executive", "advisor", "admin"];
const PRODUCTION_HOSTS = new Set([
  "clubs.campusone.com.ng",
  "clubs-api.campusone.com.ng",
  "auth.campusone.com.ng"
]);

function requireValue(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function assertNotProductionHost(rawUrl, name) {
  let hostname;
  try {
    hostname = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    throw new Error(`Refusing to run: ${name} is not a valid URL.`);
  }

  if (PRODUCTION_HOSTS.has(hostname) || hostname.endsWith(".campusone.com.ng") && !hostname.includes("staging")) {
    throw new Error(`Refusing to run: ${name} points at a production host.`);
  }
}

function getConfig() {
  if (process.env.E2E_STAGING_ENABLED !== "true") {
    throw new Error("Refusing to run: E2E_STAGING_ENABLED must be exactly true.");
  }

  if (process.env.E2E_STAGING_ALLOW_RESET !== "reset-e2e-staging") {
    throw new Error("Refusing to run: E2E_STAGING_ALLOW_RESET must be reset-e2e-staging.");
  }

  const url = requireValue("E2E_STAGING_SUPABASE_URL");
  const projectRef = requireValue("E2E_STAGING_PROJECT_REF");
  const hostname = new URL(url).hostname;

  if (hostname.split(".")[0] !== projectRef) {
    throw new Error("Refusing to run: E2E_STAGING_PROJECT_REF does not match E2E_STAGING_SUPABASE_URL.");
  }

  assertNotProductionHost(url, "E2E_STAGING_SUPABASE_URL");
  if (process.env.E2E_STAGING_BASE_URL) {
    assertNotProductionHost(process.env.E2E_STAGING_BASE_URL, "E2E_STAGING_BASE_URL");
  }
  if (process.env.E2E_STAGING_API_BASE_URL) {
    assertNotProductionHost(process.env.E2E_STAGING_API_BASE_URL, "E2E_STAGING_API_BASE_URL");
  }

  return {
    url,
    serviceRoleKey: requireValue("E2E_STAGING_SUPABASE_SERVICE_ROLE_KEY"),
    emailPrefix: process.env.E2E_STAGING_EMAIL_PREFIX || "e2e+",
    runId: (process.env.E2E_STAGING_RUN_ID || `run-${Date.now()}`).replace(/[^a-zA-Z0-9-]/g, "-")
  };
}

function createStagingClient(config) {
  return createClient(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function deleteWhere(client, table, column, values) {
  if (!values.length) return 0;
  const { data, error } = await client.from(table).delete().in(column, values).select("id");
  if (error) throw new Error(`${table}: ${error.message}`);
  return data?.length ?? 0;
}

async function listIds(client, table, column, values) {
  if (!values.length) return [];
  const { data, error } = await client.from(table).select("id").in(column, values);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []).map((item) => item.id);
}

async function insertRow(client, table, row) {
  const { data, error } = await client.from(table).insert(row).select("id").single();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

async function removeBucketPrefix(client, bucket, prefix) {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error(`storage/${bucket}: ${error.message}`);
  const paths = (data ?? []).filter((item) => item.name).map((item) => `${prefix}/${item.name}`);
  if (!paths.length) return 0;
  const { error: removeError } = await client.storage.from(bucket).remove(paths);
  if (removeError) throw new Error(`storage/${bucket}: ${removeError.message}`);
  return paths.length;
}

function clubCode(runId, suffix) {
  return `E2E-${runId}-${suffix}`.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
}

function isoDateOffset(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function reset() {
  const config = getConfig();
  const client = createStagingClient(config);
  const { data: profiles, error: profileError } = await client
    .from("profiles")
    .select("id")
    .ilike("email", `${config.emailPrefix}%`);
  if (profileError) throw new Error(`profiles: ${profileError.message}`);

  const profileIds = (profiles ?? []).map((profile) => profile.id);
  const { data: clubs, error: clubError } = await client
    .from("clubs")
    .select("id")
    .ilike("code", "E2E-%");
  if (clubError) throw new Error(`clubs: ${clubError.message}`);
  const clubIds = (clubs ?? []).map((club) => club.id);
  const proposalIds = await listIds(client, "proposals", "club_id", clubIds);
  const memberIds = await listIds(client, "club_members", "club_id", clubIds);
  const notificationIds = await listIds(client, "notifications", "user_id", profileIds);

  const deleted = {};
  deleted.notification_deliveries = await deleteWhere(client, "notification_deliveries", "notification_id", notificationIds);
  deleted.notifications = await deleteWhere(client, "notifications", "user_id", profileIds);
  deleted.push_subscriptions = await deleteWhere(client, "push_subscriptions", "user_id", profileIds);
  deleted.event_attendance = await deleteWhere(client, "event_attendance", "club_id", clubIds);
  deleted.event_rsvps = await deleteWhere(client, "event_rsvps", "club_id", clubIds);
  deleted.event_feedback = await deleteWhere(client, "event_feedback", "club_id", clubIds);
  deleted.event_reports = await deleteWhere(client, "event_reports", "club_id", clubIds);
  deleted.tasks = await deleteWhere(client, "tasks", "club_id", clubIds);
  deleted.announcements = await deleteWhere(client, "announcements", "club_id", clubIds);
  deleted.actor_announcements = await deleteWhere(client, "announcements", "created_by", profileIds);
  deleted.audit_logs = await deleteWhere(client, "audit_logs", "club_id", clubIds);
  deleted.actor_audit_logs = await deleteWhere(client, "audit_logs", "actor_id", profileIds);
  deleted.membership_requests = await deleteWhere(client, "membership_requests", "club_id", clubIds);
  deleted.due_payments = await deleteWhere(client, "due_payments", "club_id", clubIds);
  deleted.club_advisors = await deleteWhere(client, "club_advisors", "club_id", clubIds);
  deleted.club_members = await deleteWhere(client, "club_members", "id", memberIds);
  deleted.proposals = await deleteWhere(client, "proposals", "id", proposalIds);
  deleted.club_media = await deleteWhere(client, "club_media", "club_id", clubIds);
  deleted.clubs = await deleteWhere(client, "clubs", "id", clubIds);

  const buckets = (process.env.E2E_STAGING_STORAGE_BUCKETS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const storageDeleted = {};
  for (const bucket of buckets) storageDeleted[bucket] = await removeBucketPrefix(client, bucket, "e2e");

  console.log(JSON.stringify({ action: "reset", run_id: config.runId, profiles: profileIds.length, deleted, storage_deleted: storageDeleted }));
}

function parseActors() {
  const raw = requireValue("E2E_STAGING_ACTORS_JSON");
  let actors;
  try {
    actors = JSON.parse(raw);
  } catch {
    throw new Error("E2E_STAGING_ACTORS_JSON must be valid JSON.");
  }

  for (const role of PRODUCT_ROLES) {
    if (!actors?.[role]?.profile_id) throw new Error(`E2E_STAGING_ACTORS_JSON.${role}.profile_id is required.`);
  }
  return actors;
}

async function seed() {
  const config = getConfig();
  const actors = parseActors();
  const client = createStagingClient(config);
  const codes = {
    a: clubCode(config.runId, "A"),
    b: clubCode(config.runId, "B"),
    c: clubCode(config.runId, "C")
  };

  const clubs = {};
  for (const [key, code] of Object.entries(codes)) {
    const { data: club, error: clubError } = await client
      .from("clubs")
      .upsert({
        name: `E2E Club ${config.runId} ${key.toUpperCase()}`,
        code,
        description: "Isolated OneClub staging test club. Official 14 clubs are not modified.",
        is_public_signup: true,
        dues_amount: 5000
      }, { onConflict: "code" })
      .select("id, code")
      .single();
    if (clubError) throw new Error(`clubs: ${clubError.message}`);
    clubs[key] = club;
  }

  for (const role of PRODUCT_ROLES) {
    const actor = actors[role];
    const update = {
      role,
      requested_role: role,
      onboarding_status: "complete",
      account_status: "active",
      club_id: ["president", "executive", "advisor", "student"].includes(role) ? clubs.a.id : null
    };
    const { error } = await client.from("profiles").update(update).eq("id", actor.profile_id);
    if (error) throw new Error(`profiles/${role}: ${error.message}`);
  }

  const { error: advisorError } = await client
    .from("club_advisors")
    .upsert({ club_id: clubs.a.id, advisor_profile_id: actors.advisor.profile_id, remarks: "E2E staging assignment" }, { onConflict: "club_id,advisor_profile_id" });
  if (advisorError) throw new Error(`club_advisors: ${advisorError.message}`);
  const { error: legacyAdvisorError } = await client
    .from("clubs")
    .update({ advisor_id: actors.advisor.profile_id })
    .eq("id", clubs.a.id);
  if (legacyAdvisorError) throw new Error(`clubs/advisor: ${legacyAdvisorError.message}`);

  const members = ["president", "executive", "student"].map((role, index) => ({
    club_id: clubs.a.id,
    profile_id: actors[role].profile_id,
    full_name: `E2E ${role}`,
    student_id: `90000000${index + 1}`,
    email: actors[role].email || null,
    club_role: role === "president" ? "president" : role === "executive" ? "executive" : "member",
    membership_status: "active"
  }));
  const { error: memberError } = await client.from("club_members").insert(members);
  if (memberError) throw new Error(`club_members: ${memberError.message}`);

  const { data: studentMember, error: studentMemberError } = await client
    .from("club_members")
    .select("id")
    .eq("club_id", clubs.a.id)
    .eq("profile_id", actors.student.profile_id)
    .single();
  if (studentMemberError) throw new Error(`club_members/student: ${studentMemberError.message}`);

  const pendingMember = await insertRow(client, "club_members", {
    club_id: clubs.b.id,
    profile_id: actors.student.profile_id,
    full_name: "E2E student",
    student_id: "900000014",
    email: actors.student.email || null,
    club_role: "member",
    membership_status: "pending"
  });

  const pendingProposal = await insertRow(client, "proposals", {
    club_id: clubs.a.id,
    submitted_by: actors.president.profile_id,
    title: `E2E pending admin ${config.runId}`,
    description: "Advisor-reviewed proposal waiting for Club Services Admin.",
    event_date: isoDateOffset(21),
    location: "E2E Hall",
    status: "pending_admin_review",
    advisor_remarks: "Ready for Admin review.",
    advisor_decided_by: actors.advisor.profile_id,
    advisor_decided_at: new Date().toISOString()
  });

  const approvedEvent = await insertRow(client, "proposals", {
    club_id: clubs.a.id,
    submitted_by: actors.president.profile_id,
    title: `E2E approved event ${config.runId}`,
    description: "Approved upcoming event for Admin Events coverage.",
    event_date: isoDateOffset(14),
    location: "E2E Auditorium",
    status: "approved",
    advisor_remarks: "Approved by advisor.",
    admin_remarks: "Approved by Admin seed.",
    advisor_decided_by: actors.advisor.profile_id,
    admin_decided_by: actors.admin.profile_id,
    advisor_decided_at: new Date().toISOString(),
    admin_decided_at: new Date().toISOString()
  });

  const submittedDues = await insertRow(client, "due_payments", {
    club_id: clubs.b.id,
    member_id: pendingMember.id,
    amount: 5000,
    academic_session: "2025/2026",
    payment_reference: `E2E-${config.runId}-DUE`,
    status: "submitted",
    submitted_at: new Date().toISOString()
  });

  await insertRow(client, "membership_requests", {
    profile_id: actors.student.profile_id,
    club_id: clubs.b.id,
    requested_role: "member",
    status: "pending",
    member_id: pendingMember.id,
    due_payment_id: submittedDues.id,
    dues_amount: 5000,
    academic_session: "2025/2026",
    join_reason: `E2E join ${config.runId}`
  });

  await insertRow(client, "event_rsvps", {
    proposal_id: approvedEvent.id,
    club_id: clubs.a.id,
    user_id: actors.student.profile_id,
    status: "going"
  });

  await insertRow(client, "event_attendance", {
    proposal_id: approvedEvent.id,
    club_id: clubs.a.id,
    user_id: actors.student.profile_id,
    attended: true,
    checked_in_by: actors.admin.profile_id,
    checked_in_at: new Date().toISOString()
  });

  const announcement = await insertRow(client, "announcements", {
    club_id: null,
    created_by: actors.admin.profile_id,
    title: `E2E announcement ${config.runId}`,
    message: "Isolated staging announcement for Admin directory coverage.",
    audience: "all_users",
    priority: "normal"
  });

  await insertRow(client, "notifications", {
    user_id: actors.admin.profile_id,
    proposal_id: pendingProposal.id,
    type: "pending_admin_review",
    message: `E2E unread notification ${config.runId}`,
    delivery_status: "stored"
  });

  await insertRow(client, "event_feedback", {
    club_id: clubs.a.id,
    proposal_id: approvedEvent.id,
    submitted_by: actors.student.profile_id,
    category: "event",
    rating: 5,
    comment: `E2E feedback ${config.runId}`,
    status: "open"
  });

  await insertRow(client, "audit_logs", {
    actor_id: actors.admin.profile_id,
    entity_type: "announcement",
    action: "announcement_published",
    club_id: null,
    announcement_id: announcement.id,
    remarks: `E2E seed ${config.runId}`,
    metadata: { audience: "all_users", nested: { access_token: "should-be-redacted-if-read" } }
  });

  console.log(JSON.stringify({
    action: "seed",
    run_id: config.runId,
    club_id: clubs.a.id,
    club_code: clubs.a.code,
    extra_club_codes: [clubs.b.code, clubs.c.code],
    pending_proposal_id: pendingProposal.id,
    approved_event_id: approvedEvent.id
  }));
}

const action = process.argv[2];
if (action === "reset") reset().catch((error) => { console.error(error.message); process.exitCode = 1; });
else if (action === "seed") seed().catch((error) => { console.error(error.message); process.exitCode = 1; });
else {
  console.error("Usage: node scripts/e2e-staging.js <reset|seed>");
  process.exitCode = 1;
}
