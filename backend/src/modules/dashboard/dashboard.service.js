const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { getQueueHealth } = require("../../jobs/queue");
const { getEventLifecycle } = require("../events/event-lifecycle");

function isPendingStatus(status) {
  return status === "pending_advisor_review" || status === "pending_admin_review";
}

function isRejectedStatus(status) {
  return status === "advisor_rejected" || status === "admin_rejected";
}

function summarizeProposals(proposals) {
  const total = proposals.length;
  const approved = proposals.filter((proposal) => proposal.status === "approved").length;
  const pending = proposals.filter((proposal) => isPendingStatus(proposal.status)).length;
  const rejected = proposals.filter((proposal) => isRejectedStatus(proposal.status)).length;

  return {
    total_proposals: total,
    pending_proposals: pending,
    approved_proposals: approved,
    rejected_proposals: rejected,
    approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0
  };
}

function calculateAttendanceRate(attendedCount, goingCount) {
  if (goingCount <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((attendedCount / goingCount) * 100));
}

function formatProposalSummary(proposal) {
  return {
    id: proposal.id,
    title: proposal.title,
    club_id: proposal.club_id,
    club_name: proposal.club?.name || null,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    status: proposal.status,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at
  };
}

function formatEventSummary(proposal) {
  return {
    id: proposal.id,
    proposal_id: proposal.id,
    title: proposal.proposed_activity || proposal.title,
    proposal_title: proposal.title,
    club_id: proposal.club_id,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    status: proposal.status,
    approved_at: proposal.admin_decided_at
  };
}

function formatActivity(proposal) {
  return {
    id: proposal.id,
    proposal_id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    message: `Proposal "${proposal.title}" is ${proposal.status.replace(/_/g, " ")}.`,
    created_at: proposal.updated_at || proposal.created_at
  };
}

