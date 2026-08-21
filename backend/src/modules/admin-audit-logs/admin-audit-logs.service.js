const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { redactAuditMetadata } = require("../../shared/auditRedaction");
const { ensurePaginatedResult } = require("../../shared/pagination");
const { validateAuditLogListQuery } = require("./admin-audit-logs.validation");

function requireAdmin(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can view audit logs", "FORBIDDEN");
  }
}

function formatActor(actor) {
  if (!actor || typeof actor !== "object") {
    return null;
  }

  return {
    id: actor.id ?? null,
    full_name: actor.full_name ?? null,
    role: actor.role ?? null,
    student_id: actor.student_id ?? null
  };
}

function formatClub(club) {
  if (!club || typeof club !== "object") {
    return null;
  }

  return {
    id: club.id ?? null,
    name: club.name ?? null,
    code: club.code ?? null
  };
}

function resolveEntityId(record) {
  return (
    record.proposal_id ||
    record.due_payment_id ||
    record.announcement_id ||
    record.leadership_application_id ||
    record.target_profile_id ||
    record.club_id ||
    null
  );
}

function formatAuditLog(record) {
  return {
    id: record.id,
    actor_id: record.actor_id,
    actor: formatActor(record.actor) || (record.actor_id ? { id: record.actor_id, full_name: null, role: null, student_id: null } : null),
    action: record.action,
    entity_type: record.entity_type,
    entity_id: resolveEntityId(record),
    target_profile_id: record.target_profile_id ?? null,
    target: formatActor(record.target),
    club_id: record.club_id ?? null,
    club: formatClub(record.club),
    proposal_id: record.proposal_id ?? null,
    due_payment_id: record.due_payment_id ?? null,
    leadership_application_id: record.leadership_application_id ?? null,
    announcement_id: record.announcement_id ?? null,
    remarks: typeof record.remarks === "string" ? record.remarks.slice(0, 2000) : null,
    metadata: redactAuditMetadata(record.metadata),
    created_at: record.created_at
  };
}

async function listAdminAuditLogs(options) {
  const { actor, query = {}, pagination, database = db } = options;

  requireAdmin(actor);

  const filters = validateAuditLogListQuery(query);

  if (typeof database.listAuditLogs !== "function") {
    return ensurePaginatedResult([], pagination);
  }

  const result = await database.listAuditLogs({
    ...filters,
    pagination,
    sort: pagination?.sort || "created_at",
    order: pagination?.order || "desc"
  });

  const page = ensurePaginatedResult(result, pagination);
  return {
    ...page,
    items: (page.items ?? []).map(formatAuditLog)
  };
}

module.exports = {
  formatAuditLog,
  listAdminAuditLogs,
  requireAdmin
};
