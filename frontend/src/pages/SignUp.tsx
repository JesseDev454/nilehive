import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Building2, CheckCircle2, Network, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const CAMPUS_LOUNGE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtWpjmv-aJhohYghqjIZGKpv8YmfVqo4M1_vpbn628XqWd8nC44bSnXbESgLdSk0EkQshCyBK5A1QNILkD4oAR4wJMwww7TQhzsNm5dzF2MKq4BsTDum7o8UMvLYO6PMeFeBJ0K4bWI4ijUTENADR2umL45GR3vqQ17gafeGeVmGfyUf_U77legsSkpxoSuocgzqvIuxQ4oLZ72OFiTujKX3NNCDI2sjLLfhLy6NpRQHx-RXBfUChYwniKEqg7yu6JTmVTIdyzsY7S";

export default function SignUp() {
  const { signUp, session, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [clubName, setClubName] = useState("");
  const [requestedRole, setRequestedRole] = useState("executive");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  if (!isLoading && session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSignupError(null);

    try {
      await signUp({
        email,
        password,
        fullName,
        requestedRole,
        clubName
      });
      toast.success("Account request created", {
        description: "Club Services still needs to assign your NileHive profile before dashboard access."
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
                  Account creation is real, but dashboard access still requires a Club Services profile assignment.
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
                </div>
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
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#75777f]" />
                      <Input
                        className="rounded-2xl border-0 bg-[#f1f4f7] py-6 pl-12 focus-visible:ring-[#0d5bbc]/30"
                        placeholder="e.g. Nile Innovators Club"
                        value={clubName}
                        onChange={(event) => setClubName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-[#181c1e]">Requested Role</Label>
                    <Select value={requestedRole} onValueChange={setRequestedRole}>
                      <SelectTrigger className="rounded-2xl border-0 bg-[#f1f4f7] py-6 focus:ring-[#0d5bbc]/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
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
                  After signup, Club Services must create your matching app profile before the dashboard opens.
                  This keeps role access controlled while onboarding is still being built out.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
