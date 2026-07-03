import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClublyStateCard } from "@/components/Clubly";

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const message = reason
    ? `Clubly could not complete the request: ${reason}. Try again, or return to the dashboard.`
    : "Clubly could not complete the request. Try again, or return to the dashboard.";

  return (
    <main className="clb-screen flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ClublyStateCard icon={AlertTriangle} title="Something needs another try" message={message} tone="danger">
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
        </ClublyStateCard>
      </div>
    </main>
  );
}
