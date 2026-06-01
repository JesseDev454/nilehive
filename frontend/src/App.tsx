import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import { NeoLoadingState, NeoStateCard } from "@/components/NeoBrutal";
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
import Analytics from "@/pages/Analytics";
import AdminClubDashboard from "@/pages/AdminClubDashboard";
import Communications from "@/pages/Communications";
import Clubs from "@/pages/Clubs";
import Dues from "@/pages/Dues";
import EventCalendar from "@/pages/EventCalendar";
import EventCheckIn from "@/pages/EventCheckIn";
import MediaArchive from "@/pages/MediaArchive";
import Members from "@/pages/Members";
import Membership from "@/pages/Membership";
import Notifications from "@/pages/Notifications";
import Tasks from "@/pages/Tasks";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/NotFound";
import { queryClient } from "@/lib/queryClient";

function ProtectedRoutes() {
  const { profile, session, isLoading, profileError, requiresProfileRecovery, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-xl">
          <NeoLoadingState
            title="Getting your account ready"
            message="Please wait while we open your Club Services workspace."
            delayedMessage="This is taking longer than usual. Please check your network connection."
          />
        </div>
      </div>
    );
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
            <NeoStateCard
              title="We couldn't open your workspace yet"
              message={profileError}
              tone="danger"
            >
              <Button onClick={() => void signOut()} variant="outline">
                Sign out
              </Button>
            </NeoStateCard>
          </div>
        </div>
      );
    }

    return <ProfileSetup />;
  }

  const effectiveRole = profile.effective_role ?? profile.role;

  if (effectiveRole === "feedback_manager" && location.pathname !== "/feedback") {
    return <Navigate to="/feedback" replace />;
  }

  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <Route element={<ProtectedRoutes />}>
                <Route path="/events/:proposalId/check-in" element={<EventCheckIn />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals/new" element={<NewProposal />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/proposals/:id" element={<ProposalDetail />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/events" element={<EventCalendar />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="/membership/clubs/:clubId" element={<Membership />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/dues" element={<Dues />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/feedback" element={<Communications defaultTab="feedback" />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/clubs/:clubId/dashboard" element={<AdminClubDashboard />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/archive" element={<MediaArchive />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
