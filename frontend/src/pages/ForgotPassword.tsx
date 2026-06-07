import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserFacingErrorMessage } from "@/lib/api";
import {
  getAllowedEmailDomainLabel,
  getCampusOneOidcAuthUrl,
  getMicrosoftPasswordHelpUrl,
  getPortalAuthUrl,
  isAllowedEmailDomain,
  isCampusOneOidcAuthProvider,
  isPasswordAuthEnabled,
  usesCookieAuthProvider
} from "@/lib/env";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const passwordAuthEnabled = isPasswordAuthEnabled();
  const cookieAuthEnabled = usesCookieAuthProvider();
  const campusOneAuthEnabled = isCampusOneOidcAuthProvider();

  useEffect(() => {
    if (cookieAuthEnabled && !campusOneAuthEnabled) {
      window.location.assign(getPortalAuthUrl("forgot-password", window.location.origin));
    }
  }, [campusOneAuthEnabled, cookieAuthEnabled]);

  if (cookieAuthEnabled && campusOneAuthEnabled) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <section className="flex flex-1 items-center justify-center p-5">
          <div className="nh-card max-w-xl bg-card p-6 text-center md:p-10">
            <BrandLogo size="lg" variant="plain" className="mx-auto mb-5 h-24 w-[22rem] max-w-full" />
            <p className="nh-eyebrow">Account Recovery</p>
            <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Use Campus One recovery</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Club Services does not manage your Campus One password. Use Campus One or your Nile University account recovery options to restore access.
            </p>
            <Button
              className="mt-6 h-14 w-full"
              onClick={() => window.location.assign(getCampusOneOidcAuthUrl("login", "/"))}
            >
              Sign in with Campus One
            </Button>
            <Link className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-black underline underline-offset-4" to="/login">
              <ArrowLeft className="h-4 w-4" />
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
        <div className="nh-card max-w-md bg-card p-6 text-center">
          <BrandLogo size="lg" variant="plain" className="mx-auto mb-4 h-20 w-72 max-w-full" />
          <h1 className="text-2xl font-black uppercase">Opening account recovery</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we send you to the shared portal.</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isAllowedEmailDomain(normalizedEmail)) {
      toast.error("Use your Nile University email", {
        description: `Password reset is limited to ${getAllowedEmailDomainLabel()}.`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSentEmail(normalizedEmail);
      toast.success("Reset email sent", {
        description: "Check your inbox and open the password reset link."
      });
    } catch (error) {
      toast.error("Could not send reset email", {
        description: getUserFacingErrorMessage(error, "Please try again.")
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="flex flex-1 items-center justify-center p-5">
        <div className="w-full max-w-xl">
          <Link className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em]" to="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mb-4 flex flex-col items-center text-center">
            <BrandLogo
              size="lg"
              variant="plain"
              className="mx-auto mb-4 h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
            />
            <p className="nh-eyebrow">Account Recovery</p>
          </div>

          <div className="nh-card bg-card p-6 md:p-10">
            <div className="mb-8 border-b-2 border-foreground pb-6">
              <h1 className="nh-title">Reset Password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your Nile University email and we will send a secure reset link.
              </p>
            </div>

          {passwordAuthEnabled ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="font-black uppercase tracking-[0.12em]" htmlFor="reset-email">
                  University Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="email"
                    className="h-12 pl-11"
                    id="reset-email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@nileuniversity.edu.ng"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Allowed domain: {getAllowedEmailDomainLabel()}</p>
              </div>

              <Button className="h-14 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
              </Button>

              {sentEmail ? (
                <div className="border-2 border-success bg-success/10 p-4 text-sm">
                  <p className="font-black">Reset link sent</p>
                  <p className="mt-1 text-muted-foreground">
                    If an account exists for {sentEmail}, Supabase will send the password reset email.
                  </p>
                </div>
              ) : null}
            </form>
          ) : (
            <div className="space-y-5">
              <div className="border-2 border-foreground bg-muted p-5">
                <p className="font-black uppercase">Microsoft account recovery</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Password reset is handled through your Nile University Microsoft account.
                </p>
              </div>
              <Button asChild className="h-14 w-full">
                <a href={getMicrosoftPasswordHelpUrl()} rel="noreferrer" target="_blank">
                  Open Microsoft password recovery
                </a>
              </Button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 border-2 border-foreground bg-muted p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            <p>
              For security, reset links expire. If the link no longer works, request a fresh one from this page.
            </p>
          </div>
        </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
