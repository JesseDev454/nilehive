import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit3,
  Filter,
  Info,
  Loader2,
  Sparkles,
  User
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { ExecutiveActionItem, ExecutiveTaskStatus } from "./ExecutiveHomeWorkspace";

interface AssignedActionsSectionProps {
  actions: ExecutiveActionItem[];
  isLoading?: boolean;
  onOpenUpdateModal: (action: ExecutiveActionItem) => void;
  onQuickStatusChange: (actionId: string, status: ExecutiveTaskStatus) => void;
}

export function AssignedActionsSection({
  actions,
  isLoading = false,
  onOpenUpdateModal,
  onQuickStatusChange
}: AssignedActionsSectionProps) {
  const [activeTab, setActiveTab] = useState<"needing_update" | "all" | "in_progress" | "blocked" | "completed">("needing_update");

  const filteredActions = actions.filter((act) => {
    if (activeTab === "needing_update") {
      return act.status === "Pending" || act.status === "In Progress" || act.status === "Blocked";
    }
    if (activeTab === "in_progress") return act.status === "In Progress";
    if (activeTab === "blocked") return act.status === "Blocked";
    if (activeTab === "completed") return act.status === "Completed";
    return true;
  });

  const needingUpdateCount = actions.filter(
    (a) => a.status === "Pending" || a.status === "In Progress" || a.status === "Blocked"
  ).length;

  return (
    <section
      id="assigned-actions-section"
      aria-labelledby="assigned-actions-heading"
      className="space-y-3"
    >
      {/* Section Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary shrink-0" />
          <h2
            id="assigned-actions-heading"
            className="text-sm sm:text-base font-bold text-foreground tracking-tight"
          >
            Assigned Actions Needing Update
          </h2>
          {needingUpdateCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono">
              {needingUpdateCount} Active
            </span>
          )}
        </div>

        <Link
          to="/tasks"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All Tasks in My Work</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-border/60">
        {[
          { id: "needing_update" as const, label: `Needing Update (${needingUpdateCount})` },
          { id: "all" as const, label: `All (${actions.length})` },
          { id: "in_progress" as const, label: `In Progress (${actions.filter(a => a.status === "In Progress").length})` },
          { id: "blocked" as const, label: `Blocked (${actions.filter(a => a.status === "Blocked").length})` },
          { id: "completed" as const, label: `Completed (${actions.filter(a => a.status === "Completed").length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl border border-border/60 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredActions.length === 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {activeTab === "needing_update"
              ? "All Assigned Actions Up to Date!"
              : "No actions found in this filter."}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === "needing_update"
              ? "You have updated all current club deliverables. Review completed records or upcoming event requirements."
              : "Switch filter to view other executive action items."}
          </p>
        </div>
      )}

      {/* Action Cards List */}
      {!isLoading && filteredActions.length > 0 && (
        <div className="space-y-3">
          {filteredActions.map((item) => {
            const isBlocked = item.status === "Blocked";
            const isCompleted = item.status === "Completed";
            const isInProgress = item.status === "In Progress";

            return (
              <Card
                key={item.id}
                className={`border-border/80 shadow-xs transition-all ${
                  isBlocked
                    ? "border-amber-500/30 bg-amber-500/5"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-85"
                    : "bg-card"
                }`}
              >
                <CardContent className="p-4 sm:p-4.5 space-y-3 text-xs">
                  {/* Top Bar: Title, Priority, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">
                          {item.title}
                        </h3>
                        {item.priority === "Urgent" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-mono">
                            URGENT
                          </span>
                        )}
                        {item.priority === "High" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge
                        variant={
                          isCompleted
                            ? "success"
                            : isBlocked
                            ? "warning"
                            : isInProgress
                            ? "info"
                            : "default"
                        }
                        label={item.status}
                      />
                    </div>
                  </div>

                  {/* Blocker Alert Box if Blocked */}
                  {isBlocked && item.blockerReason && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">Presidential Unblocking Flag:</span>
                        <p className="leading-relaxed">{item.blockerReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Progress Note if Available */}
                  {item.progressNote && !isBlocked && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-0.5">
                      <span className="font-semibold text-foreground">Latest Update:</span>
                      <p>{item.progressNote}</p>
                    </div>
                  )}

                  {/* Meta Bar: Assignment info + Update Workflow CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-[11px]">
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        <span>Assigned by: <strong className="text-foreground">{item.assignedBy}</strong></span>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>Due: <strong className="text-foreground">{item.dueDate}</strong></span>
                      </span>
                    </div>

                    {/* Dominant Action: Open Update Modal */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenUpdateModal(item)}
                        className="text-xs font-bold gap-1.5 h-8 bg-card hover:bg-muted"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
                        <span>Update Status &amp; Notes</span>
                      </Button>

                      {/* Quick inline complete if not yet completed */}
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusChange(item.id, "Completed")}
                          className="h-8 px-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Mark complete directly"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
