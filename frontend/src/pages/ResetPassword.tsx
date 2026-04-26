import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserFacingErrorMessage } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setHasRecoverySession(Boolean(data.session));
      setIsCheckingSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password is too short", {
        description: "Use at least 8 characters."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Retype the same new password in both fields."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      toast.success("Password updated", {
        description: "Sign in again with your new password."
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Could not reset password", {
        description: getUserFacingErrorMessage(error, "Please request a new reset link and try again.")
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-foreground">
      <section className="w-full max-w-xl">
        <Link className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em]" to="/login">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <form className="nh-card bg-card p-6 md:p-10" onSubmit={handleSubmit}>
          <BrandLogo
            size="lg"
            className="mb-6 h-20 w-[19rem] max-w-full sm:h-24 sm:w-[21rem]"
          />
          <div className="mb-8 border-b-2 border-foreground pb-6">
            <p className="nh-eyebrow">Account Recovery</p>
            <h1 className="mt-2 text-4xl font-black uppercase">Set New Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a new password for your Club Services account.
            </p>
          </div>

          {isCheckingSession ? (
            <p className="text-sm text-muted-foreground">Checking reset link...</p>
          ) : hasRecoverySession ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black uppercase tracking-[0.12em]" htmlFor="new-password">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="new-password"
                    className="h-12 pl-11"
                    id="new-password"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Use 8+ characters"
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black uppercase tracking-[0.12em]" htmlFor="confirm-password">
                  Confirm Password
                </Label>
                <Input
                  autoComplete="new-password"
                  className="h-12"
                  id="confirm-password"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Retype password"
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              <Button className="h-14 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Updating password..." : "Update password"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-2 border-destructive bg-destructive/10 p-5">
                <p className="font-black uppercase text-destructive">Reset link unavailable</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This reset link may have expired or already been used. Request a fresh link to continue.
                </p>
              </div>
              <Button asChild className="h-14 w-full">
                <Link to="/forgot-password">Request new reset link</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 border-2 border-foreground bg-muted p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            <p>After your password is updated, you will be signed out and asked to sign in again.</p>
          </div>
        </form>
      </section>
    </main>
  );
}
