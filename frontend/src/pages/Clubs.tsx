import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, School } from "lucide-react";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, createClub, getClubs, updateClub, type ClubRecord } from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  is_public_signup: true,
  whatsapp_group_name: "",
  whatsapp_onboarding_notes: ""
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiClientError || error instanceof Error
    ? error.message
    : "Unable to save this club right now.";
}

export default function Clubs() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [editingClub, setEditingClub] = useState<ClubRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const canManageClubs = role === "admin";
  const { data: clubs = [], isLoading, isError, error } = useQuery({
    queryKey: ["clubs-management"],
    queryFn: () => getClubs(),
    enabled: canManageClubs,
    retry: false
  });

  useEffect(() => {
    if (!editingClub) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: editingClub.name,
      code: editingClub.code || "",
      description: editingClub.description || "",
      is_public_signup: editingClub.is_public_signup !== false,
      whatsapp_group_name: editingClub.whatsapp_group_name || "",
      whatsapp_onboarding_notes: editingClub.whatsapp_onboarding_notes || ""
    });
  }, [editingClub]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        code: form.code || null,
        whatsapp_group_name: form.whatsapp_group_name || null,
        whatsapp_onboarding_notes: form.whatsapp_onboarding_notes || null
      };
      return editingClub ? updateClub(editingClub.id, payload) : createClub(payload);
    },
    onSuccess: async () => {
      actionSuccess(editingClub ? "Club updated" : "Club created", "Students will see public club details in Discover Clubs.");
      setEditingClub(null);
      setForm(emptyForm);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clubs-management"] }),
        queryClient.invalidateQueries({ queryKey: ["public-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["dues-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["membership-review-clubs"] })
      ]);
    },
    onError: (mutationError) => actionError("Could not save club", mutationError, getErrorMessage(mutationError))
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  if (!canManageClubs) {
    return (
      <div className="nh-page">
        <NeoStateCard icon={School} title="Club management is restricted" message="Only Club Services admins can create or edit clubs." />
      </div>
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader eyebrow="Club Services" title="Clubs" description="Create and maintain the clubs students discover in the app." />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editingClub ? `Edit ${editingClub.name}` : "Add a new club"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="nh-form-grid">
            <div className="space-y-2">
              <Label htmlFor="club_name">Club Name</Label>
              <Input id="club_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club_code">Short Code</Label>
              <Input id="club_code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Optional" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="club_description">Description</Label>
              <Textarea id="club_description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="club_public" checked={form.is_public_signup} onCheckedChange={(checked) => setForm({ ...form, is_public_signup: checked })} />
              <Label htmlFor="club_public">Show in Discover Clubs</Label>
            </div>
            <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
              {editingClub ? <Button type="button" variant="outline" onClick={() => setEditingClub(null)}>Cancel</Button> : null}
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingClub ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingClub ? "Save Changes" : "Add Club"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Configured clubs</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <NeoLoadingState title="Loading clubs" message="We are gathering the current club directory." compact /> : isError ? (
            <NeoStateCard icon={School} title="Could not load clubs" message={getErrorMessage(error)} tone="danger" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clubs.map((club) => (
                <div key={club.id} className="nh-list-card space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-black">{club.name}</p><p className="text-xs text-muted-foreground">{club.code || "No short code"}</p></div>
                    <Badge>{club.is_public_signup === false ? "Hidden" : "Public"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{club.description || "No description yet."}</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditingClub(club)}><Pencil className="h-4 w-4" /> Edit Club</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
