import { CheckSquare, Clock, CreditCard, FileText, Filter, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OFFICIAL_14_CLUBS } from "@/data/mockData";

export type ApprovalTab = "proposals" | "join_requests" | "payment_proofs";

interface AdminApprovalsHeaderProps {
  activeTab: ApprovalTab;
  onTabChange: (tab: ApprovalTab) => void;
  counts: {
    proposals: number;
    join_requests: number;
    payment_proofs: number;
  };
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedClubFilter: string;
  onClubFilterChange: (clubId: string) => void;
}

export function AdminApprovalsHeader({
  activeTab,
  onTabChange,
  counts,
  searchTerm,
  onSearchChange,
  selectedClubFilter,
  onClubFilterChange
}: AdminApprovalsHeaderProps) {
  const tabs = [
    {
      id: "proposals" as const,
      label: "Proposals",
      count: counts.proposals,
      icon: FileText
    },
    {
      id: "join_requests" as const,
      label: "Join Requests",
      count: counts.join_requests,
      icon: UserCheck
    },
    {
      id: "payment_proofs" as const,
      label: "Payment Proofs",
      count: counts.payment_proofs,
      icon: CreditCard
    }
  ];

  return (
    <div className="space-y-5 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>Directorate Authorization Surface</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Campus Approvals &amp; Verifications
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review, authorize, or return proposals, club join applications, and dues payment receipts across the 14 official clubs.
        </p>
      </div>

      {/* 3 Unified Filter Tabs (Not competing homes) */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-approvals-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-180 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs scale-[1.01]"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-foreground border border-border/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Club Filtering */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab.replace("_", " ")} by title, name, reference...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={selectedClubFilter} onValueChange={onClubFilterChange}>
            <SelectTrigger className="w-[200px] text-xs h-9 bg-background">
              <SelectValue placeholder="All 14 Official Clubs" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All 14 Official Clubs</SelectItem>
              {OFFICIAL_14_CLUBS.map((club) => (
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
