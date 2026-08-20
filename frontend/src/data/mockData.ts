export interface Club {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "Technology" | "Leadership & Speaking" | "Academic & Diplomacy" | "Arts & Culture" | "Community & Impact" | "Business & Innovation" | "Recreation";
  duesAmount: number;
  presidentName: string;
  advisorName: string;
  meetingSchedule: string;
  location: string;
  memberCount: number;
  isPublicSignup: boolean;
  coverImage?: string;
  tags: string[];
}

const RAW_OFFICIAL_CLUBS: Club[] = [
  {
    id: "club-1",
    name: "Nile Book Club",
    code: "NBC",
    description: "Fostering literature appreciation, critical reading seminars, author discourse sessions, and campus book drives.",
    category: "Arts & Culture",
    duesAmount: 2500,
    presidentName: "Zainab Mukhtar",
    advisorName: "Prof. Halima Yusuf",
    meetingSchedule: "Every Alternate Wednesday, 4:00 PM",
    location: "Library Annex, Room B12",
    memberCount: 68,
    isPublicSignup: true,
    tags: ["Literature", "Discussion", "Writing", "Book Drive"]
  },
  {
    id: "club-2",
    name: "Nile Business Club",
    code: "NBUC",
    description: "Developing future business leaders through case study competitions, financial modeling clinics, and corporate networking.",
    category: "Business & Innovation",
    duesAmount: 5000,
    presidentName: "Oluwaseun Adeleke",
    advisorName: "Dr. Chidi Nwosu",
    meetingSchedule: "Tuesdays, 5:00 PM",
    location: "Faculty of Management Sciences, Aud 2",
    memberCount: 142,
    isPublicSignup: true,
    tags: ["Finance", "Consulting", "Leadership", "Corporate Networking"]
  },
  {
    id: "club-3",
    name: "Nile Charity Club",
    code: "NCC",
    description: "Leading humanitarian initiatives, orphan welfare visits, medical outreach drives, and educational donations across the community.",
    category: "Community & Impact",
    duesAmount: 2000,
    presidentName: "Maryam Danjuma",
    advisorName: "Dr. Aisha Bello",
    meetingSchedule: "Saturdays, 10:00 AM",
    location: "Student Center, Multi-purpose Hall",
    memberCount: 210,
    isPublicSignup: true,
    tags: ["Humanitarian", "Outreach", "Community", "Volunteering"]
  },
  {
    id: "club-4",
    name: "Nile Climate Initiatives Club",
    code: "NCIC",
    description: "Championing campus sustainability, solar energy awareness, waste recycling drives, and environmental policy research.",
    category: "Community & Impact",
    duesAmount: 2500,
    presidentName: "Emeka Obi",
    advisorName: "Dr. Kalu Okonkwo",
    meetingSchedule: "Thursdays, 4:30 PM",
    location: "Science Complex, Lab 4",
    memberCount: 95,
    isPublicSignup: true,
    tags: ["Sustainability", "Climate Action", "Recycling", "Green Campus"]
  },
  {
    id: "club-5",
    name: "Nile Creative Arts Club",
    code: "NCAC",
    description: "Celebrating visual arts, digital illustration, theater performance, sculpting, and annual campus fine arts exhibitions.",
    category: "Arts & Culture",
    duesAmount: 3000,
    presidentName: "Amina Lawal",
    advisorName: "Prof. Halima Yusuf",
    meetingSchedule: "Fridays, 3:30 PM",
    location: "Fine Arts Studio, Block C",
    memberCount: 115,
    isPublicSignup: true,
    tags: ["Visual Arts", "Theater", "Exhibitions", "Design"]
  },
  {
    id: "club-6",
    name: "Nile Debate Club",
    code: "NDC",
    description: "Training students in British Parliamentary debating, policy argumentation, rhetorical poise, and national intervarsity tournaments.",
    category: "Leadership & Speaking",
    duesAmount: 3500,
    presidentName: "Mustapha Garba",
    advisorName: "Dr. Aisha Bello",
    meetingSchedule: "Mondays & Thursdays, 5:00 PM",
    location: "Senate Building, Committee Room 1",
    memberCount: 84,
    isPublicSignup: true,
    tags: ["Debate", "Public Policy", "Rhetoric", "Tournaments"]
  },
  {
    id: "club-7",
    name: "Nile Games Club",
    code: "NGC",
    description: "Organizing e-sports tournaments, strategy board games, game development workshops, and recreational campus championships.",
    category: "Recreation",
    duesAmount: 3000,
    presidentName: "Chinedu Eze",
    advisorName: "Dr. Chidi Nwosu",
    meetingSchedule: "Fridays & Saturdays, 4:00 PM",
    location: "Student Lounge, Floor 2",
    memberCount: 180,
    isPublicSignup: true,
    tags: ["E-Sports", "Game Dev", "Strategy", "Tournaments"]
  },
  {
    id: "club-8",
    name: "Nile Google Developers",
    code: "NGD",
    description: "Empowering student software engineers, cloud architects, and AI developers through hands-on hackathons and Google technology sprints.",
    category: "Technology",
    duesAmount: 4000,
    presidentName: "Tariq Ibrahim",
    advisorName: "Dr. Kalu Okonkwo",
    meetingSchedule: "Wednesdays, 5:00 PM",
    location: "ICT Center, Lab 1",
    memberCount: 320,
    isPublicSignup: true,
    tags: ["Software Engineering", "Cloud", "Gemini AI", "Web & Mobile"]
  },
  {
    id: "club-9",
    name: "Nile Model United Nations Club",
    code: "NMUN",
    description: "Simulating UN committees, global diplomatic negotiations, international law treaties, and participating in global conferences.",
    category: "Academic & Diplomacy",
    duesAmount: 5000,
    presidentName: "Fatima Al-Hassan",
    advisorName: "Dr. Aisha Bello",
    meetingSchedule: "Tuesdays, 4:00 PM",
    location: "Diplomacy Seminar Room, Law Faculty",
    memberCount: 110,
    isPublicSignup: true,
    tags: ["Diplomacy", "International Relations", "Model UN", "Treaty Writing"]
  },
  {
    id: "club-10",
    name: "Nile Photography Club",
    code: "NPC",
    description: "Mastering digital photography, photojournalism, lighting techniques, drone capture, and campus event documentation.",
    category: "Arts & Culture",
    duesAmount: 3500,
    presidentName: "David Adeleke",
    advisorName: "Prof. Halima Yusuf",
    meetingSchedule: "Saturdays, 11:00 AM",
    location: "Media Center, Studio A",
    memberCount: 92,
    isPublicSignup: true,
    tags: ["Photojournalism", "Cinematography", "Lighting", "Campus Media"]
  },
  {
    id: "club-11",
    name: "Nile Startup Campus",
    code: "NSC",
    description: "Incubating student technology ventures, providing seed pitch feedback, venture mentorship, and legal incorporation guidance.",
    category: "Business & Innovation",
    duesAmount: 6000,
    presidentName: "Ibrahim Shehu",
    advisorName: "Dr. Kalu Okonkwo",
    meetingSchedule: "Thursdays, 5:30 PM",
    location: "Innovation Hub, Workspace 3",
    memberCount: 160,
    isPublicSignup: true,
    tags: ["Startups", "Incubation", "Pitching", "Venture Capital"]
  },
  {
    id: "club-12",
    name: "Nile Toastmasters Club",
    code: "NTC",
    description: "Building public speaking mastery, impromptu speech confidence, constructive evaluation skills, and executive communication.",
    category: "Leadership & Speaking",
    duesAmount: 4500,
    presidentName: "Grace Onoja",
    advisorName: "Dr. Aisha Bello",
    meetingSchedule: "Every Monday, 5:30 PM",
    location: "Executive Boardroom, Block D",
    memberCount: 128,
    isPublicSignup: true,
    tags: ["Public Speaking", "Executive Communication", "Evaluation", "Leadership"]
  },
  {
    id: "club-13",
    name: "TEDx Nile Club",
    code: "TEDX",
    description: "Curating ideas worth spreading, organizing licensed TEDx conferences, speaker coaching, stage production, and media broadcasting.",
    category: "Leadership & Speaking",
    duesAmount: 5000,
    presidentName: "Abdulrahman Sadiq",
    advisorName: "Dr. Chidi Nwosu",
    meetingSchedule: "Wednesdays, 4:30 PM",
    location: "Auditorium Complex",
    memberCount: 175,
    isPublicSignup: true,
    tags: ["TEDx Conferences", "Speaker Curation", "Stage Production", "Broadcasting"]
  },
  {
    id: "club-14",
    name: "Women in Tech Club",
    code: "WIT",
    description: "Mentoring women in STEM careers, organizing coding bootcamps, cybersecurity clinics, and leadership circles.",
    category: "Technology",
    duesAmount: 3000,
    presidentName: "Khadija Usman",
    advisorName: "Dr. Aisha Bello",
    meetingSchedule: "Fridays, 4:00 PM",
    location: "ICT Center, Lab 3",
    memberCount: 240,
    isPublicSignup: true,
    tags: ["Women in STEM", "Coding Bootcamps", "Cybersecurity", "Mentorship"]
  }
];

