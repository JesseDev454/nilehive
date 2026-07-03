import { Link } from "react-router-dom";
import { CalendarDays, Compass, Home, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClublyPanel } from "@/components/Clubly";

const NotFound = () => {
  return (
    <div className="clb-screen flex min-h-screen items-center justify-center p-6">
      <ClublyPanel className="relative w-full max-w-2xl overflow-hidden p-8 text-center md:p-12">
        <div className="absolute -bottom-12 -right-4 text-[10rem] font-black leading-none text-muted/50">404</div>
        <div className="relative z-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-soft-sm">
            <Compass className="h-10 w-10" />
          </div>
          <p className="clb-eyebrow">Page not found</p>
          <h1 className="clb-title mt-2 text-4xl md:text-5xl">That page is not available.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            The link may be old, or your role may not use this page. Choose a safe place to continue.
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/membership">
                <UserPlus className="mr-2 h-4 w-4" />
                Discover Clubs
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/events">
                <CalendarDays className="mr-2 h-4 w-4" />
                View Events
              </Link>
            </Button>
          </div>
        </div>
      </ClublyPanel>
    </div>
  );
};

export default NotFound;
