import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClubPreferencesForm } from "@/components/ClubPreferencesForm";
import { ClublyErrorState, ClublyLoadingState, ClublyPageHeader } from "@/components/Clubly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getClubPreferences, getUserFacingErrorMessage, updateClubPreferences, type ClubPreferencesPayload } from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";

export default function Profile() {
  const { profile, role } = useAuth();
  const queryClient = useQueryClient();
  const preferences = useQuery({ queryKey: ["club-preferences"], queryFn: getClubPreferences, enabled: role === "student", retry: false });
  const mutation = useMutation({
    mutationFn: (payload: ClubPreferencesPayload) => updateClubPreferences(payload),
    onSuccess: async (record) => { queryClient.setQueryData(["club-preferences"], record); await queryClient.invalidateQueries({ queryKey: ["club-recommendations"] }); actionSuccess("Preferences saved", "Your club matches have been refreshed."); },
    onError: (error) => actionError("Could not save preferences", error, getUserFacingErrorMessage(error))
  });
  return <div className="clb-screen">
    <ClublyPageHeader title="Profile" description="Review your Clubly identity and personalize club discovery." />
    <Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Name</span><br />{profile?.full_name || "Not provided"}</p><p><span className="text-muted-foreground">Role</span><br />{role || profile?.role || "Loading"}</p><p><span className="text-muted-foreground">Student ID</span><br />{profile?.student_id || "Not provided"}</p><p><span className="text-muted-foreground">Department</span><br />{profile?.department || "Not provided"}</p></CardContent></Card>
    {role === "student" ? <Card><CardHeader><CardTitle>Club discovery preferences</CardTitle></CardHeader><CardContent>{preferences.isLoading ? <ClublyLoadingState compact title="Loading preferences" message="Preparing your club matching profile." /> : preferences.isError ? <ClublyErrorState message={getUserFacingErrorMessage(preferences.error)} /> : <ClubPreferencesForm key={preferences.data?.updated_at || "new"} initial={preferences.data} pending={mutation.isPending} onSubmit={(payload) => mutation.mutate(payload)} />}</CardContent></Card> : null}
  </div>;
}