export const OFFICIAL_CLUBS: Club[] = RAW_OFFICIAL_CLUBS.map((club) => ({
  ...club,
  duesAmount: 10000
}));

export type OneClubRole = "student" | "president" | "executive" | "advisor" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentOrStaffId: string;
  portalRole: "student" | "staff" | "admin"; // Read-only from Campus One
  role: OneClubRole;
  assignedClubId?: string;
  assignedClubName?: string;
  department: string;
  avatarUrl?: string;
  joinedClubs: string[];
}

export const MOCK_USERS: Record<OneClubRole, UserProfile> = {
  student: {
    id: "usr-student-1",
    name: "Amina Bello",
    email: "amina.bello@nileuniversity.edu.ng",
    studentOrStaffId: "2021/0492",
    portalRole: "student",
    role: "student",
    department: "Computer Engineering",
    joinedClubs: ["club-8", "club-14", "club-1"]
  },
  president: {
    id: "usr-pres-1",
    name: "Tariq Ibrahim",
    email: "tariq.ibrahim@nileuniversity.edu.ng",
    studentOrStaffId: "2020/0188",
    portalRole: "student",
    role: "president",
    assignedClubId: "club-8",
    assignedClubName: "Nile Google Developers",
    department: "Software Engineering",
    joinedClubs: ["club-8", "club-11"]
  },
  executive: {
    id: "usr-exec-1",
    name: "Fatima Al-Hassan",
    email: "fatima.alhassan@nileuniversity.edu.ng",
    studentOrStaffId: "2021/0312",
    portalRole: "student",
    role: "executive",
    assignedClubId: "club-8",
    assignedClubName: "Nile Google Developers",
    department: "Computer Science",
    joinedClubs: ["club-8", "club-9"]
  },
  advisor: {
    id: "usr-adv-1",
    name: "Dr. Kalu Okonkwo",
    email: "kalu.okonkwo@nileuniversity.edu.ng",
    studentOrStaffId: "STAFF/7721",
    portalRole: "staff",
    role: "advisor",
    assignedClubId: "club-8",
    assignedClubName: "Nile Google Developers",
    department: "Department of Computer Science & Engineering",
    joinedClubs: ["club-8", "club-4", "club-11"]
  },
  admin: {
    id: "usr-admin-1",
    name: "Director Zainab Ahmed",
    email: "zainab.ahmed@nileuniversity.edu.ng",
    studentOrStaffId: "STAFF/1004",
    portalRole: "admin",
    role: "admin",
    department: "Student Affairs & Club Services Directorate",
    joinedClubs: []
  }
};

