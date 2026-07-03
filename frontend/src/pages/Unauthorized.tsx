import { Link } from "react-router-dom";
import { Home, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClublyStateCard } from "@/components/Clubly";
import { useAuth } from "@/contexts/AuthContext";

export default function Unauthorized() {
  const { signOut } = useAuth();

  return (
    <main className="clb-screen flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ClublyStateCard
          icon={ShieldAlert}
          title="This page is not available for your role"
          message="Clubly keeps club records, approvals, dues, and feedback separated by role. Return home or sign out safely."
          tone="warning"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </ClublyStateCard>
      </div>
    </main>
  );
}
