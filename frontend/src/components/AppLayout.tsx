import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  const { profile, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 items-center justify-between border-b-2 border-foreground bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="hidden text-sm font-black uppercase tracking-[0.18em] text-foreground sm:inline">
                Nile University Club Services
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden border-2 border-secondary bg-secondary px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-secondary-foreground sm:inline">
                {profile?.role ?? "Loading"} Mode
              </span>
              <span className="hidden text-xs font-bold text-muted-foreground md:inline">
                {profile?.full_name ?? "Club Services User"}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
