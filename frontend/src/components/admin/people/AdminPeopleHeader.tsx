import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AssignmentClub } from "@/lib/people/types";

interface AdminPeopleHeaderProps {
  counts: {
    presidents: number;
    executives: number;
    advisors: number;
    students: number;
  };
  searchTerm: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
  clubFilter: string;
  onClubFilterChange: (val: string) => void;
  clubs: AssignmentClub[];
}

export function AdminPeopleHeader({
  counts,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  clubFilter,
  onClubFilterChange,
  clubs,
}: AdminPeopleHeaderProps) {
  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>Campus Member Directory &amp; Role Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            People &amp; Club Leadership
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            View verified Campus One identities (read-only) and assign OneClub organizational roles across the 14 official student clubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
          <div className="rounded-xl border border-border bg-card px-2.5 py-1 text-center shadow-2xs">
            <span className="block text-[9px] uppercase font-semibold text-muted-foreground">Presidents</span>
            <span className="text-xs font-bold text-foreground font-mono">{counts.presidents}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-2.5 py-1 text-center shadow-2xs">
            <span className="block text-[9px] uppercase font-semibold text-muted-foreground">Executives</span>
            <span className="text-xs font-bold text-foreground font-mono">{counts.executives}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-2.5 py-1 text-center shadow-2xs">
            <span className="block text-[9px] uppercase font-semibold text-muted-foreground">Advisors</span>
            <span className="text-xs font-bold text-foreground font-mono">{counts.advisors}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-2.5 py-1 text-center shadow-2xs">
            <span className="block text-[9px] uppercase font-semibold text-muted-foreground">Students</span>
            <span className="text-xs font-bold text-foreground font-mono">{counts.students}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            id="admin-people-search"
            aria-label="Search people by name, campus ID or email"
            placeholder="Search by name, ID, email, club..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[140px] text-xs h-9 bg-background" aria-label="Filter by OneClub role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OneClub Roles</SelectItem>
              <SelectItem value="president">Presidents</SelectItem>
              <SelectItem value="executive">Executives</SelectItem>
              <SelectItem value="advisor">Staff Advisors</SelectItem>
              <SelectItem value="student">Students</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clubFilter} onValueChange={onClubFilterChange}>
            <SelectTrigger className="w-[180px] text-xs h-9 bg-background" aria-label="Filter by assigned club">
              <SelectValue placeholder="All Clubs" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All 14 Clubs</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
