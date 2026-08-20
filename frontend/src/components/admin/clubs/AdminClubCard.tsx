import { Building2, Calendar, CreditCard, Edit3, Eye, MapPin, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OfficialClub } from "@/data/official14ClubsData";

interface AdminClubCardProps {
  club: OfficialClub;
  onInspect: (club: OfficialClub) => void;
  onEdit: (club: OfficialClub) => void;
}

export function AdminClubCard({ club, onInspect, onEdit }: AdminClubCardProps) {
  return (
    <div
      id={`club-card-${club.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-2xs transition-all duration-180 hover:border-primary/40 hover:shadow-xs"
    >
      {/* Cover Image & Badges */}
      <div>
        <div className="relative aspect-16/8 w-full overflow-hidden bg-muted">
          <img
            src={club.coverImage}
            alt={`${club.name} cover`}
            className="h-full w-full object-cover transition-transform duration-250 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category Chip & Club Code */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
              {club.category}
            </span>
            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground font-mono">
              {club.code}
            </span>
          </div>

          <div className="absolute bottom-2.5 left-3 right-3">
            <h2 className="text-base font-bold text-white tracking-tight drop-shadow-xs">
              {club.name}
            </h2>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3 text-xs">
          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          {/* Leaders & Dues Info */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[10px]">President:</span>
              <span className="font-semibold text-foreground truncate block">{club.presidentName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Faculty Advisor:</span>
              <span className="font-semibold text-foreground truncate block">{club.advisorName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Annual Dues:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ₦{club.duesAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Active Members:</span>
              <span className="font-semibold text-foreground">{club.memberCount} students</span>
            </div>
          </div>

          {/* Meeting location & time */}
          <div className="rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate">{club.location}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate">{club.meetingSchedule}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between border-t border-border/70 p-3 bg-muted/10">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(club)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Profile</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(club)}
          className="h-8 gap-1.5 text-xs font-semibold hover:border-primary hover:text-primary"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit &amp; Bank Settings</span>
        </Button>
      </div>
    </div>
  );
}
