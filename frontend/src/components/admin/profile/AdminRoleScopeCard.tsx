import { CheckCircle, Lock, ShieldCheck } from "lucide-react";
import { type AdminProfileDetails } from "@/data/adminProfileData";

interface AdminRoleScopeCardProps {
  profile: AdminProfileDetails;
}

export function AdminRoleScopeCard({ profile }: AdminRoleScopeCardProps) {
  return (
    <div id="admin-role-scope-card" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">OneClub access</h2>
            <p className="text-[11px] text-muted-foreground">Directorate-level permissions</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {profile.effectiveRole}
        </span>
      </div>

      <div className="space-y-3 text-xs pt-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">portal_role</span>
            <div className="text-xs font-bold text-foreground">{profile.portalRole}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">app_role</span>
            <div className="text-xs font-bold text-foreground">{profile.appRole}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">effective_role</span>
            <div className="text-xs font-bold text-foreground">{profile.effectiveRole}</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">custom_roles</span>
            <div className="text-xs font-bold text-foreground">
              {profile.customRoles.length ? profile.customRoles.join(", ") : "Not provided."}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Institutional Jurisdiction</span>
          <div className="text-xs font-bold text-foreground">{profile.governanceScope}</div>
        </div>

        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Administrative Authorities
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {profile.authorities.map((auth) => (
              <div key={auth} className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2.5 text-xs text-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{auth}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <span>
            <strong>Role Integrity: </strong>
            Campus One identity and roles cannot be granted or edited from OneClub. Role switching is disabled for authenticated Directorate administrators.
          </span>
        </div>
      </div>
    </div>
  );
}
