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

function shouldEmailAnnouncement(announcement) {
  return ["high", "urgent"].includes(announcement.priority);
}

function buildAnnouncementEmail(announcement, env = process.env) {
  const appUrl = (env.FRONTEND_APP_URL || "http://localhost:8080").replace(/\/+$/, "");
  const subjectPrefix = announcement.priority === "urgent" ? "[NileHive Urgent]" : "[NileHive]";
  const subject = `${subjectPrefix} ${announcement.title}`;
  const text = [
    announcement.title,
    "",
    announcement.message,
    "",
    `Priority: ${announcement.priority}`,
    `Open NileHive: ${appUrl}/communications`
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#0d5bbc;font-weight:700">NileHive Communication Hub</p>
      <h1 style="font-size:22px;margin:0 0 12px">${announcement.title}</h1>
      <p style="white-space:pre-line">${announcement.message}</p>
      <p><strong>Priority:</strong> ${announcement.priority}</p>
      <p><a href="${appUrl}/communications">Open this announcement in NileHive</a></p>
      <p style="font-size:12px;color:#6b7280">This message was sent by NileHive on behalf of Nile University Club Services.</p>
    </div>
  `;

  return { subject, text, html };
}

module.exports = {
  buildAnnouncementEmail,
  buildAnnouncementNotification,
  resolveAnnouncementRecipients,
  shouldEmailAnnouncement,
  uniqueIds
};
