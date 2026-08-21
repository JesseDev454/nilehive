import { Copy, Check, Lock, User } from "lucide-react";
import { useState } from "react";
import { displayOrNotProvided, type AdminProfileDetails } from "@/data/adminProfileData";

interface AdminIdentityCardProps {
  profile: AdminProfileDetails;
}

export function AdminIdentityCard({ profile }: AdminIdentityCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    if (!text || text === "Not provided.") return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <div id="admin-identity-card" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Campus One Identity</h2>
            <p className="text-[11px] text-muted-foreground">Synchronized institutional credentials</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Read-Only Record
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1 text-xs">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Institutional Name</span>
          <div className="text-sm font-bold text-foreground">{displayOrNotProvided(profile.name)}</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Campus Staff / Student ID</span>
            <button
              type="button"
              onClick={() => void handleCopy(profile.staffId, "staffId")}
              className="text-muted-foreground hover:text-foreground min-h-11 min-w-11 inline-flex items-center justify-center"
              aria-label="Copy staff or student ID"
            >
              {copiedField === "staffId" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-sm font-mono font-bold text-foreground">{displayOrNotProvided(profile.staffId)}</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Official University Email</span>
            <button
              type="button"
              onClick={() => void handleCopy(profile.email, "email")}
              className="text-muted-foreground hover:text-foreground min-h-11 min-w-11 inline-flex items-center justify-center"
              aria-label="Copy institutional email"
            >
              {copiedField === "email" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-sm font-mono text-foreground break-all">{displayOrNotProvided(profile.email)}</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Portal user ID</span>
          <div className="text-xs font-mono font-semibold text-foreground break-all">{displayOrNotProvided(profile.portalUserId)}</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Account status</span>
          <div className="text-xs font-semibold text-foreground">{displayOrNotProvided(profile.accountStatus)}</div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1 sm:col-span-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Administrative Directorate</span>
          <div className="text-xs font-semibold text-foreground">{displayOrNotProvided(profile.department)}</div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{copiedField ? `${copiedField} copied` : ""}</p>

      <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed">
        <strong>Campus One Sync: </strong>
        Your name, university email, and staff identification number are managed through Nile University&rsquo;s central Microsoft OIDC identity provider. To update your legal name or department affiliation, please contact the University ICT Center.
      </div>
    </div>
  );
}
