import { AlertCircle, ArrowRight, HelpCircle, Mail, School, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface UnsupportedDomainScreenProps {
  attemptedEmail?: string;
  onSwitchAccount?: () => void;
}

export function UnsupportedDomainScreen({
  attemptedEmail = "student.personal@gmail.com",
  onSwitchAccount
}: UnsupportedDomainScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm tracking-tight text-foreground">Institutional Domain Required</span>
          </div>
          <span className="text-[10px] font-bold text-destructive bg-destructive/15 border border-destructive/25 px-2 py-0.5 rounded-full">
            Invalid Domain
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Use your Nile University Email
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              OneClub is exclusively provisioned for active Nile University students, faculty advisors, and administrative staff.
            </p>
          </div>

          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-destructive block">
              Attempted Non-Institutional Address
            </span>
            <p className="font-mono font-bold text-foreground text-xs">{attemptedEmail}</p>
            <p className="text-[11px] text-muted-foreground pt-1">
              Personal email providers (e.g. Gmail, Yahoo, Outlook.com) cannot map to Campus One student records.
            </p>
          </div>

          {/* Supported Domains List */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
            <span className="font-bold text-foreground block text-xs">
              Supported University Domains:
            </span>
            <ul className="space-y-1 text-[11px] text-muted-foreground font-mono">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>@nileuniversity.edu.ng (Staff / Officials)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>@student.nileuniversity.edu.ng (Undergraduate &amp; Postgrad)</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-11 text-xs font-bold gap-2 justify-center shadow-xs"
              onClick={onSwitchAccount}
            >
              <span>Switch to Nile University Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
