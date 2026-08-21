import { OneClubPageHeader } from "@/components/OneClub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { profile, role } = useAuth();

  return <div className="clb-screen">
    <OneClubPageHeader title="Profile" description="Review your OneClub identity and account details." />
    <Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Name</span><br />{profile?.full_name || "Not provided"}</p><p><span className="text-muted-foreground">Role</span><br />{role || profile?.role || "Loading"}</p><p><span className="text-muted-foreground">Student ID</span><br />{profile?.student_id || "Not provided"}</p><p><span className="text-muted-foreground">Department</span><br />{profile?.department || "Not provided"}</p></CardContent></Card>
    <div className="mt-6 flex justify-center">
      <Button 
        variant="outline" 
        onClick={() => {
          if (typeof window !== "undefined" && profile && role) {
            window.localStorage.removeItem(`nilehive:onboarding:v1:${profile.id}:${role}`);
            window.location.href = "/";
          }
        }}
      >
        Take the tour again
      </Button>
    </div>
  </div>;
}
