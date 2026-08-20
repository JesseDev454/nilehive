import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  FileX2,
  FolderSearch,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  Moon,
  RefreshCw,
  School,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  UserCheck,
  WifiOff
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Banner } from "@/shared/components/Banner";
import { useTheme } from "@/shared/theme";

// Import the 12 shared system screens
import { CampusOneLoginScreen } from "./CampusOneLoginScreen";
import { CampusOneCallbackScreen } from "./CampusOneCallbackScreen";
import { SessionExpiredScreen } from "./SessionExpiredScreen";
import { AccountSuspendedScreen } from "./AccountSuspendedScreen";
import { UnauthorizedRoleScreen } from "./UnauthorizedRoleScreen";
import { NotFoundScreen } from "./NotFoundScreen";
import { OfflineRetryScreen } from "./OfflineRetryScreen";
import { RecoverableErrorScreen } from "./RecoverableErrorScreen";
import { UnsupportedDomainScreen } from "./UnsupportedDomainScreen";
import { ReceiptUploadErrorScreen } from "./ReceiptUploadErrorScreen";
import { SignOutConfirmationDialog } from "./SignOutConfirmationDialog";
import { SharedSkeletonsAndEmptyStates } from "./SharedSkeletonsAndEmptyStates";

export type SharedScreenId =
  | "campusone_login"
  | "campusone_callback"
  | "session_expired"
  | "account_suspended"
  | "unauthorized_role"
  | "not_found"
  | "offline_retry"
  | "recoverable_error"
  | "unsupported_domain"
  | "receipt_error"
  | "sign_out_dialog"
  | "skeletons_empty";

interface ScreenMenuItem {
  id: SharedScreenId;
  title: string;
  category: "Auth & SSO" | "Access & Security" | "Errors & Network" | "Components";
  description: string;
}

const SHARED_SCREENS_LIST: ScreenMenuItem[] = [
  {
    id: "campusone_login",
    title: "1. Continue with Campus One",
    category: "Auth & SSO",
    description: "Pure SSO entry screen without email/password form."
  },
  {
    id: "campusone_callback",
    title: "2. Returning from Campus One",
    category: "Auth & SSO",
    description: "Short stepped loading returning to user destination."
  },
  {
    id: "session_expired",
    title: "3. Session Expired",
    category: "Auth & SSO",
    description: "Expired session with a clear Campus One continuation."
  },
  {
    id: "account_suspended",
    title: "4. Account Unavailable / Suspended",
    category: "Access & Security",
    description: "Unavailable account with a clear support next step."
  },
  {
    id: "unauthorized_role",
    title: "5. Wrong OneClub Role",
    category: "Access & Security",
    description: "Role mismatch boundary with authorized hub links."
  },
  {
    id: "not_found",
    title: "6. Page Not Found (404)",
    category: "Errors & Network",
    description: "OneClub 404 with safe campus destinations."
  },
  {
    id: "offline_retry",
    title: "7. Offline with Retry",
    category: "Errors & Network",
    description: "Preserves cached records with live retry connection."
  },
  {
    id: "recoverable_error",
    title: "8. Recoverable Error",
    category: "Errors & Network",
    description: "Safe-work guidance and a clear retry action."
  },
  {
    id: "unsupported_domain",
    title: "9. Nile Email Domain Required",
    category: "Access & Security",
    description: "Rejection of personal email providers like Gmail."
  },
  {
    id: "receipt_error",
    title: "10. Receipt Size / Format Error",
    category: "Errors & Network",
    description: "Exceeded 5MB limit or unsupported receipt file format."
  },
  {
    id: "sign_out_dialog",
    title: "11. Sign-Out Confirmation",
    category: "Auth & SSO",
    description: "Explicit Cancel / Sign out confirmation dialog."
  },
  {
    id: "skeletons_empty",
    title: "12. Shared Skeletons & Empty State",
    category: "Components",
    description: "Non-blocking skeleton cards and compact empty patterns."
  }
];