function countBy(items, readKey) {
  return items.reduce((counts, item) => {
    const key = readKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getLatestTimestamp(records, readTimestamp) {
  return records
    .map(readTimestamp)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

function isPastEvent(proposal, now = new Date()) {
  return getEventLifecycle(proposal?.event_date, now) === "past";
}

function isSupportableEvent(proposal, now = new Date()) {
  return getEventLifecycle(proposal?.event_date, now) !== "past";
}

function formatPendingAction(type, label, count) {
  return {
    type,
    label,
    count
  };
}

function buildProposalBottlenecks(proposals) {
  const statusCounts = countBy(proposals, (proposal) => proposal.status);

  return [
    {
      status: "draft",
      label: "Draft",
      count: statusCounts.draft || 0
    },
    {
      status: "pending_advisor_review",
      label: "With Advisor",
      count: statusCounts.pending_advisor_review || 0
    },
    {
      status: "pending_admin_review",
      label: "With Admin",
      count: statusCounts.pending_admin_review || 0
    },
    {
      status: "approved",
      label: "Approved",
      count: statusCounts.approved || 0
    },
    {
      status: "advisor_rejected",
      label: "Advisor Rejected",
      count: statusCounts.advisor_rejected || 0
    },
    {
      status: "admin_rejected",
      label: "Admin Rejected",
      count: statusCounts.admin_rejected || 0
    }
  ];
}

function buildRecentActivity({
  proposals,
  membershipRequests,
  duePayments,
  reports,
  feedback,
  tasks
}) {
  const proposalActivity = proposals.map((proposal) => ({
    id: `proposal-${proposal.id}`,
    type: "proposal",
    club_id: proposal.club_id,
    club_name: proposal.club?.name || null,
    title: proposal.title,
    message: `Proposal "${proposal.title}" is ${proposal.status.replace(/_/g, " ")}.`,
    created_at: proposal.updated_at || proposal.created_at
  }));
  const membershipActivity = membershipRequests.map((request) => ({
    id: `membership-${request.id}`,
    type: "membership_request",
    club_id: request.club_id,
    club_name: request.club?.name || null,
    title: "Membership request",
    message: `Membership request is ${request.status.replace(/_/g, " ")}.`,
    created_at: request.updated_at || request.created_at
  }));
  const duesActivity = duePayments.map((payment) => ({
    id: `dues-${payment.id}`,
    type: "dues",
    club_id: payment.club_id,
    club_name: null,
    title: "Dues payment",
    message: `Dues payment is ${payment.status}.`,
    created_at: payment.updated_at || payment.created_at
  }));
  const reportActivity = reports.map((report) => ({
    id: `report-${report.id}`,
    type: "event_report",
    club_id: report.club_id,
    club_name: null,
    title: "Event report submitted",
    message: `Event report submitted with ${report.attendance_count} attendee(s).`,
    created_at: report.submitted_at || report.updated_at || report.created_at
  }));
  const feedbackActivity = feedback.map((item) => ({
    id: `feedback-${item.id}`,
    type: "feedback",
    club_id: item.club_id,
    club_name: null,
    title: "Event feedback",
    message: item.rating ? `Feedback received with ${item.rating}/5 rating.` : "Feedback received.",
    created_at: item.updated_at || item.created_at
  }));
  const taskActivity = tasks.map((task) => ({
    id: `task-${task.id}`,
    type: "task",
    club_id: task.club_id,
    club_name: null,
    title: task.title,
    message: `Task "${task.title}" is ${task.status.replace(/_/g, " ")}.`,
    created_at: task.updated_at || task.created_at
  }));

  return [
    ...proposalActivity,
    ...membershipActivity,
    ...duesActivity,
    ...reportActivity,
    ...feedbackActivity,
    ...taskActivity
  ]
    .filter((item) => item.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);
}

function buildClubPerformance({
  clubs,
  proposals,
  members,
  duePayments,
  reports,
  rsvps,
  attendance,
  membershipRequests,
  feedback,
  tasks
}) {
  return clubs.map((club) => {
    const clubProposals = proposals.filter((proposal) => proposal.club_id === club.id);
    const clubMembers = members.filter((member) => member.club_id === club.id);
    const clubDues = duePayments.filter((payment) => payment.club_id === club.id);
    const clubReports = reports.filter((report) => report.club_id === club.id);
    const clubRsvps = rsvps.filter((rsvp) => rsvp.club_id === club.id);
    const clubAttendance = attendance.filter((record) => record.club_id === club.id && record.attended);
    const clubRequests = membershipRequests.filter((request) => request.club_id === club.id);
    const clubFeedback = feedback.filter((item) => item.club_id === club.id);
    const clubTasks = tasks.filter((task) => task.club_id === club.id);
    const paidDues = clubDues.filter((payment) => payment.status === "paid");
    const approvedEvents = clubProposals.filter((proposal) => proposal.status === "approved");
    const supportableApprovedEvents = approvedEvents.filter((proposal) => isSupportableEvent(proposal));

    return {
      club_id: club.id,
      club_name: club.name,
      club_code: club.code,
      total_members: clubMembers.length,
      active_members: clubMembers.filter((member) => member.membership_status === "active").length,
      proposal_count: clubProposals.length,
      pending_proposals: clubProposals.filter((proposal) => isPendingStatus(proposal.status)).length,
      approved_events: supportableApprovedEvents.length,
      rejected_proposals: clubProposals.filter((proposal) => isRejectedStatus(proposal.status)).length,
      pending_membership_requests: clubRequests.filter((request) => request.status === "pending").length,
      dues_collection_rate: clubDues.length > 0 ? Math.round((paidDues.length / clubDues.length) * 100) : 0,
      dues_collected_amount: paidDues.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      rsvp_count: clubRsvps.length,
      attendance_count: clubAttendance.length,
      reports_submitted: clubReports.length,
      feedback_count: clubFeedback.length,
      open_tasks: clubTasks.filter((task) => task.status !== "completed").length,
      last_activity_at: getLatestTimestamp(
        [
          ...clubProposals,
          ...clubReports,
          ...clubRequests,
          ...clubDues,
          ...clubFeedback,
          ...clubTasks
        ],
        (item) => item.updated_at || item.submitted_at || item.created_at
      )
    };
  });
}

function buildTaskSummary(tasks, approvedEvents, reminders) {
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;

  return {
    total_tasks: tasks.length,
    pending_tasks: pending,
    in_progress_tasks: inProgress,
    completed_tasks: completed,
    blocked_tasks: blocked,
    upcoming_events: approvedEvents.length,
    reminders: reminders.length
  };
}

function buildExecutiveTaskActionItems(tasks, reminders) {
  const actionItems = [];
  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const blockedCount = tasks.filter((task) => task.status === "blocked").length;
  const dueSoonCount = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") {
      return false;
    }

    const dueTime = new Date(task.due_date).getTime();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return dueTime >= now && dueTime - now <= sevenDays;
  }).length;

  if (pendingCount > 0) {
    actionItems.push({
      type: "task_start",
      label: `${pendingCount} assigned task(s) are waiting to be started.`
    });
  }

  if (dueSoonCount > 0) {
    actionItems.push({
      type: "task_due_soon",
      label: `${dueSoonCount} task(s) are due soon.`
    });
  }

  if (blockedCount > 0) {
    actionItems.push({
      type: "task_blocked",
      label: `${blockedCount} task(s) are currently blocked.`
    });
  }

  if (reminders.length > 0) {
    actionItems.push({
      type: "approved_event_reminder",
      label: `${reminders.length} approved event reminder(s) are available.`
    });
  }

  return actionItems;
}

function formatTaskSummary(task) {
  return {
    id: task.id,
    club_id: task.club_id,
    assigned_by: task.assigned_by,
    assigned_to: task.assigned_to,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date,
    assigned_by_profile: task.assigned_by_profile ?? null,
    assigned_to_profile: task.assigned_to_profile ?? null,
    created_at: task.created_at,
    updated_at: task.updated_at
  };
}

function summarizeTasks(tasks) {
  return {
    total_tasks: tasks.length,
    pending_tasks: tasks.filter((task) => task.status === "pending").length,
    in_progress_tasks: tasks.filter((task) => task.status === "in_progress").length,
    completed_tasks: tasks.filter((task) => task.status === "completed").length,
    blocked_tasks: tasks.filter((task) => task.status === "blocked").length,
    open_tasks: tasks.filter((task) => task.status !== "completed").length
  };
}

function summarizeFeedback(feedback) {
  const ratedFeedback = feedback.filter((item) => Number.isFinite(Number(item.rating)));

  return {
    feedback_count: feedback.length,
    average_rating: ratedFeedback.length > 0
      ? Math.round((ratedFeedback.reduce((sum, item) => sum + Number(item.rating), 0) / ratedFeedback.length) * 10) / 10
      : null
  };
}

function buildClubDetailActivity(records) {
  return records
    .filter((item) => item.created_at)
    .sort((first, second) => new Date(second.created_at) - new Date(first.created_at))
    .slice(0, 12);
}

async function getDashboardClub(actor, database) {
  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  return database.getClubById ? database.getClubById(actor.clubId) : null;
}

async function getExecutiveDashboard(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can view this dashboard", "FORBIDDEN");
  }

  await getDashboardClub(actor, database);

  const tasks = database.listTasks
    ? await database.listTasks({ assignedTo: actor.id })
    : [];
  const approvedEvents = await database.listApprovedProposals({ clubIds: [actor.clubId] });
  const supportableApprovedEvents = approvedEvents.filter((proposal) => isSupportableEvent(proposal));
  const reminders = database.listEventRemindersByUserId
    ? await database.listEventRemindersByUserId(actor.id)
    : [];
  const notifications = database.listNotificationsByUserId
    ? await database.listNotificationsByUserId(actor.id)
    : [];

  return {
    role: "executive",
    club_id: actor.clubId,
    summary: buildTaskSummary(tasks, supportableApprovedEvents, reminders),
    action_items: buildExecutiveTaskActionItems(tasks, reminders),
    assigned_tasks: tasks.slice(0, 5).map(formatTaskSummary),
    upcoming_events: supportableApprovedEvents.slice(0, 5).map(formatEventSummary),
    reminders: reminders.slice(0, 5),
    notifications: notifications.slice(0, 5)
  };
}

