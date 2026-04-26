function getCurrentAcademicSession() {
  return process.env.CURRENT_ACADEMIC_SESSION || "2025/2026";
}

async function hasVerifiedCurrentSessionDues(memberId, database, academicSession = getCurrentAcademicSession()) {
  if (!database.listDuePayments) {
    return false;
  }

  const payments = await database.listDuePayments({
    memberId,
    status: "paid"
  });

  return payments.some((payment) => payment.academic_session === academicSession);
}

async function recordMemberStatusHistory({
  database,
  member,
  actor,
  previousStatus,
  newStatus,
  reason
}) {
  if (!database.createClubMemberStatusHistory || previousStatus === newStatus) {
    return null;
  }

  return database.createClubMemberStatusHistory({
    member_id: member.id,
    club_id: member.club_id,
    profile_id: member.profile_id || null,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: actor?.id || null,
    reason: reason || null
  });
}

async function updateMemberStatus({
  database,
  member,
  actor,
  nextStatus,
  reason
}) {
  if (!member || member.membership_status === nextStatus) {
    return member;
  }

  const previousStatus = member.membership_status;
  const updatedMember = await database.updateClubMember(member.id, {
    membership_status: nextStatus
  });

  await recordMemberStatusHistory({
    database,
    member,
    actor,
    previousStatus,
    newStatus: nextStatus,
    reason
  });

  return updatedMember;
}

async function syncMemberStatusFromDuePayment({
  database,
  payment,
  actor,
  academicSession = getCurrentAcademicSession()
}) {
  if (!payment || !database.getClubMemberById || !database.updateClubMember) {
    return null;
  }

  if (payment.academic_session !== academicSession) {
    return null;
  }

  const member = await database.getClubMemberById(payment.member_id);

  if (!member || member.membership_status === "alumni") {
    return member;
  }

  const linkedRequest = database.getMembershipRequestByMemberId
    ? await database.getMembershipRequestByMemberId(member.id, ["pending", "approved_pending_dues", "active"])
    : null;

  const nextStatus =
    payment.status === "paid" && linkedRequest?.status !== "pending"
      ? "active"
      : payment.status === "paid" && !linkedRequest
        ? "active"
        : "inactive";

  if (!["paid", "unpaid", "submitted", "rejected"].includes(payment.status)) {
    return member;
  }

  return updateMemberStatus({
    database,
    member,
    actor,
    nextStatus,
    reason:
      payment.status === "paid"
        ? `Dues verified for ${academicSession}`
        : `Dues status is ${payment.status} for ${academicSession}`
  });
}

module.exports = {
  getCurrentAcademicSession,
  hasVerifiedCurrentSessionDues,
  recordMemberStatusHistory,
  syncMemberStatusFromDuePayment,
  updateMemberStatus
};
