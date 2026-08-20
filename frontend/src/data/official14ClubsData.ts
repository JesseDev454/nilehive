export interface OfficialClub {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "Technology" | "Leadership & Speaking" | "Academic & Diplomacy" | "Arts & Culture" | "Community & Impact" | "Business & Innovation" | "Recreation";
  duesAmount: number;
  presidentName: string;
  presidentEmail: string;
  advisorName: string;
  advisorEmail: string;
  meetingSchedule: string;
  location: string;
  memberCount: number;
  isPublicSignup: boolean;
  coverImage: string;
  tags: string[];
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    narrationGuideline: string;
    proofInstructions: string;
  };
  adminOnlyWhatsAppNotes: string;
}

const RAW_OFFICIAL_14_CLUBS_DATA: OfficialClub[] = [
  {
    id: "nile-book-club",
    name: "Nile Book Club",
    code: "NBC",
    description: "Fostering literature appreciation, critical reading seminars, author discourse sessions, and campus book drives across Nile University faculties.",
    category: "Arts & Culture",
    duesAmount: 2500,
    presidentName: "Zainab Mukhtar",
    presidentEmail: "z.mukhtar@student.nileuniversity.edu.ng",
    advisorName: "Prof. Halima Yusuf",
    advisorEmail: "h.yusuf@nileuniversity.edu.ng",
    meetingSchedule: "Every Alternate Wednesday, 4:00 PM",
    location: "Library Annex, Room B12",
    memberCount: 68,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80",
    tags: ["Literature", "Discussion", "Writing", "Book Drive"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948001",
      accountName: "Nile University - Nile Book Club",
      narrationGuideline: "MatricNo - NBC Dues 2026",
      proofInstructions: "Upload receipt image with clear transaction reference and timestamp."
    },
    adminOnlyWhatsAppNotes: "Executive link maintained by President Zainab. Group link refresh approved every semester start."
  },
  {
    id: "nile-business-club",
    name: "Nile Business Club",
    code: "NBUC",
    description: "Developing future business leaders through case study competitions, financial modeling clinics, corporate networking, and executive speaker panels.",
    category: "Business & Innovation",
    duesAmount: 5000,
    presidentName: "Fatima Aliyu",
    presidentEmail: "f.aliyu@student.nileuniversity.edu.ng",
    advisorName: "Dr. Aliyu Bello",
    advisorEmail: "a.bello@nileuniversity.edu.ng",
    meetingSchedule: "Every Thursday, 3:30 PM",
    location: "Faculty of Management Sciences, Aud 2",
    memberCount: 142,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    tags: ["Finance", "Consulting", "Entrepreneurship", "Case Studies"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948002",
      accountName: "Nile University - Nile Business Club",
      narrationGuideline: "MatricNo - NBUC Annual Dues",
      proofInstructions: "Upload bank transfer confirmation showing sender account name matching student matric record."
    },
    adminOnlyWhatsAppNotes: "Active executive channel. Mentorship cohort 3 coordinator assigned as co-admin."
  },
  {
    id: "nile-charity-club",
    name: "Nile Charity Club",
    code: "NCC",
    description: "Spearheading philanthropic initiatives, medical outreach missions, orphanage visitation campaigns, and community empowerment drives in the FCT.",
    category: "Community & Impact",
    duesAmount: 2000,
    presidentName: "Maryam Sanusi",
    presidentEmail: "m.sanusi@student.nileuniversity.edu.ng",
    advisorName: "Dr. Fatima Ibrahim",
    advisorEmail: "f.ibrahim@nileuniversity.edu.ng",
    meetingSchedule: "Every Friday, 4:30 PM",
    location: "Student Affairs Complex, Room 104",
    memberCount: 185,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
    tags: ["Philanthropy", "Outreach", "Community", "Volunteering"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948003",
      accountName: "Nile University - Nile Charity Club",
      narrationGuideline: "MatricNo - NCC Membership Dues",
      proofInstructions: "Attach transfer receipt or stamped teller."
    },
    adminOnlyWhatsAppNotes: "Volunteer roster managed via sub-group. Main group strictly for executive broadcasts."
  },
  {
    id: "nile-climate-initiatives-club",
    name: "Nile Climate Initiatives Club",
    code: "NCIC",
    description: "Driving environmental sustainability, tree planting operations, electronic waste recycling campaigns, and renewable energy research forums.",
    category: "Community & Impact",
    duesAmount: 2500,
    presidentName: "Ibrahim Sani",
    presidentEmail: "i.sani@student.nileuniversity.edu.ng",
    advisorName: "Prof. Halima Yusuf",
    advisorEmail: "h.yusuf@nileuniversity.edu.ng",
    meetingSchedule: "Every Tuesday, 4:00 PM",
    location: "Green Canopy Plaza, Room 102",
    memberCount: 78,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    tags: ["Sustainability", "Eco", "Recycling", "Climate Action"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948004",
      accountName: "Nile University - Climate Initiatives Club",
      narrationGuideline: "MatricNo - NCIC Dues",
      proofInstructions: "Upload bank transfer confirmation."
    },
    adminOnlyWhatsAppNotes: "Green week planning channel active."
  },
  {
    id: "nile-creative-arts-club",
    name: "Nile Creative Arts Club",
    code: "NCAC",
    description: "Nurturing campus fine arts, digital illustration, sculpture exhibitions, canvas workshops, and annual Nile University art galleries.",
    category: "Arts & Culture",
    duesAmount: 3500,
    presidentName: "Chinedu Eze",
    presidentEmail: "c.eze@student.nileuniversity.edu.ng",
    advisorName: "Dr. Aliyu Bello",
    advisorEmail: "a.bello@nileuniversity.edu.ng",
    meetingSchedule: "Every Saturday, 2:00 PM",
    location: "Creative Arts Studio, Block D",
    memberCount: 94,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
    tags: ["Fine Arts", "Painting", "Exhibitions", "Design"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948005",
      accountName: "Nile University - Creative Arts Club",
      narrationGuideline: "MatricNo - NCAC Studio Dues",
      proofInstructions: "Attach transfer receipt."
    },
    adminOnlyWhatsAppNotes: "Exhibition coordinator added to admin notifications."
  },
  {
    id: "nile-debate-club",
    name: "Nile Debate Club",
    code: "NDC",
    description: "Fostering British Parliamentary debate mastery, public speaking, oratorical championships, and national varsity tournament delegations.",
    category: "Leadership & Speaking",
    duesAmount: 3000,
    presidentName: "Tariq Ibrahim",
    presidentEmail: "t.ibrahim@student.nileuniversity.edu.ng",
    advisorName: "Prof. Halima Yusuf",
    advisorEmail: "h.yusuf@nileuniversity.edu.ng",
    meetingSchedule: "Every Monday & Wednesday, 5:00 PM",
    location: "Moot Court Hall, Law Faculty",
    memberCount: 88,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    tags: ["Debate", "Oratory", "Parliamentary", "Critical Thinking"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948006",
      accountName: "Nile University - Nile Debate Club",
      narrationGuideline: "MatricNo - NDC Dues",
      proofInstructions: "Upload bank transfer confirmation."
    },
    adminOnlyWhatsAppNotes: "National debate delegation travel coordination group link restricted."
  },
  {
    id: "nile-games-club",
    name: "Nile Games Club",
    code: "NGC",
    description: "Hosting campus chess tournaments, competitive esports leagues, tabletop strategy tournaments, and game design workshops.",
    category: "Recreation",
    duesAmount: 2500,
    presidentName: "Usman Danjuma",
    presidentEmail: "u.danjuma@student.nileuniversity.edu.ng",
    advisorName: "Dr. Emeka Nnamdi",
    advisorEmail: "e.nnamdi@nileuniversity.edu.ng",
    meetingSchedule: "Every Friday, 3:00 PM",
    location: "Student Center Games Lounge",
    memberCount: 160,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
    tags: ["Esports", "Chess", "Gaming", "Tabletop"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948007",
      accountName: "Nile University - Nile Games Club",
      narrationGuideline: "MatricNo - NGC Dues",
      proofInstructions: "Upload receipt image."
    },
    adminOnlyWhatsAppNotes: "Discord and WhatsApp group announcements mirrored."
  },
  {
    id: "nile-google-developers",
    name: "Nile Google Developers",
    code: "NGDG",
    description: "Empowering university engineers through Android, Cloud, Web, and Generative AI workshops, solution challenges, and tech hackathons.",
    category: "Technology",
    duesAmount: 3500,
    presidentName: "Farouk Aliyu",
    presidentEmail: "f.aliyu@student.nileuniversity.edu.ng",
    advisorName: "Dr. Aliyu Bello",
    advisorEmail: "a.bello@nileuniversity.edu.ng",
    meetingSchedule: "Every Saturday, 10:00 AM",
    location: "Nile Tech Auditorium & Lab 4",
    memberCount: 220,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    tags: ["Google Cloud", "AI", "Software", "Hackathon", "Android"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948008",
      accountName: "Nile University - Google Developer Group",
      narrationGuideline: "MatricNo - NGDG Dues 2026",
      proofInstructions: "Submit verified bank transfer screenshot."
    },
    adminOnlyWhatsAppNotes: "Main developer group has 200+ members. Tech leads sub-group monitored by Directorate."
  },
  {
    id: "nile-model-united-nations-club",
    name: "Nile Model United Nations Club",
    code: "NMUN",
    description: "Training diplomatic delegates in resolution drafting, global policy simulations, multilateral negotiation, and international affairs conferences.",
    category: "Academic & Diplomacy",
    duesAmount: 4000,
    presidentName: "Zainab Mukhtar",
    presidentEmail: "z.mukhtar@student.nileuniversity.edu.ng",
    advisorName: "Prof. Halima Yusuf",
    advisorEmail: "h.yusuf@nileuniversity.edu.ng",
    meetingSchedule: "Every Wednesday, 4:30 PM",
    location: "Faculty of Arts & Social Sciences, Room 204",
    memberCount: 110,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
    tags: ["Diplomacy", "United Nations", "International Relations", "Policy"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948009",
      accountName: "Nile University - Model UN Club",
      narrationGuideline: "MatricNo - NMUN Dues",
      proofInstructions: "Upload bank transfer confirmation."
    },
    adminOnlyWhatsAppNotes: "Delegate coordination channel active."
  },
  {
    id: "nile-photography-club",
    name: "Nile Photography Club",
    code: "NPC",
    description: "Elevating visual storytelling, photojournalism, portrait lighting masterclasses, campus photowalks, and official university event documentation.",
    category: "Arts & Culture",
    duesAmount: 3000,
    presidentName: "Ahmed Bello",
    presidentEmail: "a.bello@student.nileuniversity.edu.ng",
    advisorName: "Dr. Fatima Ibrahim",
    advisorEmail: "f.ibrahim@nileuniversity.edu.ng",
    meetingSchedule: "Every Thursday, 4:00 PM",
    location: "Media Studio 1, Mass Comm Block",
    memberCount: 95,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    tags: ["Photography", "Media", "Editing", "Visuals"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948010",
      accountName: "Nile University - Photography Club",
      narrationGuideline: "MatricNo - NPC Dues",
      proofInstructions: "Upload transfer receipt."
    },
    adminOnlyWhatsAppNotes: "Photo gallery cloud drive link pinned in executive group."
  },
  {
    id: "nile-startup-campus",
    name: "Nile Startup Campus",
    code: "NSC",
    description: "Incubating student technology and commercial ventures with pitch coaching, seed grant navigation, MVP development clinics, and investor networking.",
    category: "Business & Innovation",
    duesAmount: 4500,
    presidentName: "Chiamaka Okafor",
    presidentEmail: "c.okafor@student.nileuniversity.edu.ng",
    advisorName: "Dr. Emeka Nnamdi",
    advisorEmail: "e.nnamdi@nileuniversity.edu.ng",
    meetingSchedule: "Every Tuesday, 5:00 PM",
    location: "Nile Innovation Pavilion, Room 3",
    memberCount: 130,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80",
    tags: ["Startups", "Venture", "Incubation", "Pitch"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948011",
      accountName: "Nile University - Startup Campus",
      narrationGuideline: "MatricNo - NSC Venture Dues",
      proofInstructions: "Upload bank transfer confirmation."
    },
    adminOnlyWhatsAppNotes: "Founders cohort channel active."
  },
  {
    id: "nile-toastmasters-club",
    name: "Nile Toastmasters Club",
    code: "NTC",
    description: "Cultivating world-class public speaking, impromptu speech prowess, executive meeting leadership, and Toastmasters International communication pathways.",
    category: "Leadership & Speaking",
    duesAmount: 4000,
    presidentName: "Khadija Mustapha",
    presidentEmail: "k.mustapha@student.nileuniversity.edu.ng",
    advisorName: "Prof. Halima Yusuf",
    advisorEmail: "h.yusuf@nileuniversity.edu.ng",
    meetingSchedule: "Every Alternate Saturday, 11:00 AM",
    location: "Executive Seminar Room 2",
    memberCount: 82,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
    tags: ["Toastmasters", "Public Speaking", "Speech", "Leadership"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948012",
      accountName: "Nile University - Toastmasters Club",
      narrationGuideline: "MatricNo - NTC Dues",
      proofInstructions: "Attach transfer teller or receipt."
    },
    adminOnlyWhatsAppNotes: "Speech evaluator roster shared bi-weekly."
  },
  {
    id: "tedx-nile-club",
    name: "TEDx Nile Club",
    code: "TEDX",
    description: "Curating university-licensed TEDx conferences, visionary thought-leadership talks, innovative speaker auditions, and multimedia production.",
    category: "Leadership & Speaking",
    duesAmount: 3500,
    presidentName: "Amina Lawal",
    presidentEmail: "a.lawal@student.nileuniversity.edu.ng",
    advisorName: "Dr. Fatima Ibrahim",
    advisorEmail: "f.ibrahim@nileuniversity.edu.ng",
    meetingSchedule: "Every Monday, 4:00 PM",
    location: "Main Auditorium Green Room",
    memberCount: 115,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80",
    tags: ["TEDx", "Ideas", "Conferences", "Production"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948013",
      accountName: "Nile University - TEDx Nile",
      narrationGuideline: "MatricNo - TEDx Dues",
      proofInstructions: "Upload bank transfer confirmation."
    },
    adminOnlyWhatsAppNotes: "Official TEDx licensee and executive team communications."
  },
  {
    id: "women-in-tech-club",
    name: "Women in Tech Club",
    code: "WITC",
    description: "Championing female representation in engineering, computing, data science, cybersecurity, technical mentorship, and industry career pathways.",
    category: "Technology",
    duesAmount: 3000,
    presidentName: "Hauwa Mohammed",
    presidentEmail: "h.mohammed@student.nileuniversity.edu.ng",
    advisorName: "Dr. Fatima Ibrahim",
    advisorEmail: "f.ibrahim@nileuniversity.edu.ng",
    meetingSchedule: "Every Thursday, 4:30 PM",
    location: "Faculty of Engineering, Lab 2",
    memberCount: 155,
    isPublicSignup: true,
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    tags: ["Women in Tech", "STEM", "Coding", "Mentorship"],
    bankDetails: {
      bankName: "Zenith Bank Nile Campus Branch",
      accountNumber: "1012948014",
      accountName: "Nile University - Women in Tech",
      narrationGuideline: "MatricNo - WITC Annual Dues",
      proofInstructions: "Upload bank transfer confirmation screenshot."
    },
    adminOnlyWhatsAppNotes: "Mentorship pairing coordinator active. Executive group restricted to official directives."
  }
];

// OneClub uses one approved dues amount across every student-facing mock.
// Local artwork keeps the visual prototype deterministic and offline-safe.
export const OFFICIAL_14_CLUBS_DATA: OfficialClub[] = RAW_OFFICIAL_14_CLUBS_DATA.map((club) => ({
  ...club,
  duesAmount: 10000,
  coverImage: "/oneclub.svg"
}));
