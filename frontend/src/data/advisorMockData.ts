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

// Advisor-only deterministic preview records. These are limited to the three
// assigned official clubs and never call the production proposals API.
export const ADVISOR_MOCK_PROPOSALS: Proposal[] = [
  {
    id: "prop-101",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    title: "Google Cloud & Generative AI Buildathon 2026",
    description: "A hands-on buildathon creating practical campus tools with Gemini API and Google Cloud.",
    aimObjectives: "Equip students with modern development skills, produce useful campus prototypes, and support peer learning.",
    proposedActivity: "Coding sessions, mentor check-ins, project demonstrations, and a closing showcase.",
    eventDate: "2026-09-12",
    eventTime: "09:00 AM - 05:00 PM",
    location: "ICT Center, Main Auditorium & Labs 1-3",
    expectedParticipants: 220,
    budgetEstimate: 350000,
    status: "pending_advisor_review",
    submittedBy: "Farouk Aliyu",
    submittedAt: "2026-08-18",
    budgetItems: [
      { item: "Participant refreshments", quantity: 220, amount: 200000, description: "Lunch packs and water" },
      { item: "Awards and badges", quantity: 3, amount: 90000, description: "Awards for the top teams" },
      { item: "Event signage", quantity: 4, amount: 60000, description: "Directional signs and name badges" },
    ],
    responsibleMembers: [
      { name: "Farouk Aliyu", studentId: "2020/0188", phone: "08012345678", position: "President" },
      { name: "Fatima Al-Hassan", studentId: "2021/0312", phone: "08087654321", position: "Executive" },
    ],
  },
  {
    id: "prop-102",
    clubId: "club-4",
    clubName: "Nile Climate Initiatives Club",
    title: "Green Campus Tree Planting Drive",
    description: "A campus sustainability day focused on native tree planting and practical environmental education.",
    aimObjectives: "Improve campus green cover and teach students how to maintain newly planted trees.",
    proposedActivity: "Safety briefing, planting teams, maintenance demonstrations, and a short reflection session.",
    eventDate: "2026-09-26",
    eventTime: "08:30 AM - 01:00 PM",
    location: "Green Canopy Plaza",
    expectedParticipants: 120,
    budgetEstimate: 145000,
    status: "pending_advisor_review",
    submittedBy: "Ibrahim Sani",
    submittedAt: "2026-08-17",
    budgetItems: [
      { item: "Native seedlings", quantity: 80, amount: 80000, description: "Locally suitable tree seedlings" },
      { item: "Tools and gloves", quantity: 40, amount: 65000, description: "Shared planting equipment and safety gloves" },
    ],
    responsibleMembers: [
      { name: "Ibrahim Sani", studentId: "2021/0441", phone: "08055566778", position: "President" },
    ],
  },
  {
    id: "prop-103",
    clubId: "club-11",
    clubName: "Nile Startup Campus",
    title: "Campus Venture Seed Pitch Day",
    description: "Student founders present early ventures to invited mentors and startup professionals.",
    aimObjectives: "Connect student innovators with practical feedback and support promising campus ventures.",
    proposedActivity: "Short pitches, jury questions, mentoring conversations, and networking.",
    eventDate: "2026-10-05",
    eventTime: "10:00 AM - 03:00 PM",
    location: "Faculty of Management Sciences Auditorium",
    expectedParticipants: 180,
    budgetEstimate: 280000,
    status: "pending_admin_review",
    submittedBy: "Chiamaka Okafor",
    submittedAt: "2026-08-14",
    advisorRemarks: "The proposal is clear and ready for Admin's final decision.",
    budgetItems: [
      { item: "Guest hospitality", quantity: 5, amount: 150000, description: "Hospitality for the invited jury" },
      { item: "Stage and AV", quantity: 1, amount: 130000, description: "Audio-visual setup for presentations" },
    ],
    responsibleMembers: [
      { name: "Chiamaka Okafor", studentId: "2020/0944", phone: "08033322114", position: "President" },
    ],
  },
];
