const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateAnnouncementPayload,
  validateCreateFeedbackPayload
} = require("./communications.validation");

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

function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}

function profileIds(profiles) {
  return profiles.map((profile) => profile.id);
}

async function getClubRecipientIds(database, clubId) {
  const [profiles, members, advisorIds] = await Promise.all([
    database.listProfiles ? database.listProfiles({ clubId }) : [],
    database.listClubMembers ? database.listClubMembers({ clubId, membershipStatus: "active" }) : [],
    database.getAdvisorProfileIdsByClubId ? database.getAdvisorProfileIdsByClubId(clubId) : []
  ]);

  return uniqueIds([
    ...profileIds(profiles),
    ...members.map((member) => member.profile_id),
    ...advisorIds
  ]);
}

async function getAllClubRecipientIds(database) {
  const [profiles, members, clubs] = await Promise.all([
    database.listProfiles ? database.listProfiles() : [],
    database.listClubMembers ? database.listClubMembers({ membershipStatus: "active" }) : [],
    database.listClubs ? database.listClubs() : []
  ]);

  return uniqueIds([
    ...profiles.filter((profile) => profile.club_id).map((profile) => profile.id),
    ...members.map((member) => member.profile_id),
    ...clubs.map((club) => club.advisor_id)
  ]);
}

async function resolveAnnouncementRecipients(database, announcement) {
  if (announcement.audience === "all_users") {
    return profileIds(database.listProfiles ? await database.listProfiles() : []);
  }

  if (announcement.audience === "all_clubs") {
    return getAllClubRecipientIds(database);
  }

  if (announcement.audience === "club") {
    return getClubRecipientIds(database, announcement.club_id);
  }

  if (announcement.audience === "role") {
    const profiles = database.listProfiles
      ? await database.listProfiles({
          role: announcement.target_role,
          clubId: announcement.club_id ?? undefined
        })
      : [];

    return profileIds(profiles);
  }

  return [];
}

function buildAnnouncementNotification(announcement) {
  return {
    proposal_id: null,
    announcement_id: announcement.id,
    type: "announcement_published",
    message: `${announcement.priority === "urgent" ? "Urgent announcement" : "New announcement"}: ${announcement.title}`,
    delivery_status: "stored"
  };
}

async function createAnnouncementNotifications(database, announcement) {
  if (typeof database.createNotifications !== "function") {
    return [];
  }

  const recipientIds = await resolveAnnouncementRecipients(database, announcement);
  const baseNotification = buildAnnouncementNotification(announcement);

  return database.createNotifications(
    uniqueIds(recipientIds).map((userId) => ({
      ...baseNotification,
      user_id: userId
    }))
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
  return {
    id: feedback.id,
    club_id: feedback.club_id,
    proposal_id: feedback.proposal_id,
    submitted_by: feedback.submitted_by,
    category: feedback.category,
    rating: feedback.rating,
    comment: feedback.comment,
    status: feedback.status,
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
  const { actor, payload, database = db } = options;
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

  await createAnnouncementNotifications(database, announcement);

  return formatAnnouncement(announcement);
}

async function listAnnouncements(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  return getVisibleAnnouncements(actor, {
    audience: filters.audience,
    club_id: filters.club_id,
    priority: filters.priority,
    unread: filters.unread === true || filters.unread === "true"
  }, database);
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

  if (actor.role === "advisor") {
    throw new ApiError(403, "Advisors can view feedback but should not submit club feedback", "FORBIDDEN");
  }

  const validatedPayload = validateCreateFeedbackPayload(payload);
  const clubId = actor.role === "admin"
    ? validatedPayload.club_id
    : requireClubLinkedActor(actor);

  if (!clubId) {
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

  const feedback = await database.createFeedback({
    club_id: clubId,
    proposal_id: validatedPayload.proposal_id,
    submitted_by: actor.id,
    category: validatedPayload.category,
    rating: validatedPayload.rating,
    comment: validatedPayload.comment,
    status: "open"
  });

  return formatFeedback(feedback);
}

async function listFeedback(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  if (!["admin", "advisor", "president", "executive"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot view feedback", "FORBIDDEN");
  }

  const clubFilters = await getVisibleClubFilters(actor, filters.club_id, database);
  const feedback = await database.listFeedback({
    ...clubFilters,
    proposalId: filters.proposal_id,
    status: filters.status
  });

  return feedback.map(formatFeedback);
}

module.exports = {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback,
  markAllAnnouncementsRead,
  markAnnouncementRead
};