async function getPresidentDashboard(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "president") {
    throw new ApiError(403, "Only presidents can view this dashboard", "FORBIDDEN");
  }

  const club = await getDashboardClub(actor, database);
  const proposals = await database.listProposalsByClubId(actor.clubId);
  const approvedEvents = await database.listApprovedProposals({ clubIds: [actor.clubId] });
  const supportableApprovedEvents = approvedEvents.filter((proposal) => isSupportableEvent(proposal));
  const executiveTeam = database.listProfilesByClubId
    ? await database.listProfilesByClubId(actor.clubId, { role: "executive" })
    : [];
  const notifications = database.listNotificationsByUserId
    ? await database.listNotificationsByUserId(actor.id)
    : [];

  return {
    role: "president",
    club,
    club_id: actor.clubId,
    summary: {
      ...summarizeProposals(proposals),
      upcoming_events: supportableApprovedEvents.length,
      executive_count: executiveTeam.length
    },
    recent_activity: proposals.slice(0, 6).map(formatActivity),
    pending_proposals: proposals.filter((proposal) => isPendingStatus(proposal.status)).slice(0, 5).map(formatProposalSummary),
    upcoming_events: supportableApprovedEvents.slice(0, 5).map(formatEventSummary),
    executive_team: executiveTeam.map((profile) => ({
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      club_id: profile.club_id,
      created_at: profile.created_at
    })),
    notifications: notifications.slice(0, 5)
  };
}

