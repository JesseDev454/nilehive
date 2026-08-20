export type EventLifecycle = "happening_today" | "upcoming" | "past";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkedInAt: string;
  checkInMethod: "qr_scan" | "manual_fallback";
  verifiedBy?: string;
}

export interface AdminEventRecord {
  id: string;
  proposalId: string;
  title: string;
  clubId: string;
  clubName: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  capacity: number;
  rsvpsCount: number;
  attendeesCount: number;
  organizerName: string;
  organizerEmail: string;
  description: string;
  qrCodePayload: string;
  postEventReport: {
    status: "submitted" | "missing";
    submittedAt?: string;
    verifiedAttendees?: number;
    budgetReconciled?: number;
    summary?: string;
  };
  attendanceRoster: AttendanceRecord[];
}

export function computeEventLifecycle(eventDate: string): EventLifecycle {
  // Use current simulated date: 2026-08-19
  const todayStr = "2026-08-19";
  if (eventDate === todayStr) {
    return "happening_today";
  }
  if (eventDate > todayStr) {
    return "upcoming";
  }
  return "past";
}

export const INITIAL_ADMIN_EVENTS: AdminEventRecord[] = [
  {
    id: "evt-01",
    proposalId: "prop-101",
    title: "Google Cloud & Generative AI Buildathon 2026",
    clubId: "google-developers",
    clubName: "Nile Google Developers",
    eventDate: "2026-08-19", // Happening Today
    startTime: "10:00",
    endTime: "16:00",
    venue: "Nile Tech Auditorium & Lab 4",
    capacity: 150,
    rsvpsCount: 138,
    attendeesCount: 94,
    organizerName: "Farouk Aliyu",
    organizerEmail: "f.aliyu@student.nileuniversity.edu.ng",
    description: "Hands-on engineering hackathon building campus solutions using Vertex AI and Google Cloud tools. Includes mentor clinics and live demonstrations.",
    qrCodePayload: "ONECLUB:EVT-01:2026-08-19:GDG-BUILDATHON",
    postEventReport: {
      status: "missing" // Active today, report pending
    },
    attendanceRoster: [
      {
        id: "att-01",
        studentId: "NIL/2023/UG/0491",
        studentName: "Ibrahim Sani",
        studentEmail: "i.sani@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-19T10:14:00Z",
        checkInMethod: "qr_scan"
      },
      {
        id: "att-02",
        studentId: "NIL/2024/UG/1029",
        studentName: "Fatima Aliyu",
        studentEmail: "f.aliyu@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-19T10:22:00Z",
        checkInMethod: "qr_scan"
      },
      {
        id: "att-03",
        studentId: "NIL/2022/UG/0144",
        studentName: "Tariq Ibrahim",
        studentEmail: "t.ibrahim@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-19T10:45:00Z",
        checkInMethod: "manual_fallback",
        verifiedBy: "Directorate Admin"
      }
    ]
  },
  {
    id: "evt-02",
    proposalId: "prop-102",
    title: "All-Nigeria Inter-Varsity Model UN Simulation",
    clubId: "model-un",
    clubName: "Nile Model United Nations Club",
    eventDate: "2026-09-24", // Upcoming
    startTime: "09:00",
    endTime: "17:30",
    venue: "Conference Hall A",
    capacity: 200,
    rsvpsCount: 165,
    attendeesCount: 0,
    organizerName: "Zainab Mukhtar",
    organizerEmail: "z.mukhtar@student.nileuniversity.edu.ng",
    description: "National parliamentary diplomatic simulation addressing regional climate resilience and multilateral resolutions.",
    qrCodePayload: "ONECLUB:EVT-02:2026-09-24:MUN-SIMULATION",
    postEventReport: {
      status: "missing"
    },
    attendanceRoster: []
  },
  {
    id: "evt-03",
    proposalId: "prop-103",
    title: "Campus Seed Venture Showcase & Investor Pitch Day",
    clubId: "startup-campus",
    clubName: "Nile Startup Campus",
    eventDate: "2026-10-05", // Upcoming
    startTime: "13:00",
    endTime: "18:00",
    venue: "Nile Innovation Pavilion, Room 3",
    capacity: 120,
    rsvpsCount: 88,
    attendeesCount: 0,
    organizerName: "Chiamaka Okafor",
    organizerEmail: "c.okafor@student.nileuniversity.edu.ng",
    description: "Venture pitch competition showcasing student startups to angel investors and campus incubation mentors.",
    qrCodePayload: "ONECLUB:EVT-03:2026-10-05:STARTUP-PITCH",
    postEventReport: {
      status: "missing"
    },
    attendanceRoster: []
  },
  {
    id: "evt-04",
    proposalId: "prop-090",
    title: "Inter-Faculty Parliamentary Debate Championship Finals",
    clubId: "debate-club",
    clubName: "Nile Debate Club",
    eventDate: "2026-08-10", // Past (Report Submitted)
    startTime: "14:00",
    endTime: "18:00",
    venue: "Moot Court Hall, Law Faculty",
    capacity: 150,
    rsvpsCount: 130,
    attendeesCount: 118,
    organizerName: "Tariq Ibrahim",
    organizerEmail: "t.ibrahim@student.nileuniversity.edu.ng",
    description: "Final rounds of the Nile University parliamentary debate league with visiting adjudication panels.",
    qrCodePayload: "ONECLUB:EVT-04:2026-08-10:DEBATE-FINALS",
    postEventReport: {
      status: "submitted",
      submittedAt: "2026-08-12T09:00:00Z",
      verifiedAttendees: 118,
      budgetReconciled: 65000,
      summary: "Completed successfully with 14 faculty teams. Attendance confirmed via QR scan and verified by Faculty Advisor."
    },
    attendanceRoster: [
      {
        id: "att-11",
        studentId: "NIL/2023/UG/0219",
        studentName: "Zainab Mukhtar",
        studentEmail: "z.mukhtar@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-10T14:05:00Z",
        checkInMethod: "qr_scan"
      },
      {
        id: "att-12",
        studentId: "NIL/2022/UG/0104",
        studentName: "Farouk Aliyu",
        studentEmail: "f.aliyu@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-10T14:12:00Z",
        checkInMethod: "qr_scan"
      }
    ]
  },
  {
    id: "evt-05",
    proposalId: "prop-088",
    title: "Annual Campus Tree Planting & E-Waste Drive",
    clubId: "climate-club",
    clubName: "Nile Climate Initiatives Club",
    eventDate: "2026-08-05", // Past (Report Missing - Compliance Alert)
    startTime: "09:00",
    endTime: "13:00",
    venue: "Green Canopy Plaza, Room 102",
    capacity: 100,
    rsvpsCount: 85,
    attendeesCount: 74,
    organizerName: "Ibrahim Sani",
    organizerEmail: "i.sani@student.nileuniversity.edu.ng",
    description: "Campus-wide environmental volunteering project planting 50 shaded trees and collecting electronic waste.",
    qrCodePayload: "ONECLUB:EVT-05:2026-08-05:TREE-PLANTING",
    postEventReport: {
      status: "missing" // Past event with missing report
    },
    attendanceRoster: [
      {
        id: "att-21",
        studentId: "NIL/2024/UG/0812",
        studentName: "Amina Lawal",
        studentEmail: "a.lawal@student.nileuniversity.edu.ng",
        checkedInAt: "2026-08-05T09:15:00Z",
        checkInMethod: "qr_scan"
      }
    ]
  }
];
