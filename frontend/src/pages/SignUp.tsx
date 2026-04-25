import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain } from "@/lib/env";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";
import { isValidStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";

export default function SignUp() {
  const { signUp, session, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [clubName, setClubName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery(publicClubsQueryOptions);

  if (!isLoading && session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSignupError(null);

    if (!clubName) {
      const message = "Please select your club before creating an account.";
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (!isAllowedEmailDomain(email)) {
      const message = `Please use your Nile University email address (${getAllowedEmailDomainLabel()}).`;
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (!isValidStudentId(studentId)) {
      setSignupError(STUDENT_ID_ERROR_MESSAGE);
      toast.error("Signup failed", { description: STUDENT_ID_ERROR_MESSAGE });
      setIsSubmitting(false);
      return;
    }

    try {
      await signUp({
        email,
        password,
        fullName,
        requestedRole: "student",
        clubName,
        studentId
      });
      toast.success("Account request created", {
        description: "After confirming your email, log in and complete your Club Services profile setup."
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please check the form and try again.";
      setSignupError(message);
      toast.error("Signup failed", {
        description: message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-5 text-foreground md:p-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6">
          <div className="space-y-4">
            <BrandLogo
              size="lg"
              variant="plain"
              className="h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
            />
            <div>
              <p className="nh-eyebrow">Official university platform</p>
              <h1 className="text-2xl font-black uppercase">Club Services</h1>
            </div>
          </div>

          <div className="nh-card-dark p-8">
            <p className="nh-eyebrow text-primary-foreground/70">New Profile</p>
            <h2 className="mt-3 text-5xl font-black uppercase leading-none md:text-6xl">Join an official club workspace.</h2>
            <p className="mt-5 border-l-4 border-secondary pl-4 text-primary-foreground/80">
              Create your account, pick your club, and start with safe student access. Leadership applications happen after dues verification.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="nh-card p-5">
              <ShieldCheck className="h-7 w-7 text-secondary" />
              <h3 className="mt-4 font-black uppercase">Official access</h3>
              <p className="mt-2 text-sm text-muted-foreground">Advisor and admin roles are assigned by Club Services.</p>
            </div>
            <div className="nh-card p-5">
              <Users className="h-7 w-7 text-secondary" />
              <h3 className="mt-4 font-black uppercase">Club context</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your club selection helps route your first membership request.</p>
            </div>
          </div>
        </aside>

        <form className="nh-card bg-card p-6 md:p-10" onSubmit={handleSubmit}>
          <div className="mb-8 border-b-2 border-foreground pb-6">
            <p className="nh-eyebrow">Profile Setup</p>
            <h2 className="mt-2 text-4xl font-black uppercase">Create Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Nile University email. You will complete your profile after email confirmation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="full-name">
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

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="student-id">
                University ID
              </Label>
              <NhStudentId id="student-id" value={studentId} onChange={setStudentId} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="signup-email">
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

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]">Club Association</Label>
              <Select disabled={isLoadingClubs || clubsFailed || clubs.length === 0} value={clubName} onValueChange={setClubName}>
                <SelectTrigger className="border-2 border-input bg-card">
                  <SelectValue
                    placeholder={
                      isLoadingClubs
                        ? "Loading official clubs..."
                        : clubsFailed
                          ? "Club list unavailable"
                          : "Select primary club"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.name}>
                      {club.name}{club.code ? ` (${club.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isLoadingClubs
                  ? "We are loading the official signup clubs."
                  : clubsFailed
                    ? (clubsError instanceof Error ? clubsError.message : "We could not load clubs right now. Please refresh and try again.")
                    : clubs.length === 0
                      ? "No clubs are available yet. Ask Club Services to add the official clubs for production."
                      : "Official clubs appear here automatically. If no clubs are marked public yet, NileHive falls back to the current club directory."}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]">Starting Access</Label>
              <div className="border-2 border-input bg-card px-4 py-3 text-sm font-black uppercase">
                Student
              </div>
              <p className="text-xs text-muted-foreground">
                Executive and president applications open after your membership is active.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="signup-password">
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
            </div>
          </div>

          {signupError && (
            <div className="mt-6 border-2 border-destructive bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {signupError}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Button className="h-14 w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Complete registration"}
              <ArrowRight className="h-5 w-5" />
            </Button>

            <div className="flex items-start gap-3 border-2 border-foreground bg-muted p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <p>
                Everyone starts safely as a student. Advisor and admin roles are assigned by Club Services.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="font-black text-foreground underline underline-offset-4" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
