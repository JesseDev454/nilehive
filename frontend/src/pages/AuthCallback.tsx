import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClublyPanel, ClublyStateCard } from "@/components/OneClub";
import { useAuth } from "@/contexts/AuthContext";

const callbackMessages: Record<string, { title: string; message: string }> = {
  campusone_unavailable: {
    title: "CampusOne sign-in is unavailable",
    message: "CampusOne could not be reached. Try again, or use the Nile University Microsoft sign-in option if it is available."
  },
  callback_failed: {
    title: "CampusOne callback failed",
    message: "We could not complete the secure sign-in return. Try again from the login page."
  },
  access_pending: {
    title: "Access pending",
    message: "Your account is waiting for OneClub approval. You can safely sign out and check again later."
  },
  unauthorized_role: {
    title: "This role cannot open OneClub",
    message: "Your CampusOne identity is active, but it does not map to a OneClub role for this workspace."
  },
  session_expired: {
    title: "Your session expired",
    message: "Sign in again to continue where you left off."
  },
  network_error: {
    title: "Network error",
    message: "OneClub could not verify your session because the network dropped. Try again when your connection is stable."
  },
  qr_return_failed: {
    title: "Check-in return needs sign-in",
    message: "Sign in again and OneClub will return you to the QR check-in page when possible."
  }
};

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();
  const status = searchParams.get("status") ?? searchParams.get("error");
  const returnTo = searchParams.get("returnTo") || searchParams.get("redirect_to") || "/";
  const message = useMemo(() => (status ? callbackMessages[status] : null), [status]);

  if (message) {
    return (
      <main className="clb-screen flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <ClublyStateCard icon={AlertTriangle} title={message.title} message={message.message} tone="danger">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/login">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out safely
              </Button>
            </div>
          </ClublyStateCard>
        </div>
      </main>
    );
  }

  return (
    <main className="clb-screen flex min-h-screen items-center justify-center p-6">
      <ClublyPanel className="w-full max-w-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="clb-eyebrow mt-6">CampusOne callback</p>
        <h1 className="clb-title mt-2 text-3xl">Finishing secure sign-in</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          OneClub is verifying your Nile University session. If you came from a QR check-in, we will return you to the check-in page after sign-in.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
            <div>
              <p className="font-semibold text-foreground">Return destination</p>
              <p className="mt-1 break-all text-muted-foreground">{returnTo}</p>
            </div>
          </div>
        </div>
        <Button asChild className="mt-6">
          <Link to={returnTo}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </ClublyPanel>
    </main>
  );
}
