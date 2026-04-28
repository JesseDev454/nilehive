export interface Proposal {
  id: string;
  title: string;
  description: string;
  club: string;
  eventDate: string;
  submittedBy: string;
  submittedAt: string;
  status: "draft" | "pending" | "approved" | "rejected";
  currentStep: number;
  steps: {
    label: string;
    status: "completed" | "current" | "pending" | "rejected";
    remarks?: string;
  }[];
  hasPostEvent?: boolean;
}

export const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Annual Tech Symposium 2024",
    description: "A two-day technology symposium featuring keynote speakers, workshops, and hackathon.",
    club: "Computer Science Society",
    eventDate: "2024-04-15",
    submittedBy: "Sarah Chen",
    submittedAt: "2024-03-01",
    status: "pending",
    currentStep: 1,
    steps: [
      { label: "Executive Submission", status: "completed", remarks: "Submitted on Mar 1" },
      { label: "Advisor Review", status: "current" },
      { label: "Admin Approval", status: "pending" },
    ],
  },
  {
    id: "2",
    title: "Spring Cultural Night",
    description: "An evening celebrating diverse cultures with performances, food stalls, and art exhibitions.",
    club: "Cultural Exchange Club",
    eventDate: "2024-05-20",
    submittedBy: "Ahmad Rizki",
    submittedAt: "2024-03-10",
    status: "approved",
    currentStep: 3,
    steps: [
      { label: "Executive Submission", status: "completed", remarks: "Submitted on Mar 10" },
      { label: "Advisor Review", status: "completed", remarks: "Approved on Mar 15" },
      { label: "Admin Approval", status: "completed", remarks: "Approved on Mar 18" },
    ],
    hasPostEvent: true,
  },
  {
    id: "3",
    title: "Entrepreneurship Workshop",
    description: "A hands-on workshop on building startups, featuring local founders and VCs.",
    club: "Business Club",
    eventDate: "2024-06-01",
    submittedBy: "Maria Santos",
    submittedAt: "2024-03-20",
    status: "rejected",
    currentStep: 2,
    steps: [
      { label: "Executive Submission", status: "completed", remarks: "Submitted on Mar 20" },
      { label: "Advisor Review", status: "rejected", remarks: "Budget exceeds allocation. Please revise." },
      { label: "Admin Approval", status: "pending" },
    ],
  },
  {
    id: "4",
    title: "Charity Fun Run",
    description: "5K fun run to raise funds for local community shelters.",
    club: "Community Service Club",
    eventDate: "2024-04-28",
    submittedBy: "James Okafor",
    submittedAt: "2024-03-25",
    status: "pending",
    currentStep: 0,
    steps: [
      { label: "Executive Submission", status: "completed", remarks: "Submitted on Mar 25" },
      { label: "Advisor Review", status: "current" },
      { label: "Admin Approval", status: "pending" },
    ],
  },
  {
    id: "5",
    title: "Photography Exhibition",
    description: "Student photography showcase highlighting campus life and nature.",
    club: "Photography Club",
    eventDate: "2024-05-10",
    submittedBy: "Lina Park",
    submittedAt: "2024-03-28",
    status: "approved",
    currentStep: 3,
    steps: [
      { label: "Executive Submission", status: "completed" },
      { label: "Advisor Review", status: "completed", remarks: "Great proposal!" },
      { label: "Admin Approval", status: "completed", remarks: "Venue confirmed" },
    ],
    hasPostEvent: true,
  },
];

export interface ArchiveItem {
  id: string;
  title: string;
  club: string;
  date: string;
  thumbnail: string;
  images: string[];
  reportUrl?: string;
}

export const mockArchive: ArchiveItem[] = [
  {
    id: "1",
    title: "Spring Cultural Night",
    club: "Cultural Exchange Club",
    date: "2024-05-20",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    ],
  },
  {
    id: "2",
    title: "Photography Exhibition",
    club: "Photography Club",
    date: "2024-05-10",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    ],
  },
  {
    id: "3",
    title: "Hackathon 2023",
    club: "Computer Science Society",
    date: "2023-11-15",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    ],
  },
  {
    id: "4",
    title: "Charity Gala Dinner",
    club: "Community Service Club",
    date: "2023-12-01",
    thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    ],
  },
];
