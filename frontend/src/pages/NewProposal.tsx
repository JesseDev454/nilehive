import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { ApiClientError, createProposal } from "@/lib/api";
import { cn } from "@/lib/utils";

const steps = ["Details", "Description", "Schedule", "Review"];

function getStoredAccessToken() {
  return (
    window.localStorage.getItem("nilehive_access_token")?.trim() ||
    window.sessionStorage.getItem("nilehive_access_token")?.trim() ||
    ""
  );
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

export default function NewProposal() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    eventDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const accessToken = getStoredAccessToken();

    if (!accessToken) {
      toast.error("Missing executive session", {
        description:
          "Store a valid executive access token in localStorage or sessionStorage as nilehive_access_token."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProposal(
        {
          title: form.title,
          description: form.description,
          event_date: form.eventDate,
          location: form.location
        },
        accessToken
      );

      toast.success("Proposal submitted successfully!", {
        description: "Your proposal has been sent for advisor review."
      });
      navigate("/proposals");
    } catch (error) {
      toast.error("Proposal submission failed", {
        description: getSubmissionErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">New Proposal</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a new event proposal for approval</p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                i < step && "bg-success text-success-foreground",
                i === step && "bg-primary text-primary-foreground",
                i > step && "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn("text-sm hidden sm:inline", i === step ? "font-medium" : "text-muted-foreground")}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Annual Tech Symposium"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Hall"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event, its goals, and expected outcomes..."
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-base">Review Your Proposal</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{form.title || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{form.location || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Event Date</span>
                  <span className="font-medium">{form.eventDate || "-"}</span>
                </div>
                <div className="py-2 border-b">
                  <span className="text-muted-foreground">Description</span>
                  <p className="mt-1">{form.description || "-"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={back} disabled={step === 0 || isSubmitting}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} disabled={isSubmitting}>
                Continue
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={isSubmitting}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
