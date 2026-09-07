const PORTAL_ROLES = new Set(["student", "staff", "admin"]);
const APP_ROLES = new Set(["student", "executive", "president", "advisor", "admin", "feedback_manager"]);
const CAMPUS_ONE_ADMIN_CUSTOM_ROLE = "club_services_admin";

function normalizePortalRole(role) {
  return PORTAL_ROLES.has(role) ? role : "student";
}

function normalizeAppRole(role) {
  return APP_ROLES.has(role) ? role : "student";
}

function normalizeCustomRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  return [...new Set(
    roles
      .map((role) => String(role || "").trim().toLowerCase())
      .filter(Boolean)
  )];
}

function hasClubServicesAdminRole(customRoles) {
  return normalizeCustomRoles(customRoles).includes(CAMPUS_ONE_ADMIN_CUSTOM_ROLE);
}

function isPortalAdmin(userOrRole) {
  const portalRole = typeof userOrRole === "string" ? userOrRole : userOrRole?.portalRole;
  const customRoles = typeof userOrRole === "string" ? [] : userOrRole?.customRoles;
  return normalizePortalRole(portalRole) === "admin" || hasClubServicesAdminRole(customRoles);
}

function isPortalStaffOrAdmin(userOrRole) {
  const portalRole = typeof userOrRole === "string" ? userOrRole : userOrRole?.portalRole;
  const normalized = normalizePortalRole(portalRole);
  return normalized === "staff" || normalized === "admin";
}

function canUseAdvisorFeatures(user) {
  return normalizeAppRole(user?.appRole) === "advisor";
}

function resolveEffectiveRole({ portalRole, appRole, customRoles }) {
  const normalizedPortalRole = normalizePortalRole(portalRole);
  const normalizedAppRole = normalizeAppRole(appRole);
  const normalizedCustomRoles = normalizeCustomRoles(customRoles);

  if (normalizedPortalRole === "admin" || hasClubServicesAdminRole(normalizedCustomRoles)) {
    return {
      portalRole: normalizedPortalRole,
      appRole: normalizedAppRole,
      customRoles: normalizedCustomRoles,
      effectiveRole: "admin",
      accessPending: false,
      roleSyncState: "active"
    };
  }

  return {
    portalRole: normalizedPortalRole,
    appRole: normalizedAppRole,
    customRoles: normalizedCustomRoles,
    effectiveRole: normalizedAppRole,
    accessPending: false,
    roleSyncState: "active"
  };
}

module.exports = {
  canUseAdvisorFeatures,
  hasClubServicesAdminRole,
  isPortalAdmin,
  isPortalStaffOrAdmin,
  normalizeAppRole,
  normalizeCustomRoles,
  normalizePortalRole,
  resolveEffectiveRole
};
