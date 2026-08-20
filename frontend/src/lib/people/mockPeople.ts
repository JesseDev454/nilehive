import { INITIAL_CAMPUS_USERS } from "@/data/adminPeopleData";
import { OFFICIAL_14_CLUBS } from "@/data/mockData";
import type { AssignmentClub, PersonDirectoryView } from "./types";

export function mockPersonDirectory(): PersonDirectoryView[] {
  return INITIAL_CAMPUS_USERS.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    campusId: user.campusId,
    email: user.email,
    portalUserId: null,
    campusOneBaseRole: user.campusOneBaseRole,
    department: user.department,
    faculty: user.faculty,
    accountStatus: user.accountStatus,
    oneClubRole: user.oneClubRole,
    assignedClubId: user.assignedClubId,
    assignedClubName: user.assignedClubName,
    advisorAssignments:
      user.oneClubRole === "advisor" && user.assignedClubId
        ? [
            {
              id: `assignment-${user.id}`,
              club_id: user.assignedClubId,
              club_name: user.assignedClubName || "Club unavailable",
            },
          ]
        : [],
    requestedRole: null,
    onboardingStatus: "complete",
    portalRole: null,
    customRoles: [],
    effectiveRole: user.oneClubRole,
    createdAt: user.assignedAt ? `${user.assignedAt}T00:00:00.000Z` : null,
    updatedAt: user.assignedAt ? `${user.assignedAt}T00:00:00.000Z` : null,
    executiveTitle: user.executiveTitle,
    joinedClubsCount: user.joinedClubsCount,
  }));
}

export function mockAssignmentClubs(): AssignmentClub[] {
  return OFFICIAL_14_CLUBS.map((club) => ({
    id: club.id,
    name: club.name,
    code: club.code,
  }));
}
