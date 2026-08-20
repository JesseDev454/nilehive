import { getDateStringInTimeZone } from "./lifecycle";
import type { AdminEventView } from "./types";

function shiftDate(days: number): string {
  const today = getDateStringInTimeZone();
  const [year, month, day] = today.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function mockAdminEvents(): AdminEventView[] {
  const today = shiftDate(0);
  return [
    {
      id: "evt-01",
      proposalId: "prop-101",
      title: "Google Cloud & Generative AI Buildathon 2026",
      clubId: "google-developers",
      clubName: "Nile Google Developers",
      eventDate: today,
      startTime: "10:00",
      endTime: "16:00",
      venue: "Nile Tech Auditorium & Lab 4",
      capacity: 150,
      rsvpsCount: 138,
      attendeesCount: 94,
      goingCount: 138,
      organizerName: "Farouk Aliyu",
      organizerEmail: "f.aliyu@student.nileuniversity.edu.ng",
      description:
        "Hands-on engineering hackathon building campus solutions using Vertex AI and Google Cloud tools. Includes mentor clinics and live demonstrations.",
      checkInPath: "/check-in?proposal=prop-101",
      eventLifecycle: "happening_today",
      engagementLoaded: true,
      postEventReport: { status: "missing" },
      rsvpRoster: [],
      attendanceRoster: [
        {
          id: "att-01",
          userId: "student-mock-1",
          studentId: "NIL/2023/UG/0491",
          studentName: "Ibrahim Sani",
          studentEmail: "i.sani@student.nileuniversity.edu.ng",
          checkedInAt: `${today}T10:14:00Z`,
          checkInMethod: "qr_scan",
        },
        {
          id: "att-02",
          userId: "student-mock-2",
          studentId: "NIL/2024/UG/1029",
          studentName: "Fatima Aliyu",
          studentEmail: "f.aliyu@student.nileuniversity.edu.ng",
          checkedInAt: `${today}T10:22:00Z`,
          checkInMethod: "qr_scan",
        },
        {
          id: "att-03",
          userId: "student-mock-3",
          studentId: "NIL/2022/UG/0144",
          studentName: "Tariq Ibrahim",
          studentEmail: "t.ibrahim@student.nileuniversity.edu.ng",
          checkedInAt: `${today}T10:45:00Z`,
          checkInMethod: "manual_fallback",
          verifiedBy: "Directorate Admin",
        },
      ],
    },
    {
      id: "evt-02",
      proposalId: "prop-102",
      title: "All-Nigeria Inter-Varsity Model UN Simulation",
      clubId: "model-un",
      clubName: "Nile Model United Nations Club",
      eventDate: shiftDate(36),
      startTime: "09:00",
      endTime: "17:30",
      venue: "Conference Hall A",
      capacity: 200,
      rsvpsCount: 165,
      attendeesCount: 0,
      goingCount: 165,
      organizerName: "Zainab Mukhtar",
      organizerEmail: "z.mukhtar@student.nileuniversity.edu.ng",
      description:
        "National parliamentary diplomatic simulation addressing regional climate resilience and multilateral resolutions.",
      checkInPath: "/check-in?proposal=prop-102",
      eventLifecycle: "upcoming",
      engagementLoaded: true,
      postEventReport: { status: "missing" },
      rsvpRoster: [],
      attendanceRoster: [],
    },
    {
      id: "evt-03",
      proposalId: "prop-103",
      title: "Nile Climate Hackathon Closing Showcase",
      clubId: "climate",
      clubName: "Nile Climate Initiatives Club",
      eventDate: shiftDate(-21),
      startTime: "14:00",
      endTime: "18:00",
      venue: "Senate Chambers",
      capacity: 120,
      rsvpsCount: 118,
      attendeesCount: 109,
      goingCount: 118,
      organizerName: "Chidi Nwosu",
      organizerEmail: "c.nwosu@student.nileuniversity.edu.ng",
      description: "Closing exhibition of student climate prototypes with faculty and partner reviewers.",
      checkInPath: "/check-in?proposal=prop-103",
      eventLifecycle: "past",
      engagementLoaded: true,
      postEventReport: {
        status: "submitted",
        submittedAt: `${shiftDate(-20)}T09:00:00Z`,
        verifiedAttendees: 109,
        budgetReconciled: 186000,
        summary: "Showcase completed with verified attendance and reconciled materials spend.",
      },
      rsvpRoster: [],
      attendanceRoster: [],
    },
  ];
}
