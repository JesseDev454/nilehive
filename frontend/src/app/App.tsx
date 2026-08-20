import { lazy, Suspense, useMemo, useState, type ComponentType } from "react";
import { Building2, CalendarDays, ClipboardCheck, Compass, FileCheck2, FileText, Home, LayoutGrid, ListTodo, MoreHorizontal, Users } from "lucide-react";
import { BrowserRouter, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/shared/theme";
import { AuthProvider, useAuth, type PreviewRole } from "@/contexts/AuthContext";
import { PreviewRoleProvider } from "@/contexts/RoleContext";
import { WorkspaceShell, type NavigationItem } from "./WorkspaceShell";
import { Skeleton } from "@/shared/components/Skeleton";
import {
  AccountSuspendedScreen,
  CampusOneLoginScreen,
  NotFoundScreen,
  OfflineRetryScreen,
  RecoverableErrorScreen,
  SessionExpiredScreen,
  UnauthorizedRoleScreen,
  UnsupportedDomainScreen,
} from "@/components/shared/system";
import { isMockPreviewMode } from "@/lib/oneclubMode";
import {
  ROLE_LABELS,
  adminAliasRedirect,
  homePathForRole,
  isPublicPath,
  isSystemGalleryPath,
  loginPath,
  matchAdminWorkspace,
  normalizePathname,
  roleFromPath,
  safeReturnTo,
} from "@/lib/workspaceRoutes";

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

const AdvisorHome = lazyNamed(() => import("@/components/advisor/home/AdvisorHomeWorkspace"), "AdvisorHomeWorkspace");
const AdvisorReviews = lazyNamed(() => import("@/components/advisor/reviews/AdvisorReviewsWorkspace"), "AdvisorReviewsWorkspace");
const AdvisorClubs = lazyNamed(() => import("@/components/advisor/clubs/AdvisorClubsWorkspace"), "AdvisorClubsWorkspace");
const AdvisorReports = lazyNamed(() => import("@/components/advisor/reports/AdvisorReportsWorkspace"), "AdvisorReportsWorkspace");
const AdvisorNotifications = lazyNamed(() => import("@/components/advisor/notifications/AdvisorNotificationsWorkspace"), "AdvisorNotificationsWorkspace");
const AdvisorProfile = lazyNamed(() => import("@/components/advisor/profile/AdvisorProfileWorkspace"), "AdvisorProfileWorkspace");
const AdvisorMore = lazyNamed(() => import("@/components/advisor/more/AdvisorMoreWorkspace"), "AdvisorMoreWorkspace");

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
const SharedScreens = lazyNamed(() => import("@/components/shared/system/SharedScreensWorkspace"), "SharedScreensWorkspace");

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

function WorkspaceFallback() {
  return (
    <div className="space-y-4" aria-label="Loading workspace">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function SessionCheckingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground" aria-label="Checking Campus One session" aria-busy="true">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

function loginStatusMessage(authError: string | null, signedOut: string | null): string | undefined {
  if (signedOut) {
    return "You have signed out of OneClub. Continue with Campus One to sign in again.";
  }
  if (authError === "cancelled") {
    return "Campus One sign-in was cancelled. Continue when you are ready.";
  }
  if (authError) {
    return "Campus One sign-in did not complete. Continue to try again.";
  }
  return undefined;
}

function LoginScreen() {
  const { mode, beginLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const returnTo = params.get("return_to") || "/";

  return (
    <CampusOneLoginScreen
      statusMessage={loginStatusMessage(params.get("auth_error"), params.get("signed_out"))}
      onContinue={() => {
        if (mode === "mock") {
          navigate("/student/home");
          return;
        }
        beginLogin(safeReturnTo(returnTo));
      }}
    />
  );
}

function WorkspaceRouter({ role }: { role: PreviewRole }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
    if (key.includes("review")) return <AdvisorReviews />;
    if (key.includes("club")) return <AdvisorClubs />;
    if (key.includes("report") || key.includes("archive")) return <AdvisorReports />;
    if (key.includes("notification")) return <AdvisorNotifications />;
    if (key.includes("profile")) return <AdvisorProfile />;
    if (key.includes("more")) return <AdvisorMore />;
    return <AdvisorHome />;
  }

  switch (matchAdminWorkspace(pathname)) {
    case "approvals":
      return <AdminApprovals />;
    case "people":
      return <AdminPeople />;
    case "announcements":
      return <AdminAnnouncements />;
    case "notifications":
      return <AdminNotifications />;
    case "feedback":
      return <AdminFeedback />;
    case "analytics":
      return <AdminAnalytics />;
    case "profile":
      return <AdminProfile />;
    case "events":
      return <AdminEvents />;
    case "clubs":
      return <AdminClubs />;
    case "more":
      return <AdminMore />;
    case "home":
      return <AdminHome />;
    default:
      return (
        <NotFoundScreen
          requestedPath={normalizePathname(pathname)}
          onGoHome={() => navigate(homePathForRole(role))}
        />
      );
  }
}

function AuthenticatedWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, effective_role } = useAuth();
  const pathRole = roleFromPath(location.pathname);
  const [previewRole, setPreviewRole] = useState<PreviewRole>(pathRole ?? "student");
  const role: PreviewRole = mode === "mock" ? (pathRole ?? previewRole) : (effective_role ?? "student");
  const navigation = useMemo(() => NAVIGATION[role], [role]);

  if (role === "admin") {
    const alias = adminAliasRedirect(location.pathname);
    if (alias) {
      return <Navigate to={alias} replace />;
    }
  }

  if (pathRole && pathRole !== role) {
    return (
      <UnauthorizedRoleScreen
        currentRole={ROLE_LABELS[role]}
        requiredRole={ROLE_LABELS[pathRole]}
        targetWorkspaceName={`${ROLE_LABELS[pathRole]} workspace`}
        onBackToDashboard={() => navigate(homePathForRole(role))}
      />
    );
  }

  return (
    <WorkspaceShell role={role} roleLabel={ROLE_LABELS[role]} navigation={navigation} onRoleChange={setPreviewRole}>
      <Suspense fallback={<WorkspaceFallback />}>
        <WorkspaceRouter role={role} />
      </Suspense>
    </WorkspaceShell>
  );
}

function OneClubApp() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mockMode = isMockPreviewMode();
  const path = normalizePathname(location.pathname);
  const workspaceRole = mockMode ? (roleFromPath(location.pathname) ?? "student") : (auth.effective_role ?? "student");

  if (!mockMode) {
    if (auth.status === "checking") {
      return <SessionCheckingScreen />;
    }
    if (auth.status === "session_expired") {
      return (
        <SessionExpiredScreen
          lastActiveWorkspace={path}
          onContinue={() => auth.beginLogin(safeReturnTo(location.pathname, location.search))}
          onSignOut={() => {
            void auth.signOut();
          }}
        />
      );
    }
    if (auth.status === "suspended") {
      return (
        <AccountSuspendedScreen
          name={auth.profile.full_name}
          matricNumber={auth.profile.student_id || undefined}
          onSignOut={() => {
            void auth.signOut();
          }}
        />
      );
    }
    if (auth.status === "unsupported_domain") {
      return (
        <UnsupportedDomainScreen
          attemptedEmail={auth.profile.email || undefined}
          onSwitchAccount={() => {
            void auth.signOut();
          }}
        />
      );
    }
    if (auth.status === "offline") {
      return (
        <OfflineRetryScreen
          cachedSectionTitle="Campus One session"
          hasCachedData={false}
          onRetry={() => {
            void auth.refresh();
          }}
        />
      );
    }
    if (auth.status === "error") {
      return (
        <RecoverableErrorScreen
          errorMessage={auth.errorMessage || undefined}
          onRetry={() => {
            void auth.refresh();
          }}
          onGoHome={() => auth.beginLogin("/")}
        />
      );
    }
    if (auth.status === "unauthorized") {
      return (
        <UnauthorizedRoleScreen
          currentRole="Unavailable"
          requiredRole="OneClub workspace role"
          targetWorkspaceName="This workspace"
          onBackToDashboard={() => {
            void auth.signOut();
          }}
        />
      );
    }
    if (auth.status === "unauthenticated") {
      if (!isPublicPath(location.pathname)) {
        return <Navigate to={loginPath(location.pathname, location.search)} replace />;
      }
      return <LoginScreen />;
    }
    if (isPublicPath(location.pathname)) {
      return <Navigate to={homePathForRole(auth.effective_role ?? "student")} replace />;
    }
  } else if (isPublicPath(location.pathname)) {
    return <LoginScreen />;
  }

  if (isSystemGalleryPath(location.pathname)) {
    if (!mockMode) {
      return (
        <NotFoundScreen
          requestedPath={path}
          onGoHome={() => navigate(homePathForRole(workspaceRole))}
        />
      );
    }
    return (
      <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <Suspense fallback={<div className="mx-auto max-w-6xl space-y-4" aria-label="Loading shared system screens"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>}>
          <SharedScreens />
        </Suspense>
      </div>
    );
  }

  if (path === "/") {
    return <Navigate to={homePathForRole(workspaceRole)} replace />;
  }

  return <AuthenticatedWorkspace />;
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <PreviewRoleProvider>
            <OneClubApp />
            <Toaster position="bottom-right" richColors />
          </PreviewRoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
