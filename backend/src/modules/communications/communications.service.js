const { db } = require("../../config/db");
const { createEmailService } = require("../email/email.service");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const { paginateArray } = require("../../shared/pagination");
const {
  areAsyncJobsEnabled,
  enqueueAnnouncementFanout
} = require("../../jobs/queue");
const {
  buildAnnouncementEmail,
  buildAnnouncementNotification,
  resolveAnnouncementRecipients,
  shouldEmailAnnouncement,
  uniqueIds
} = require("./communications.helpers");
const {
  APP_FEEDBACK_CATEGORIES,
  validateCreateAnnouncementPayload,
  validateCreateFeedbackPayload
} = require("./communications.validation");
const { getEventLifecycle } = require("../events/event-lifecycle");
const { sendPushForNotifications } = require("../notifications/push.service");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireClubLinkedActor(actor) {
  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  return actor.clubId;
}

function formatAnnouncement(announcement) {
  return {
    id: announcement.id,
    club_id: announcement.club_id,
    created_by: announcement.created_by,
    title: announcement.title,
    message: announcement.message,
    audience: announcement.audience,
    priority: announcement.priority ?? "normal",
    target_role: announcement.target_role ?? null,
    is_read: announcement.is_read ?? false,
    read_at: announcement.read_at ?? null,
    created_at: announcement.created_at,
    updated_at: announcement.updated_at
  };
}

async function createAnnouncementNotifications(database, announcement) {
  if (typeof database.createNotifications !== "function") {
    return [];
  }

  const recipientIds = await resolveAnnouncementRecipients(database, announcement);
  const baseNotification = buildAnnouncementNotification(announcement);

  const notifications = await database.createNotifications(
    uniqueIds(recipientIds).map((userId) => ({
      ...baseNotification,
      user_id: userId
    }))
  );

  try {
    await sendPushForNotifications({ database, notifications });
  } catch {
    // Push is best-effort; the in-app notification remains the durable record.
  }

  return notifications;
}

async function sendAnnouncementEmails(options) {
  const {
    announcement,
    notifications,
    database,
    emailService = createEmailService({ database })
  } = options;

  if (!shouldEmailAnnouncement(announcement) || !notifications.length) {
    return [];
  }

  if (typeof emailService.isDeliveryEnabled === "function" && !emailService.isDeliveryEnabled()) {
    return [];
  }

  const profileIds = uniqueIds(notifications.map((notification) => notification.user_id));
  const emailsByProfileId = typeof database.getAuthEmailsByProfileIds === "function"
    ? await database.getAuthEmailsByProfileIds(profileIds)
    : {};
  const email = buildAnnouncementEmail(announcement);

  return Promise.all(
    notifications.map((notification) =>
      emailService.sendEmail({
        to: emailsByProfileId[notification.user_id] ?? null,
        ...email,
        metadata: {
          recipient_user_id: notification.user_id,
          announcement_id: announcement.id,
          notification_id: notification.id ?? null
        }
      })
    )
  );
}

async function canViewAnnouncement(actor, announcement, advisorClubIds = null) {
  if (actor.role === "admin") {
    return true;
  }

  if (announcement.audience === "all_users") {
    return true;
  }

  if (announcement.audience === "all_clubs") {
    if (actor.clubId) {
      return true;
    }

    return actor.role === "advisor" && (advisorClubIds ?? []).length > 0;
  }

  if (announcement.audience === "club") {
    if (actor.clubId === announcement.club_id) {
      return true;
    }

    return actor.role === "advisor" && (advisorClubIds ?? []).includes(announcement.club_id);
  }

  if (announcement.audience === "role") {
    if (announcement.target_role !== actor.role) {
      return false;
    }

    if (!announcement.club_id) {
      return true;
    }

    if (actor.clubId === announcement.club_id) {
      return true;
    }

    return actor.role === "advisor" && (advisorClubIds ?? []).includes(announcement.club_id);
  }

  return false;
}

async function getVisibleAnnouncements(actor, filters, database) {
  const advisorClubIds = actor.role === "advisor" && database.getAdvisorClubIds
    ? await database.getAdvisorClubIds(actor.id)
    : [];

  if (filters.club_id && actor.role !== "admin") {
    const allowed = actor.clubId === filters.club_id || advisorClubIds.includes(filters.club_id);

    if (!allowed) {
      throw new ApiError(403, "You can only access communications for your own club", "FORBIDDEN");
    }
  }

  const announcements = await database.listAnnouncements({
    audience: filters.audience,
    clubId: filters.club_id,
    priority: filters.priority
  });
  const reads = database.listAnnouncementReadsByUserId
    ? await database.listAnnouncementReadsByUserId(actor.id)
    : [];
  const readByAnnouncementId = reads.reduce((readMap, read) => {
    readMap[read.announcement_id] = read;
    return readMap;
  }, {});
  const visible = [];

  for (const announcement of announcements) {
    if (await canViewAnnouncement(actor, announcement, advisorClubIds)) {
      const read = readByAnnouncementId[announcement.id];
      const formatted = formatAnnouncement({
        ...announcement,
        is_read: Boolean(read),
        read_at: read?.read_at ?? null
      });

      if (filters.unread === true && formatted.is_read) {
        continue;
      }

      visible.push(formatted);
    }
  }

  return visible;
}

