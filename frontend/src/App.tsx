import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ProfileSetup from "@/pages/ProfileSetup";
import SignUp from "@/pages/SignUp";
import NewProposal from "@/pages/NewProposal";
import Proposals from "@/pages/Proposals";
import ProposalDetail from "@/pages/ProposalDetail";
import Approvals from "@/pages/Approvals";
import Analytics from "@/pages/Analytics";
import Communications from "@/pages/Communications";
import Dues from "@/pages/Dues";
import EventCalendar from "@/pages/EventCalendar";
import MediaArchive from "@/pages/MediaArchive";
import Members from "@/pages/Members";
import Membership from "@/pages/Membership";
import Notifications from "@/pages/Notifications";
import Tasks from "@/pages/Tasks";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { profile, session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading NileHive...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return <ProfileSetup />;
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
              <Route element={<ProtectedRoutes />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals/new" element={<NewProposal />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/proposals/:id" element={<ProposalDetail />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/events" element={<EventCalendar />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/dues" element={<Dues />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/tasks" element={<Tasks />} />
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
