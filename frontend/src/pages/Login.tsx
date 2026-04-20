import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Building2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";

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
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedRedirect = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
  const redirectTo = isRoleSensitivePath(requestedRedirect) ? "/" : requestedRedirect;

  if (!isLoading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back to Club Services");
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-10 border-2 border-primary-foreground/20" />
          <div className="absolute -right-28 top-20 h-80 w-80 rotate-45 border-[18px] border-secondary/30" />
          <div className="absolute -bottom-20 left-12 h-72 w-72 rotate-12 border-[18px] border-accent/30" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-primary-foreground bg-secondary shadow-[4px_4px_0_hsl(var(--primary-foreground))]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-foreground/70">Nile University</p>
              <h1 className="text-2xl font-black uppercase tracking-tight">Club Services</h1>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="nh-eyebrow text-primary-foreground/70">Institutional Access</p>
            <h2 className="mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tighter">
              Campus clubs, proposals, and records.
            </h2>
            <p className="mt-6 border-l-4 border-secondary pl-5 text-lg leading-8 text-primary-foreground/82">
              The official workspace for club leadership, student membership, approved events, and Club Services review.
            </p>
          </div>

          <div className="relative z-10 border-2 border-primary-foreground/40 bg-primary/70 p-5">
            <p className="text-sm font-black uppercase tracking-[0.14em]">Notice to Students</p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Use your Nile University email address. Advisor and admin access is assigned by Club Services.
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-xl">
            <div className="mb-8 lg:hidden">
              <p className="nh-eyebrow">Nile University</p>
              <h1 className="nh-title mt-2">Club Services</h1>
            </div>

            <form className="nh-card bg-card p-6 md:p-10" onSubmit={handleSubmit}>
              <div className="mb-8 border-b-2 border-foreground pb-6">
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
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="login-student-id">
                    University ID
                  </Label>
                  <NhStudentId id="login-student-id" value={studentId} onChange={setStudentId} disabled />
                  <p className="text-xs text-muted-foreground">
                    University ID login needs account mapping first. Use your university email for now.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="font-black uppercase tracking-[0.12em]" htmlFor="password">
                      Password
                    </Label>
                    <span className="text-xs font-bold text-muted-foreground">Contact Club Services for support</span>
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

                <div className="border-2 border-foreground bg-muted p-4 text-sm">
                  New club officer or student?{" "}
                  <Link className="font-black underline underline-offset-4" to="/signup">
                    Set up your profile
                  </Link>
                </div>

                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <p>Real users should use a Nile University email address. Admin and advisor roles are assigned by Club Services.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
