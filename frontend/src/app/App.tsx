import { lazy, Suspense, useMemo, useState, type ComponentType } from "react";
import { Building2, CalendarDays, ClipboardCheck, Compass, FileCheck2, FileText, Home, LayoutGrid, ListTodo, MoreHorizontal, Users } from "lucide-react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/shared/theme";
import { PreviewAuthProvider, type PreviewRole } from "@/contexts/AuthContext";
import { PreviewRoleProvider } from "@/contexts/RoleContext";
import { WorkspaceShell, type NavigationItem } from "./WorkspaceShell";
import { Skeleton } from "@/shared/components/Skeleton";
import { AdvisorWorkspace } from "@/components/advisor/AdvisorWorkspace";

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  name: TKey,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[name] as ComponentType };
  });
}

const StudentHome = lazyNamed(() => import("@/components/student/home/StudentHomeWorkspace"), "StudentHomeWorkspace");
const StudentDiscover = lazyNamed(() => import("@/components/student/discover/StudentDiscoverWorkspace"), "StudentDiscoverWorkspace");
const StudentEvents = lazyNamed(() => import("@/components/student/events/StudentEventsWorkspace"), "StudentEventsWorkspace");
const StudentCheckIn = lazyNamed(() => import("@/components/student/checkin/StudentQrCheckInWorkspace"), "StudentQrCheckInWorkspace");
const StudentClubs = lazyNamed(() => import("@/components/student/myclubs/StudentMyClubsWorkspace"), "StudentMyClubsWorkspace");
const StudentDues = lazyNamed(() => import("@/components/student/dues/StudentDuesWorkspace"), "StudentDuesWorkspace");
const StudentAnnouncements = lazyNamed(() => import("@/components/student/announcements/StudentAnnouncementsWorkspace"), "StudentAnnouncementsWorkspace");
const StudentNotifications = lazyNamed(() => import("@/components/student/notifications/StudentNotificationsWorkspace"), "StudentNotificationsWorkspace");
const StudentFeedback = lazyNamed(() => import("@/components/student/feedback/StudentFeedbackWorkspace"), "StudentFeedbackWorkspace");
const StudentMore = lazyNamed(() => import("@/components/student/more/StudentMoreWorkspace"), "StudentMoreWorkspace");
const StudentProfile = lazyNamed(() => import("@/components/student/profile/StudentProfileWorkspace"), "StudentProfileWorkspace");
const StudentOnboarding = lazyNamed(() => import("@/components/student/onboarding/StudentOnboardingWorkspace"), "StudentOnboardingWorkspace");

const PresidentHome = lazyNamed(() => import("@/components/president/home/PresidentHomeWorkspace"), "PresidentHomeWorkspace");
const PresidentProposals = lazyNamed(() => import("@/components/president/proposals/PresidentProposalsWorkspace"), "PresidentProposalsWorkspace");
const PresidentEvents = lazyNamed(() => import("@/components/president/events/PresidentEventsWorkspace"), "PresidentEventsWorkspace");
const PresidentMembers = lazyNamed(() => import("@/components/president/members/PresidentMembersWorkspace"), "PresidentMembersWorkspace");
const PresidentAnnouncements = lazyNamed(() => import("@/components/president/announcements/PresidentAnnouncementsWorkspace"), "PresidentAnnouncementsWorkspace");
const PresidentReports = lazyNamed(() => import("@/components/president/reports/PresidentReportsWorkspace"), "PresidentReportsWorkspace");
const PresidentClub = lazyNamed(() => import("@/components/president/club/PresidentClubDetailsWorkspace"), "PresidentClubDetailsWorkspace");
const PresidentWork = lazyNamed(() => import("@/components/president/work/PresidentWorkWorkspace"), "PresidentWorkWorkspace");
const PresidentNotifications = lazyNamed(() => import("@/components/president/notifications/PresidentNotificationsWorkspace"), "PresidentNotificationsWorkspace");
const PresidentMore = lazyNamed(() => import("@/components/president/more/PresidentMoreWorkspace"), "PresidentMoreWorkspace");
const PresidentProfile = lazyNamed(() => import("@/components/president/profile/PresidentProfileWorkspace"), "PresidentProfileWorkspace");

