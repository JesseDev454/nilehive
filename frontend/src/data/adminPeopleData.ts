export type AssignableOneClubRole = "student" | "executive" | "president" | "advisor";

export interface CampusUserRecord {
  id: string;
  // Campus One Identity (Read-Only)
  fullName: string;
  campusId: string; // Matric number or Staff ID
  email: string;
  campusOneBaseRole: "Student" | "Faculty Staff";
  department: string;
  faculty: string;
  accountStatus: "Active" | "Graduated" | "On Leave";

  // OneClub Work & Governance
  oneClubRole: AssignableOneClubRole;
  assignedClubId: string | null;
  assignedClubName: string | null;
  executiveTitle?: string;
  joinedClubsCount: number;
  assignedAt?: string;
}

export const INITIAL_CAMPUS_USERS: CampusUserRecord[] = [
  {
    id: "usr-001",
    fullName: "Farouk Aliyu",
    campusId: "NIL/2022/UG/0104",
    email: "f.aliyu@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Computer Science",
    faculty: "Natural and Applied Sciences",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "google-developers",
    assignedClubName: "Nile Google Developers",
    executiveTitle: "President & Lead Organizer",
    joinedClubsCount: 3,
    assignedAt: "2025-10-15"
  },
  {
    id: "usr-002",
    fullName: "Zainab Mukhtar",
    campusId: "NIL/2023/UG/0219",
    email: "z.mukhtar@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "International Relations",
    faculty: "Arts and Social Sciences",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "model-un",
    assignedClubName: "Nile Model United Nations Club",
    executiveTitle: "President & Secretary-General",
    joinedClubsCount: 2,
    assignedAt: "2025-11-01"
  },
  {
    id: "usr-003",
    fullName: "Fatima Aliyu",
    campusId: "NIL/2023/UG/0581",
    email: "f.aliyu.biz@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Business Administration",
    faculty: "Management Sciences",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "nile-business",
    assignedClubName: "Nile Business Club",
    executiveTitle: "President",
    joinedClubsCount: 2,
    assignedAt: "2025-09-20"
  },
  {
    id: "usr-004",
    fullName: "Chiamaka Okafor",
    campusId: "NIL/2022/UG/0394",
    email: "c.okafor@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Software Engineering",
    faculty: "Natural and Applied Sciences",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "startup-campus",
    assignedClubName: "Nile Startup Campus",
    executiveTitle: "President & Venture Lead",
    joinedClubsCount: 4,
    assignedAt: "2025-10-02"
  },
  {
    id: "usr-005",
    fullName: "Tariq Ibrahim",
    campusId: "NIL/2022/UG/0144",
    email: "t.ibrahim@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Public and Private Law",
    faculty: "Faculty of Law",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "debate-club",
    assignedClubName: "Nile Debate Club",
    executiveTitle: "President & Chief Debater",
    joinedClubsCount: 1,
    assignedAt: "2025-10-10"
  },
  {
    id: "usr-006",
    fullName: "Amina Lawal",
    campusId: "NIL/2024/UG/0812",
    email: "a.lawal@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Mass Communication",
    faculty: "Arts and Social Sciences",
    accountStatus: "Active",
    oneClubRole: "president",
    assignedClubId: "tedx-nile",
    assignedClubName: "TEDx Nile Club",
    executiveTitle: "President & Lead Licensee",
    joinedClubsCount: 2,
    assignedAt: "2025-11-12"
  },
  {
    id: "usr-007",
    fullName: "Khadija Mustapha",
    campusId: "NIL/2023/UG/0411",
    email: "k.mustapha@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "English and Literary Studies",
    faculty: "Arts and Social Sciences",
    accountStatus: "Active",
    oneClubRole: "executive",
    assignedClubId: "toastmasters-club",
    assignedClubName: "Nile Toastmaster's Club",
    executiveTitle: "VP of Education",
    joinedClubsCount: 2,
    assignedAt: "2026-01-15"
  },
  {
    id: "usr-008",
    fullName: "Hauwa Mohammed",
    campusId: "NIL/2023/UG/0733",
    email: "h.mohammed@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Electrical and Electronics Engineering",
    faculty: "Engineering",
    accountStatus: "Active",
    oneClubRole: "executive",
    assignedClubId: "women-in-tech",
    assignedClubName: "Women in Tech Club",
    executiveTitle: "Programs Director",
    joinedClubsCount: 3,
    assignedAt: "2026-01-20"
  },
  {
    id: "usr-009",
    fullName: "Usman Danjuma",
    campusId: "NIL/2024/UG/0904",
    email: "u.danjuma@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Cyber Security",
    faculty: "Natural and Applied Sciences",
    accountStatus: "Active",
    oneClubRole: "executive",
    assignedClubId: "games-club",
    assignedClubName: "Nile Games Club",
    executiveTitle: "Tournament Director",
    joinedClubsCount: 2,
    assignedAt: "2026-02-01"
  },
  {
    id: "usr-010",
    fullName: "Dr. Aliyu Bello",
    campusId: "NIL/STAFF/FNS/044",
    email: "a.bello@nileuniversity.edu.ng",
    campusOneBaseRole: "Faculty Staff",
    department: "Computer Science",
    faculty: "Natural and Applied Sciences",
    accountStatus: "Active",
    oneClubRole: "advisor",
    assignedClubId: "google-developers",
    assignedClubName: "Nile Google Developers",
    joinedClubsCount: 1,
    assignedAt: "2025-08-15"
  },
  {
    id: "usr-011",
    fullName: "Prof. Halima Yusuf",
    campusId: "NIL/STAFF/FASS/019",
    email: "h.yusuf@nileuniversity.edu.ng",
    campusOneBaseRole: "Faculty Staff",
    department: "Political Science & International Relations",
    faculty: "Arts and Social Sciences",
    accountStatus: "Active",
    oneClubRole: "advisor",
    assignedClubId: "model-un",
    assignedClubName: "Nile Model United Nations Club",
    joinedClubsCount: 2,
    assignedAt: "2025-08-15"
  },
  {
    id: "usr-012",
    fullName: "Dr. Fatima Ibrahim",
    campusId: "NIL/STAFF/FMS/082",
    email: "f.ibrahim@nileuniversity.edu.ng",
    campusOneBaseRole: "Faculty Staff",
    department: "Business Administration",
    faculty: "Management Sciences",
    accountStatus: "Active",
    oneClubRole: "advisor",
    assignedClubId: "charity-club",
    assignedClubName: "Nile Charity Club",
    joinedClubsCount: 2,
    assignedAt: "2025-08-20"
  },
  {
    id: "usr-013",
    fullName: "Dr. Emeka Nnamdi",
    campusId: "NIL/STAFF/ENG/055",
    email: "e.nnamdi@nileuniversity.edu.ng",
    campusOneBaseRole: "Faculty Staff",
    department: "Mechanical Engineering",
    faculty: "Engineering",
    accountStatus: "Active",
    oneClubRole: "advisor",
    assignedClubId: "startup-campus",
    assignedClubName: "Nile Startup Campus",
    joinedClubsCount: 1,
    assignedAt: "2025-09-01"
  },
  {
    id: "usr-014",
    fullName: "Ibrahim Sani",
    campusId: "NIL/2023/UG/0491",
    email: "i.sani@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Civil Engineering",
    faculty: "Engineering",
    accountStatus: "Active",
    oneClubRole: "student",
    assignedClubId: null,
    assignedClubName: null,
    joinedClubsCount: 2
  },
  {
    id: "usr-015",
    fullName: "Nkechi Adeleke",
    campusId: "NIL/2024/UG/1120",
    email: "n.adeleke@student.nileuniversity.edu.ng",
    campusOneBaseRole: "Student",
    department: "Accounting",
    faculty: "Management Sciences",
    accountStatus: "Active",
    oneClubRole: "student",
    assignedClubId: null,
    assignedClubName: null,
    joinedClubsCount: 1
  }
];