async function getAdminOperationsDashboard(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can view the operations dashboard", "FORBIDDEN");
  }

  const [
    clubs,
    proposals,
    members,
    duePayments,
    membershipRequests,
    reports,
    approvedEvents,
    tasks,
    feedback,
    rsvps,
    attendance,
    queue
  ] = await Promise.all([
    database.listClubs ? database.listClubs() : [],
    database.listAdminProposals ? database.listAdminProposals() : [],
    database.listClubMembers ? database.listClubMembers() : [],
    database.listDuePayments ? database.listDuePayments() : [],
    database.listMembershipRequests ? database.listMembershipRequests() : [],
    database.listEventReports ? database.listEventReports() : [],
    database.listApprovedProposals ? database.listApprovedProposals() : [],
    database.listTasks ? database.listTasks() : [],
    database.listFeedback ? database.listFeedback() : [],
    database.listEventRsvps ? database.listEventRsvps() : [],
    database.listEventAttendance ? database.listEventAttendance() : [],
    getQueueHealth()
  ]);
  const approvedEventIdsWithReports = new Set(reports.map((report) => report.proposal_id));
  const supportableApprovedEvents = approvedEvents.filter((event) => isSupportableEvent(event));
  const allMissingReports = approvedEvents
    .filter((event) => isPastEvent(event))
    .filter((event) => !approvedEventIdsWithReports.has(event.id));
  const missingReports = allMissingReports
    .slice(0, 10)
    .map((event) => ({
      proposal_id: event.id,
      club_id: event.club_id,
      title: event.proposed_activity || event.title,
      event_date: event.event_date,
      days_since_event: Math.max(
        0,
        Math.floor((Date.now() - new Date(event.event_date).getTime()) / (1000 * 60 * 60 * 24))
      )
    }));
  const pendingMembershipRequests = membershipRequests.filter((request) => request.status === "pending");
  const submittedDues = duePayments.filter((payment) => payment.status === "submitted");
  const pendingAdminProposals = proposals.filter((proposal) => proposal.status === "pending_admin_review");
  const pendingAdvisorProposals = proposals.filter((proposal) => proposal.status === "pending_advisor_review");
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const attendedCount = attendance.filter((record) => record.attended).length;
  const goingCount = rsvps.filter((rsvp) => rsvp.status === "going").length;
  const paidDues = duePayments.filter((payment) => payment.status === "paid");

  return {
    role: "admin",
    generated_at: new Date().toISOString(),
    summary: {
      total_clubs: clubs.length,
      total_members: members.length,
      active_members: members.filter((member) => member.membership_status === "active").length,
      pending_proposals: proposals.filter((proposal) => isPendingStatus(proposal.status)).length,
      pending_admin_proposals: pendingAdminProposals.length,
      pending_membership_requests: pendingMembershipRequests.length,
      submitted_dues_payments: submittedDues.length,
      approved_events: supportableApprovedEvents.length,
      reports_submitted: reports.length,
      missing_reports: allMissingReports.length,
      dues_collected_amount: paidDues.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      event_attendance_count: attendedCount,
      event_rsvp_count: rsvps.length,
      attendance_rate: calculateAttendanceRate(attendedCount, goingCount),
      feedback_count: feedback.length,
      open_tasks: openTasks.length
    },
    pending_actions: [
      formatPendingAction("pending_admin_review", "Proposals waiting for admin review", pendingAdminProposals.length),
      formatPendingAction("pending_advisor_review", "Proposals waiting for advisor review", pendingAdvisorProposals.length),
      formatPendingAction("membership_requests", "Membership requests waiting for review", pendingMembershipRequests.length),
      formatPendingAction("dues_verification", "Dues payments waiting for verification", submittedDues.length),
      formatPendingAction("missing_reports", "Past approved events missing reports", allMissingReports.length),
      formatPendingAction("open_tasks", "Open club tasks", openTasks.length)
    ].filter((action) => action.count > 0),
    proposal_bottlenecks: buildProposalBottlenecks(proposals),
    club_performance: buildClubPerformance({
      clubs,
      proposals,
      members,
      duePayments,
      reports,
      rsvps,
      attendance,
      membershipRequests,
      feedback,
      tasks
    }),
    queue,
    missing_reports: missingReports,
    recent_activity: buildRecentActivity({
      proposals,
      membershipRequests,
      duePayments,
      reports,
      feedback,
      tasks
    }),
    ops_status: {
      queue: {
        status: queue.status,
        worker_status: queue.worker_status,
        waiting: queue.waiting,
        active: queue.active,
        failed: queue.failed,
        delayed: queue.delayed
      }
    }
  };
}

