import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, School, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCampusOneOidcAuthUrl,
  getPortalAuthUrl,
  getMicrosoftPasswordHelpUrl,
  isCampusOneOidcAuthProvider,
  isPasswordAuthEnabled,
  usesCookieAuthProvider
} from "@/lib/env";
import { getUserFacingErrorMessage } from "@/lib/api";

function isRoleSensitivePath(pathname: string) {
  return (
    pathname === "/proposals" ||
    pathname === "/proposals/new" ||
    pathname.startsWith("/proposals/") ||
    pathname === "/approvals" ||
    pathname === "/dues" ||
    pathname === "/archive" ||
    pathname === "/user-management"
  );
}

export default function Login() {
  const { signIn, session, isLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedRedirect = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
  const redirectTo = isRoleSensitivePath(requestedRedirect) ? "/" : requestedRedirect;
  const searchParams = new URLSearchParams(location.search);
  const isSignedOutView = searchParams.get("signed_out") === "1";
  const authError = searchParams.get("auth_error");
  const passwordAuthEnabled = isPasswordAuthEnabled();
  const cookieAuthEnabled = usesCookieAuthProvider();
  const campusOneAuthEnabled = isCampusOneOidcAuthProvider();

  useEffect(() => {
    if (cookieAuthEnabled && !campusOneAuthEnabled && !isSignedOutView && !isLoading && !session) {
      window.location.assign(getPortalAuthUrl("sign-in", `${window.location.origin}${redirectTo}`));
    }
  }, [campusOneAuthEnabled, cookieAuthEnabled, isLoading, isSignedOutView, redirectTo, session]);

  useEffect(() => {
    if (authError === "cancelled") {
      toast.error("Sign-in was cancelled", {
        description: "Click Sign in with Campus One when you are ready to continue."
      });
    } else if (authError === "failed") {
      toast.error("Campus One sign-in could not be completed", {
        description: "Please try again. If it keeps happening, contact Club Services."
      });
    }
  }, [authError]);

  if (!isLoading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  if (cookieAuthEnabled && campusOneAuthEnabled) {
    const statusMessage = authError === "cancelled"
      ? "Sign-in was cancelled. Click Sign in with Campus One when you are ready to continue."
      : authError === "failed"
        ? "Campus One sign-in could not be completed. Please try again or contact Club Services."
        : isSignedOutView
          ? "You have signed out of Club Services. Your CampusOne session may still be active."
          : "Use your Nile University Campus One account. No separate password needed.";

    return (
      <main className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <section className="relative flex min-h-screen flex-1 items-center justify-center p-5 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--accent)/0.7)_1.4px,transparent_0)] bg-[length:28px_28px]" />
          <div className="absolute left-8 top-10 hidden h-40 w-40 rotate-12 rounded-[32px] border-[14px] border-secondary/25 md:block" />
          <div className="absolute bottom-10 right-10 hidden h-56 w-56 -rotate-12 rounded-[44px] border-[18px] border-primary/15 lg:block" />

          <section className="nh-card relative z-10 w-full max-w-2xl bg-card p-6 text-center md:p-10">
            <div className="absolute -left-5 -top-5 rounded-full border-3 border-foreground bg-accent px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_hsl(var(--neo-shadow))]">
              CampusOne SSO
            </div>
            <div className="mx-auto mb-8 flex justify-center" aria-hidden="true">
              <div className="club-logo-orbit">
                <span className="club-logo-orbit-ring club-logo-orbit-ring-primary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-green" />
                </span>
                <span className="club-logo-orbit-ring club-logo-orbit-ring-secondary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-blue" />
                </span>
                <span className="club-logo-orbit-ring club-logo-orbit-ring-tertiary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-sky" />
                </span>
                <div className="club-logo-core">
                  <School className="h-8 w-8" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-black leading-none tracking-[-0.05em] md:text-7xl">
              Welcome Back.
            </h1>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Sign in with your Nile University account
            </p>

            <div className="mx-auto my-8 h-1 max-w-md rounded-full bg-accent" />

            <div className="mx-auto max-w-xl rounded-[24px] border-3 border-foreground bg-muted p-5 text-left shadow-neo-sm">
              <p className="text-2xl font-black tracking-[-0.04em]">Single Sign-On</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use your Nile University CampusOne account. No separate password needed. Club Services applies your correct club access after sign-in.
              </p>
            </div>

            {(isSignedOutView || authError === "cancelled" || authError === "failed") ? (
              <div className={`mt-6 rounded-[18px] border-3 p-4 text-left text-sm font-bold ${
                authError === "cancelled" || authError === "failed"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-success bg-success/15 text-foreground"
              }`}>
                {statusMessage}
              </div>
            ) : null}

            <Button
              className="mt-8 h-14 w-full text-base font-black uppercase tracking-[0.08em]"
              onClick={() => window.location.assign(getCampusOneOidcAuthUrl("login", redirectTo))}
            >
              Sign in with Campus One
              <ArrowRight className="h-5 w-5" />
            </Button>
          </section>
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (cookieAuthEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="nh-card max-w-md bg-card p-6 text-center">
          <BrandLogo size="lg" variant="plain" className="mx-auto mb-4 h-20 w-72 max-w-full" />
          <h1 className="text-2xl font-black uppercase">Opening sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we send you to the shared portal.</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back to Club Services");
      } catch (error) {
        toast.error("We couldn’t sign you in", {
          description: getUserFacingErrorMessage(error, "Please check your details and try again.")
        });
      } finally {
        setIsSubmitting(false);
      }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="grid min-h-screen flex-1 lg:grid-cols-[1fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-10 border-2 border-primary-foreground/20" />
          <div className="absolute -right-28 top-20 h-80 w-80 rotate-45 border-[18px] border-secondary/30" />
          <div className="absolute -bottom-20 left-12 h-72 w-72 rotate-12 rounded-[44px] border-[18px] border-accent/30" />

          <div className="relative z-10 max-w-xl">
            <p className="nh-eyebrow text-primary-foreground/70">Institutional Access</p>
            <h2 className="mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tighter">
              Campus clubs, proposals, and records.
            </h2>
            <p className="mt-6 border-l-4 border-secondary pl-5 text-lg leading-8 text-primary-foreground/82">
              The official workspace for club leadership, student membership, events, and Club Services review.
            </p>
          </div>

          <div className="relative z-10 rounded-[24px] border-2 border-primary-foreground/40 bg-primary/70 p-5">
            <p className="text-sm font-black uppercase tracking-[0.14em]">Notice to Students</p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Use your Nile University email address. Campus One manages shared sign-in and admin access, while Club Services manages student, advisor, and leadership roles locally.
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <BrandLogo
                size="lg"
                variant="plain"
                className="mx-auto mb-4 h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
              />
              <p className="nh-eyebrow">Nile University</p>
              <h1 className="nh-title mt-2">Club Services</h1>
            </div>

            <form className="nh-card bg-card p-6 md:p-10" onSubmit={handleSubmit}>
              <div className="mb-8 border-b-3 border-foreground pb-6">
                <p className="nh-eyebrow">Access Portal</p>
                <h2 className="mt-2 text-4xl font-black uppercase">Sign In</h2>
                <p className="mt-2 text-sm text-muted-foreground">Access your Club Services workspace.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="email">
                    University Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 pl-11"
                      id="email"
                      autoComplete="email"
                      placeholder="name@nileuniversity.edu.ng"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="font-black uppercase tracking-[0.12em]" htmlFor="password">
                      Password
                    </Label>
                    {passwordAuthEnabled ? (
                      <Link className="text-xs font-black text-foreground underline underline-offset-4" to="/forgot-password">
                        Forgot password?
                      </Link>
                    ) : (
                      <a
                        className="text-xs font-black text-foreground underline underline-offset-4"
                        href={getMicrosoftPasswordHelpUrl()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Microsoft password help
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 pl-11"
                      id="password"
                      autoComplete="current-password"
                      placeholder="Enter password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button className="h-14 w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <div className="rounded-[18px] border-3 border-foreground bg-muted p-4 text-sm">
                  New club officer or student?{" "}
                  <Link className="font-black underline underline-offset-4" to="/signup">
                    Create an account
                  </Link>
                </div>

                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <p>Real users should use a Nile University email address. Campus One handles the shared sign-in, while Club Services applies club-specific access after login.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
