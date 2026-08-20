import {
  AlertCircle,
  Filter,
  Layers,
  Megaphone,
  Plus,
  Search,
  Send,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type {
  AnnouncementAudienceType,
  AnnouncementPriorityLevel
} from "@/data/adminAnnouncementsData";

export type AudienceFilterTab = "all" | AnnouncementAudienceType;

interface AdminAnnouncementsHeaderProps {
  activeAudienceTab: AudienceFilterTab;
  onAudienceTabChange: (tab: AudienceFilterTab) => void;
  selectedPriority: "all" | AnnouncementPriorityLevel;
  onPriorityChange: (val: "all" | AnnouncementPriorityLevel) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onComposeClick: () => void;
  totalCount: number;
}

export function AdminAnnouncementsHeader({
  activeAudienceTab,
  onAudienceTabChange,
  selectedPriority,
  onPriorityChange,
  searchTerm,
  onSearchChange,
  onComposeClick,
  totalCount
}: AdminAnnouncementsHeaderProps) {
  const audienceTabs: Array<{ id: AudienceFilterTab; label: string }> = [
    { id: "all", label: "All Broadcasts" },
    { id: "all_users", label: "Campus-Wide" },
    { id: "all_clubs", label: "All 14 Clubs" },
    { id: "one_club", label: "Single Club" },
    { id: "role", label: "Role Specific" }
  ];

  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      {/* Top Title & Dominant Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Megaphone className="h-4 w-4 text-primary" />
            <span>Directorate Communications &amp; Broadcasts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Official Announcements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Publish and monitor official university communications, governance policies, and compliance notices. Recipients review and acknowledge broadcasts in their personal feeds.
          </p>
        </div>

        {/* The Dominant Supported Action */}
        <Button
          type="button"
          onClick={onComposeClick}
          className="h-10 shrink-0 gap-2 font-semibold shadow-xs transition-transform active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </Button>
      </div>

      {/* Audience Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {audienceTabs.map((tab) => {
          const isActive = activeAudienceTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onAudienceTabChange(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-180 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs scale-[1.01]"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Priority Filtering */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search broadcasts by title or keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={selectedPriority} onValueChange={(v) => onPriorityChange(v as "all" | AnnouncementPriorityLevel)}>
            <SelectTrigger className="w-[180px] text-xs h-9 bg-background">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low (Information)</SelectItem>
              <SelectItem value="normal">Normal (Standard)</SelectItem>
              <SelectItem value="high">High (Important)</SelectItem>
              <SelectItem value="urgent">Urgent (Critical)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
