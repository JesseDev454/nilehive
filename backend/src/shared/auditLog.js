async function writeAuditLog(database, entry) {
  if (!database || typeof database.createAuditLog !== "function") {
    return null;
  }

  return database.createAuditLog({
    actor_id: entry.actor_id,
    entity_type: entry.entity_type,
    action: entry.action,
    target_profile_id: entry.target_profile_id ?? null,
    club_id: entry.club_id ?? null,
    proposal_id: entry.proposal_id ?? null,
    due_payment_id: entry.due_payment_id ?? null,
    leadership_application_id: entry.leadership_application_id ?? null,
    announcement_id: entry.announcement_id ?? null,
    remarks: entry.remarks ?? null,
    metadata: entry.metadata ?? {}
  });
}

module.exports = {
  writeAuditLog
};
