const PORTAL_ROLES = new Set(["student", "staff", "admin"]);
const APP_ROLES = new Set(["student", "executive", "president", "advisor", "admin"]);

function normalizePortalRole(role) {
  return PORTAL_ROLES.has(role) ? role : "student";
}

function normalizeAppRole(role) {
  return APP_ROLES.has(role) ? role : "student";
}

function isPortalAdmin(userOrRole) {
  const portalRole = typeof userOrRole === "string" ? userOrRole : userOrRole?.portalRole;
  return normalizePortalRole(portalRole) === "admin";
}

function isPortalStaffOrAdmin(userOrRole) {
  const portalRole = typeof userOrRole === "string" ? userOrRole : userOrRole?.portalRole;
  const normalized = normalizePortalRole(portalRole);
  return normalized === "staff" || normalized === "admin";
}

function canUseAdvisorFeatures(user) {
  return isPortalStaffOrAdmin(user) && normalizeAppRole(user?.appRole) === "advisor";
}

function resolveEffectiveRole({ portalRole, appRole }) {
  const normalizedPortalRole = normalizePortalRole(portalRole);
  const normalizedAppRole = normalizeAppRole(appRole);

  if (normalizedPortalRole === "admin") {
    return {
      portalRole: normalizedPortalRole,
      appRole: normalizedAppRole,
      effectiveRole: "admin",
      accessPending: false,
      roleSyncState: "active"
    };
  }

  if (normalizedPortalRole === "staff") {
    if (normalizedAppRole === "advisor") {
      return {
        portalRole: normalizedPortalRole,
        appRole: normalizedAppRole,
        effectiveRole: "advisor",
        accessPending: false,
        roleSyncState: "active"
      };
    }

    return {
      portalRole: normalizedPortalRole,
      appRole: normalizedAppRole,
      effectiveRole: "staff",
      accessPending: true,
      roleSyncState: "pending_assignment"
    };
  }

  if (normalizedAppRole === "advisor") {
    return {
      portalRole: normalizedPortalRole,
      appRole: normalizedAppRole,
      effectiveRole: "student",
      accessPending: false,
      roleSyncState: "advisor_requires_staff_role"
    };
  }

  if (normalizedAppRole === "president" || normalizedAppRole === "executive") {
    return {
      portalRole: normalizedPortalRole,
      appRole: normalizedAppRole,
      effectiveRole: normalizedAppRole,
      accessPending: false,
      roleSyncState: "active"
    };
  }

  return {
    portalRole: normalizedPortalRole,
    appRole: normalizedAppRole,
    effectiveRole: "student",
    accessPending: false,
    roleSyncState: "active"
  };
}

module.exports = {
  canUseAdvisorFeatures,
  isPortalAdmin,
  isPortalStaffOrAdmin,
  normalizeAppRole,
  normalizePortalRole,
  resolveEffectiveRole
};