const ExecutiveHome = lazyNamed(() => import("@/components/executive/home/ExecutiveHomeWorkspace"), "ExecutiveHomeWorkspace");
const ExecutiveClub = lazyNamed(() => import("@/components/executive/club/ExecutiveClubWorkspace"), "ExecutiveClubWorkspace");
const ExecutiveEvents = lazyNamed(() => import("@/components/executive/events/ExecutiveEventsWorkspace"), "ExecutiveEventsWorkspace");
const ExecutiveWork = lazyNamed(() => import("@/components/executive/work/ExecutiveWorkWorkspace"), "ExecutiveWorkWorkspace");
const ExecutiveNotifications = lazyNamed(() => import("@/components/executive/notifications/ExecutiveNotificationsWorkspace"), "ExecutiveNotificationsWorkspace");
const ExecutiveMore = lazyNamed(() => import("@/components/executive/more/ExecutiveMoreWorkspace"), "ExecutiveMoreWorkspace");
const ExecutiveProfile = lazyNamed(() => import("@/components/executive/profile/ExecutiveProfileWorkspace"), "ExecutiveProfileWorkspace");

const AdminHome = lazyNamed(() => import("@/components/AdminHomeView"), "AdminHomeView");
const AdminApprovals = lazyNamed(() => import("@/components/admin/approvals/AdminApprovalsWorkspace"), "AdminApprovalsWorkspace");
const AdminClubs = lazyNamed(() => import("@/components/admin/clubs/AdminClubsWorkspace"), "AdminClubsWorkspace");
const AdminPeople = lazyNamed(() => import("@/components/admin/people/AdminPeopleWorkspace"), "AdminPeopleWorkspace");
const AdminEvents = lazyNamed(() => import("@/components/admin/events/AdminEventsWorkspace"), "AdminEventsWorkspace");
const AdminAnnouncements = lazyNamed(() => import("@/components/admin/announcements/AdminAnnouncementsWorkspace"), "AdminAnnouncementsWorkspace");
const AdminNotifications = lazyNamed(() => import("@/components/admin/notifications/AdminNotificationsWorkspace"), "AdminNotificationsWorkspace");
const AdminFeedback = lazyNamed(() => import("@/components/admin/feedback/AdminFeedbackWorkspace"), "AdminFeedbackWorkspace");
const AdminAnalytics = lazyNamed(() => import("@/components/admin/analytics/AdminAnalyticsWorkspace"), "AdminAnalyticsWorkspace");
const AdminMore = lazyNamed(() => import("@/components/admin/more/AdminMoreWorkspace"), "AdminMoreWorkspace");
const AdminProfile = lazyNamed(() => import("@/components/admin/profile/AdminProfileWorkspace"), "AdminProfileWorkspace");

const NAVIGATION: Record<PreviewRole, NavigationItem[]> = {
  student: [
    { label: "Home", path: "/student/home", icon: Home },
    { label: "Discover", path: "/student/discover", icon: Compass },
    { label: "Events", path: "/student/events", icon: CalendarDays },
    { label: "My clubs", path: "/student/my-clubs", icon: Users },
    { label: "More", path: "/student/more", icon: MoreHorizontal },
  ],
  president: [
    { label: "Home", path: "/president/home", icon: Home },
    { label: "Proposals", path: "/president/proposals", icon: FileText },
    { label: "Events", path: "/president/events", icon: CalendarDays },
    { label: "Members", path: "/president/members", icon: Users },
    { label: "More", path: "/president/more", icon: MoreHorizontal },
  ],
  executive: [
    { label: "Home", path: "/executive/home", icon: Home },
    { label: "Club", path: "/executive/club", icon: Building2 },
    { label: "Events", path: "/executive/events", icon: CalendarDays },
    { label: "My work", path: "/executive/work", icon: ListTodo },
    { label: "More", path: "/executive/more", icon: MoreHorizontal },
  ],
  advisor: [
    { label: "Home", path: "/advisor/home", icon: Home },
    { label: "Reviews", path: "/advisor/reviews", icon: ClipboardCheck },
    { label: "Clubs", path: "/advisor/clubs", icon: Building2 },
    { label: "Reports", path: "/advisor/reports", icon: FileCheck2 },
    { label: "More", path: "/advisor/more", icon: MoreHorizontal },
  ],
  admin: [
    { label: "Home", path: "/admin/home", icon: Home },
    { label: "Approvals", path: "/admin/approvals", icon: ClipboardCheck },
    { label: "Clubs", path: "/admin/clubs", icon: Building2 },
    { label: "People", path: "/admin/people", icon: Users },
    { label: "More", path: "/admin/more", icon: LayoutGrid },
  ],
};

