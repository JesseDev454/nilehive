/*
 * Staging-only E2E data lifecycle utility.
 *
 * This script intentionally refuses the application's normal SUPABASE_* vars.
 * CI must provide the E2E_STAGING_* equivalents and an explicit reset phrase.
 */
const { createClient } = require("@supabase/supabase-js");

const ROLE_NAMES = ["student", "president", "executive", "advisor", "admin", "feedback_manager"];

function requireValue(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
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

async function removeBucketPrefix(client, bucket, prefix) {
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error(`storage/${bucket}: ${error.message}`);
  const paths = (data ?? []).filter((item) => item.name).map((item) => `${prefix}/${item.name}`);
  if (!paths.length) return 0;
  const { error: removeError } = await client.storage.from(bucket).remove(paths);
  if (removeError) throw new Error(`storage/${bucket}: ${removeError.message}`);
  return paths.length;
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
  deleted.membership_requests = await deleteWhere(client, "membership_requests", "club_id", clubIds);
  deleted.due_payments = await deleteWhere(client, "due_payments", "club_id", clubIds);
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

  for (const role of ROLE_NAMES) {
    if (!actors?.[role]?.profile_id) throw new Error(`E2E_STAGING_ACTORS_JSON.${role}.profile_id is required.`);
  }
  return actors;
}

async function seed() {
  const config = getConfig();
  const actors = parseActors();
  const client = createStagingClient(config);
  const code = `E2E-${config.runId.toUpperCase()}`.slice(0, 40);
  const { data: club, error: clubError } = await client
    .from("clubs")
    .upsert({ name: `E2E Club ${config.runId}`, code, description: "Isolated OneClub staging test club.", is_public_signup: true }, { onConflict: "code" })
    .select("id, code")
    .single();
  if (clubError) throw new Error(`clubs: ${clubError.message}`);

  for (const role of ROLE_NAMES) {
    const actor = actors[role];
    const update = {
      role,
      requested_role: role === "feedback_manager" ? "student" : role,
      onboarding_status: "complete",
      account_status: "active",
      club_id: ["president", "executive", "advisor", "student"].includes(role) ? club.id : null
    };
    const { error } = await client.from("profiles").update(update).eq("id", actor.profile_id);
    if (error) throw new Error(`profiles/${role}: ${error.message}`);
  }

  // Modern installations use club_advisors; keep the legacy advisor_id in
  // sync so the seed works during a staged migration as well.
  const { error: advisorError } = await client
    .from("club_advisors")
    .upsert({ club_id: club.id, advisor_profile_id: actors.advisor.profile_id, remarks: "E2E staging assignment" }, { onConflict: "club_id,advisor_profile_id" });
  if (advisorError) throw new Error(`club_advisors: ${advisorError.message}`);
  const { error: legacyAdvisorError } = await client
    .from("clubs")
    .update({ advisor_id: actors.advisor.profile_id })
    .eq("id", club.id);
  if (legacyAdvisorError) throw new Error(`clubs/advisor: ${legacyAdvisorError.message}`);

  const members = ["president", "executive", "student"].map((role) => ({
    club_id: club.id,
    profile_id: actors[role].profile_id,
    full_name: `E2E ${role}`,
    // New test records must meet the same nine-digit constraint as real members.
    student_id: `90000000${["president", "executive", "student"].indexOf(role) + 1}`,
    email: actors[role].email || null,
    club_role: role === "president" ? "president" : role === "executive" ? "executive" : "member",
    membership_status: "active"
  }));
  const { error: memberError } = await client.from("club_members").insert(members);
  if (memberError) throw new Error(`club_members: ${memberError.message}`);

  console.log(JSON.stringify({ action: "seed", run_id: config.runId, club_id: club.id, club_code: club.code }));
}

const action = process.argv[2];
if (action === "reset") reset().catch((error) => { console.error(error.message); process.exitCode = 1; });
else if (action === "seed") seed().catch((error) => { console.error(error.message); process.exitCode = 1; });
else {
  console.error("Usage: node scripts/e2e-staging.js <reset|seed>");
  process.exitCode = 1;
}
