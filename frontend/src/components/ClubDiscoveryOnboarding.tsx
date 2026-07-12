import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClubPreferencesForm } from "@/components/ClubPreferencesForm";
import { getUserFacingErrorMessage, updateClubPreferences, type ClubPreferencesPayload } from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";

export function ClubDiscoveryOnboarding() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: ClubPreferencesPayload) => updateClubPreferences(payload),
    onSuccess: async (record) => {
      queryClient.setQueryData(["club-preferences"], record);
      await queryClient.invalidateQueries({ queryKey: ["club-recommendations"] });
      actionSuccess(record.status === "dismissed" ? "You can finish this later" : "Club matches are ready", record.status === "dismissed" ? "Open Profile whenever you want personalized club suggestions." : "Your recommendations now reflect your interests and availability.");
    },
    onError: (error) => actionError("Could not save preferences", error, getUserFacingErrorMessage(error))
  });
  return (
    <div className="fixed inset-0 z-[85] overflow-y-auto bg-slate-950/70 p-4 md:p-8" role="dialog" aria-modal="true" aria-labelledby="club-discovery-title">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-border bg-background p-5 text-foreground shadow-soft-lg md:p-8">
        <p className="clb-eyebrow">First-time club discovery</p>
        <h2 id="club-discovery-title" className="mt-2 text-3xl font-bold">Find clubs that fit you</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Tell Clubly what you want to learn and when you are available. You can change these answers later from Profile.</p>
        <div className="mt-6"><ClubPreferencesForm pending={mutation.isPending} onSubmit={(payload) => mutation.mutate(payload)} onSkip={() => mutation.mutate({ interests: [], skills: [], career_goals: [], availability: [], weekly_commitment: null, status: "dismissed" })} /></div>
      </section>
    </div>
  );
}