async function getAdminClubDashboard(options) {
  const { actor, clubId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can view club operations dashboards", "FORBIDDEN");
  }

  const club = database.getClubById ? await database.getClubById(clubId) : null;

  if (!club) {
    throw new ApiError(404, "Club not found", "CLUB_NOT_FOUND");
  }

  const [
    proposals,
    members,
    duePayments,
    membershipRequests,
    reports,
    approvedEvents,
    tasks,
    feedback,
    rsvps,
    attendance
  ] = await Promise.all([
    database.listProposalsByClubId ? database.listProposalsByClubId(clubId) : [],
    database.listClubMembers ? database.listClubMembers({ clubId }) : [],
    database.listDuePayments ? database.listDuePayments({ clubId }) : [],
    database.listMembershipRequests ? database.listMembershipRequests({ clubId }) : [],
    database.listEventReports ? database.listEventReports({ clubId }) : [],
    database.listApprovedProposals ? database.listApprovedProposals({ clubIds: [clubId] }) : [],
    database.listTasks ? database.listTasks({ clubId }) : [],
    database.listFeedback ? database.listFeedback({ clubId }) : [],
    database.listEventRsvps ? database.listEventRsvps({ clubId }) : [],
    database.listEventAttendance ? database.listEventAttendance({ clubId }) : []
  ]);
  const approvedEventIdsWithReports = new Set(reports.map((report) => report.proposal_id));
  const supportableApprovedEvents = approvedEvents.filter((event) => isSupportableEvent(event));
  const missingReports = approvedEvents
    .filter((event) => isPastEvent(event))
    .filter((event) => !approvedEventIdsWithReports.has(event.id));
  const attendedCount = attendance.filter((record) => record.attended).length;
  const goingCount = rsvps.filter((rsvp) => rsvp.status === "going").length;
  const paidDues = duePayments.filter((payment) => payment.status === "paid");
  const performance = buildClubPerformance({
    clubs: [club],
    proposals,
    members,
    duePayments,
    reports,
    rsvps,
    attendance,
    membershipRequests,
    feedback,
    tasks
  })[0];

  return {
    role: "admin",
    club,
    performance,
    summary: {
      ...summarizeProposals(proposals),
      total_members: members.length,
      active_members: members.filter((member) => member.membership_status === "active").length,
      pending_membership_requests: membershipRequests.filter((request) => request.status === "pending").length,
      dues_collected_amount: paidDues.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      dues_collection_rate: duePayments.length > 0 ? Math.round((paidDues.length / duePayments.length) * 100) : 0,
      approved_events: supportableApprovedEvents.length,
      reports_submitted: reports.length,
      missing_reports: missingReports.length,
      event_attendance_count: attendedCount,
      event_rsvp_count: rsvps.length,
      attendance_rate: calculateAttendanceRate(attendedCount, goingCount),
      ...summarizeTasks(tasks),
      ...summarizeFeedback(feedback)
    },
    tasks: tasks.slice(0, 10).map(formatTaskSummary),
    recent_proposals: proposals.slice(0, 8).map(formatProposalSummary),
    recent_members: members.slice(0, 8),
    recent_reports: reports.slice(0, 8),
    approved_events: supportableApprovedEvents.slice(0, 8).map(formatEventSummary),
    missing_reports: missingReports.slice(0, 8).map((event) => ({
      proposal_id: event.id,
      club_id: event.club_id,
      title: event.proposed_activity || event.title,
      event_date: event.event_date,
      days_since_event: Math.max(
        0,
        Math.floor((Date.now() - new Date(event.event_date).getTime()) / (1000 * 60 * 60 * 24))
      )
    })),
    recent_activity: buildClubDetailActivity([
      ...buildRecentActivity({
        proposals,
        membershipRequests,
        duePayments,
        reports,
        feedback,
        tasks
      }),
      ...members.map((member) => ({
        id: `member-${member.id}`,
        type: "member",
        club_id: member.club_id,
        title: member.full_name || "Club member",
        message: `${(member.club_role || "member").replace(/_/g, " ")} is ${member.membership_status}.`,
        created_at: member.updated_at || member.created_at
      }))
    ])
  };
}

module.exports = {
  getAdminClubDashboard,
  getAdminOperationsDashboard,
  getExecutiveDashboard,
  getPresidentDashboard,
  summarizeProposals
};