const ROLE_LABELS: Record<PreviewRole, string> = {
  student: "Student",
  president: "President",
  executive: "Executive",
  advisor: "Advisor",
  admin: "Club Services Admin",
};

function roleFromPath(pathname: string): PreviewRole | null {
  const candidate = pathname.split("/")[1];
  return ["student", "president", "executive", "advisor", "admin"].includes(candidate)
    ? (candidate as PreviewRole)
    : null;
}

function WorkspaceRouter({ role }: { role: PreviewRole }) {
  const { pathname } = useLocation();
  const key = pathname.toLowerCase();

  if (role === "student") {
    if (key.includes("check-in") || key.includes("checkin")) return <StudentCheckIn />;
    if (key.includes("discover") || key.startsWith("/membership")) return <StudentDiscover />;
    if (key.includes("my-clubs")) return <StudentClubs />;
    if (key.includes("dues")) return <StudentDues />;
    if (key.includes("announcement") || key.startsWith("/communications")) return <StudentAnnouncements />;
    if (key.includes("notification")) return <StudentNotifications />;
    if (key.includes("feedback")) return <StudentFeedback />;
    if (key.includes("profile")) return <StudentProfile />;
    if (key.includes("onboarding")) return <StudentOnboarding />;
    if (key.includes("more")) return <StudentMore />;
    if (key.includes("event")) return <StudentEvents />;
    return <StudentHome />;
  }
  if (role === "president") {
    if (key.includes("proposal")) return <PresidentProposals />;
    if (key.includes("member")) return <PresidentMembers />;
    if (key.includes("announcement") || key.startsWith("/communications")) return <PresidentAnnouncements />;
    if (key.includes("report") || key.includes("archive")) return <PresidentReports />;
    if (key.includes("notification")) return <PresidentNotifications />;
    if (key.includes("profile")) return <PresidentProfile />;
    if (key.includes("work") || key.includes("task")) return <PresidentWork />;
    if (key.includes("club")) return <PresidentClub />;
    if (key.includes("more")) return <PresidentMore />;
    if (key.includes("event")) return <PresidentEvents />;
    return <PresidentHome />;
  }
  if (role === "executive") {
    if (key.includes("event")) return <ExecutiveEvents />;
    if (key.includes("work") || key.includes("task")) return <ExecutiveWork />;
    if (key.includes("notification")) return <ExecutiveNotifications />;
    if (key.includes("profile")) return <ExecutiveProfile />;
    if (key.includes("more")) return <ExecutiveMore />;
    if (key.includes("club")) return <ExecutiveClub />;
    return <ExecutiveHome />;
  }
  if (role === "advisor") {
    const section = key.includes("review") ? "reviews" : key.includes("club") ? "clubs" : key.includes("report") ? "reports" : key.includes("notification") ? "notifications" : key.includes("profile") ? "profile" : key.includes("more") ? "more" : "home";
    return <AdvisorWorkspace section={section} />;
  }
  if (key.includes("approval") || key.startsWith("/dues") || key.startsWith("/user-management")) return <AdminApprovals />;
  if (key.includes("people")) return <AdminPeople />;
  if (key.includes("announcement") || key.startsWith("/communications")) return <AdminAnnouncements />;
  if (key.includes("notification")) return <AdminNotifications />;
  if (key.includes("feedback")) return <AdminFeedback />;
  if (key.includes("analytics")) return <AdminAnalytics />;
  if (key.includes("profile")) return <AdminProfile />;
  if (key.includes("event") || key.includes("archive")) return <AdminEvents />;
  if (key.includes("club")) return <AdminClubs />;
  if (key.includes("more")) return <AdminMore />;
  return <AdminHome />;
}

function OneClubPreview() {
  const location = useLocation();
  const pathRole = roleFromPath(location.pathname);
  const [previewRole, setPreviewRole] = useState<PreviewRole>(pathRole ?? "student");
  const role = pathRole ?? previewRole;
  const navigation = useMemo(() => NAVIGATION[role], [role]);

  return (
    <WorkspaceShell role={role} roleLabel={ROLE_LABELS[role]} navigation={navigation} onRoleChange={setPreviewRole}>
      <Suspense fallback={<div className="space-y-4" aria-label="Loading workspace"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>}>
        <WorkspaceRouter role={role} />
      </Suspense>
    </WorkspaceShell>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <PreviewAuthProvider>
        <PreviewRoleProvider>
          <BrowserRouter>
            <OneClubPreview />
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </PreviewRoleProvider>
      </PreviewAuthProvider>
    </ThemeProvider>
  );
}
