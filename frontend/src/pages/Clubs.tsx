import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Loader2, Pencil, Plus, School, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AccessDenied } from "@/components/AccessDenied";
import { OneClubLoadingState, OneClubPageHeader, OneClubStateCard } from "@/components/OneClub";
import { OneClubSkeleton } from "@/components/OneClubSkeleton";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  skills_offered: [] as string[],
  career_goals: [] as string[],
  meeting_windows: [] as string[],
  weekly_commitment: "" as "" | "1-2" | "3-5" | "6+",
  instagram: "",
  linkedin: ""
};
const MATCHING_OPTIONS = {
  skills_offered: [["communication", "Communication"], ["leadership", "Leadership"], ["technical", "Technical"], ["design", "Design"], ["research", "Research"], ["entrepreneurship", "Entrepreneurship"], ["event_planning", "Event planning"], ["media_content", "Media / content"], ["teamwork", "Teamwork"], ["community_service", "Community service"]],
  career_goals: [["portfolio_building", "Portfolio building"], ["leadership", "Leadership"], ["networking", "Networking"], ["technology", "Technology"], ["entrepreneurship", "Entrepreneurship"], ["public_speaking", "Public speaking"], ["creative_practice", "Creative practice"], ["community_impact", "Community impact"], ["academic_enrichment", "Academic enrichment"]],
  meeting_windows: [["weekday_daytime", "Weekday daytime"], ["weekday_evening", "Weekday evening"], ["weekend", "Weekend"], ["flexible", "Flexible"]]
} as const;
const CLUB_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const CLUB_IMAGE_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CLUB_GALLERY_MAX_IMAGES = 12;