function formatFeedback(feedback) {
  const proposal = feedback.proposal ?? feedback.proposals ?? null;

  return {
    id: feedback.id,
    club_id: feedback.club_id,
    proposal_id: feedback.proposal_id,
    submitted_by: feedback.submitted_by,
    category: feedback.category,
    rating: feedback.rating,
    comment: feedback.comment,
    status: feedback.status,
    proposal: proposal
      ? {
          id: proposal.id,
          title: proposal.title,
          proposed_activity: proposal.proposed_activity ?? null,
          event_date: proposal.event_date ?? null
        }
      : null,
    created_at: feedback.created_at,
    updated_at: feedback.updated_at
  };
}

async function getVisibleClubFilters(actor, requestedClubId, database) {
  if (actor.role === "admin") {
    return requestedClubId ? { clubId: requestedClubId } : {};
  }

  if (actor.role === "advisor") {
    const clubIds = await database.getAdvisorClubIds(actor.id);

    if (requestedClubId) {
      if (!clubIds.includes(requestedClubId)) {
        throw new ApiError(403, "You can only access communications for assigned clubs", "FORBIDDEN");
      }

      return { clubId: requestedClubId };
    }

    return { clubIds };
  }

  const clubId = requireClubLinkedActor(actor);

  if (requestedClubId && requestedClubId !== clubId) {
    throw new ApiError(403, "You can only access communications for your own club", "FORBIDDEN");
  }

  return { clubId };
}

async function createAnnouncement(options) {
  const { actor, payload, database = db, emailService, queueService, logger = console } = options;
  requireActor(actor);

  if (!["admin", "president"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot create announcements", "FORBIDDEN");
  }

  const validatedPayload = validateCreateAnnouncementPayload(payload);
  let clubId = validatedPayload.club_id;
  let audience = validatedPayload.audience;
  let targetRole = validatedPayload.target_role;

  if (actor.role === "president") {
    clubId = requireClubLinkedActor(actor);
    audience = audience === "role" ? "role" : "club";

    if (audience === "role" && !["student", "executive"].includes(targetRole)) {
      throw new ApiError(403, "Presidents can only target students or executives in their own club", "FORBIDDEN");
    }

    if (audience === "club") {
      targetRole = null;
    }
  } else if (audience === "club" && !clubId) {
    throw new ApiError(400, "Club announcements require a club_id", "VALIDATION_ERROR", {
      field: "club_id"
    });
  } else if (audience === "role" && !targetRole) {
    throw new ApiError(400, "Role announcements require target_role", "VALIDATION_ERROR", {
      field: "target_role"
    });
  } else if (audience === "all_users" || audience === "all_clubs" || audience === "role") {
    clubId = null;
  }

  if (actor.role === "admin" && audience === "club" && database.getClubById) {
    const club = await database.getClubById(clubId);

    if (!club) {
      throw new ApiError(404, "Club not found", "CLUB_NOT_FOUND");
    }
  }

  if (audience !== "role") {
    targetRole = null;
  }

  if (audience === "all_users" || audience === "all_clubs") {
    clubId = null;
  }

  const announcement = await database.createAnnouncement({
    club_id: clubId,
    created_by: actor.id,
    title: validatedPayload.title,
    message: validatedPayload.message,
    audience,
    priority: validatedPayload.priority,
    target_role: targetRole
  });

  let notificationCount = 0;
  const asyncJobService = queueService ?? {
    areAsyncJobsEnabled,
    enqueueAnnouncementFanout
  };

  if (asyncJobService.areAsyncJobsEnabled()) {
    await asyncJobService.enqueueAnnouncementFanout({
      announcementId: announcement.id
    });
  } else {
    const notifications = await createAnnouncementNotifications(database, announcement);
    notificationCount = notifications.length;

    try {
      await sendAnnouncementEmails({
        announcement,
        notifications,
        database,
        emailService
      });
    } catch (error) {
      logger.warn("Announcement email delivery failed", error);
    }
  }

  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "announcement",
    action: "announcement_published",
    club_id: announcement.club_id,
    announcement_id: announcement.id,
    remarks: announcement.title,
    metadata: {
      audience: announcement.audience,
      priority: announcement.priority,
      target_role: announcement.target_role,
      notification_count: notificationCount,
      async_delivery: asyncJobService.areAsyncJobsEnabled()
    }
  });

  return formatAnnouncement(announcement);
}

async function listAnnouncements(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireActor(actor);

  const announcements = await getVisibleAnnouncements(actor, {
    audience: filters.audience,
    club_id: filters.club_id,
    priority: filters.priority,
    unread: filters.unread === true || filters.unread === "true"
  }, database);

  if (pagination) {
    return paginateArray(announcements, pagination);
  }

  return announcements;
}

