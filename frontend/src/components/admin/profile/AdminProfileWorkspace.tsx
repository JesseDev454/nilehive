import { useAuth } from "@/contexts/AuthContext";
import {
  DETERMINISTIC_ADMIN_PROFILE,
  type AdminProfileDetails
} from "@/data/adminProfileData";
import { AdminProfileHeader } from "@/components/admin/profile/AdminProfileHeader";
import { AdminIdentityCard } from "@/components/admin/profile/AdminIdentityCard";
import { AdminRoleScopeCard } from "@/components/admin/profile/AdminRoleScopeCard";
import { AdminThemePreferencesCard } from "@/components/admin/profile/AdminThemePreferencesCard";
import { AdminSignOutDialog } from "@/components/admin/profile/AdminSignOutDialog";

export function AdminProfileWorkspace() {
  const { profile, user } = useAuth();

  // Combine live auth user/profile if available with deterministic fallback
  const adminDetails: AdminProfileDetails = {
    ...DETERMINISTIC_ADMIN_PROFILE,
    name: profile?.full_name || DETERMINISTIC_ADMIN_PROFILE.name,
    email: user?.email || profile?.full_name ? `${profile?.full_name?.toLowerCase().replace(/\s+/g, ".")}@nileuniversity.edu.ng` : DETERMINISTIC_ADMIN_PROFILE.email,
    staffId: profile?.student_id || DETERMINISTIC_ADMIN_PROFILE.staffId,
    department: profile?.department || DETERMINISTIC_ADMIN_PROFILE.department
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-fade-in pb-16">
      {/* Profile Header */}
      <AdminProfileHeader profile={adminDetails} />

      {/* Main Content Stack */}
      <div className="space-y-5">
        {/* Campus One Identity (Read-Only) */}
        <AdminIdentityCard profile={adminDetails} />

        {/* OneClub Role Scope & Institutional Authority (Read-Only, No Switcher) */}
        <AdminRoleScopeCard profile={adminDetails} />

        {/* Interface Display Mode (Moon/Sun Theme Switcher) */}
        <AdminThemePreferencesCard />

        {/* Session Security & Sign Out Confirmation */}
        <AdminSignOutDialog />
      </div>
    </div>
  );
}
