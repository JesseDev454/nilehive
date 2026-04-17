import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Network, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicClubs } from "@/lib/api";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain } from "@/lib/env";

const CAMPUS_LOUNGE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtWpjmv-aJhohYghqjIZGKpv8YmfVqo4M1_vpbn628XqWd8nC44bSnXbESgLdSk0EkQshCyBK5A1QNILkD4oAR4wJMwww7TQhzsNm5dzF2MKq4BsTDum7o8UMvLYO6PMeFeBJ0K4bWI4ijUTENADR2umL45GR3vqQ17gafeGeVmGfyUf_U77legsSkpxoSuocgzqvIuxQ4oLZ72OFiTujKX3NNCDI2sjLLfhLy6NpRQHx-RXBfUChYwniKEqg7yu6JTmVTIdyzsY7S";

export default function SignUp() {
  const { signUp, session, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [clubName, setClubName] = useState("");
  const [requestedRole, setRequestedRole] = useState("student");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["public-clubs"],
    queryFn: getPublicClubs,
    retry: false
  });

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

    try {
      await signUp({
        email,
        password,
        fullName,
        requestedRole,
        clubName,
        studentId
      });
      toast.success("Account request created", {
        description: "After confirming your email, log in and complete your NileHive profile setup."
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
    <main className="relative min-h-screen overflow-hidden bg-[#f7fafd] p-5 md:p-12 text-[#181c1e]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(245,185,66,0.14),transparent_42%)]" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#F5B942]/10 blur-3xl" />
      <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-[#000d27]/5 blur-[100px]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-12 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-5">
          <div className="space-y-3">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b2347] text-white">
                <Network className="h-5 w-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#000d27]">NileHive</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-[#000d27] md:text-6xl">
              Join the <span className="text-[#0d5bbc]">Hive</span>
            </h1>
            <p className="max-w-md pt-3 text-lg text-[#44474e]">
              Step into the digital extension of Nile University of Nigeria student life. Manage
              societies, lead your teams, and build your club legacy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_4px_20px_rgba(11,35,71,0.06)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0d5bbc]/10 text-[#0d5bbc]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#000d27]">Official Hub</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#44474e]">
                Verified club operations and administrative tools.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_4px_20px_rgba(11,35,71,0.06)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#8af9ae] text-[#00210e]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#000d27]">Active Pulse</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#44474e]">
                Club milestones, proposals, and approval movement.
              </p>
            </div>
          </div>

          <div className="relative h-48 overflow-hidden rounded-[1.75rem]">
            <img
              alt="Nile University students collaborating"
              className="h-full w-full object-cover grayscale opacity-60 transition-all duration-700 hover:grayscale-0 hover:opacity-100"
              src={CAMPUS_LOUNGE_IMAGE}
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#000d27]/85 to-transparent p-6">
              <span className="text-sm font-semibold text-white">Empowering Nile University scholars</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_4px_30px_rgba(11,35,71,0.08)] md:p-12">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#0d5bbc]/5" />
            <form className="relative z-10 space-y-8" onSubmit={handleSubmit}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d5bbc]">
                  Onboarding
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#000d27]">Create your account</h2>
                <p className="mt-2 text-sm text-[#44474e]">
                  Use your Nile University email. After login, NileHive will guide you through profile setup.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-[#181c1e]" htmlFor="full-name">
                    Full Name
                  </Label>
                  <Input
                    className="rounded-2xl border-0 bg-[#f1f4f7] px-5 py-6 focus-visible:ring-[#0d5bbc]/30"
                    id="full-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-[#181c1e]" htmlFor="signup-email">
                    University Email
                  </Label>
                  <Input
                    className="rounded-2xl border-0 bg-[#f1f4f7] px-5 py-6 focus-visible:ring-[#0d5bbc]/30"
                    id="signup-email"
                    placeholder="name@nileuniversity.edu.ng"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  <p className="px-1 text-[11px] font-medium text-[#75777f]">
                    Allowed domain: {getAllowedEmailDomainLabel()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-[#181c1e]" htmlFor="student-id">
                  University ID
                </Label>
                <NhStudentId id="student-id" value={studentId} onChange={setStudentId} required />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#000d27]">Organization Affinity</h3>
                  <span className="rounded-lg bg-[#8af9ae] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00210e]">
                    Required
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-semibold text-[#181c1e]">Society / Club</Label>
                    <Select disabled={isLoadingClubs} value={clubName} onValueChange={setClubName}>
                      <SelectTrigger className="rounded-2xl border-0 bg-[#f1f4f7] py-6 focus:ring-[#0d5bbc]/30">
                        <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select your club"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.name}>
                            {club.name}{club.code ? ` (${club.code})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="px-1 text-[11px] font-medium text-[#75777f]">
                      This helps preselect your club during profile setup.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-[#181c1e]">Requested Role</Label>
                    <Select value={requestedRole} onValueChange={setRequestedRole}>
                      <SelectTrigger className="rounded-2xl border-0 bg-[#f1f4f7] py-6 focus:ring-[#0d5bbc]/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="president">President</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-[#181c1e]" htmlFor="signup-password">
                  Secure Password
                </Label>
                <Input
                  className="rounded-2xl border-0 bg-[#f1f4f7] px-5 py-6 focus-visible:ring-[#0d5bbc]/30"
                  id="signup-password"
                  placeholder="Use 8+ characters"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
                <div className="mt-2 flex gap-1 px-1">
                  <div className="h-1 flex-1 rounded-full bg-[#0d5bbc]" />
                  <div className="h-1 flex-1 rounded-full bg-[#0d5bbc]" />
                  <div className="h-1 flex-1 rounded-full bg-[#ebeef1]" />
                  <div className="h-1 flex-1 rounded-full bg-[#ebeef1]" />
                </div>
              </div>

              {signupError && (
                <div className="rounded-2xl bg-[#ffdad6] p-4 text-sm font-medium text-[#93000a]">
                  {signupError}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <Button
                  className="h-14 w-full rounded-2xl bg-[#0d5bbc] font-bold text-white shadow-lg shadow-[#0d5bbc]/20 hover:bg-[#004493]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Creating account..." : "Create My Account"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-[#44474e]">Already an inhabitant?</span>
                  <Link className="font-bold text-[#0d5bbc] hover:underline" to="/login">
                    Log in to your dashboard
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#f1f4f7] p-4 text-sm text-[#44474e]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#299e5c]" />
                <p>
                  After signup, log in to complete profile setup. Executive or president access remains a
                  request until Club Services approves it.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
