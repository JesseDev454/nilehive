import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OneClubStateCard } from "@/components/OneClub";

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const message = reason
    ? `OneClub could not complete the request: ${reason}. Try again, or return to the dashboard.`
    : "OneClub could not complete the request. Try again, or return to the dashboard.";

  return (
    <main className="clb-screen flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <OneClubStateCard icon={AlertTriangle} title="Something needs another try" message={message} tone="danger">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </OneClubStateCard>
      </div>
    </main>
  );
}