export function SharedScreensWorkspace() {
  const { theme, setTheme } = useTheme();
  const [activeScreen, setActiveScreen] = useState<SharedScreenId>("campusone_login");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="shared-screens-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="shared-screens-badge"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              SHARED SYSTEM SCREENS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Standardized System Shell
            </span>
          </div>

          <h1
            id="shared-screens-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            OneClub Shared System Screens
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Universal authentication, error handling, permission boundaries, and offline patterns shared across all OneClub student and officer roles.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-xs font-semibold gap-1.5 h-8.5 px-3"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSignOutOpen(true)}
            className="text-xs font-bold gap-1.5 h-8.5 text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Action Executed"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* HORIZONTAL SCREEN SELECTOR TABS */}
      <section aria-label="Shared System Screens Selector" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Select System Screen ({SHARED_SCREENS_LIST.length} Screens):
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            Current: {SHARED_SCREENS_LIST.find((s) => s.id === activeScreen)?.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SHARED_SCREENS_LIST.map((item) => {
            const isSelected = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveScreen(item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20 font-bold"
                    : "bg-card text-foreground hover:bg-muted/40 border-border/80"
                }`}
                aria-pressed={isSelected}
              >
                <span className="block truncate font-bold">{item.title}</span>
                <span
                  className={`text-[10px] block truncate mt-0.5 ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SCREEN DISPLAY CANVAS */}
      <section
        aria-label="Active System Screen Canvas"
        className="rounded-2xl border border-border/80 bg-muted/10 p-2 sm:p-6 shadow-xs overflow-hidden"
      >
        {activeScreen === "campusone_login" && (
          <CampusOneLoginScreen
            onContinue={() => showToast("Simulated Campus One Single Sign-On triggered.")}
          />
        )}

        {activeScreen === "campusone_callback" && (
          <CampusOneCallbackScreen
            returnTo="/executive/work"
            onContinue={() => showToast("Returning to My work.")}
            onCancel={() => showToast("Callback cancelled safely.")}
          />
        )}

        {activeScreen === "session_expired" && (
          <SessionExpiredScreen
            lastActiveWorkspace="/executive/work"
            onContinue={() => showToast("Re-authenticating Campus One session token...")}
            onSignOut={() => showToast("Signed out safely from expired session.")}
          />
        )}

        {activeScreen === "account_suspended" && (
          <AccountSuspendedScreen
            status="suspended"
            matricNumber="NUG/NAS/21/0312"
            name="Fatima Al-Hassan"
            onSignOut={() => showToast("Signed out of suspended account.")}
          />
        )}

        {activeScreen === "unauthorized_role" && (
          <UnauthorizedRoleScreen
            currentRole="Executive Officer"
            requiredRole="Club Services Admin"
            targetWorkspaceName="Institutional Dues & Governance Oversight"
            onBackToDashboard={() => showToast("Navigating back to Executive Dashboard.")}
          />
        )}

        {activeScreen === "not_found" && (
          <NotFoundScreen
            requestedPath="/executive/undefined-module"
            onGoHome={() => showToast("Navigating to OneClub home.")}
          />
        )}

        {activeScreen === "offline_retry" && (
          <OfflineRetryScreen
            cachedSectionTitle="Executive Task Directives & 148-Student Roster"
            hasCachedData={true}
            onRetry={() => showToast("Network ping test executed.")}
          />
        )}

        {activeScreen === "recoverable_error" && (
          <RecoverableErrorScreen
            errorTitle="Something needs another try"
            errorMessage="OneClub could not refresh this workspace. Your saved work is still available."
            onRetry={() => showToast("Retrying transmission with cached drafts...")}
            onGoHome={() => showToast("Returned to Dashboard.")}
          />
        )}

        {activeScreen === "unsupported_domain" && (
          <UnsupportedDomainScreen
            attemptedEmail="fatima.personal@gmail.com"
            onSwitchAccount={() => showToast("Opening Campus One institutional login selector...")}
          />
        )}

        {activeScreen === "receipt_error" && (
          <ReceiptUploadErrorScreen
            errorType="too_large"
            fileName="official_bank_teller_scan_300dpi.pdf"
            fileSize="16.4 MB"
            maxSize="5.0 MB"
            onSelectAnotherFile={() => showToast("Opening file picker dialog (Max 5MB PDF/PNG)...")}
            onDismiss={() => showToast("Receipt error dismissed.")}
          />
        )}

        {activeScreen === "sign_out_dialog" && (
          <SignOutConfirmationDialog
            isOpen={true}
            inlinePreview={true}
            onClose={() => showToast("Sign out cancelled.")}
            onConfirmSignOut={() => showToast("Session tokens revoked safely.")}
          />
        )}

        {activeScreen === "skeletons_empty" && <SharedSkeletonsAndEmptyStates />}
      </section>

      {/* SIGN OUT CONFIRMATION DIALOG (FOR HEADER BUTTON) */}
      <SignOutConfirmationDialog
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirmSignOut={() => {
          setIsSignOutOpen(false);
          showToast("Signed out of OneClub session.");
        }}
      />
    </main>
  );
}

export default SharedScreensWorkspace;
