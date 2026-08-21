import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/AccessDenied";
import { AuthProvider, resolveEffectiveRole, useAuth } from "@/contexts/AuthContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import { ClublyLoadingState, ClublyStateCard, ClublyWorkspaceLoadingScreen } from "@/components/OneClub";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import Login from "@/pages/Login";
import ProfileSetup from "@/pages/ProfileSetup";
import ResetPassword from "@/pages/ResetPassword";
import SignUp from "@/pages/SignUp";
import SignupConfirmation from "@/pages/SignupConfirmation";
import NewProposal from "@/pages/NewProposal";
import Proposals from "@/pages/Proposals";
import ProposalDetail from "@/pages/ProposalDetail";
import Approvals from "@/pages/Approvals";
import AdminProposalReview from "@/pages/AdminProposalReview";
import AdminClubDashboard from "@/pages/AdminClubDashboard";
import Communications from "@/pages/Communications";
import Clubs from "@/pages/Clubs";
import Dues from "@/pages/Dues";
import DuesProofReview from "@/pages/DuesProofReview";
import EventCalendar from "@/pages/EventCalendar";
import EventCheckIn from "@/pages/EventCheckIn";
import MediaArchive from "@/pages/MediaArchive";
import Members from "@/pages/Members";
import Membership from "@/pages/Membership";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Tasks from "@/pages/Tasks";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/NotFound";
import { PERSIST_MAX_AGE, queryClient, queryPersister, shouldPersistQuery } from "@/lib/queryClient";

function ProtectedRoutes() {
  const { profile, session, isLoading, profileError, requiresProfileRecovery, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ClublyWorkspaceLoadingScreen title="Opening your OneClub workspace" message="Preparing your campus workspace." />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    if (requiresProfileRecovery) {
      return <ProfileSetup />;
    }

    if (profileError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-xl">
            <ClublyStateCard
              title="We couldn't open your workspace yet"
              message={profileError}
              tone="danger"
            >
              <Button onClick={() => void signOut()} variant="outline">
                Sign out
              </Button>
            </ClublyStateCard>
          </div>
        </div>
      );
    }

    return <ProfileSetup />;
  }

  const effectiveRole = resolveEffectiveRole(profile);

  return <Outlet />;
}

function FrontendApiRouteFallback() {
  return <Navigate to="/" replace />;
}

const allowedRoutes: Record<string, string[]> = {
  student: ["/", "/membership", "/events", "/communications", "/feedback", "/notifications", "/profile"],
  president: ["/", "/clubs", "/proposals", "/events", "/communications", "/notifications", "/profile", "/members", "/dues", "/tasks", "/archive", "/feedback"],
  executive: ["/", "/clubs", "/tasks", "/events", "/communications", "/notifications", "/profile", "/feedback"],
  advisor: ["/", "/approvals", "/proposals", "/events", "/communications", "/notifications", "/profile", "/archive", "/feedback"],
  admin: ["/", "/proposals", "/admin/proposals/review", "/notifications", "/profile", "/events", "/membership", "/members", "/dues", "/communications", "/clubs", "/feedback", "/tasks", "/user-management", "/archive"],
};

function RoleRouteGuard() {
  const { role } = useRole();
  const location = useLocation();
  const allowed = role ? allowedRoutes[role] ?? [] : [];
  const matches = allowed.some((path) => path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`));

  if (!matches) {
    return <AccessDenied reason="This workspace is not available for your current OneClub role." />;
  }

  return <Outlet />;
}

const App = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: queryPersister,
      maxAge: PERSIST_MAX_AGE,
      buster: "v2-public-only",
      dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery }
    }}
  >
    <ThemeProvider attribute="class" themes={["light", "dark"]} defaultTheme="light" enableSystem={false} storageKey="clubly-theme" disableTransitionOnChange>
    <ThemePreferenceMigration />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RoleProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signup/confirm" element={<SignupConfirmation />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/api/v1/*" element={<FrontendApiRouteFallback />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/events/:proposalId/check-in" element={<EventCheckIn />} />
                <Route element={<RoleRouteGuard />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals/new" element={<NewProposal />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/proposals/:id" element={<ProposalDetail />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/events" element={<EventCalendar />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="/membership/clubs/:clubId" element={<Membership />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/dues" element={<Dues />} />
                  <Route path="/dues/:paymentId/proof" element={<DuesProofReview />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/clubs/:clubId/edit" element={<Clubs />} />
                  <Route path="/feedback" element={<Communications defaultTab="feedback" />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/clubs/:clubId/dashboard" element={<AdminClubDashboard />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/user-management/:userId" element={<UserManagement />} />
                  <Route path="/admin/proposals/review" element={<AdminProposalReview />} />
                  <Route path="/archive" element={<MediaArchive />} />
                </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </PersistQueryClientProvider>
);

export default App;
function ThemePreferenceMigration() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== "light" && theme !== "dark") {
      setTheme("light");
    }
  }, [setTheme, theme]);

  return null;
}