export type ProposalStatus =
  | "draft"
  | "pending_advisor_review"
  | "pending_admin_review"
  | "approved"
  | "revisions_requested"
  | "rejected";

export interface Proposal {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  aimObjectives: string;
  proposedActivity: string;
  eventDate: string;
  eventTime: string;
  location: string;
  expectedParticipants: number;
  budgetEstimate: number;
  status: ProposalStatus;
  submittedBy: string;
  submittedAt: string;
  advisorRemarks?: string;
  adminRemarks?: string;
  budgetItems: Array<{ item: string; quantity: number; amount: number; description: string }>;
  responsibleMembers: Array<{ name: string; studentId: string; phone: string; position: string }>;
}

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-101",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    title: "Google Cloud & Generative AI Buildathon 2026",
    description: "A 24-hour hands-on hackathon building practical campus productivity solutions using Gemini API and Google Cloud Vertex AI.",
    aimObjectives: "1. Equip 200+ students with Gemini API and modern web development skills. 2. Build 15 viable campus prototypes. 3. Award seed credits to top 3 winning teams.",
    proposedActivity: "Hands-on coding sprints, technical mentor breakouts, live project presentations, and awards ceremony.",
    eventDate: "2026-09-12",
    eventTime: "09:00 AM - 05:00 PM",
    location: "ICT Center, Main Auditorium & Labs 1-3",
    expectedParticipants: 220,
    budgetEstimate: 350000,
    status: "approved",
    submittedBy: "Tariq Ibrahim",
    submittedAt: "2026-08-01",
    advisorRemarks: "Outstanding technical initiative aligned with university digital skills mandate. Approved for logistics.",
    adminRemarks: "Confirmed. Facility reserved and security informed.",
    budgetItems: [
      { item: "Participant Refreshments & Lunch", quantity: 220, amount: 200000, description: "Lunch packs and water for 220 developers" },
      { item: "Awards, Badges & Trophies", quantity: 3, amount: 90000, description: "Trophies for top 3 teams" },
      { item: "Branding & Directional Banners", quantity: 4, amount: 60000, description: "Campus banners and name badges" }
    ],
    responsibleMembers: [
      { name: "Tariq Ibrahim", studentId: "2020/0188", phone: "08012345678", position: "President" },
      { name: "Fatima Al-Hassan", studentId: "2021/0312", phone: "08087654321", position: "Vice President" }
    ]
  },
  {
    id: "prop-102",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    title: "Android Kotlin & Flutter Workshop",
    description: "Beginner-friendly masterclass for building native mobile applications with modern toolkits.",
    aimObjectives: "Provide hands-on mobile UI development training to returning and fresher computer students.",
    proposedActivity: "Live coding demonstrations, code-along lab session, and app deployment to test devices.",
    eventDate: "2026-09-26",
    eventTime: "02:00 PM - 05:30 PM",
    location: "ICT Center, Lab 2",
    expectedParticipants: 85,
    budgetEstimate: 80000,
    status: "pending_admin_review",
    submittedBy: "Tariq Ibrahim",
    submittedAt: "2026-08-10",
    advisorRemarks: "Endorsed. Lab availability checked with faculty ICT director.",
    budgetItems: [
      { item: "Lab Refreshments", quantity: 85, amount: 60000, description: "Water and snacks for participants" },
      { item: "Printable Certificates", quantity: 85, amount: 20000, description: "Certificate cardstock" }
    ],
    responsibleMembers: [
      { name: "Tariq Ibrahim", studentId: "2020/0188", phone: "08012345678", position: "President" }
    ]
  },
  {
    id: "prop-103",
    clubId: "club-11",
    clubName: "Nile Startup Campus",
    title: "Campus Venture Seed Pitch Day",
    description: "Annual startup demonstration day where student venture founders pitch to invited angel investors and startup mentors.",
    aimObjectives: "Connect student innovators with real capital opportunities and accelerate 5 campus startups.",
    proposedActivity: "10-minute pitches, Q&A by guest investor jury, and networking mixer.",
    eventDate: "2026-10-05",
    eventTime: "10:00 AM - 03:00 PM",
    location: "Faculty of Management Sciences Auditorium",
    expectedParticipants: 180,
    budgetEstimate: 280000,
    status: "pending_advisor_review",
    submittedBy: "Ibrahim Shehu",
    submittedAt: "2026-08-14",
    budgetItems: [
      { item: "Guest Jury Honorarium & Catering", quantity: 5, amount: 150000, description: "VIP catering and hospitality" },
      { item: "Event Stage Lighting & AV Rental", quantity: 1, amount: 130000, description: "Audio visual equipment" }
    ],
    responsibleMembers: [
      { name: "Ibrahim Shehu", studentId: "2020/0944", phone: "08055566778", position: "President" }
    ]
  },
  {
    id: "prop-104",
    clubId: "club-6",
    clubName: "Nile Debate Club",
    title: "All-Nigeria Intervarsity Parliamentary Championship",
    description: "Hosting 12 regional university debate teams for the prestigious Nile Open debate trophy.",
    aimObjectives: "Elevate Nile University's national standing in competitive academic rhetoric.",
    proposedActivity: "7 preliminary debate rounds, semi-finals, and grand parliamentary debate.",
    eventDate: "2026-10-20",
    eventTime: "08:30 AM - 06:00 PM",
    location: "Senate Chamber & Law Lecture Halls",
    expectedParticipants: 300,
    budgetEstimate: 600000,
    status: "approved",
    submittedBy: "Mustapha Garba",
    submittedAt: "2026-07-22",
    advisorRemarks: "Approved with high commendation. Directorate of Student Affairs fully supports.",
    adminRemarks: "Facility booked and accommodation reserved for visiting contingents.",
    budgetItems: [
      { item: "Trophies & Medals", quantity: 20, amount: 200000, description: "Championship trophies" },
      { item: "Delegate Meals (2 Days)", quantity: 300, amount: 400000, description: "Lunch and dinner for delegates" }
    ],
    responsibleMembers: [
      { name: "Mustapha Garba", studentId: "2020/0551", phone: "08033322114", position: "President" }
    ]
  },
  {
    id: "prop-105",
    clubId: "club-3",
    clubName: "Nile Charity Club",
    title: "Annual Community Medical & Eyecare Outreach",
    description: "Free medical screening, eyecare examinations, and prescription glasses distribution for surrounding communities.",
    aimObjectives: "Provide accessible basic healthcare to over 400 underserved community residents.",
    proposedActivity: "Blood pressure checks, malaria screening, vision testing, and medication dispensing.",
    eventDate: "2026-11-02",
    eventTime: "08:00 AM - 04:00 PM",
    location: "Community Primary Health Center, Lugbe",
    expectedParticipants: 450,
    budgetEstimate: 420000,
    status: "approved",
    submittedBy: "Maryam Danjuma",
    submittedAt: "2026-07-15",
    advisorRemarks: "Medical team credentials verified with University Clinic.",
    adminRemarks: "Transport buses assigned for student volunteers.",
    budgetItems: [
      { item: "Medical Consumables & Test Kits", quantity: 500, amount: 300000, description: "Diagnostic kits and gloves" },
      { item: "Volunteer Transportation & Meals", quantity: 50, amount: 120000, description: "Logistics for volunteers" }
    ],
    responsibleMembers: [
      { name: "Maryam Danjuma", studentId: "2021/0119", phone: "08044433221", position: "President" }
    ]
  }
];

