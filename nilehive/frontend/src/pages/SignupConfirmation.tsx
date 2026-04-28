import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

export default function SignupConfirmation() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-foreground">
      <section className="w-full max-w-2xl">
        <div className="nh-card bg-card p-6 md:p-10">
          <BrandLogo
            size="lg"
            variant="plain"
            className="mb-6 h-20 w-[19rem] max-w-full sm:h-24 sm:w-[21rem]"
          />

          <div className="mb-8 border-b-2 border-foreground pb-6">
            <p className="nh-eyebrow">Email Confirmation</p>
            <h1 className="mt-2 text-4xl font-black uppercase">Check Your Inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a Nile University verification link so your Club Services account can open safely.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 border-2 border-foreground bg-muted p-4 text-sm">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>
                Open the confirmation email{email ? ` sent to ${email}` : ""} and follow the link from that same Nile University inbox.
              </p>
            </div>

            <div className="flex items-start gap-3 border-2 border-success bg-success/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p>
                After you confirm, come back and sign in. New accounts will enter the app directly without a separate profile-setup step.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button asChild className="h-12 flex-1">
                <Link to="/login">Return to sign in</Link>
              </Button>
              <Button asChild className="h-12" variant="outline">
                <Link to="/signup">Back to signup</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
