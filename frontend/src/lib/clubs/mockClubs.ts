import { OFFICIAL_14_CLUBS_DATA, type OfficialClub } from "@/data/official14ClubsData";
import type { AdminClubView, ClubMemberView } from "./types";

function membersFor(club: OfficialClub): ClubMemberView[] {
  return Array.from({ length: Math.min(club.memberCount, 8) }, (_, index) => ({
    id: `${club.id}-member-${index + 1}`,
    clubId: club.id,
    profileId: `${club.id}-profile-${index + 1}`,
    fullName: index === 0 ? club.presidentName : `${club.name} Member ${index + 1}`,
    studentId: `NIL/2023/UG/${String(1000 + index).padStart(4, "0")}`,
    email: index === 0 ? club.presidentEmail : null,
    clubRole: index === 0 ? "president" : "member",
    membershipStatus: "active",
    joinedAt: "2026-01-15T10:00:00.000Z",
  }));
}

export function mockClubFromOfficial(club: OfficialClub): AdminClubView {
  return {
    id: club.id,
    name: club.name,
    code: club.code,
    description: club.description,
    categoryLabel: club.category,
    categories: [club.category],
    duesAmount: club.duesAmount,
    presidentName: club.presidentName,
    presidentEmail: club.presidentEmail,
    presidentId: `${club.id}-president`,
    advisorName: club.advisorName,
    advisorEmail: club.advisorEmail,
    advisorId: `${club.id}-advisor`,
    advisors: [
      {
        id: `${club.id}-advisor`,
        fullName: club.advisorName,
        email: club.advisorEmail,
        studentId: null,
      },
    ],
    executives: [],
    meetingWindows: [],
    weeklyCommitment: null,
    location: club.location,
    meetingSchedule: club.meetingSchedule,
    memberCount: club.memberCount,
    isPublicSignup: club.isPublicSignup,
    coverImage: club.coverImage,
    tags: club.tags,
    bankDetails: { ...club.bankDetails },
    adminOnlyWhatsAppNotes: club.adminOnlyWhatsAppNotes,
    whatsappGroupName: null,
    websiteUrl: null,
    logoPath: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    members: membersFor(club),
    paymentLoaded: true,
    supportsLocation: true,
    supportsMeetingSchedule: true,
    supportsCoverUrl: true,
    supportsFreeformTags: true,
    supportsArchive: false,
    supportsDelete: false,
    supportsLogoUpload: false,
    supportsCreate: false,
  };
}

export function mockAdminClubs(): AdminClubView[] {
  return OFFICIAL_14_CLUBS_DATA.map(mockClubFromOfficial);
}
