import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ClublySkeleton({ variant = "cards", rows = 3, className }: { variant?: "page" | "cards" | "list" | "table"; rows?: number; className?: string }) {
  if (variant === "page") {
    return <div className={cn("space-y-5", className)} aria-label="Loading page" aria-busy="true"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-5 w-full max-w-xl" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-44 rounded-[24px]" />)}</div></div>;
  }
  if (variant === "table") {
    return <div className={cn("space-y-2 rounded-[24px] border border-border p-4", className)} aria-label="Loading table" aria-busy="true">{Array.from({ length: rows + 1 }, (_, index) => <Skeleton key={index} className={cn("h-10 w-full", index === 0 && "bg-muted")} />)}</div>;
  }
  if (variant === "list") {
    return <div className={cn("space-y-3", className)} aria-label="Loading list" aria-busy="true">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-20 w-full rounded-[20px]" />)}</div>;
  }
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)} aria-label="Loading cards" aria-busy="true">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-52 rounded-[24px]" />)}</div>;
}
