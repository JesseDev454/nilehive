import { FormEvent, useState } from "react";
import { Archive, CheckCircle2, FileUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClublyPageHeader, ClublyPanel, ClublyStateCard } from "@/components/Clubly";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "@/components/ui/use-toast";

export default function ReportSubmission() {
  const { role } = useRole();
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
    toast({
      variant: "success",
      title: "Report draft ready",
      description: "Clubly saved the report details locally for review."
    });
  }

  if (role !== "president" && role !== "admin") {
    return (
      <div className="clb-screen">
        <ClublyStateCard
          icon={Archive}
          title="Reports are restricted"
          message="Post-event report submission is available to club presidents. Advisors and admins can review reports from the archive."
          tone="warning"
        />
      </div>
    );
  }

  return (
    <div className="clb-screen space-y-6">
      <ClublyPageHeader
        eyebrow="Reports Archive"
        title="Submit post-event report"
        description="Record attendance, outcomes, budget usage, and supporting media for an approved club event."
        actions={
          <Button type="submit" form="report-submission-form">
            <Send className="mr-2 h-4 w-4" />
            Submit report
          </Button>
        }
      />

      {isSubmitted ? (
        <ClublyStateCard
          icon={CheckCircle2}
          title="Report details captured"
          message="Connect this screen to the final report API when the backend report submission contract is available."
          tone="success"
        />
      ) : null}

      <ClublyPanel className="p-6">
        <form id="report-submission-form" className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="report-title">Event or proposal title</Label>
            <Input id="report-title" placeholder="e.g. Club innovation showcase" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-attendance">Confirmed attendance</Label>
            <Input id="report-attendance" min={0} type="number" placeholder="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-budget">Budget used (₦)</Label>
            <Input id="report-budget" min={0} type="number" placeholder="0" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="report-outcomes">Outcomes</Label>
            <Textarea id="report-outcomes" placeholder="Summarize what happened, who attended, and the result for the club." required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="report-challenges">Challenges or follow-up</Label>
            <Textarea id="report-challenges" placeholder="Add any issues, advisor notes, or next actions." />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="report-files"
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-center transition hover:border-primary hover:bg-primary/5"
            >
              <FileUp className="h-8 w-8 text-primary" />
              <span className="mt-3 text-sm font-semibold text-foreground">Upload photos, receipts, or attendance sheets</span>
              <span className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, or CSV files</span>
              <Input id="report-files" className="sr-only" type="file" multiple />
            </label>
          </div>
        </form>
      </ClublyPanel>
    </div>
  );
}
