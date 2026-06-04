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

test("Campus One staff keeps normal local Club Services access", () => {
  const result = resolveEffectiveRole({
    portalRole: "staff",
    appRole: "student"
  });

  assert.equal(result.effectiveRole, "student");
  assert.equal(result.accessPending, false);
  assert.equal(result.roleSyncState, "active");
  assert.equal(isPortalStaffOrAdmin({ portalRole: "staff" }), true);
  assert.equal(canUseAdvisorFeatures({ portalRole: "staff", appRole: "student" }), false);
});

test("local advisor remains advisor regardless of non-admin Campus One role", () => {
  const studentAdvisor = resolveEffectiveRole({
    portalRole: "student",
    appRole: "advisor"
  });
  const staffAdvisor = resolveEffectiveRole({
    portalRole: "staff",
    appRole: "advisor"
  });

  assert.equal(studentAdvisor.effectiveRole, "advisor");
  assert.equal(studentAdvisor.roleSyncState, "active");
  assert.equal(staffAdvisor.effectiveRole, "advisor");
  assert.equal(staffAdvisor.accessPending, false);
  assert.equal(canUseAdvisorFeatures({ portalRole: "student", appRole: "advisor" }), true);
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

test("feedback manager remains a local Club Services role for Campus One staff", () => {
  const result = resolveEffectiveRole({
    portalRole: "staff",
    appRole: "feedback_manager"
  });

  assert.equal(result.portalRole, "staff");
  assert.equal(result.appRole, "feedback_manager");
  assert.equal(result.effectiveRole, "feedback_manager");
});
