import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CalendarDays, Compass, Home, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="nh-card relative w-full max-w-2xl overflow-hidden bg-card p-8 text-center md:p-12">
        <div className="absolute -bottom-12 -right-4 text-[10rem] font-black leading-none text-muted/70">404</div>
        <div className="relative z-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-3 border-foreground bg-accent shadow-neo-sm">
            <Compass className="h-10 w-10" />
          </div>
          <p className="nh-eyebrow">Page not found</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal md:text-5xl">That page is not available.</h1>
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
      </div>
    </div>
  );
};

export default NotFound;
