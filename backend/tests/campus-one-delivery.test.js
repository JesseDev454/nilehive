const test = require("node:test");
const assert = require("node:assert/strict");
const { decryptToken, encryptToken } = require("../src/modules/notifications/campusOneTokens");
const { mapCampusOneType } = require("../src/modules/notifications/campusOne.service");
const { verifyCampusOneSignature } = require("../src/modules/auth/campusOneWebhook");
const crypto = require("node:crypto");

const env = { CAMPUS_ONE_TOKEN_ENCRYPTION_KEY: "test-only-encryption-key" };

test("CampusOne tokens round-trip through AES-256-GCM without plaintext storage", () => {
  const encrypted = encryptToken("secret-access-token", env);
  assert.ok(encrypted.startsWith("v1."));
  assert.equal(encrypted.includes("secret-access-token"), false);
  assert.equal(decryptToken(encrypted, env), "secret-access-token");
});

test("CampusOne notification types map workflow urgency", () => {
  assert.equal(mapCampusOneType({ type: "admin_approved" }), "success");
  assert.equal(mapCampusOneType({ type: "missing_report_prompt" }), "action_required");
  assert.equal(mapCampusOneType({ type: "announcement_published" }), "info");
});

test("CampusOne webhook signatures require the raw HMAC body", () => {
  const raw = Buffer.from(JSON.stringify({ id: "delivery-1", event: "user.updated" }));
  const secret = "webhook-secret";
  const signature = `sha256=${crypto.createHmac("sha256", secret).update(raw).digest("hex")}`;
  assert.equal(verifyCampusOneSignature(raw, signature, secret), true);
  assert.equal(verifyCampusOneSignature(raw, "sha256=bad", secret), false);
});
