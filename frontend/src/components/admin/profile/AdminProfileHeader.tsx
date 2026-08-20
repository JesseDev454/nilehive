import { CheckCircle2, Shield, ShieldCheck, UserCircle } from "lucide-react";
import { type AdminProfileDetails } from "@/data/adminProfileData";

interface AdminProfileHeaderProps {
  profile: AdminProfileDetails;
}

export function AdminProfileHeader({ profile }: AdminProfileHeaderProps) {
  // Generate 2-letter monogram
  const initials = profile.name
    .split(" ")
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-5 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {/* Monogram Badge */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
          {initials || "ZA"}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-background shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-primary fill-primary/20" />
          </div>
        </div>

        {/* Name, Staff ID, Directorate */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Verified Administrator
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {profile.department} &bull; <span className="font-mono">{profile.staffId}</span>
          </p>
        </div>
      </div>

      {/* Session Scope Pill */}
      <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground self-start sm:self-auto">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Campus One Active SSO Session</span>
      </div>
    </div>
  );
}
