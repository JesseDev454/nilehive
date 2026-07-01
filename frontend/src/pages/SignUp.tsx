import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllowedEmailDomainLabel,
  getCampusOneOidcAuthUrl,
  getPortalAuthUrl,
  isAllowedEmailDomain,
  isCampusOneOidcAuthProvider,
  usesCookieAuthProvider
} from "@/lib/env";
import { getUserFacingErrorMessage } from "@/lib/api";

const REQUESTED_ROLES = [
  { value: "student", label: "Student" },
  { value: "advisor", label: "Advisor" }
] as const;

export default function SignUp() {
  const { signUp, session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [requestedRole, setRequestedRole] = useState<(typeof REQUESTED_ROLES)[number]["value"]>("student");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const cookieAuthEnabled = usesCookieAuthProvider();
  const campusOneAuthEnabled = isCampusOneOidcAuthProvider();

  useEffect(() => {
    if (cookieAuthEnabled && !campusOneAuthEnabled && !isLoading && !session) {
      window.location.assign(getPortalAuthUrl("sign-up", window.location.origin));
    }
  }, [campusOneAuthEnabled, cookieAuthEnabled, isLoading, session]);

  if (!isLoading && session) {
    return <Navigate to="/" replace />;
  }

  if (cookieAuthEnabled && campusOneAuthEnabled) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <section className="flex flex-1 items-center justify-center p-5">
          <div className="clb-card max-w-xl bg-card p-6 text-center md:p-10">
            <BrandLogo size="lg" variant="plain" className="mx-auto mb-5 h-24 w-[22rem] max-w-full" />
            <p className="clb-eyebrow">Campus One Access</p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">No separate signup needed</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Club Services uses your Nile University CampusOne account. Sign in with CampusOne, then Club Services will open or create your local club profile.
            </p>
            <Button
              className="mt-6 h-14 w-full"
              onClick={() => window.location.assign(getCampusOneOidcAuthUrl("login", "/"))}
            >
              Sign in with CampusOne
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Link className="mt-5 inline-block text-sm font-bold underline underline-offset-4" to="/login">
              Back to sign in
            </Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (cookieAuthEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="clb-card max-w-md bg-card p-6 text-center">
          <BrandLogo size="lg" variant="plain" className="mx-auto mb-4 h-20 w-72 max-w-full" />
          <h1 className="text-2xl font-bold">Opening signup</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we send you to the shared portal.</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSignupError(null);

    if (!isAllowedEmailDomain(email)) {
      const message = `Please use your Nile University email address (${getAllowedEmailDomainLabel()}).`;
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signUp({
        email,
        password,
        fullName,
        requestedRole
      });

      if (result.needsEmailConfirmation) {
        toast.success("Verification email sent", {
          description: "Check your Nile University inbox, confirm your email, then sign in."
        });
        navigate(`/signup/confirm?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          replace: true
        });
        return;
      }

      toast.success("Account created", {
        description: "Your Club Services account is ready. Explore and join a club from Discover Clubs."
      });
      navigate("/", { replace: true });
    } catch (error) {
      const message = getUserFacingErrorMessage(error, "Please check the form and try again.");
      setSignupError(message);
      toast.error("Signup failed", {
        description: message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-6 p-5 md:p-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <aside className="space-y-5 pt-2">
          <div>
            <BrandLogo
              size="lg"
              variant="plain"
              className="h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
            />
          </div>

          <div className="clb-card bg-primary text-primary-foreground p-7">
            <p className="clb-eyebrow text-primary-foreground/70">New Account</p>
            <h2 className="mt-3 text-4xl font-bold leading-none md:text-5xl">Create your account first, then join a club.</h2>
            <p className="mt-4 border-l-4 border-secondary pl-4 text-primary-foreground/80">
              Signup takes under a minute. Once inside, browse the clubs directory and submit your paid membership request from the club's join page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="clb-card p-4">
              <ShieldCheck className="h-7 w-7 text-secondary" />
              <h3 className="mt-3 font-bold">Official access</h3>
              <p className="mt-2 text-sm text-muted-foreground">Choose the role that matches your real university position  Estudent or faculty advisor.</p>
            </div>
            <div className="clb-card p-4">
              <Users className="h-7 w-7 text-secondary" />
              <h3 className="mt-3 font-bold">Join after signup</h3>
              <p className="mt-2 text-sm text-muted-foreground">Explore every club and submit your payment details from the dedicated join page at your own pace.</p>
            </div>
          </div>
        </aside>

        <form className="clb-card bg-card p-5 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 border-b border-border/70 pb-5">
            <p className="clb-eyebrow">Account Creation</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Create Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Nile University email. You will join a club separately after account creation.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-bold tracking-[0.12em]">User Role</Label>
              <Select value={requestedRole} onValueChange={(value) => setRequestedRole(value as (typeof REQUESTED_ROLES)[number]["value"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your user role" />
                </SelectTrigger>
                <SelectContent>
                  {REQUESTED_ROLES.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold tracking-[0.12em]" htmlFor="full-name">
                Full Name
              </Label>
              <Input
                id="full-name"
                placeholder="As it appears on your ID"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold tracking-[0.12em]" htmlFor="signup-email">
                Nile University Email
              </Label>
              <Input
                id="signup-email"
                placeholder="name@nileuniversity.edu.ng"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Allowed domain: {getAllowedEmailDomainLabel()}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold tracking-[0.12em]" htmlFor="signup-password">
                Password
              </Label>
              <Input
                id="signup-password"
                placeholder="Use 8+ characters"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                {requestedRole === "advisor"
                  ? "Advisor accounts are assigned to a club by Club Services after account creation."
                  : "After signup, go to Discover Clubs to browse clubs and submit your membership payment."}
              </p>
            </div>
          </div>

          {signupError && (
            <div className="mt-6 border border-destructive bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {signupError}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Button className="h-14 w-full" disabled={isSubmitting} type="submit" id="signup-submit-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex items-start gap-3 border border-border bg-muted p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <p>
                {requestedRole === "advisor"
                  ? "Advisor accounts use your Nile email. Club Services assigns you to the right club after your account is active."
                  : "Students sign up with their Nile email, then pick a club and attach payment details from the Discover Clubs page."}
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="font-bold text-foreground underline underline-offset-4" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