export interface EventRecord {
  id: string;
  proposalId: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  checkInCode: string;
  qrPayload: string;
  isRegistered: boolean;
  isCheckedIn: boolean;
  totalAttendees: number;
  capacity: number;
  hasPostReport: boolean;
}

export const MOCK_EVENTS: EventRecord[] = [
  {
    id: "evt-201",
    proposalId: "prop-101",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    title: "Google Cloud & Generative AI Buildathon 2026",
    description: "A 24-hour hands-on hackathon building practical campus productivity solutions using Gemini API and Google Cloud Vertex AI.",
    eventDate: "2026-09-12",
    eventTime: "09:00 AM - 05:00 PM",
    location: "ICT Center, Main Auditorium & Labs 1-3",
    checkInCode: "NGD-AI-2026",
    qrPayload: "ONECLUB:CHECKIN:evt-201:NGD-AI-2026",
    isRegistered: true,
    isCheckedIn: false,
    totalAttendees: 184,
    capacity: 220,
    hasPostReport: false
  },
  {
    id: "evt-202",
    proposalId: "prop-104",
    clubId: "club-6",
    clubName: "Nile Debate Club",
    title: "All-Nigeria Intervarsity Parliamentary Championship",
    description: "Hosting 12 regional university debate teams for the prestigious Nile Open debate trophy.",
    eventDate: "2026-10-20",
    eventTime: "08:30 AM - 06:00 PM",
    location: "Senate Chamber & Law Lecture Halls",
    checkInCode: "NDC-DEBATE-26",
    qrPayload: "ONECLUB:CHECKIN:evt-202:NDC-DEBATE-26",
    isRegistered: false,
    isCheckedIn: false,
    totalAttendees: 240,
    capacity: 300,
    hasPostReport: false
  },
  {
    id: "evt-203",
    proposalId: "prop-105",
    clubId: "club-3",
    clubName: "Nile Charity Club",
    title: "Annual Community Medical & Eyecare Outreach",
    description: "Free medical screening, eyecare examinations, and prescription glasses distribution for surrounding communities.",
    eventDate: "2026-11-02",
    eventTime: "08:00 AM - 04:00 PM",
    location: "Community Primary Health Center, Lugbe",
    checkInCode: "NCC-HEALTH-26",
    qrPayload: "ONECLUB:CHECKIN:evt-203:NCC-HEALTH-26",
    isRegistered: true,
    isCheckedIn: false,
    totalAttendees: 310,
    capacity: 450,
    hasPostReport: false
  }
];

