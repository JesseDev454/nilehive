import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";

const CAMPUS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBOcyl3fQGGd0BuSaw42oMg7F_dWb7g2BnM1yAu0MhjS0f_63-3dUn4MeLyFEL4vWMR7FdZzhUWAxPObtqy9hoZSC1V6Pu3JWi98dgdcT3YAgvcU3Hm-SaRBilgKGE0c0coHaHUFbtJJ7UORjiYf3IazHNbSUWlJBmk5hGsLMMNj9DTscApRXr4MG1WHLGBbTdiLlLJE25VWkNCUSA_nbUCnD2jBoKlpZ0L62tJvpgxGXjvNBOx3GA2iGXiiygLBYCUP4ORbboS9-M4";

const STUDENT_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsPJsXtLpg7aXabPr4SK-LfpzwabRbFdTdmRGMJP-SDYM-fNhjQN3GK20iBHPbMo5uscc7HhSa_BX3bjGBNrkanMvSDS_4cQQXDqNju3ZeLHe262kdhJb49X0nLFIgCWE4lP8GNY5fZLZlZq8wFBp8EWnGBdi-esmXaJrgsgSviWcBw9fAnawMvO_5AA-bWcFSEDX_tIoMZdZRvtnGk-IMursZJNXdNQq_2OfiyhgIHioZnRPe4gLQB_CO0OGEwqRf7Qhx5OawczjG",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCTBKfyBLfXu6Rl3U71wJyKQo9HgnqqCprBn93UcMQ6ZXor3nn5WZiLXs6YxcbUoLQttFVZpXf-Su6AQ0jpXUqpmUymgbUIJWQovXcIHNOALaQsISoZRYVHHs--Cxwo57NodWh7k81CJalq6WGZ-R3wcwGn8mFZgADSfjfdVsXlBhtNgxvujSX8bl54pFOLW4b3MetGrrGvH9S8v4XaAhA0IzsJ9GvP3_AAi2k3SCX1VWlVbUVjjuoGm5JOZxNGmVAyEgcahv8nqAw6",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBKCFuR5sxW97e1KKXOyzCinV_iIK5QM2BR5-vWKR8_HWks0m21Za8LGo3xs8gKhjNbAm-9Mw6lVmoRUAreDKOtjEdyzWD6UUyK5xX9zU09W1eygQLZlp7tFAlyC9zR5c0vHBQPUeUCCe7CxAAjUOo8Vz_w_8JRiTsRhnxUPj3A-PoIlepj_CY6wj_gFc1TyZQuOPiY4HMXR5FPgiHlsgzScsK12hP8u85YpKCij69BA5bRs-2sB5RxhJ39_iX4KDtGWlGwVHs4TxK_"
];

export default function Login() {
  const { signIn, session, isLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  if (!isLoading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back to NileHive");
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fafd] p-4 sm:p-6 flex items-center justify-center text-[#181c1e]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,185,66,0.14),rgba(13,91,188,0.06)_38%,transparent_70%)]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#8af9ae]/20 blur-[120px]" />
      <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[#629afe]/15 blur-[100px]" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_4px_30px_rgba(11,35,71,0.08)] md:grid-cols-12">
        <div className="relative hidden min-h-[680px] overflow-hidden bg-[#0b2347] p-12 md:col-span-7 md:flex md:flex-col md:justify-between">
          <img
            alt="Modern Nile University campus architecture"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            src={CAMPUS_IMAGE}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#000d27]/75 via-[#0b2347]/70 to-[#002a13]/70" />
          <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[#629afe]/20 blur-[80px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d5bbc] text-white shadow-lg">
              <Network className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-2xl">NileHive</span>
          </div>

          <div className="relative z-10 mt-auto">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">
              Empowering Student <br />
              <span className="text-[#8af9ae]">Innovation & Synergy.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-[#b2c7f4]">
              The central hub for Nile University of Nigeria club operations, proposal management,
              and collaborative excellence.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {STUDENT_AVATARS.map((avatar) => (
                  <img
                    alt="NileHive student avatar"
                    className="h-10 w-10 rounded-full border-2 border-[#0b2347] object-cover"
                    key={avatar}
                    src={avatar}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wide text-white">Join active campus clubs</span>
                <span className="text-xs text-[#b2c7f4]">Managing proposals, approvals, and events</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col justify-center p-8 sm:p-10 lg:p-16">
          <div className="mb-10">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0b2347] text-white">
                <Network className="h-5 w-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#000d27]">NileHive</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d5bbc]">
              Club Services Platform
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#181c1e]">Welcome back</h2>
            <p className="mt-2 text-sm font-medium text-[#44474e]">
              Access your club dashboard and proposals.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="font-semibold text-[#181c1e]" htmlFor="email">
                University Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#75777f]" />
                <Input
                  className="h-13 rounded-2xl border-0 bg-[#f1f4f7] py-6 pl-12 font-medium focus-visible:ring-[#0d5bbc]/30"
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
              <Label className="font-semibold text-[#181c1e]" htmlFor="login-student-id">
                Student ID
              </Label>
              <NhStudentId id="login-student-id" value={studentId} onChange={setStudentId} disabled />
              <p className="px-1 text-[11px] font-medium text-[#75777f]">
                Student ID login needs account mapping first. Use your university email for now.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-[#181c1e]" htmlFor="password">
                  Password
                </Label>
                <button className="text-xs font-bold text-[#0d5bbc] hover:underline" type="button">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#75777f]" />
                <Input
                  className="h-13 rounded-2xl border-0 bg-[#f1f4f7] py-6 pl-12 font-medium focus-visible:ring-[#0d5bbc]/30"
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

            <div className="flex items-center gap-3">
              <Checkbox id="remember-me" />
              <Label className="text-sm font-medium text-[#44474e]" htmlFor="remember-me">
                Keep me signed in
              </Label>
            </div>

            <Button
              className="h-14 w-full rounded-2xl bg-[#0d5bbc] font-bold text-white shadow-lg shadow-[#0d5bbc]/20 hover:bg-[#000d27]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Sign in to Platform"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-8 rounded-2xl bg-[#f1f4f7] p-4 text-sm text-[#44474e]">
            New here?{" "}
            <Link className="font-bold text-[#0d5bbc] hover:underline" to="/signup">
              Request a NileHive account
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-[#ebeef1] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6edc94]" />
                <span className="text-xs font-semibold text-[#44474e]">System: Operational</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6edc94]" />
                <span className="text-xs font-semibold text-[#44474e]">Live Workflow</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#f1f4f7] px-3 py-1 text-xs font-bold text-[#000d27]">
              <Sparkles className="h-3.5 w-3.5 text-[#F5B942]" />
              Club Services
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
