import {
  CheckCircle2,
  Filter,
  Info,
  Layers,
  MessageSquare,
  Search,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  FEEDBACK_CATEGORIES,
  type AdminFeedbackCategory,
  type FeedbackAuthorRole
} from "@/data/adminFeedbackData";

export type FeedbackCategoryFilter = "all" | AdminFeedbackCategory;

interface AdminFeedbackHeaderProps {
  selectedCategory: FeedbackCategoryFilter;
  onCategoryChange: (cat: FeedbackCategoryFilter) => void;
  selectedRole: "all" | FeedbackAuthorRole;
  onRoleChange: (role: "all" | FeedbackAuthorRole) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
}

export function AdminFeedbackHeader({
  selectedCategory,
  onCategoryChange,
  selectedRole,
  onRoleChange,
  searchTerm,
  onSearchChange,
  totalCount
}: AdminFeedbackHeaderProps) {
  const categoryFilters: Array<{ id: FeedbackCategoryFilter; label: string }> = [
    { id: "all", label: "All Feedback" },
    { id: "general", label: "General" },
    { id: "club", label: "Club Operations" },
    { id: "onboarding", label: "Onboarding" },
    { id: "joining", label: "Club Joining" },
    { id: "dues", label: "Dues & Payments" },
    { id: "login_access", label: "Login & Access" }
  ];

  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      {/* Title & Institutional Notice */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Campus Voice Directory</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Student &amp; Club Feedback
          </h1>
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {totalCount} Entries
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
          Review authentic user inquiries, onboarding suggestions, dues verification queries, and platform feedback.
        </p>

        {/* Mandatory Transparency Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground mt-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-foreground">Directorate Transparency Disclosure: </strong>
            <span className="text-muted-foreground">
              Students and student leaders were explicitly informed at the point of submission that Club Services and Directorate of Student Affairs administrators have read access to these records to guide institutional improvements.
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {categoryFilters.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryChange(tab.id)}
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

      {/* Search & Submitter Role Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search feedback, student name, or matric..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={selectedRole} onValueChange={(v) => onRoleChange(v as "all" | FeedbackAuthorRole)}>
            <SelectTrigger className="w-[180px] text-xs h-9 bg-background">
              <SelectValue placeholder="All Submitter Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submitter Roles</SelectItem>
              <SelectItem value="student">Students Only</SelectItem>
              <SelectItem value="executive">Club Executives</SelectItem>
              <SelectItem value="president">Club Presidents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