export type DuesProofStatus =
  | "unpaid"
  | "proof_awaiting_review"
  | "proof_verified"
  | "proof_rejected"
  | "payment_recorded";

export interface DuesRecord {
  id: string;
  clubId: string;
  clubName: string;
  studentId: string;
  studentName: string;
  academicSession: string;
  amount: number;
  status: DuesProofStatus;
  proofDocumentUrl?: string;
  bankReference?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export const MOCK_DUES: DuesRecord[] = [
  {
    id: "due-301",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    studentId: "2021/0492",
    studentName: "Amina Bello",
    academicSession: "2025/2026",
    amount: 10000,
    status: "proof_verified",
    bankReference: "NUB-FT-8839210",
    submittedAt: "2026-08-04T10:15:00Z",
    verifiedAt: "2026-08-05T14:30:00Z",
    verifiedBy: "Tariq Ibrahim (President)"
  },
  {
    id: "due-302",
    clubId: "club-14",
    clubName: "Women in Tech Club",
    studentId: "2021/0492",
    studentName: "Amina Bello",
    academicSession: "2025/2026",
    amount: 10000,
    status: "proof_awaiting_review",
    bankReference: "NUB-POS-9921443",
    submittedAt: "2026-08-18T09:20:00Z"
  },
  {
    id: "due-303",
    clubId: "club-1",
    clubName: "Nile Book Club",
    studentId: "2021/0492",
    studentName: "Amina Bello",
    academicSession: "2025/2026",
    amount: 10000,
    status: "unpaid"
  },
  {
    id: "due-304",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    studentId: "2022/1104",
    studentName: "Chukwudi Nnamdi",
    academicSession: "2025/2026",
    amount: 10000,
    status: "proof_awaiting_review",
    bankReference: "GTB-TRF-0019283",
    submittedAt: "2026-08-17T16:45:00Z"
  },
  {
    id: "due-305",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    studentId: "2021/0988",
    studentName: "Farida Sanusi",
    academicSession: "2025/2026",
    amount: 10000,
    status: "proof_rejected",
    bankReference: "ZEN-REF-7711209",
    submittedAt: "2026-08-12T11:00:00Z",
    rejectionReason: "Screenshot blurred and transaction date does not match academic session."
  },
  {
    id: "due-306",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    studentId: "2020/0312",
    studentName: "Bilal Mahmoud",
    academicSession: "2025/2026",
    amount: 10000,
    status: "payment_recorded",
    bankReference: "OFFLINE-REC-041",
    submittedAt: "2026-08-02T13:00:00Z",
    verifiedAt: "2026-08-02T13:10:00Z",
    verifiedBy: "Fatima Al-Hassan (Executive)"
  }
];

export interface ExecutiveTask {
  id: string;
  clubId: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedByName: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high";
  relatedProposalId?: string;
}

export const MOCK_TASKS: ExecutiveTask[] = [
  {
    id: "tsk-401",
    clubId: "club-8",
    title: "Coordinate ICT Center Lab 1-3 Booking & Power Backup",
    description: "Liaise with University Facilities Management to ensure generator standby and high-speed Wi-Fi routing for the 24h Buildathon.",
    assignedToName: "Fatima Al-Hassan",
    assignedToEmail: "fatima.alhassan@nileuniversity.edu.ng",
    assignedByName: "Tariq Ibrahim (President)",
    dueDate: "2026-09-05",
    status: "in_progress",
    priority: "high",
    relatedProposalId: "prop-101"
  },
  {
    id: "tsk-402",
    clubId: "club-8",
    title: "Design & Distribute Buildathon Digital Badges",
    description: "Produce official attendee badges and participant certificates in coordination with Media Design team.",
    assignedToName: "Fatima Al-Hassan",
    assignedToEmail: "fatima.alhassan@nileuniversity.edu.ng",
    assignedByName: "Tariq Ibrahim (President)",
    dueDate: "2026-09-08",
    status: "pending",
    priority: "medium",
    relatedProposalId: "prop-101"
  },
  {
    id: "tsk-403",
    clubId: "club-8",
    title: "Verify First-Round Dues Payment Receipts",
    description: "Review 42 pending dues bank transfer receipts submitted by returning members on OneClub.",
    assignedToName: "Fatima Al-Hassan",
    assignedToEmail: "fatima.alhassan@nileuniversity.edu.ng",
    assignedByName: "Tariq Ibrahim (President)",
    dueDate: "2026-08-25",
    status: "completed",
    priority: "high"
  },
  {
    id: "tsk-404",
    clubId: "club-8",
    title: "Confirm Google Cloud Mentor Roster",
    description: "Verify technical mentor availability for Gemini API breakouts and finalize schedule.",
    assignedToName: "Fatima Al-Hassan",
    assignedToEmail: "fatima.alhassan@nileuniversity.edu.ng",
    assignedByName: "Tariq Ibrahim (President)",
    dueDate: "2026-09-01",
    status: "pending",
    priority: "medium",
    relatedProposalId: "prop-101"
  }
];

export interface Announcement {
  id: string;
  clubId?: string;
  clubName?: string;
  title: string;
  content: string;
  targetRole: "all" | "student" | "executive" | "advisor" | "admin";
  authorName: string;
  authorRole: string;
  createdAt: string;
  isImportant?: boolean;
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "anc-501",
    title: "First Semester 2025/2026 Official Club Registrations Open",
    content: "All Nile University students are invited to join up to three official campus clubs. Campus One accounts automatically grant instant discovery and dues tracking.",
    targetRole: "all",
    authorName: "Director Zainab Ahmed",
    authorRole: "Student Affairs Directorate",
    createdAt: "2026-08-15T08:00:00Z",
    isImportant: true
  },
  {
    id: "anc-502",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    title: "Google Cloud & Generative AI Buildathon Registration Open",
    content: "Spots are now open for the 24-hour campus hackathon scheduled for Sept 12. Free catering and certificates for all active club members with verified dues.",
    targetRole: "student",
    authorName: "Tariq Ibrahim",
    authorRole: "President, NGD",
    createdAt: "2026-08-16T14:30:00Z",
    isImportant: false
  },
  {
    id: "anc-503",
    title: "Club Executive Proposal Submission Deadline for Q4 Events",
    content: "All club presidents and executives are reminded to submit event proposals at least 14 working days prior to proposed event dates to ensure timely advisor and admin endorsement.",
    targetRole: "executive",
    authorName: "Director Zainab Ahmed",
    authorRole: "Student Affairs Directorate",
    createdAt: "2026-08-10T10:00:00Z",
    isImportant: true
  }
];

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  type: "proposal" | "task" | "dues" | "event" | "announcement";
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-601",
    userId: "usr-student-1",
    title: "Dues Verified",
    message: "Your payment proof for Nile Google Developers dues has been verified by the President.",
    createdAt: "2026-08-05T14:30:00Z",
    isRead: true,
    type: "dues",
    actionUrl: "/dues"
  },
  {
    id: "notif-602",
    userId: "usr-student-1",
    title: "Upcoming Event Reminder",
    message: "Google Cloud & Generative AI Buildathon 2026 is scheduled in 24 days. Check your check-in scanner ready.",
    createdAt: "2026-08-18T08:00:00Z",
    isRead: false,
    type: "event",
    actionUrl: "/events"
  },
  {
    id: "notif-603",
    userId: "usr-pres-1",
    title: "Proposal Approved by Admin",
    message: "Your proposal 'Google Cloud & Generative AI Buildathon 2026' was approved. Event is now live on campus calendar.",
    createdAt: "2026-08-02T11:00:00Z",
    isRead: true,
    type: "proposal",
    actionUrl: "/proposals/prop-101"
  },
  {
    id: "notif-604",
    userId: "usr-adv-1",
    title: "New Proposal Awaiting Review",
    message: "Nile Startup Campus submitted 'Campus Venture Seed Pitch Day' for advisor review.",
    createdAt: "2026-08-14T09:00:00Z",
    isRead: false,
    type: "proposal",
    actionUrl: "/approvals"
  }
];

export const OFFICIAL_14_CLUBS = OFFICIAL_CLUBS;
