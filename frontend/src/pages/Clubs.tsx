import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Plus, School, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import { ApiClientError, createClub, createClubMedia, deleteClub, getClubs, updateClub, updateClubProfile, type ClubRecord } from "@/lib/api";
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
  const { clubId: editClubId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingClub, setEditingClub] = useState<ClubRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const canManageClubs = role === "admin" || role === "president";
  const canCreateClubs = role === "admin";
  const isFocusedEdit = Boolean(editClubId);
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
    if (!editClubId) {
      setEditingClub(null);
      return;
    }

    setEditingClub(clubs.find((club) => club.id === editClubId) || null);
  }, [clubs, editClubId]);

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
      if (isFocusedEdit) {
        navigate("/clubs");
      }
    },
    onError: (mutationError) => actionError("Could not save club", mutationError, getErrorMessage(mutationError))
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!editingClub) {
        throw new Error("Choose a club before deleting.");
      }

      await deleteClub(editingClub.id);
    },
    onSuccess: async () => {
      actionSuccess("Club deleted", `${editingClub?.name || "Club"} has been removed from Club Services.`);
      setDeleteConfirmOpen(false);
      setEditingClub(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clubs-management"] }),
        queryClient.invalidateQueries({ queryKey: ["public-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["dues-clubs"] }),
        queryClient.invalidateQueries({ queryKey: ["membership-review-clubs"] })
      ]);
      navigate("/clubs");
    },
    onError: (mutationError) => actionError("Could not delete club", mutationError, getErrorMessage(mutationError))
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
      <NeoPageHeader
        eyebrow="Club Services"
        title={isFocusedEdit ? "Edit Club Profile" : "Clubs"}
        description={isFocusedEdit ? "Update this club profile in a focused editor." : role === "president" ? "Maintain the public profile for your assigned club." : "Create and maintain the clubs students discover in the app."}
      />

      {isFocusedEdit ? (
        <Button asChild variant="outline" className="w-fit">
          <Link to="/clubs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to clubs
          </Link>
        </Button>
      ) : null}

      {isFocusedEdit && isLoading ? (
        <NeoLoadingState title="Opening club editor" message="We are loading the selected club profile." compact />
      ) : isFocusedEdit && !editingClub ? (
        <NeoStateCard icon={School} title="Club editor unavailable" message="This club is not available for your role, or it no longer exists." />
      ) : (canCreateClubs || editingClub) ? (
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
              {editingClub && role === "admin" ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={saveMutation.isPending || deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Club
                </Button>
              ) : null}
              {editingClub && role === "admin" ? <Button asChild type="button" variant="outline"><Link to="/clubs">Cancel</Link></Button> : null}
              <Button type="submit" disabled={saveMutation.isPending || (role === "president" && !editingClub)}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingClub ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingClub ? "Save Changes" : "Add Club"}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {editingClub?.name || "club"}?</DialogTitle>
            <DialogDescription>
              This removes the club and connected club records from Club Services. This action is only available to admins.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border-2 border-destructive bg-destructive/5 p-4 text-sm">
            <p className="font-semibold">You are about to delete {editingClub?.name || "this club"}.</p>
            <p className="mt-1 text-muted-foreground">Use this only for duplicate or incorrect club records.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isFocusedEdit ? <Card>
        <CardHeader><CardTitle className="text-lg">Configured clubs</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <NeoLoadingState title="Loading clubs" message="We are gathering the current club directory." compact /> : isError ? (
            <NeoStateCard icon={School} title="Could not load clubs" message={getErrorMessage(error)} tone="danger" />
          ) : !clubs.length ? (
            <NeoStateCard
              icon={School}
              title={role === "president" ? "No assigned club found" : "No clubs configured yet"}
              message={role === "president" ? "Ask a Club Services admin to assign your president profile to a club." : "Admins can add a club from the form above."}
            />
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
                  <Button asChild size="sm" variant="outline"><Link to={`/clubs/${club.id}/edit`}><Pencil className="h-4 w-4" /> Edit Club</Link></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> : null}
    </div>
  );
}