async function markAnnouncementRead(options) {
  const { actor, announcementId, database = db } = options;
  requireActor(actor);

  const visibleAnnouncements = await getVisibleAnnouncements(actor, {}, database);
  const announcement = visibleAnnouncements.find((item) => item.id === announcementId);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found", "ANNOUNCEMENT_NOT_FOUND");
  }

  if (typeof database.markAnnouncementRead !== "function") {
    return { ...announcement, is_read: true, read_at: new Date().toISOString() };
  }

  const read = await database.markAnnouncementRead(announcementId, actor.id);

  return {
    ...announcement,
    is_read: true,
    read_at: read.read_at
  };
}

async function markAllAnnouncementsRead(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  const visibleAnnouncements = await getVisibleAnnouncements(actor, {
    audience: filters.audience,
    club_id: filters.club_id,
    priority: filters.priority,
    unread: filters.unread === true || filters.unread === "true"
  }, database);
  const unreadIds = visibleAnnouncements
    .filter((announcement) => !announcement.is_read)
    .map((announcement) => announcement.id);

  if (typeof database.markAnnouncementsRead === "function") {
    await database.markAnnouncementsRead(unreadIds, actor.id);
  }

  return {
    marked_read: unreadIds.length
  };
}

async function createFeedback(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  const validatedPayload = validateCreateFeedbackPayload(payload);
  let clubId = actor.role === "admin"
    ? (validatedPayload.club_id ?? null)
    : (actor.clubId ?? null);

  if (validatedPayload.category === "event" && validatedPayload.proposal_id) {
    if (actor.role !== "student") {
      throw new ApiError(403, "Only students who attended can submit post-event feedback", "FORBIDDEN");
    }

    const proposal = database.getApprovedProposalById
      ? await database.getApprovedProposalById(validatedPayload.proposal_id)
      : await database.getProposalById(validatedPayload.proposal_id);

    if (!proposal || proposal.status !== "approved") {
      throw new ApiError(404, "Approved event not found", "APPROVED_EVENT_NOT_FOUND");
    }

    if (getEventLifecycle(proposal.event_date) !== "past") {
      throw new ApiError(409, "Feedback opens after the event has ended.", "EVENT_FEEDBACK_NOT_OPEN");
    }

    const attendance = database.listEventAttendance
      ? await database.listEventAttendance({ proposalId: proposal.id, userId: actor.id })
      : [];
    const attended = attendance.some((record) => record.attended);

    if (!attended) {
      throw new ApiError(403, "Feedback is available for students marked as attended.", "ATTENDANCE_REQUIRED");
    }

    const existingFeedback = database.listFeedback
      ? await database.listFeedback({ proposalId: proposal.id, submittedBy: actor.id })
      : [];
    const alreadySubmitted = existingFeedback.some((feedback) => feedback.submitted_by === actor.id);

    if (alreadySubmitted) {
      throw new ApiError(409, "You have already submitted feedback for this event.", "FEEDBACK_ALREADY_SUBMITTED");
    }

    clubId = proposal.club_id;
  } else {
    if (validatedPayload.category === "club" && !clubId) {
      throw new ApiError(400, "Feedback requires a club_id", "VALIDATION_ERROR", {
        field: "club_id"
      });
    }

    if (actor.role !== "admin" && validatedPayload.club_id && validatedPayload.club_id !== clubId) {
      throw new ApiError(403, "You can only submit feedback for your own club", "FORBIDDEN");
    }

    if (validatedPayload.proposal_id) {
      const proposal = await database.getProposalById(validatedPayload.proposal_id);

      if (!proposal || proposal.club_id !== clubId) {
        throw new ApiError(404, "Proposal not found for this club", "PROPOSAL_NOT_FOUND");
      }
    }
  }

  let feedback;

  try {
    feedback = await database.createFeedback({
      club_id: clubId,
      proposal_id: validatedPayload.proposal_id,
      submitted_by: actor.id,
      category: validatedPayload.category,
      rating: validatedPayload.rating,
      comment: validatedPayload.comment,
      status: "open"
    });
  } catch {
    throw new ApiError(
      500,
      "Feedback could not be saved. Please try again or contact Club Services.",
      "FEEDBACK_SAVE_FAILED"
    );
  }

  return formatFeedback(feedback);
}

async function listFeedback(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  if (!["admin", "advisor", "president", "executive", "feedback_manager"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot view feedback", "FORBIDDEN");
  }

  if (actor.role === "feedback_manager") {
    const requestedCategory = APP_FEEDBACK_CATEGORIES.includes(filters.category)
      ? filters.category
      : null;
    const feedback = await database.listFeedback({
      categories: requestedCategory ? [requestedCategory] : APP_FEEDBACK_CATEGORIES,
      proposalId: null,
      status: filters.status
    });

    return feedback.map(formatFeedback);
  }

  const clubFilters = await getVisibleClubFilters(actor, filters.club_id, database);
  const feedbackFilters = {
    ...clubFilters,
    proposalId: filters.proposal_id,
    status: filters.status
  };

  if (filters.category) {
    feedbackFilters.category = filters.category;
  }

  const feedback = await database.listFeedback(feedbackFilters);

  return feedback.map(formatFeedback);
}

module.exports = {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback,
  markAllAnnouncementsRead,
  markAnnouncementRead,
  sendAnnouncementEmails
};
