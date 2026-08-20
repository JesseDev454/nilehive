import { Bell, ChevronDown, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { useAuth, type PreviewRole } from "@/contexts/AuthContext";
import { isMockPreviewMode } from "@/lib/oneclubMode";

export interface NavigationItem {
  label: string;
  path: string;
  icon: typeof Bell;
}

interface WorkspaceShellProps {
  children: React.ReactNode;
  role: PreviewRole;
  roleLabel: string;
  navigation: NavigationItem[];
  onRoleChange: (role: PreviewRole) => void;
}

const PROFILE_NAMES: Record<PreviewRole, string> = {
  student: "Amina Bello",
  president: "Farouk Aliyu",
  executive: "Fatima Hassan",
  advisor: "Dr. Aliyu Bello",
  admin: "Zainab Ahmed",
};

export function WorkspaceShell({ children, role, roleLabel, navigation, onRoleChange }: WorkspaceShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const mockMode = isMockPreviewMode();
  const displayName = mockMode ? PROFILE_NAMES[role] : (profile.full_name || PROFILE_NAMES[role]);
  const initials = displayName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2);
  const isSelected = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="oneclub-layout">
      <a className="skip-link" href="#workspace-content">Skip to main content</a>
      <aside className="desktop-rail" aria-label={`${roleLabel} navigation`}>
        <Link className="rail-brand" to={`/${role}/home`} aria-label="OneClub home">
          <span className="rail-brand__mark" aria-hidden="true">1</span>
          <span><strong>OneClub</strong><small>Nile University</small></span>
        </Link>
        <nav className="rail-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = isSelected(item.path);
            return (
              <Link key={item.path} to={item.path} className={`rail-link ${selected ? "is-selected" : ""}`} aria-current={selected ? "page" : undefined}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rail-account">
          {mockMode ? (
            <>
              <span className="preview-badge"><ShieldCheck className="h-3.5 w-3.5" /> UI preview</span>
              <span className="text-xs font-semibold text-foreground">{roleLabel}</span>
              <span className="text-xs text-muted-foreground">Mock data only</span>
            </>
          ) : (
            <>
              <span className="preview-badge"><ShieldCheck className="h-3.5 w-3.5" /> Campus One</span>
              <span className="text-xs font-semibold text-foreground">{roleLabel}</span>
              <span className="text-xs text-muted-foreground">{displayName}</span>
            </>
          )}
        </div>
      </aside>

      <div className="workspace-column">
        <header className="workspace-topbar">
          <Link className="mobile-brand" to={`/${role}/home`}><span>1</span><strong>OneClub</strong></Link>
          {mockMode ? (
            <label className="preview-role-control">
              <span>Preview role</span>
              <span className="preview-role-select-wrap">
                <select
                  value={role}
                  onChange={(event) => {
                    const nextRole = event.target.value as PreviewRole;
                    onRoleChange(nextRole);
                    navigate(`/${nextRole}/home`);
                  }}
                  aria-label="Preview a role in development"
                >
                  <option value="student">Student</option>
                  <option value="president">President</option>
                  <option value="executive">Executive</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </label>
          ) : null}
          <div className="topbar-actions">
            <Link className="topbar-icon" to={`/${role}/notifications`} aria-label="Open notifications"><Bell className="h-5 w-5" /></Link>
            <ThemeToggle />
            <Link className="profile-avatar" to={`/${role}/profile`} aria-label={`Open profile for ${displayName}`}>{initials}</Link>
          </div>
        </header>
        <main id="workspace-content" className="workspace-main" tabIndex={-1}>{children}</main>
        <nav className="mobile-navigation" aria-label={`${roleLabel} navigation`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = isSelected(item.path);
            return (
              <Link key={item.path} to={item.path} className={`mobile-nav-link ${selected ? "is-selected" : ""}`} aria-current={selected ? "page" : undefined}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
