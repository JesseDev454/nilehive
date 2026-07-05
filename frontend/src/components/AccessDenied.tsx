import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ClublyStateCard } from "@/components/Clubly";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { roleLabels } from "@/lib/appNavigation";

type AccessDeniedProps = {
  title?: string;
  reason: string;
  suggestedDestination?: string;
  icon?: ElementType;
};

export function AccessDenied({
  title = "This page is not available for your role",
  reason,
  suggestedDestination = "Open your dashboard to continue with the Clubly tools available to your role.",
  icon: Icon = ShieldCheck
}: AccessDeniedProps) {
  const { role } = useRole();
  const roleLabel = role ? roleLabels[role] : "Unknown role";

  return (
    <ClublyStateCard icon={Icon} title={title} message={reason}>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-sm">
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-left">
          <p className="font-semibold text-foreground">Current role: {roleLabel}</p>
          <p className="mt-1 text-muted-foreground">{suggestedDestination}</p>
        </div>
        <Button asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    </ClublyStateCard>
  );
}
