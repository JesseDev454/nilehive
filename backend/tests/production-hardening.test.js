const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..", "..");

function readRepoFile(...segments) {
  return fs.readFileSync(path.join(repoRoot, ...segments), "utf8");
}

test("production RLS cleanup removes executive access from private storage policies", () => {
  const sql = readRepoFile("backend", "supabase", "migrations", "0027_production_rls_cleanup.sql");

  assert.match(sql, /storage_objects_select_private_due_receipts/);
  assert.match(sql, /storage_objects_select_private_reports/);
  assert.match(sql, /storage_objects_insert_reports_by_club/);
  assert.doesNotMatch(sql, /p\.role\s*=\s*'executive'/);
  assert.doesNotMatch(sql, /p\.role\s+in\s+\([^)]*'executive'[^)]*\)/);
});

test("production admin bootstrap does not create fake auth users", () => {
  const sql = readRepoFile("backend", "supabase", "bootstrap_admin.sql");

  assert.match(sql, /insert into public\.profiles/i);
  assert.match(sql, /insert into public\.profile_role_history/i);
  assert.match(sql, /exists\s*\(\s*select 1\s*from auth\.users/i);
  assert.doesNotMatch(sql, /insert into auth\.users/i);
});

test("demo seed includes the required role and workflow states", () => {
  const sql = readRepoFile("backend", "supabase", "demo_seed.sql");

  for (const email of [
    "admin@nilehive.test",
    "president@nilehive.test",
    "executive@nilehive.test",
    "advisor@nilehive.test",
    "student@nilehive.test"
  ]) {
    assert.match(sql, new RegExp(email.replace(".", "\\.")));
  }

  for (const status of [
    "draft",
    "pending_advisor_review",
    "pending_admin_review",
    "advisor_rejected",
    "approved"
  ]) {
    assert.match(sql, new RegExp(`'${status}'`));
  }

  assert.match(sql, /missing report/i);
  assert.match(sql, /announcement_published/);
});

test("production handoff documents storage conventions and env split", () => {
  const docs = readRepoFile("docs", "PRODUCTION_HANDOFF.md");

  assert.match(docs, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(docs, /VITE_SUPABASE_ANON_KEY/);
  assert.match(docs, /local\/demo Supabase project/i);
  assert.match(docs, /production Supabase project/i);
  assert.match(docs, /dues-receipts\/\{club_id\}\/\{profile_id\}\/\{file\}/);
  assert.match(docs, /event-media\/\{club_id\}\/\{file\}/);
  assert.match(docs, /reports\/\{club_id\}\/\{proposal_id\}\/\{file\}/);
});

test("signup provisioning migration creates profiles from auth metadata without advisor auto-assignment", () => {
  const sql = readRepoFile("backend", "supabase", "migrations", "0037_signup_profile_provisioning.sql");

  assert.match(sql, /after insert on auth\.users/i);
  assert.match(sql, /raw_user_meta_data/i);
  assert.match(sql, /insert into public\.profiles/i);
  assert.match(sql, /insert into public\.membership_requests/i);
  assert.match(sql, /Created during signup\./i);
  assert.doesNotMatch(sql, /insert into public\.club_advisors/i);
});
