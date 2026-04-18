import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Network, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";
import { completeProfileOnboarding, getPublicClubs } from "@/lib/api";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain } from "@/lib/env";

export default function ProfileSetup() {
  const { profileError, session, signOut, refreshProfile } = useAuth();
  const metadata = session?.user.user_metadata ?? {};
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [clubId, setClubId] = useState("");
  const [requestedRole, setRequestedRole] = useState<"student" | "executive" | "president">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["public-clubs"],
    queryFn: getPublicClubs,
    retry: false
  });

  useEffect(() => {
    setFullName(typeof metadata.full_name === "string" ? metadata.full_name : "");
    setStudentId(typeof metadata.student_id === "string" ? metadata.student_id : "");

    if (metadata.requested_role === "executive" || metadata.requested_role === "president") {
      setRequestedRole(metadata.requested_role);
    }
  }, [metadata.full_name, metadata.requested_role, metadata.student_id]);

  useEffect(() => {
    const requestedClub = typeof metadata.requested_club === "string" ? metadata.requested_club : "";
    const matchingClub = clubs.find(
      (club) => club.name.toLowerCase() === requestedClub.toLowerCase()
    );

    if (!clubId && matchingClub) {
      setClubId(matchingClub.id);
    }
  }, [clubId, clubs, metadata.requested_club]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAllowedEmailDomain(session?.user.email ?? "")) {
      toast.error("Use your Nile University email", {
        description: `Profile setup requires ${getAllowedEmailDomainLabel()}.`
      });
      return;
    }

    if (!clubId) {
      toast.error("Select your club", {
        description: "Your NileHive profile must be linked to a club."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await completeProfileOnboarding({
        full_name: fullName,
        student_id: studentId,
        club_id: clubId,
        requested_role: requestedRole
      });
      await refreshProfile();
      toast.success("Profile setup complete", {
        description:
          requestedRole === "student"
            ? "You can now access the student event feed."
            : "Your account is active as a student while your requested club role awaits approval."
      });
    } catch (error) {
      toast.error("Profile setup failed", {
        description: error instanceof Error ? error.message : "Please check the form and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fafd] p-5 text-[#181c1e] md:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(13,91,188,0.14),transparent_42%)]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b2347] text-white">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#000d27]">NileHive</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d5bbc]">
              Profile Onboarding
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#000d27] md:text-5xl">
              Finish setting up your NileHive account.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#44474e]">
              We found your Microsoft login, but NileHive still needs your app profile before
              opening the dashboard. Real users must use a Nile University Outlook email address.
            </p>
          </div>
          {profileError && (
            <Card className="border-0 bg-[#ffdad6] shadow-sm">
              <CardContent className="p-5 text-sm font-medium text-[#93000a]">
                {profileError}
              </CardContent>
            </Card>
          )}
          <Card className="border-0 bg-white/80 shadow-sm">
            <CardContent className="flex gap-3 p-5 text-sm text-[#44474e]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#299e5c]" />
              <p>
                For safety, self-service onboarding activates users as students first. Requested
                executive or president access can be approved later by Club Services.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <form
            className="relative overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_4px_30px_rgba(11,35,71,0.08)] md:p-10"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-full-name">Full Name</Label>
                <Input
                  id="profile-full-name"
                  className="rounded-2xl border-0 bg-[#f1f4f7] px-5 py-6"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-student-id">University ID</Label>
                <NhStudentId
                  id="profile-student-id"
                  value={studentId}
                  onChange={setStudentId}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Requested Role</Label>
                <Select value={requestedRole} onValueChange={(value) => setRequestedRole(value as typeof requestedRole)}>
                  <SelectTrigger className="rounded-2xl border-0 bg-[#f1f4f7] py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="president">President</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Club</Label>
                <Select disabled={isLoadingClubs} value={clubId} onValueChange={setClubId}>
                  <SelectTrigger className="rounded-2xl border-0 bg-[#f1f4f7] py-6">
                    <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select your club"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}{club.code ? ` (${club.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 flex-1 rounded-2xl bg-[#0d5bbc] font-bold text-white hover:bg-[#004493]"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving profile..." : "Complete Profile"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button className="h-12 rounded-2xl" type="button" variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
