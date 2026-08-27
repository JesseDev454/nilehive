/** OneClub portfolio seed for an isolated demo database only. */
const { createClient } = require("@supabase/supabase-js");

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const PROD_PATTERNS = ["nilehive.app", "campusone.nileuniversity.edu.ng"];
const DEMO_PERSONAS = [
  { key: "student", email: "amina.yusuf@demo.oneclub.internal", fullName: "Amina Yusuf", preferredName: "Amina", role: "student", portalRole: "student", studentId: "242124561", department: "Computer Science", studentType: "returning" },
  { key: "president", email: "daniel.okafor@demo.oneclub.internal", fullName: "Daniel Okafor", preferredName: "Daniel", role: "president", portalRole: "student", studentId: "242124562", department: "Computer Science", studentType: "returning", clubCode: "NGD" },
  { key: "executive", email: "zainab.musa@demo.oneclub.internal", fullName: "Zainab Musa", preferredName: "Zainab", role: "executive", portalRole: "student", studentId: "242124563", department: "Computer Science", studentType: "returning", clubCode: "NGD" },
  { key: "advisor", email: "sarah.bello@demo.oneclub.internal", fullName: "Dr. Sarah Bello", preferredName: "Dr. Bello", role: "advisor", portalRole: "staff", department: "Computer Science" },
  { key: "admin", email: "tobi.adeyemi@demo.oneclub.internal", fullName: "Tobi Adeyemi", preferredName: "Tobi", role: "admin", portalRole: "admin", department: "Student Affairs & Club Services" }
];
const makeIds = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}-0000-4000-8000-00000000000${i + 1}`);
const IDS = Object.freeze({
  members: makeIds("d1000000", 3), proposals: makeIds("d2000000", 4), approvals: makeIds("d3000000", 4),
  tasks: makeIds("d4000000", 6), announcements: makeIds("d5000000", 2), notifications: makeIds("d6000000", 2), rsvps: makeIds("d7000000", 1)
});
const SCOPED_RESET_DELETION_ORDER = ["notifications", "event_rsvps", "approvals", "tasks", "proposals", "announcements", "club_members", "club_advisors", "profiles", "auth_users"];

function hostAllowlist(value = "") { return new Set(value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean)); }
function validateDemoEnvironment(env = process.env) {
  const errors = [];
  if (env.APP_ENV !== "demo") errors.push(`Invalid APP_ENV: expected "demo", received "${env.APP_ENV || ""}"`);
  if (env.ALLOW_DEMO_SEED !== "true") errors.push("ALLOW_DEMO_SEED must be explicitly set to \"true\"");
  if (!env.DEMO_AUTH_PASSWORD?.trim()) errors.push("DEMO_AUTH_PASSWORD must be supplied at runtime");
  if (!env.DEMO_SUPABASE_URL) errors.push("DEMO_SUPABASE_URL is required; generic SUPABASE_URL fallback is disabled");
  else try {
    const hostname = new URL(env.DEMO_SUPABASE_URL).hostname.toLowerCase();
    const allowed = hostAllowlist(env.DEMO_PROJECT_REF_ALLOWLIST);
    if (PROD_PATTERNS.some((p) => hostname.includes(p))) errors.push(`Target URL hostname "${hostname}" matches a production pattern`);
    if (!LOCAL_HOSTS.has(hostname) && !allowed.has(hostname)) errors.push(`Target URL hostname "${hostname}" is not in the demo host allowlist (exact match required)`);
    if (hostname.endsWith(".supabase.co") && !allowed.has(hostname)) errors.push("Hosted Supabase targets require an exact allowlist hostname");
  } catch { errors.push("DEMO_SUPABASE_URL is not a valid URL"); }
  if (!env.DEMO_SUPABASE_SERVICE_ROLE_KEY) errors.push("DEMO_SUPABASE_SERVICE_ROLE_KEY is required; generic service-key fallback is disabled");
  return { valid: errors.length === 0, errors };
}
async function verifyDemoSentinel(client) {
  try {
    const { data, error } = await client.from("oneclub_demo_sentinel").select("is_demo_database, environment_name").limit(1).maybeSingle();
    if (error) return { verified: false, error: `Failed to query demo sentinel table: ${error.message}` };
    if (!data || data.is_demo_database !== true) return { verified: false, error: "Sentinel record missing or false. Refusing to seed non-demo database." };
    return { verified: true, environmentName: data.environment_name || "demo" };
  } catch (error) { return { verified: false, error: `Sentinel verification exception: ${error.message}` }; }
}
function requireResult(result, label) {
  if (result?.error) throw new Error(`${label}: ${result.error.message || String(result.error)}`);
  return result?.data;
}
async function listAllUsers(client) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const data = requireResult(await client.auth.admin.listUsers({ page, perPage: 1000 }), "List demo auth users");
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < 1000) return users;
  }
}
async function ensureUser(client, persona, password, knownUsers) {
  const existing = knownUsers.find((u) => u.email?.toLowerCase() === persona.email);
  const user_metadata = { full_name: persona.fullName, preferred_name: persona.preferredName, first_name: persona.preferredName, portal_role: persona.portalRole, custom_roles: persona.role === "admin" ? ["club_services_admin"] : [] };
  const result = existing
    ? await client.auth.admin.updateUserById(existing.id, { password, user_metadata })
    : await client.auth.admin.createUser({ email: persona.email, password, email_confirm: true, user_metadata });
  return requireResult(result, `${existing ? "Update" : "Create"} demo auth user ${persona.email}`).user;
}
const dateOffset = (now, days) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);

function buildDemoRecords({ usersByPersona, clubsByCode, now = new Date() }) {
  const user = (key) => { const value = usersByPersona.get(key); if (!value?.id) throw new Error(`Missing demo user ${key}`); return value; };
  const club = (code) => { const value = clubsByCode.get(code); if (!value?.id) throw new Error(`Missing official club ${code}`); return value; };
  const ngd = club("NGD"), ncic = club("NCIC"), student = user("student"), president = user("president"), executive = user("executive"), advisor = user("advisor"), admin = user("admin");
  const dates = [7, 21, 45, 28].map((days) => dateOffset(now, days));
  const timestamp = now.toISOString();
  const profiles = DEMO_PERSONAS.map((p) => ({ id: user(p.key).id, full_name: p.fullName, email: p.email, role: p.role, requested_role: p.role, club_id: p.clubCode ? club(p.clubCode).id : null, student_id: p.studentId || null, department: p.department || null, student_type: p.studentType || null, onboarding_status: "complete", account_status: "active" }));
  const clubAdvisors = [ngd, ncic].map((c) => ({ club_id: c.id, advisor_profile_id: advisor.id, assigned_by: admin.id, remarks: "OneClub demo advisor assignment" }));
  const clubMembers = [
    { id: IDS.members[0], club_id: ngd.id, profile_id: president.id, full_name: "Daniel Okafor", student_id: "242124562", email: president.email, club_role: "president", membership_status: "active" },
    { id: IDS.members[1], club_id: ngd.id, profile_id: executive.id, full_name: "Zainab Musa", student_id: "242124563", email: executive.email, club_role: "executive", membership_status: "active" },
    { id: IDS.members[2], club_id: ngd.id, profile_id: student.id, full_name: "Amina Yusuf", student_id: "242124561", email: student.email, club_role: "member", membership_status: "active" }
  ];
  const common = { club_id: ngd.id, submitted_by: president.id, event_time: "10:00", aim_objectives: "Build practical skills and strengthen the Nile technology community.", responsible_members: [{ name: "Zainab Musa", student_id: "242124563", phone_number: "08000000000", position: "Operations Lead" }], submitted_at: timestamp, revision_count: 0 };
  const proposal = (id, title, date, location, participants, budget, status, extra = {}) => ({ ...common, id, title, proposed_activity: title, description: `${title} for the OneClub portfolio demonstration.`, event_date: date, location, number_of_participants: participants, budget_estimate: budget, budget_line_items: [{ item: "Event operations", quantity: 1, description: "Venue, media and logistics", amount: budget }], status, ...extra });
  const proposals = [
    proposal(IDS.proposals[0], "Annual Nile Innovation & Hackathon 2026", dates[0], "Lab 3 and Student Innovation Hub", 150, 450000, "approved", { advisor_remarks: "Recommended for final approval.", admin_remarks: "Approved for the demo calendar." }),
    proposal(IDS.proposals[1], "Inter-University Coding Marathon", dates[1], "Computing Hall A", 80, 200000, "pending_admin_review", { advisor_remarks: "Recommended for final approval." }),
    proposal(IDS.proposals[2], "Nile Tech Symposium and Career Fair", dates[2], "Main Auditorium", 250, 600000, "pending_advisor_review"),
    proposal(IDS.proposals[3], "Off-Campus Overnight Retreat", dates[3], "Off-campus venue", 30, 350000, "advisor_rejected", { advisor_remarks: "Off-campus overnight events require prior dean approval." })
  ];
  const approvals = [
    [0, 0, advisor.id, "advisor", "approve", "Recommended for final approval."], [1, 0, admin.id, "admin", "approve", "Approved for the demo calendar."],
    [2, 1, advisor.id, "advisor", "approve", "Recommended for final approval."], [3, 3, advisor.id, "advisor", "reject", "Off-campus overnight events require prior dean approval."]
  ].map(([approvalIndex, proposalIndex, reviewer_id, reviewer_role, decision, remarks]) => ({ id: IDS.approvals[approvalIndex], proposal_id: IDS.proposals[proposalIndex], reviewer_id, reviewer_role, decision, remarks, decided_at: timestamp }));
  const taskValues = [["Finalize event banner and digital badges", "pending"], ["Coordinate speaker lodging and transport", "pending"], ["Set up Lab 3 networking and backup power", "in_progress"], ["Design RSVP QR check-in posters", "in_progress"], ["Order catering and refreshments", "in_progress"], ["Draft initial budget breakdown", "completed"]];
  const tasks = taskValues.map(([title, status], i) => ({ id: IDS.tasks[i], club_id: ngd.id, assigned_by: president.id, assigned_to: executive.id, title, description: `${title} for the Annual Nile Innovation and Hackathon.`, priority: i < 2 ? "high" : "medium", status, due_date: dates[0] }));
  const announcements = [{ id: IDS.announcements[0], club_id: ngd.id, created_by: president.id, title: "Nile Google Developers session update", message: "Registration for the Annual Nile Innovation and Hackathon is now open.", audience: "club" }, { id: IDS.announcements[1], club_id: null, created_by: admin.id, title: "OneClub campus update", message: "Explore upcoming club events and follow your membership progress in OneClub.", audience: "all" }];
  const notifications = [{ id: IDS.notifications[0], user_id: student.id, proposal_id: IDS.proposals[0], announcement_id: null, type: "advisor_approved", message: "The Annual Nile Innovation and Hackathon is approved and available in Events." }, { id: IDS.notifications[1], user_id: executive.id, proposal_id: null, announcement_id: IDS.announcements[0], type: "announcement_published", message: "A new club update has been published." }];
  const rsvps = [{ id: IDS.rsvps[0], proposal_id: IDS.proposals[0], club_id: ngd.id, user_id: student.id, status: "going" }];
  return { profiles, clubAdvisors, clubMembers, proposals, approvals, tasks, announcements, notifications, rsvps };
}

async function upsert(client, table, rows, onConflict = "id") { if (rows.length) requireResult(await client.from(table).upsert(rows, { onConflict }), `Upsert ${table}`); }
async function seedDemoDataset({ supabase, password, dryRun = false, now = new Date() }) {
  if (!password && !dryRun) throw new Error("DEMO_AUTH_PASSWORD is required");
  const clubs = requireResult(await supabase.from("clubs").select("id, code, name"), "Load official clubs") || [];
  const clubsByCode = new Map(clubs.map((c) => [c.code, c]));
  for (const code of ["NGD", "NCIC"]) if (!clubsByCode.has(code)) throw new Error(`Missing official club ${code}`);
  if (dryRun) {
    const users = new Map(DEMO_PERSONAS.map((p, i) => [p.key, { id: `00000000-0000-4000-8000-00000000000${i + 1}`, email: p.email }]));
    return { success: true, dryRun: true, records: buildDemoRecords({ usersByPersona: users, clubsByCode, now }) };
  }
  const known = await listAllUsers(supabase), users = new Map();
  for (const persona of DEMO_PERSONAS) { const authUser = await ensureUser(supabase, persona, password, known); users.set(persona.key, authUser); if (!known.some((u) => u.id === authUser.id)) known.push(authUser); }
  const records = buildDemoRecords({ usersByPersona: users, clubsByCode, now });
  await upsert(supabase, "profiles", records.profiles); await upsert(supabase, "club_advisors", records.clubAdvisors, "club_id,advisor_profile_id");
  await upsert(supabase, "club_members", records.clubMembers); await upsert(supabase, "proposals", records.proposals); await upsert(supabase, "approvals", records.approvals);
  await upsert(supabase, "tasks", records.tasks); await upsert(supabase, "announcements", records.announcements); await upsert(supabase, "notifications", records.notifications); await upsert(supabase, "event_rsvps", records.rsvps);
  return { success: true, counts: Object.fromEntries(Object.entries(records).map(([key, rows]) => [key, rows.length])) };
}
async function deleteIds(client, table, ids) { if (ids.length) requireResult(await client.from(table).delete().in("id", ids), `Delete ${table}`); }
async function resetDemoDataset({ supabase, dryRun = false }) {
  const demoEmails = new Set(DEMO_PERSONAS.map((p) => p.email));
  const demoUsers = (await listAllUsers(supabase)).filter((u) => demoEmails.has(u.email?.toLowerCase()));
  const userIds = demoUsers.map((u) => u.id);
  if (dryRun) return { success: true, dryRun: true, deletionOrder: SCOPED_RESET_DELETION_ORDER, demoUserIds: userIds };
  await deleteIds(supabase, "notifications", IDS.notifications); await deleteIds(supabase, "event_rsvps", IDS.rsvps); await deleteIds(supabase, "approvals", IDS.approvals);
  await deleteIds(supabase, "tasks", IDS.tasks); await deleteIds(supabase, "proposals", IDS.proposals); await deleteIds(supabase, "announcements", IDS.announcements); await deleteIds(supabase, "club_members", IDS.members);
  if (userIds.length) { requireResult(await supabase.from("club_advisors").delete().in("advisor_profile_id", userIds), "Delete club_advisors"); requireResult(await supabase.from("profiles").delete().in("id", userIds), "Delete profiles"); }
  for (const user of demoUsers) requireResult(await supabase.auth.admin.deleteUser(user.id), `Delete auth user ${user.email}`);
  return { success: true, deletedDemoUsersCount: demoUsers.length };
}
async function runCli() {
  const validation = validateDemoEnvironment(); if (!validation.valid) throw new Error(`Demo environment validation failed:\n- ${validation.errors.join("\n- ")}`);
  const client = createClient(process.env.DEMO_SUPABASE_URL, process.env.DEMO_SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const sentinel = await verifyDemoSentinel(client); if (!sentinel.verified) throw new Error(`Demo sentinel check failed: ${sentinel.error}`);
  return process.argv.includes("reset") || process.argv.includes("--reset") ? resetDemoDataset({ supabase: client }) : seedDemoDataset({ supabase: client, password: process.env.DEMO_AUTH_PASSWORD });
}
if (require.main === module) runCli().then((r) => console.log(JSON.stringify(r))).catch((e) => { console.error(e.message); process.exitCode = 1; });
module.exports = { DEMO_PERSONAS, IDS, SCOPED_RESET_DELETION_ORDER, buildDemoRecords, validateDemoEnvironment, verifyDemoSentinel, seedDemoDataset, resetDemoDataset };
