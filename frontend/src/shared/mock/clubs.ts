export interface OfficialClub {
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
  tags: string[];
}

const RAW_OFFICIAL_14_CLUBS: OfficialClub[] = [
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

export const OFFICIAL_14_CLUBS: OfficialClub[] = RAW_OFFICIAL_14_CLUBS.map((club) => ({
  ...club,
  duesAmount: 10000
}));

export interface Club extends OfficialClub {
  dues: number;
  president: string;
  advisor: string;
}

export const OFFICIAL_CLUBS: Club[] = OFFICIAL_14_CLUBS.map((c) => ({
  ...c,
  dues: c.duesAmount,
  president: c.presidentName,
  advisor: c.advisorName
}));
