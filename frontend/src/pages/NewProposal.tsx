import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Lightbulb,
  Plus,
  Rocket,
  Trash2,
  Users,
  WalletCards
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ApiClientError,
  createProposal,
  getClubs,
  getExecutiveProposal,
  updateExecutiveProposal,
  type BudgetLineItem,
  type CreateProposalPayload,
  type ResponsibleMember
} from "@/lib/api";
import { cn } from "@/lib/utils";

const steps = ["Club Info", "Activity", "Budget", "Members", "Review"];
const MAX_RESPONSIBLE_MEMBERS = 5;

const PRESET_CLUB_NAMES = [
  "NILE GDG CLUB",
  "NILE GAMES CLUB",
  "NILE CREATIVE ARTS CLUB",
  "NILE BOOK CLUB"
];

const PRESET_VENUES = [
  "STUDENT CENTER",
  "NIGER HOUSE CONFERENCE HALL",
  "COLLECTIVE LABS",
  "UBANGI",
  "CONGO",
  "LIMPOPO",
  "VOLTA"
];

const PRESET_POSITIONS = [
  "CORE MEMBER",
  "EXECUTIVE",
  "MEMBER",
  "TEAM LEAD"
];

const TIME_OPTIONS = Array.from({ length: 24 * 4 }).map((_, idx) => {
  const h = Math.floor(idx / 4).toString().padStart(2, "0");
  const m = ((idx % 4) * 15).toString().padStart(2, "0");
  return `${h}:${m}`;
});

interface BudgetFormItem {
  id: string;
  item: string;
  quantity: string;
  description: string;
  amount: string;
}

interface ResponsibleMemberForm {
  id: string;
  name: string;
  studentId: string;
  phoneNumber: string;
  position: string;
  positionOther: string;
}

function createBudgetItem(): BudgetFormItem {
  return {
    id: crypto.randomUUID(),
    item: "",
    quantity: "",
    description: "",
    amount: ""
  };
}

function createResponsibleMember(): ResponsibleMemberForm {
  return {
    id: crypto.randomUUID(),
    name: "",
    studentId: "",
    phoneNumber: "",
    position: "",
    positionOther: ""
  };
}

function getSubmissionErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const details = error.details as
      | {
          fields?: Array<{ message?: string }>;
        }
      | undefined;

    const fieldMessages = details?.fields?.map((field) => field.message).filter(Boolean);

    if (fieldMessages?.length) {
      return fieldMessages.join(" ");
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to submit proposal right now.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);
}

function toBudgetLineItems(items: BudgetFormItem[]): BudgetLineItem[] {
  return items
    .filter((item) => item.item || item.description || item.quantity || item.amount)
    .map((item) => ({
      item: item.item.trim(),
      description: item.description.trim(),
      quantity: Number(item.quantity),
      amount: Number(item.amount)
    }));
}

