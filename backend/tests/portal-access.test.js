const test = require("node:test");
const assert = require("node:assert/strict");
const {
  resolveEffectiveRole,
  isPortalAdmin,
  isPortalStaffOrAdmin,
  canUseAdvisorFeatures
} = require("../src/shared/portalAccess");

test("Campus One admin always resolves to Club Services admin", () => {
  const result = resolveEffectiveRole({
    portalRole: "admin",
    appRole: "student"
  });

  assert.equal(result.portalRole, "admin");
  assert.equal(result.appRole, "student");
  assert.equal(result.effectiveRole, "admin");
  assert.equal(result.accessPending, false);
  assert.equal(result.roleSyncState, "active");
  assert.equal(isPortalAdmin({ portalRole: "admin" }), true);
});

test("Campus One staff without local advisor stays pending", () => {
  const result = resolveEffectiveRole({
    portalRole: "staff",
    appRole: "student"
  });

  assert.equal(result.effectiveRole, "staff");
  assert.equal(result.accessPending, true);
  assert.equal(result.roleSyncState, "pending_assignment");
  assert.equal(isPortalStaffOrAdmin({ portalRole: "staff" }), true);
  assert.equal(canUseAdvisorFeatures({ portalRole: "staff", appRole: "student" }), false);
});

test("local advisor requires Campus One staff or admin to activate", () => {
  const pendingAdvisor = resolveEffectiveRole({
    portalRole: "student",
    appRole: "advisor"
  });
  const activeAdvisor = resolveEffectiveRole({
    portalRole: "staff",
    appRole: "advisor"
  });

  assert.equal(pendingAdvisor.effectiveRole, "student");
  assert.equal(pendingAdvisor.roleSyncState, "advisor_requires_staff_role");
  assert.equal(activeAdvisor.effectiveRole, "advisor");
  assert.equal(activeAdvisor.accessPending, false);
  assert.equal(canUseAdvisorFeatures({ portalRole: "staff", appRole: "advisor" }), true);
});

test("president and executive remain local Club Services roles for Campus One students", () => {
  const president = resolveEffectiveRole({
    portalRole: "student",
    appRole: "president"
  });
  const executive = resolveEffectiveRole({
    portalRole: "student",
    appRole: "executive"
  });

  assert.equal(president.effectiveRole, "president");
  assert.equal(executive.effectiveRole, "executive");
  assert.equal(president.accessPending, false);
  assert.equal(executive.accessPending, false);
});
