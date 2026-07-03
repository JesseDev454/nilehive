import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Plus, School, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ClublyLoadingState, ClublyPageHeader, ClublyStateCard } from "@/components/Clubly";
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
  socialLinks: [] as SocialLinkRow[]
};

const SOCIAL_LINK_OPTIONS = [
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" }
] as const;

type SocialLinkKey = (typeof SOCIAL_LINK_OPTIONS)[number]["key"];

interface SocialLinkRow {
  id: string;
  platform: SocialLinkKey;
  url: string;
}

function createSocialLinkRow(platform: SocialLinkKey, url = ""): SocialLinkRow {
  return {
    id: `${platform}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    platform,
    url
  };
}

function getSocialLinkRows(links?: Record<string, string>): SocialLinkRow[] {
  return SOCIAL_LINK_OPTIONS.flatMap((option) => {
    const url = links?.[option.key]?.trim();
    return url ? [createSocialLinkRow(option.key, url)] : [];
  });
}

function buildSocialLinksPayload(rows: SocialLinkRow[]) {
  return rows.reduce<Record<string, string>>((links, row) => {
    const url = row.url.trim();
    if (url) {
      links[row.platform] = url;
    }
    return links;
  }, {});
}

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
      socialLinks: getSocialLinkRows(editingClub.social_links)
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
        social_links: buildSocialLinksPayload(form.socialLinks)
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
      actionSuccess("Club deleted", `${editingClub?.name || "Club"} has been removed from Clubly.`);
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

  function addSocialLink() {
    const usedPlatforms = new Set(form.socialLinks.map((row) => row.platform));
    const nextPlatform = SOCIAL_LINK_OPTIONS.find((option) => !usedPlatforms.has(option.key))?.key;

    if (!nextPlatform) {
      return;
    }

    setForm({
      ...form,
      socialLinks: [...form.socialLinks, createSocialLinkRow(nextPlatform)]
    });
  }

  function updateSocialLink(rowId: string, patch: Partial<Pick<SocialLinkRow, "platform" | "url">>) {
    setForm({
      ...form,
      socialLinks: form.socialLinks.map((row) => row.id === rowId ? { ...row, ...patch } : row)
    });
  }

  function removeSocialLink(rowId: string) {
    setForm({
      ...form,
      socialLinks: form.socialLinks.filter((row) => row.id !== rowId)
    });
  }

  if (!canManageClubs) {
    return (
      <div className="clb-screen">
        <ClublyStateCard icon={School} title="Club management is restricted" message="Only Clubly admins and assigned presidents can edit club content." />
      </div>
    );
  }

  return (
    <div className="clb-screen">
      <ClublyPageHeader
        eyebrow="Clubly"
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
        <ClublyLoadingState title="Opening club editor" message="We are loading the selected club profile." compact />
      ) : isFocusedEdit && !editingClub ? (
        <ClublyStateCard icon={School} title="Club editor unavailable" message="This club is not available for your role, or it no longer exists." />
      ) : (canCreateClubs || editingClub) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingClub ? `Edit ${editingClub.name}` : "Add a new club"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="clb-form-grid">
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
            <div className="space-y-2">
              <Label htmlFor="club_website">Website</Label>
              <Input id="club_website" type="url" value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} />
            </div>
            <div className="space-y-3 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Label>Club links</Label>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Add real public links for this club. Leave links blank or remove rows to hide them.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink} disabled={form.socialLinks.length >= SOCIAL_LINK_OPTIONS.length}>
                  <Plus className="h-4 w-4" />
                  Add link
                </Button>
              </div>
              {form.socialLinks.length ? (
                <div className="space-y-3">
                  {form.socialLinks.map((row, index) => {
                    const label = SOCIAL_LINK_OPTIONS.find((option) => option.key === row.platform)?.label || row.platform;
                    const usedByOtherRows = new Set(form.socialLinks.filter((item) => item.id !== row.id).map((item) => item.platform));

                    return (
                      <div key={row.id} className="grid gap-3 rounded-xl border-2 border-border bg-muted/30 p-3 md:grid-cols-[180px_1fr_auto] md:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`club_social_${row.id}_platform`}>Platform</Label>
                          <select
                            id={`club_social_${row.id}_platform`}
                            aria-label={`Link type ${index + 1}`}
                            className="flex h-11 w-full rounded-[18px] border border-input bg-card px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus:border-secondary focus:outline-none focus:ring-4 focus:ring-ring/30 focus:ring-offset-2"
                            value={row.platform}
                            onChange={(event) => updateSocialLink(row.id, { platform: event.target.value as SocialLinkKey })}
                          >
                            {SOCIAL_LINK_OPTIONS.map((option) => (
                              <option key={option.key} value={option.key} disabled={usedByOtherRows.has(option.key)}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`club_social_${row.id}_url`}>{label} URL</Label>
                          <Input
                            id={`club_social_${row.id}_url`}
                            type="url"
                            value={row.url}
                            onChange={(event) => updateSocialLink(row.id, { url: event.target.value })}
                          />
                        </div>
                        <Button type="button" variant="outline" onClick={() => removeSocialLink(row.id)} aria-label={`Remove ${label} link`}>
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border-2 border-dashed border-border p-4 text-sm font-semibold text-muted-foreground">
                  No club links added yet.
                </p>
              )}
            </div>
            <p className="text-xs font-semibold text-muted-foreground lg:col-span-2">
              Leave website or social links blank to remove them from the public club profile.
            </p>
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
              This removes the club and connected club records from Clubly. This action is only available to admins.
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
          {isLoading ? <ClublyLoadingState title="Loading clubs" message="We are gathering the current club directory." compact /> : isError ? (
            <ClublyStateCard icon={School} title="Could not load clubs" message={getErrorMessage(error)} tone="danger" />
          ) : !clubs.length ? (
            <ClublyStateCard
              icon={School}
              title={role === "president" ? "No assigned club found" : "No clubs configured yet"}
              message={role === "president" ? "Ask a Clubly admin to assign your president profile to a club." : "Admins can add a club from the form above."}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clubs.map((club) => (
                <div key={club.id} className="clb-list-card space-y-3">
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
