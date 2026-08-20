import React from "react";
import { FolderSearch, Plus, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Skeleton, SkeletonCard } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";

export function SharedSkeletonsAndEmptyStates() {
  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto p-4 sm:p-6">
      {/* SECTION 1: COMPACT EMPTY-STATE PATTERNS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Small Empty-State Pattern
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">Standardized Empty States</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Folder Empty State */}
          <EmptyState
            title="No Directives Found"
            description="You have cleared all presidential task assignments and review items."
            action={
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Sync Notifications
              </Button>
            }
          />

          {/* Contextual Custom Empty State */}
          <EmptyState
            icon={<UserCheck className="h-6 w-6 text-primary" />}
            title="No Pending Member Approvals"
            description="All student intake applications for this academic term have been reviewed."
            action={
              <Button size="sm" className="text-xs font-bold gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Invite New Students</span>
              </Button>
            }
          />
        </div>
      </section>

      {/* SECTION 2: SHARED SKELETON LOADERS */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Shared Skeletons (Cards, Tables, Feed)
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">Non-Blocking Loading States</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Skeleton 1 */}
          <SkeletonCard />

          {/* List Skeleton 2 */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="w-1/2 h-4" />
              <Skeleton variant="rectangular" width={50} height={20} />
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" className="w-2/3 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" className="w-4/5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" className="w-3/5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Profile Header Skeleton 3 */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" className="w-3/4 h-4" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Skeleton variant="rectangular" className="h-12 w-full" />
              <Skeleton variant="rectangular" className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
