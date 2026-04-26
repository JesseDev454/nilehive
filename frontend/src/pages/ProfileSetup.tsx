import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";
import { completeProfileOnboarding } from "@/lib/api";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain } from "@/lib/env";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";
import { isValidStudentId, normalizeStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";

export default function ProfileSetup() {
  const { profileError, session, signOut, refreshProfile } = useAuth();
  const metadata = session?.user.user_metadata ?? {};
  const requestedRole = typeof metadata.requested_role === "string" && metadata.requested_role === "advisor"
    ? "advisor"
    : "student";
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [clubId, setClubId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery(publicClubsQueryOptions);

  useEffect(() => {
    setFullName(typeof metadata.full_name === "string" ? metadata.full_name : "");
    setStudentId(typeof metadata.student_id === "string" ? normalizeStudentId(metadata.student_id) : "");

  }, [metadata.full_name, metadata.student_id]);

  useEffect(() => {
    const requestedClub = typeof metadata.requested_club === "string" ? metadata.requested_club : "";
    const requestedClubId = typeof metadata.requested_club_id === "string" ? metadata.requested_club_id : "";

    if (!clubId && requestedClubId && clubs.some((club) => club.id === requestedClubId)) {
      setClubId(requestedClubId);
      return;
    }

    const matchingClub = clubs.find(
      (club) => club.name.toLowerCase() === requestedClub.toLowerCase()
    );

    if (!clubId && matchingClub) {
      setClubId(matchingClub.id);
    }
  }, [clubId, clubs, metadata.requested_club, metadata.requested_club_id]);

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
        description: "Your Club Services profile must be linked to a club."
      });
      return;
    }

    if (requestedRole === "student" && !isValidStudentId(studentId)) {
      toast.error("Check your University ID", {
        description: STUDENT_ID_ERROR_MESSAGE
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await completeProfileOnboarding({
        full_name: fullName,
        student_id: requestedRole === "student" ? studentId : null,
        club_id: clubId,
        requested_role: requestedRole
      });
      await refreshProfile();
      toast.success("Profile setup complete", {
        description: requestedRole === "advisor"
          ? "Your advisor workspace is ready."
          : "You can now request membership and apply for leadership after your dues are active."
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
    <main className="relative min-h-screen overflow-hidden bg-background p-5 text-foreground md:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,hsl(var(--primary)/0.16),transparent_42%)]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <BrandLogo
            size="lg"
            className="h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Profile Onboarding
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
              Finish setting up your Club Services account.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We found your login, but Club Services still needs your app profile before
              opening the dashboard. Real users must use a Nile University Outlook email address.
            </p>
          </div>
          {profileError && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-5 text-sm font-medium text-destructive">
                {profileError}
              </CardContent>
            </Card>
          )}
          <Card className="bg-white/85">
            <CardContent className="flex gap-3 p-5 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p>
                {requestedRole === "advisor"
                  ? "Advisor onboarding links you to a specific club without asking for a student ID."
                  : "Executive and president applications open after membership and dues verification."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <form
            className="relative overflow-hidden border-2 border-foreground bg-white p-7 shadow-[8px_8px_0_hsl(var(--foreground))] md:p-10"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile-full-name">Full Name</Label>
                <Input
                  id="profile-full-name"
                  className="border-2 border-foreground bg-muted px-5 py-6"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              {requestedRole === "student" ? (
                <div className="space-y-2">
                  <Label htmlFor="profile-student-id">University ID</Label>
                  <NhStudentId
                    id="profile-student-id"
                    value={studentId}
                    onChange={setStudentId}
                    required
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Starting Access</Label>
                <div className="border-2 border-foreground bg-muted px-5 py-4 text-sm font-bold text-foreground">
                  {requestedRole === "advisor" ? "Advisor" : "Student"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {requestedRole === "advisor"
                    ? "Advisor access opens with the club you selected."
                    : "Club leadership applications are handled inside the app after your membership is active."}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{requestedRole === "advisor" ? "Advising Club" : "Club"}</Label>
                <Select disabled={isLoadingClubs || clubsFailed || clubs.length === 0} value={clubId} onValueChange={setClubId}>
                  <SelectTrigger className="border-2 border-foreground bg-muted py-6">
                    <SelectValue
                      placeholder={
                        isLoadingClubs
                          ? "Loading official clubs..."
                          : clubsFailed
                            ? "Club list unavailable"
                            : "Select your club"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}{club.code ? ` (${club.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isLoadingClubs
                    ? "We are loading the official clubs available for onboarding."
                    : clubsFailed
                      ? (clubsError instanceof Error ? clubsError.message : "We could not load clubs right now. Please refresh and try again.")
                      : clubs.length === 0
                        ? "No clubs are available yet. Ask Club Services to add the official clubs for production."
                        : "Official clubs appear here automatically. If no clubs are marked public yet, NileHive falls back to the current club directory."}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 flex-1 font-bold" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving profile..." : "Complete Profile"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button className="h-12" type="button" variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
