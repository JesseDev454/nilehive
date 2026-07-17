import { ClublyPageHeader } from "@/components/Clubly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { profile, role } = useAuth();

  return <div className="clb-screen">
    <ClublyPageHeader title="Profile" description="Review your Clubly identity and account details." />
    <Card><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Name</span><br />{profile?.full_name || "Not provided"}</p><p><span className="text-muted-foreground">Role</span><br />{role || profile?.role || "Loading"}</p><p><span className="text-muted-foreground">Student ID</span><br />{profile?.student_id || "Not provided"}</p><p><span className="text-muted-foreground">Department</span><br />{profile?.department || "Not provided"}</p></CardContent></Card>
  </div>;
}
