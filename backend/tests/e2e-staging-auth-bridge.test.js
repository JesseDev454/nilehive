const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hasMatchingStagingBridgeSecret,
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

test("staging E2E bridge requires an exact secret match", () => {
  assert.equal(hasMatchingStagingBridgeSecret("test-secret", "test-secret"), true);
  assert.equal(hasMatchingStagingBridgeSecret("wrong-secret", "test-secret"), false);
  assert.equal(hasMatchingStagingBridgeSecret("", "test-secret"), false);
});
