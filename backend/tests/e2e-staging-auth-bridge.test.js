const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hasMatchingStagingBridgeSecret,
  getAllowedStagingE2EProfileIds,
  getSessionCookieOptions,
  isAllowedStagingE2EProfile,
  isStagingE2EAuthBridgeEnabled
} = require("../src/modules/auth/campusOneOidc");

test("staging E2E bridge is disabled unless the deployment is explicitly marked staging", () => {
  assert.equal(isStagingE2EAuthBridgeEnabled({
    APP_ENV: "production",
    E2E_STAGING_AUTH_BRIDGE_ENABLED: "true",
    E2E_STAGING_AUTH_BRIDGE_SECRET: "test-secret"
  }), false);

  assert.equal(isStagingE2EAuthBridgeEnabled({
    APP_ENV: "staging",
    E2E_STAGING_AUTH_BRIDGE_ENABLED: "false",
    E2E_STAGING_AUTH_BRIDGE_SECRET: "test-secret"
  }), false);

  assert.equal(isStagingE2EAuthBridgeEnabled({
    APP_ENV: "staging",
    E2E_STAGING_AUTH_BRIDGE_ENABLED: "true",
    E2E_STAGING_AUTH_BRIDGE_SECRET: "test-secret"
  }), true);
});

test("staging E2E bridge permits e2e+ emails and an explicit staging allow-list only", () => {
  assert.deepEqual(getAllowedStagingE2EProfileIds({ E2E_STAGING_ALLOWED_PROFILE_IDS: " student-id, president-id, " }), ["student-id", "president-id"]);
  assert.equal(isAllowedStagingE2EProfile({ id: "student-id", email: "e2e+student@nilehive.test" }, {}), true);
  assert.equal(isAllowedStagingE2EProfile(
    { id: "student-id", email: "newstudent@nilehive.test" },
    { E2E_STAGING_ALLOWED_PROFILE_IDS: "student-id, president-id" }
  ), true);
  assert.equal(isAllowedStagingE2EProfile(
    { id: "other-id", email: "newstudent@nilehive.test" },
    { E2E_STAGING_ALLOWED_PROFILE_IDS: "student-id, president-id" }
  ), false);
});

test("staging E2E bridge requires an exact secret match", () => {
  assert.equal(hasMatchingStagingBridgeSecret("test-secret", "test-secret"), true);
  assert.equal(hasMatchingStagingBridgeSecret("wrong-secret", "test-secret"), false);
  assert.equal(hasMatchingStagingBridgeSecret("", "test-secret"), false);
});

test("staging session cookies support credentialed frontend-to-API requests", () => {
  const stagingOptions = getSessionCookieOptions(undefined, { APP_ENV: "staging", NODE_ENV: "development" });
  assert.equal(stagingOptions.secure, true);
  assert.equal(stagingOptions.sameSite, "None");

  const productionOptions = getSessionCookieOptions(undefined, { APP_ENV: "production", NODE_ENV: "production" });
  assert.equal(productionOptions.sameSite, "Lax");
});
