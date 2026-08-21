import type { AdminHomeViewModel } from "./types";
import { buildAttentionCards, emptyDashboardSummary } from "./adapters";

export function mockAdminHomeView(): AdminHomeViewModel {
  const summary = {
    ...emptyDashboardSummary(),
    total_clubs: 14,
    pending_admin_proposals: 2,
    pending_membership_requests: 1,
    submitted_dues_payments: 1,
    missing_reports: 1,
  };

  return {
    generatedAt: "2026-08-21T08:00:00.000Z",
    greetingName: "Zainab",
    totalClubs: 14,
    attention: buildAttentionCards(summary),
    missingReports: [
      {
        proposal_id: "rep-01",
        club_id: "debate-club",
        title: "Inter-Faculty Parliamentary Debate Finals",
        event_date: "2026-08-10",
        days_since_event: 11,
      },
    ],
    recentActivity: [
      {
        id: "act-01",
        type: "proposal",
        club_id: "startup",
        club_name: "Nile Startup Campus",
        title: "Venture Pitch Day 2026 Authorized",
        message: "Directorate granted final approval for venue and budget.",
        created_at: "2026-08-21T06:00:00.000Z",
        destinationUrl: "/admin/approvals",
      },
      {
        id: "act-02",
        type: "dues",
        club_id: "google-developers",
        club_name: "Nile Google Developers",
        title: "Session dues confirmed",
        message: "Bank transfer reference confirmed for Amina Yusuf.",
        created_at: "2026-08-21T04:00:00.000Z",
        destinationUrl: "/admin/approvals",
      },
      {
        id: "act-03",
        type: "membership_request",
        club_id: "creative-arts",
        club_name: "Nile Creative Arts Club",
        title: "New student admitted",
        message: "Chinedu Eze enrolled into official club membership.",
        created_at: "2026-08-20T12:00:00.000Z",
        destinationUrl: "/admin/approvals",
      },
      {
        id: "act-04",
        type: "event_report",
        club_id: "climate-club",
        club_name: "Nile Climate Initiatives Club",
        title: "Tree Planting Drive report received",
        message: "74 student participants recorded with a reconciled budget.",
        created_at: "2026-08-19T09:00:00.000Z",
        destinationUrl: "/admin/events",
      },
    ],
  };
}