function formatTime12h(timeStr: string): string {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let hours = parseInt(hStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${mStr} ${ampm}`;
}

function getDurationMinutes(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return null;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function getDurationValidationMessage(startTime: string, endTime: string) {
  if (startTime && !endTime) {
    return "Select an end time for the event.";
  }

  if (endTime && !startTime) {
    return "Select a start time before selecting an end time.";
  }

  const durationMinutes = getDurationMinutes(startTime, endTime);

  if (durationMinutes === null) {
    return "";
  }

  if (durationMinutes <= 0) {
    return "End time must be after start time.";
  }

  if (durationMinutes < 60) {
    return "Event duration must be at least 1 hour.";
  }

  return "";
}

function formatDuration(startTime: string, endTime: string) {
  const durationMinutes = getDurationMinutes(startTime, endTime);

  if (durationMinutes === null || durationMinutes <= 0) {
    return durationMinutes === null ? "-" : "Invalid";
  }

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  return [hours && `${hours} hr`, mins && `${mins} min`].filter(Boolean).join(" ");
}

function toResponsibleMembers(members: ResponsibleMemberForm[]): ResponsibleMember[] {
  return members
    .filter((member) => member.name || member.studentId || member.phoneNumber || member.position)
    .map((member) => ({
      name: member.name.trim(),
      student_id: member.studentId.trim(),
      phone_number: member.phoneNumber.trim(),
      position: (member.position === "other" ? member.positionOther : member.position).trim()
    }));
}

export default function NewProposal() {
  const [searchParams] = useSearchParams();
  const editProposalId = searchParams.get("edit");
  const isEditMode = Boolean(editProposalId);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    clubId: "",
    aimObjectives: "",
    proposedActivity: "",
    description: "",
    eventDates: [""],
    eventTime: "",
    eventEndTime: "",
    venue: "",
    venueOther: "",
    roomNumber: "",
    numberOfParticipants: ""
  });
  const [budgetItems, setBudgetItems] = useState<BudgetFormItem[]>([createBudgetItem()]);
  const [responsibleMembers, setResponsibleMembers] = useState<ResponsibleMemberForm[]>([
    createResponsibleMember()
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [didHydrateEditForm, setDidHydrateEditForm] = useState(false);
  const navigate = useNavigate();

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => getClubs(),
    retry: false
  });

  const { data: editProposal } = useQuery({
    queryKey: ["proposal-edit", editProposalId],
    queryFn: () => getExecutiveProposal(editProposalId || ""),
    enabled: !!editProposalId,
    retry: false
  });

  useEffect(() => {
    if (!form.clubId && clubs.length === 1) {
      setForm((current) => ({ ...current, clubId: clubs[0].id }));
    }
  }, [clubs, form.clubId]);

  useEffect(() => {
    if (!editProposal || didHydrateEditForm) {
      return;
    }

    const venueMatchesPreset = editProposal.location
      ? PRESET_VENUES.includes(editProposal.location)
      : false;

    setForm({
      clubId: editProposal.club_id || "",
      aimObjectives: editProposal.aim_objectives || "",
      proposedActivity: editProposal.proposed_activity || editProposal.title || "",
      description: editProposal.description || "",
      eventDates: [editProposal.event_date || ""],
      eventTime: editProposal.event_time?.slice(0, 5) || "",
      eventEndTime: "",
      venue: venueMatchesPreset ? editProposal.location || "" : editProposal.location ? "other" : "",
      venueOther: venueMatchesPreset ? "" : editProposal.location || "",
      roomNumber: "",
      numberOfParticipants: editProposal.number_of_participants?.toString() || ""
    });

    setBudgetItems(
      editProposal.budget_line_items?.length
        ? editProposal.budget_line_items.map((item) => ({
            id: crypto.randomUUID(),
            item: item.item,
            quantity: item.quantity.toString(),
            description: item.description,
            amount: item.amount.toString()
          }))
        : [createBudgetItem()]
    );

    setResponsibleMembers(
      editProposal.responsible_members?.length
        ? editProposal.responsible_members.map((member) => {
            const usesPresetPosition = PRESET_POSITIONS.includes(member.position);

            return {
              id: crypto.randomUUID(),
              name: member.name,
              studentId: member.student_id,
              phoneNumber: member.phone_number,
              position: usesPresetPosition ? member.position : "other",
              positionOther: usesPresetPosition ? "" : member.position
            };
          })
        : [createResponsibleMember()]
    );

    setDidHydrateEditForm(true);
  }, [didHydrateEditForm, editProposal]);

  const budgetTotal = useMemo(
    () =>
      budgetItems.reduce((total, item) => {
        const amount = Number(item.amount);
        return total + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [budgetItems]
  );

  const selectedClub = clubs.find((club) => club.id === form.clubId);
  const missingPresetClubNames = PRESET_CLUB_NAMES.filter(
    (name) => !clubs.some((club) => club.name.toLowerCase() === name.toLowerCase())
  );
  const durationValidationMessage = getDurationValidationMessage(
    form.eventTime,
    form.eventEndTime
  );

  function getClubDisplayName() {
    return selectedClub?.name || "";
  }

  const validateStepChange = (targetStep: number) => {
    if (step === 1 && targetStep > 1 && durationValidationMessage) {
      toast.error("Invalid event time", {
        description: durationValidationMessage
      });
      return false;
    }

    return true;
  };

  const next = () => {
    if (validateStepChange(step + 1)) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  };
  const back = () => setStep((current) => Math.max(current - 1, 0));

  function updateBudgetItem(id: string, patch: Partial<BudgetFormItem>) {
    setBudgetItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function updateResponsibleMember(id: string, patch: Partial<ResponsibleMemberForm>) {
    setResponsibleMembers((members) =>
      members.map((member) => (member.id === id ? { ...member, ...patch } : member))
    );
  }

  function buildProposalPayload(saveAsDraft = false): CreateProposalPayload {
    const budgetLineItems = toBudgetLineItems(budgetItems);
    const members = toResponsibleMembers(responsibleMembers);
    const validDates = form.eventDates.filter(Boolean);
    const extraDates = validDates.slice(1);
    const timeSuffix =
      form.eventTime && form.eventEndTime
        ? `Event time: ${formatTime12h(form.eventTime)} - ${formatTime12h(form.eventEndTime)}`
        : form.eventEndTime
        ? `Event ends at: ${formatTime12h(form.eventEndTime)}`
        : "";
    const dateSuffix =
      extraDates.length > 0 ? `Additional event dates: ${extraDates.join(", ")}` : "";
    const extras = [timeSuffix, dateSuffix].filter(Boolean).join("\n");
    const descriptionWithDates = extras
      ? `${form.description}${form.description ? "\n\n" : ""}${extras}`
      : form.description;

    return {
      club_id: form.clubId || undefined,
      title: form.proposedActivity,
      proposed_activity: form.proposedActivity,
      aim_objectives: form.aimObjectives,
      description: descriptionWithDates,
      event_date: validDates[0] || "",
      event_time: form.eventTime || null,
      location: (() => {
        const venueName = form.venue === "other" ? form.venueOther : form.venue;
        return [venueName, form.roomNumber ? `Room ${form.roomNumber}` : ""].filter(Boolean).join(", ");
      })(),
      number_of_participants: Number(form.numberOfParticipants),
      budget_estimate: budgetLineItems.length ? budgetTotal : null,
      budget_line_items: budgetLineItems,
      responsible_members: members,
      save_as_draft: saveAsDraft
    };
  }

  const submit = async (options: { saveAsDraft?: boolean } = {}) => {
    const shouldSaveDraft = options.saveAsDraft || editProposal?.status === "draft";

    if (!shouldSaveDraft && durationValidationMessage) {
      toast.error("Invalid event time", {
        description: durationValidationMessage
      });
      return;
    }

    if (shouldSaveDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const payload = buildProposalPayload(shouldSaveDraft);

      if (editProposalId) {
        await updateExecutiveProposal(editProposalId, payload);
      } else {
        await createProposal(payload);
      }

      toast.success(shouldSaveDraft ? "Proposal saved as draft" : "Proposal saved successfully", {
        description: editProposalId
          ? "Your proposal changes have been saved."
          : shouldSaveDraft
            ? "Your proposal is saved in drafts and was not sent for review yet."
            : "Your full proposal package has been sent for advisor review."
      });
      navigate(editProposalId ? `/proposals/${editProposalId}` : "/proposals");
    } catch (error) {
      toast.error(shouldSaveDraft ? "Draft save failed" : "Proposal submission failed", {
        description: getSubmissionErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0d5bbc]">Proposal Form 2.0</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#000d27]">
            {isEditMode ? "Edit Proposal" : "Create Proposal"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditMode
              ? "Update a draft or rejected proposal before resubmission."
              : "Capture club details, activity plans, budget estimates, and responsible members."}
          </p>
        </div>
        <div className="rounded-full bg-[#8af9ae]/35 px-4 py-2 text-xs font-bold text-[#00210e]">
          Max {MAX_RESPONSIBLE_MEMBERS} responsible members
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-5 hidden h-px w-full bg-[#ebeef1] sm:block" />
        <div className="relative grid grid-cols-5 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2"
              onClick={() => {
                if (validateStepChange(index)) {
                  setStep(index);
                }
              }}
              type="button"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  index < step && "bg-[#299e5c] text-white",
                  index === step && "bg-[#0d5bbc] text-white shadow-md shadow-[#0d5bbc]/20",
                  index > step && "bg-[#e5e8eb] text-[#44474e]"
                )}
              >
                {index < step ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="hidden text-xs font-semibold text-[#000d27] sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          {step === 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Building2 className="h-5 w-5 text-[#0d5bbc]" />
                  Section A: Club Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Club Name</Label>
                  <Select
                    disabled={isLoadingClubs}
                    value={form.clubId}
                    onValueChange={(clubId) => setForm({ ...form, clubId })}
                  >
                    <SelectTrigger className="rounded-xl bg-[#f1f4f7]">
                      <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select club"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}{club.code ? ` (${club.code})` : ""}
                        </SelectItem>
                      ))}
                      {missingPresetClubNames.map((name) => (
                        <SelectItem key={`missing:${name}`} value={`missing:${name}`} disabled>
                          {name} (add in Supabase first)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {missingPresetClubNames.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Some official clubs are disabled until they exist in Supabase.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <Input className="rounded-xl bg-[#f1f4f7]" disabled value="Club" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aim-objectives">Aim &amp; Objectives of the Event</Label>
                  <Textarea
                    id="aim-objectives"
                    className="rounded-xl bg-[#f1f4f7]"
                    placeholder="Define the purpose, goals, and expected outcomes of this proposal..."
                    rows={5}
                    value={form.aimObjectives}
                    onChange={(event) => setForm({ ...form, aimObjectives: event.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Rocket className="h-5 w-5 text-[#0d5bbc]" />
                  Section B: Activity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="activity">Proposed Activity/Event</Label>
                  <Input
                    id="activity"
                    className="rounded-xl bg-[#f1f4f7]"
                    placeholder="e.g. Annual Innovation Summit"
                    value={form.proposedActivity}
                    onChange={(event) => setForm({ ...form, proposedActivity: event.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Proposed Event Date(s)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm({ ...form, eventDates: [...form.eventDates, ""] })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Date
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.eventDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          className="rounded-xl bg-[#f1f4f7]"
                          type="date"
                          value={date}
                          onChange={(event) => {
                            const updated = [...form.eventDates];
                            updated[index] = event.target.value;
                            setForm({ ...form, eventDates: updated });
                          }}
                        />
                        {form.eventDates.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => {
                              const updated = form.eventDates.filter((_, i) => i !== index);
                              setForm({ ...form, eventDates: updated });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Event Time</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-muted-foreground">Start Time</p>
                      <Select
                        value={form.eventTime}
                        onValueChange={(val) => setForm({ ...form, eventTime: val })}
                      >
                        <SelectTrigger className="rounded-xl bg-[#f1f4f7]">
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime12h(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-5 text-muted-foreground text-sm font-medium">to</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-muted-foreground">End Time</p>
                      <Select
                        value={form.eventEndTime}
                        onValueChange={(val) => setForm({ ...form, eventEndTime: val })}
                      >
                        <SelectTrigger
                          className={`rounded-xl bg-[#f1f4f7] ${
                            durationValidationMessage
                              ? "border-destructive focus-visible:ring-destructive text-destructive"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime12h(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.eventTime && form.eventEndTime && (
                      <div className="pt-5 shrink-0">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            durationValidationMessage
                              ? "bg-destructive/10 text-destructive"
                              : "bg-[#299e5c]/10 text-[#299e5c]"
                          }`}
                        >
                          {formatDuration(form.eventTime, form.eventEndTime)}
                        </span>
                      </div>
                    )}
                  </div>
                  {durationValidationMessage && (
                    <p className="text-xs text-destructive mt-1">{durationValidationMessage}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Venue</Label>
                  <Select
                    value={form.venue}
                    onValueChange={(venue) => setForm({ ...form, venue, venueOther: "" })}
                  >
                    <SelectTrigger className="rounded-xl bg-[#f1f4f7]">
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_VENUES.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value="other">Other (type your own)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.venue === "other" && (
                    <Input
                      className="rounded-xl bg-[#f1f4f7] mt-2"
                      placeholder="Enter venue name"
                      value={form.venueOther}
                      onChange={(e) => setForm({ ...form, venueOther: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="room-number"
                    className="rounded-xl bg-[#f1f4f7]"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="e.g. 204"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Number of Participants</Label>
                  <Input
                    id="participants"
                    className="rounded-xl bg-[#f1f4f7]"
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="e.g. 120"
                    value={form.numberOfParticipants}
                    onChange={(event) => setForm({ ...form, numberOfParticipants: event.target.value.replace(/\D/g, "").slice(0, 3) })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    className="rounded-xl bg-[#f1f4f7]"
                    placeholder="Provide a comprehensive breakdown of the planned activity..."
                    rows={5}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <WalletCards className="h-5 w-5 text-[#0d5bbc]" />
                  Section C: Budget Items
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setBudgetItems([...budgetItems, createBudgetItem()])}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 gap-3 rounded-2xl bg-[#f1f4f7] p-4 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-3">
                      <Label>Items</Label>
                      <Input
                        className="rounded-xl bg-white"
                        placeholder="Venue rental"
                        value={item.item}
                        onChange={(event) => updateBudgetItem(item.id, { item: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        className="rounded-xl bg-white"
                        min={1}
                        type="number"
                        value={item.quantity}
                        onChange={(event) => updateBudgetItem(item.id, { quantity: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <Label>Description</Label>
                      <Input
                        className="rounded-xl bg-white"
                        placeholder="Details of the expenditure"
                        value={item.description}
                        onChange={(event) => updateBudgetItem(item.id, { description: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Amount</Label>
                      <Input
                        className="rounded-xl bg-white"
                        min={0}
                        type="number"
                        value={item.amount}
                        onChange={(event) => updateBudgetItem(item.id, { amount: event.target.value })}
                      />
                    </div>
                    <div className="flex items-end md:col-span-1">
                      <Button
                        className="w-full text-destructive hover:bg-destructive/10"
                        disabled={budgetItems.length === 1}
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => setBudgetItems(budgetItems.filter((candidate) => candidate.id !== item.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-12">
                      Budget line {index + 1} total: {formatCurrency(Number(item.amount) || 0)}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Budget is optional. Leave the line blank if this proposal does not require funding.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Users className="h-5 w-5 text-[#0d5bbc]" />
                  Section D: Responsible Club Members
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={responsibleMembers.length >= MAX_RESPONSIBLE_MEMBERS}
                  onClick={() => setResponsibleMembers([...responsibleMembers, createResponsibleMember()])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {responsibleMembers.map((member, index) => (
                  <div key={member.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#ebeef1]">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-bold text-[#000d27]">Responsible Member {index + 1}</p>
                      <Button
                        className="text-destructive hover:bg-destructive/10"
                        disabled={responsibleMembers.length === 1}
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setResponsibleMembers(
                            responsibleMembers.filter((candidate) => candidate.id !== member.id)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          className="rounded-xl bg-[#f1f4f7]"
                          value={member.name}
                          onChange={(event) => updateResponsibleMember(member.id, { name: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Student ID</Label>
                        <Input
                          className="rounded-xl bg-[#f1f4f7]"
                          inputMode="numeric"
                          placeholder="e.g. 20230001"
                          value={member.studentId}
                          onChange={(event) =>
                            updateResponsibleMember(member.id, {
                              studentId: event.target.value.replace(/\D/g, "")
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          className="rounded-xl bg-[#f1f4f7]"
                          inputMode="numeric"
                          placeholder="e.g. 08012345678"
                          value={member.phoneNumber}
                          onChange={(event) =>
                            updateResponsibleMember(member.id, {
                              phoneNumber: event.target.value.replace(/\D/g, "")
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select
                          value={member.position}
                          onValueChange={(position) =>
                            updateResponsibleMember(member.id, { position, positionOther: "" })
                          }
                        >
                          <SelectTrigger className="rounded-xl bg-[#f1f4f7]">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRESET_POSITIONS.map((pos) => (
                              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                            <SelectItem value="other">Other (type your own)</SelectItem>
                          </SelectContent>
                        </Select>
                        {member.position === "other" && (
                          <Input
                            className="rounded-xl bg-[#f1f4f7] mt-2"
                            placeholder="Enter position title"
                            value={member.positionOther}
                            onChange={(e) =>
                              updateResponsibleMember(member.id, { positionOther: e.target.value })
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Enter each member's actual name and position. Club roles vary, so these are not pre-filled.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Review Your Proposal Package</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Please review all details before submitting.</p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">

                {/* Section A: Club Info */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0d5bbc] mb-3">A - Club Information</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ReviewItem label="Club Name" value={getClubDisplayName() || "-"} />
                    <ReviewItem label="Organization Type" value="Club" />
                  </div>
                  <div className="rounded-2xl bg-[#f1f4f7] p-4 mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aim &amp; Objectives of the Event</p>
                    <p className="mt-2 leading-relaxed">{form.aimObjectives || "-"}</p>
                  </div>
                </div>

                <div className="border-t border-[#ebeef1]" />

                {/* Section B: Activity Details */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0d5bbc] mb-3">B - Activity Details</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ReviewItem label="Proposed Activity/Event" value={form.proposedActivity || "-"} />
                    <ReviewItem
                      label="Proposed Event Date(s)"
                      value={form.eventDates.filter(Boolean).join(", ") || "-"}
                    />
                    <ReviewItem
                      label="Event Time"
                      value={
                        form.eventTime && form.eventEndTime
                          ? `${formatTime12h(form.eventTime)} - ${formatTime12h(form.eventEndTime)}`
                          : formatTime12h(form.eventTime) || "-"
                      }
                    />
                    <ReviewItem
                      label="Duration"
                      value={formatDuration(form.eventTime, form.eventEndTime)}
                    />
                    <ReviewItem
                      label="Proposed Venue"
                      value={(() => {
                        const venueName = form.venue === "other" ? form.venueOther : form.venue;
                        return [venueName, form.roomNumber ? `Room ${form.roomNumber}` : ""].filter(Boolean).join(", ") || "-";
                      })()}
                    />
                    <ReviewItem label="Expected No. of Participants" value={form.numberOfParticipants || "-"} />
                  </div>
                  <div className="rounded-2xl bg-[#f1f4f7] p-4 mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Description</p>
                    <p className="mt-2 leading-relaxed">{form.description || "-"}</p>
                  </div>
                </div>

                <div className="border-t border-[#ebeef1]" />

                {/* Section C: Budget */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0d5bbc] mb-3">C - Budget</p>
                  {toBudgetLineItems(budgetItems).length > 0 ? (
                    <div className="rounded-2xl overflow-hidden ring-1 ring-[#ebeef1]">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#f1f4f7]">
                            <th className="text-left p-3 font-semibold text-muted-foreground">#</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Items</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Qty</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Description</th>
                            <th className="text-right p-3 font-semibold text-muted-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {toBudgetLineItems(budgetItems).map((item, i) => (
                            <tr key={i} className="border-t border-[#ebeef1]">
                              <td className="p-3 text-muted-foreground">{i + 1}</td>
                              <td className="p-3 font-medium">{item.item || "-"}</td>
                              <td className="p-3 text-muted-foreground">{item.quantity}</td>
                              <td className="p-3 text-muted-foreground">{item.description || "-"}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(item.amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-[#0d5bbc]/20 bg-[#f1f4f7]">
                            <td colSpan={4} className="p-3 font-bold text-[#000d27]">Total Budget Request</td>
                            <td className="p-3 text-right font-black text-[#0d5bbc] font-mono">{formatCurrency(budgetTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No budget items added.</p>
                  )}
                </div>

                <div className="border-t border-[#ebeef1]" />

                {/* Section D: Responsible Members */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0d5bbc] mb-3">D - Responsible Members</p>
                  {toResponsibleMembers(responsibleMembers).length > 0 ? (
                    <div className="space-y-3">
                      {toResponsibleMembers(responsibleMembers).map((member, i) => (
                        <div key={i} className="rounded-2xl bg-[#f1f4f7] p-4">
                          <p className="font-bold text-[#000d27] mb-2">Responsible Member {i + 1}</p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{member.name || "-"}</span>
                            <span className="text-muted-foreground">Student ID</span>
                            <span className="font-medium">{member.student_id || "-"}</span>
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium">{member.phone_number || "-"}</span>
                            <span className="text-muted-foreground">Position</span>
                            <span className="font-medium">{member.position || "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No responsible members added.</p>
                  )}
                </div>

              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <Card className="overflow-hidden border-0 bg-[#000d27] text-white shadow-xl">
            <CardContent className="relative p-7">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#F5B942]/20 blur-2xl" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#F5B942]">Budget Estimation</p>
              <div className="mt-6 space-y-3">
                {toBudgetLineItems(budgetItems).slice(0, 4).map((item) => (
                  <div key={`${item.item}-${item.description}`} className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-white/70">{item.item || "Budget item"}</span>
                    <span className="font-mono text-sm">{formatCurrency(item.amount || 0)}</span>
                  </div>
                ))}
                <div className="flex items-end justify-between pt-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-white/50">Total Request</p>
                    <p className="text-3xl font-black">{formatCurrency(budgetTotal)}</p>
                  </div>
                  <WalletCards className="h-10 w-10 text-[#F5B942]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#e5e8eb]/50">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 shrink-0 text-[#0d5bbc]" />
                <div>
                  <p className="font-semibold text-[#000d27]">Pro Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Detailed budget items and verified member IDs make the advisor/admin review much easier.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 0 || isSubmitting}>
          Back
        </Button>
        <div className="flex gap-2">
          {!isEditMode && (
            <Button
              onClick={() => submit({ saveAsDraft: true })}
              disabled={isSubmitting || isSavingDraft}
              variant="outline"
            >
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button className="bg-[#0d5bbc] hover:bg-[#004493]" onClick={next} disabled={isSubmitting}>
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => submit()}
              disabled={isSubmitting || isSavingDraft}
              className="bg-[#0d5bbc] hover:bg-[#004493] text-white"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Submit Proposal"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f1f4f7] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold text-[#000d27]">{value}</p>
    </div>
  );
}
