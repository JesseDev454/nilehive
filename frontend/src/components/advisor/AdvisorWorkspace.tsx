import { BookOpenCheck, Building2, ClipboardList, FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";

type AdvisorSection = "home" | "reviews" | "clubs" | "reports" | "more" | "notifications" | "profile";

const content: Record<AdvisorSection, { title: string; description: string; icon: typeof BookOpenCheck }> = {
  home: { title: "Advisor home", description: "Your assigned-club review workspace is ready for its generated screens.", icon: BookOpenCheck },
  reviews: { title: "Proposal reviews", description: "Review screens have not been generated yet. Advisors will approve or return proposals with remarks here.", icon: ClipboardList },
  clubs: { title: "Assigned clubs", description: "This area will show only the clubs assigned to the signed-in Advisor.", icon: Building2 },
  reports: { title: "Post-event reports", description: "Advisor report screens are still awaiting their approved visual references.", icon: FileText },
  more: { title: "More", description: "Notifications and the read-only Campus One profile will live here.", icon: ShieldCheck },
  notifications: { title: "Notifications", description: "Advisor notification screens have not been generated yet.", icon: BookOpenCheck },
  profile: { title: "Advisor profile", description: "Campus One identity will remain read-only in this workspace.", icon: ShieldCheck },
};

export function AdvisorWorkspace({ section }: { section: AdvisorSection }) {
  const item = content[section];
  const Icon = item.icon;
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-10" aria-labelledby="advisor-title">
      <Card className="w-full border-border/80">
        <CardHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <StatusBadge status="default" label="Advisor preview" />
            <CardTitle id="advisor-title" className="text-2xl">{item.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{item.description}</p>
          <p className="mt-4 rounded-xl border border-border bg-muted/50 p-4 text-sm text-foreground">
            This honest placeholder avoids copying the old Advisor dashboard or inventing actions before the new Advisor UI is approved.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
