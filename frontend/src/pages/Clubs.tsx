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
import { ApiClientError, createClub, createClubMedia, getClubs, updateClub, updateClubProfile, type ClubRecord } from "@/lib/api";
import { CLUB_INTEREST_CATEGORIES } from "@/lib/clubDiscovery";
import { actionError, actionSuccess } from "@/lib/notify";
import { uploadStorageFile } from "@/lib/storage";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  is_public_signup: true,
  whatsapp_group_name: "",
  whatsapp_onboarding_notes: "",
  categories: [] as string[],
  website_url: "",
  instagram: "",
  linkedin: ""
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const canManageClubs = role === "admin" || role === "president";
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
      whatsapp_onboarding_notes: editingClub.whatsapp_onboarding_notes || "",
      categories: editingClub.categories || [],
      website_url: editingClub.website_url || "",
      instagram: editingClub.social_links?.instagram || "",
      linkedin: editingClub.social_links?.linkedin || ""
    });
  }, [editingClub]);

  useEffect(() => {
    if (role === "president" && clubs.length === 1 && !editingClub) {
      setEditingClub(clubs[0]);
    }
  }, [clubs, editingClub, role]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logoPath = editingClub?.logo_path || null;
      if (logoFile && editingClub) {
        logoPath = (await uploadStorageFile(logoFile, "club-logos", { folder: editingClub.id })).path;
      }
      const payload = {
        ...form,
        code: form.code || null,
        whatsapp_group_name: form.whatsapp_group_name || null,
        whatsapp_onboarding_notes: form.whatsapp_onboarding_notes || null,
        website_url: form.website_url || null,
        logo_path: logoPath,
        social_links: { ...(form.instagram ? { instagram: form.instagram } : {}), ...(form.linkedin ? { linkedin: form.linkedin } : {}) }
      };
      let club: ClubRecord;
      if (editingClub) {
        club = role === "admin"
          ? await updateClub(editingClub.id, payload)
          : await updateClubProfile(editingClub.id, {
              description: payload.description,
              categories: payload.categories,
              logo_path: payload.logo_path,
              website_url: payload.website_url,
              social_links: payload.social_links,
              whatsapp_group_name: payload.whatsapp_group_name,
              whatsapp_onboarding_notes: payload.whatsapp_onboarding_notes
            });
        if (galleryFile) {
          const upload = await uploadStorageFile(galleryFile, "club-media", { folder: editingClub.id });
          await createClubMedia(editingClub.id, { storage_path: upload.path, display_order: editingClub.gallery?.length || 0 });
        }
        return club;
      }
      return createClub(payload);
    },
    onSuccess: async () => {
      actionSuccess(editingClub ? "Club updated" : "Club created", "Students will see public club details in Discover Clubs.");
      setEditingClub(null);
      setForm(emptyForm);
      setLogoFile(null);
      setGalleryFile(null);
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
        <NeoStateCard icon={School} title="Club management is restricted" message="Only Club Services admins and assigned presidents can edit club content." />
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
              <Input id="club_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required disabled={role === "president"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club_code">Short Code</Label>
              <Input id="club_code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Optional" disabled={role === "president"} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="club_description">Description</Label>
              <Textarea id="club_description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="club_public" checked={form.is_public_signup} onCheckedChange={(checked) => setForm({ ...form, is_public_signup: checked })} disabled={role === "president"} />
              <Label htmlFor="club_public">Show in Discover Clubs</Label>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">{CLUB_INTEREST_CATEGORIES.map((category) => <Button key={category} type="button" size="sm" variant={form.categories.includes(category) ? "default" : "outline"} onClick={() => setForm({ ...form, categories: form.categories.includes(category) ? form.categories.filter((item) => item !== category) : [...form.categories, category].slice(0, 5) })}>{category}</Button>)}</div>
            </div>
            <div className="space-y-2"><Label htmlFor="club_website">Website</Label><Input id="club_website" type="url" value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} placeholder="https://" /></div>
            <div className="space-y-2"><Label htmlFor="club_instagram">Instagram</Label><Input id="club_instagram" type="url" value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} placeholder="https://" /></div>
            <div className="space-y-2"><Label htmlFor="club_linkedin">LinkedIn</Label><Input id="club_linkedin" type="url" value={form.linkedin} onChange={(event) => setForm({ ...form, linkedin: event.target.value })} placeholder="https://" /></div>
            {editingClub ? <><div className="space-y-2"><Label htmlFor="club_logo">Club logo</Label><Input id="club_logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} /></div><div className="space-y-2"><Label htmlFor="club_gallery">Add gallery image</Label><Input id="club_gallery" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setGalleryFile(event.target.files?.[0] || null)} /></div></> : null}
            <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
              {editingClub && role === "admin" ? <Button type="button" variant="outline" onClick={() => setEditingClub(null)}>Cancel</Button> : null}
              <Button type="submit" disabled={saveMutation.isPending || (role === "president" && !editingClub)}>
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
                  <div className="flex flex-wrap gap-1">{(club.categories || []).map((category) => <Badge key={category} variant="outline">{category}</Badge>)}</div>
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
