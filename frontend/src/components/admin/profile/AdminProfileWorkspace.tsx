import { useAuth } from "@/contexts/AuthContext";
import {
  ADMIN_ROLE_CAPABILITIES,
  DETERMINISTIC_ADMIN_PROFILE,
  displayOrNotProvided,
  type AdminProfileDetails,
} from "@/data/adminProfileData";
import { AdminProfileHeader } from "@/components/admin/profile/AdminProfileHeader";
import { AdminIdentityCard } from "@/components/admin/profile/AdminIdentityCard";
import { AdminRoleScopeCard } from "@/components/admin/profile/AdminRoleScopeCard";
import { AdminThemePreferencesCard } from "@/components/admin/profile/AdminThemePreferencesCard";
import { AdminSignOutDialog } from "@/components/admin/profile/AdminSignOutDialog";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export function AdminProfileWorkspace() {
  const { sessionProfile, user, app_role, portal_role, custom_roles, effective_role, account_status } = useAuth();
  const mockMode = isMockPreviewMode();

  const adminDetails: AdminProfileDetails = mockMode
    ? DETERMINISTIC_ADMIN_PROFILE
    : {
        id: sessionProfile?.id || "unknown",
        name: displayOrNotProvided(sessionProfile?.full_name),
        email: displayOrNotProvided(sessionProfile?.email || user.email),
        staffId: displayOrNotProvided(sessionProfile?.student_id),
        portalUserId: displayOrNotProvided(sessionProfile?.portal_user_id),
        portalRole: displayOrNotProvided(portal_role || sessionProfile?.portal_role),
        appRole: displayOrNotProvided(app_role || sessionProfile?.app_role),
        effectiveRole: displayOrNotProvided(effective_role || sessionProfile?.effective_role),
        customRoles: custom_roles.length ? custom_roles : sessionProfile?.custom_roles || [],
        accountStatus: displayOrNotProvided(account_status || sessionProfile?.account_status),
        department: displayOrNotProvided(""),
        authProvider: "Nile University Campus One Single Sign-On (OIDC)",
        governanceScope: "All official Nile University student clubs",
        authorities: ADMIN_ROLE_CAPABILITIES,
      };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-fade-in pb-16" data-profile-source={mockMode ? "mock" : "integrated"}>
      <AdminProfileHeader profile={adminDetails} />
      <div className="space-y-5">
        <AdminIdentityCard profile={adminDetails} />
        <AdminRoleScopeCard profile={adminDetails} />
        <AdminThemePreferencesCard />
        <AdminSignOutDialog />
      </div>
    </div>
  );
}