function isAcceptedClubImage(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    CLUB_IMAGE_ACCEPTED_TYPES.has(file.type) ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp")
  );
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
  const canViewClub = canManageClubs || role === "executive";
  const canCreateClubs = role === "admin";
  const isFocusedEdit = Boolean(editClubId);
  const { data: clubs = [], isLoading, isError, error } = useQuery({
    queryKey: ["clubs-management"],
    queryFn: () => getClubs(),
    enabled: canViewClub,
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
      skills_offered: editingClub.skills_offered || [],
      career_goals: editingClub.career_goals || [],
      meeting_windows: editingClub.meeting_windows || [],
      weekly_commitment: editingClub.weekly_commitment || "",
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
              skills_offered: payload.skills_offered,
              career_goals: payload.career_goals,
              meeting_windows: payload.meeting_windows,
              weekly_commitment: payload.weekly_commitment || null,
              logo_path: payload.logo_path,
              social_links: payload.social_links,
              whatsapp_group_name: payload.whatsapp_group_name,
              whatsapp_onboarding_notes: payload.whatsapp_onboarding_notes
            });
        if (galleryFile) {
          if ((editingClub.gallery?.length || 0) >= CLUB_GALLERY_MAX_IMAGES) {
            throw new Error(`A club gallery can contain up to ${CLUB_GALLERY_MAX_IMAGES} images.`);
          }

          const upload = await uploadStorageFile(galleryFile, "club-media", { folder: editingClub.id });
          await createClubMedia(editingClub.id, { storage_path: upload.path, display_order: editingClub.gallery?.length || 0 });
        }
        return club;
      }
      const created = await createClub(payload);
      if (logoFile) {
        const upload = await uploadStorageFile(logoFile, "club-logos", { folder: created.id });
        return updateClub(created.id, { logo_path: upload.path });
      }
      return created;
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

  function chooseClubImage(file: File | undefined, setter: (file: File | null) => void, label: string) {
    if (!file) {
      setter(null);
      return;
    }

    if (!isAcceptedClubImage(file)) {
      actionError(`${label} is not supported`, new Error("Please upload a JPG, PNG, or WEBP image."));
      setter(null);
      return;
    }

    if (file.size > CLUB_IMAGE_MAX_BYTES) {
      actionError(`${label} is too large`, new Error("Please upload an image under 5MB."));
      setter(null);
      return;
    }

    setter(file);
  }

  if (!canViewClub) {
    return (
      <div className="clb-screen">
        <AccessDenied icon={School} title="Club management is restricted" reason="Only Club Services admins and assigned presidents can edit club content." />
      </div>
    );
  }

  if (role === "executive") {
    return (
      <div className="clb-screen">
        <OneClubPageHeader
          eyebrow="Club leadership"
          title="My Club"
          description="View your club profile and public information. Presidents and Club Services manage changes."
        />
        {isLoading ? (
          <OneClubLoadingState title="Loading club profile" message="Opening your club information." />
        ) : isError ? (
          <OneClubStateCard icon={School} title="Unable to load club profile" message={getErrorMessage(error)} tone="danger" />
        ) : clubs.length === 0 ? (
          <OneClubStateCard icon={School} title="No club assignment found" message="Ask your club president or Club Services to confirm your executive assignment." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {clubs.slice(0, 1).map((club) => (
              <Card key={club.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <p className="text-xl font-semibold text-primary">{club.name}</p>
                  {club.code ? <p className="mt-1 text-sm text-muted-foreground">{club.code}</p> : null}
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{club.description || "Your club profile has not been completed yet."}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(club.categories || []).map((category) => <span key={category} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{category}</span>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="clb-screen">
      <OneClubPageHeader
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
        <OneClubLoadingState title="Opening club editor" message="We are loading the selected club profile." compact />
      ) : isFocusedEdit && !editingClub ? (
        <OneClubStateCard icon={School} title="Club editor unavailable" message="This club is not available for your role, or it no longer exists." />
      ) : (canCreateClubs || editingClub) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingClub ? `Edit ${editingClub.name}` : "Add a new club"}</CardTitle>
            {!editingClub ? (
              <p className="text-sm text-muted-foreground">Just the essentials. You can add more later.</p>
            ) : null}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="clb-form-grid">
            <div className="space-y-2">
              <Label htmlFor="club_name">Club Name</Label>
              <Input id="club_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required disabled={role === "president"} />
            </div>
            {editingClub ? (
              <div className="space-y-2">
                <Label htmlFor="club_code">Short Code</Label>
                <Input id="club_code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Optional" disabled={role === "president"} />
              </div>
            ) : null}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="club_description">Description</Label>
              <Textarea id="club_description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="One or two lines about what the club does." required />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="club_public" checked={form.is_public_signup} onCheckedChange={(checked) => setForm({ ...form, is_public_signup: checked })} disabled={role === "president"} />
              <Label htmlFor="club_public">Show in Discover Clubs</Label>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{editingClub ? "Categories" : "Category"}</Label>
              <div className="flex flex-wrap gap-2">
                {CLUB_INTEREST_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={form.categories.includes(category) ? "default" : "outline"}
                    onClick={() => setForm({
                      ...form,
                      categories: editingClub
                        ? (form.categories.includes(category)
                          ? form.categories.filter((item) => item !== category)
                          : [...form.categories, category].slice(0, 5))
                        : (form.categories.includes(category) ? [] : [category])
                    })}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="club_logo">Club logo</Label>
              <Input
                id="club_logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                onChange={(event) => chooseClubImage(event.target.files?.[0], setLogoFile, "Club logo")}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP under 5MB.</p>
            </div>
            {editingClub ? (
              <>
                {(Object.entries(MATCHING_OPTIONS) as Array<[keyof typeof MATCHING_OPTIONS, readonly (readonly [string, string])[]]>).map(([field, options]) => (
                  <div key={field} className="space-y-2 lg:col-span-2">
                    <Label>{field === "skills_offered" ? "Skills students can build" : field === "career_goals" ? "Career goals supported" : "Typical meeting times"}</Label>
                    <div className="flex flex-wrap gap-2">{options.map(([value, label]) => <Button key={value} type="button" size="sm" variant={form[field].includes(value) ? "default" : "outline"} onClick={() => setForm({ ...form, [field]: form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value] })}>{label}</Button>)}</div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Weekly time commitment</Label>
                  <Select value={form.weekly_commitment || "unset"} onValueChange={(value) => setForm({ ...form, weekly_commitment: value === "unset" ? "" : value as typeof form.weekly_commitment })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="unset">Not set</SelectItem><SelectItem value="1-2">1-2 hours</SelectItem><SelectItem value="3-5">3-5 hours</SelectItem><SelectItem value="6+">6+ hours</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club_instagram">Instagram</Label>
                  <Input id="club_instagram" type="url" value={form.instagram} onChange={(event) => setForm({ ...form, instagram: event.target.value })} placeholder="Optional Instagram URL" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club_linkedin">LinkedIn</Label>
                  <Input id="club_linkedin" type="url" value={form.linkedin} onChange={(event) => setForm({ ...form, linkedin: event.target.value })} placeholder="Optional LinkedIn URL" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground lg:col-span-2">
                  Leave social links blank to remove them from the public club profile.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="club_gallery">Add gallery image</Label>
                  <Input
                    id="club_gallery"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                    onChange={(event) => chooseClubImage(event.target.files?.[0], setGalleryFile, "Gallery image")}
                    disabled={(editingClub.gallery?.length || 0) >= CLUB_GALLERY_MAX_IMAGES}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WEBP under 5MB. Gallery images: {editingClub.gallery?.length || 0}/{CLUB_GALLERY_MAX_IMAGES}.
                  </p>
                </div>
              </>
            ) : null}
            {editingClub ? <div className="rounded-2xl border border-border bg-muted/30 p-4 lg:col-span-2"><p className="font-semibold">Profile completeness</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">{[
              ["Description", Boolean(form.description.trim())], ["Categories", form.categories.length > 0], ["Logo", Boolean(logoFile || editingClub.logo_path)], ["Contact / social link", Boolean(form.instagram || form.linkedin)], ["Onboarding instructions", Boolean(form.whatsapp_onboarding_notes)], ["Gallery image", Boolean(galleryFile || editingClub.gallery?.length)], ["Matching attributes", Boolean(form.skills_offered.length && form.career_goals.length && form.meeting_windows.length && form.weekly_commitment)], ["Dues configured", editingClub.dues_amount !== null]
            ].map(([label, done]) => <div key={String(label)} className="flex items-center gap-2">{done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}<span>{label}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><Button asChild type="button" variant="outline" size="sm"><Link to="/members">Verify president assignment</Link></Button><Button asChild type="button" variant="outline" size="sm"><Link to="/communications">Publish welcome announcement</Link></Button></div></div> : null}
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
          <div className="rounded-xl border border-destructive bg-destructive/5 p-4 text-sm">
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
          {isLoading ? <OneClubSkeleton variant="cards" rows={3} /> : isError ? (
            <OneClubStateCard icon={School} title="Could not load clubs" message={getErrorMessage(error)} tone="danger" />
          ) : !clubs.length ? (
            <OneClubStateCard
              icon={School}
              title={role === "president" ? "No assigned club found" : "No clubs configured yet"}
              message={role === "president" ? "Ask a Club Services admin to assign your president profile to a club." : "Admins can add a club from the form above."}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clubs.map((club) => (
                <div key={club.id} className="clb-list-card space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-bold">{club.name}</p><p className="text-xs text-muted-foreground">{club.code || "No short code"}</p></div>
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
