import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "pending" | "rejected";

interface Step {
  label: string;
  status: StepStatus;
  remarks?: string;
  timestamp?: string;
}

export function ApprovalStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center border-2 border-foreground text-sm font-black shadow-[3px_3px_0_hsl(var(--foreground))]",
                step.status === "completed" && "bg-success text-success-foreground",
                step.status === "current" && "bg-warning text-warning-foreground",
                step.status === "pending" && "bg-muted text-muted-foreground",
                step.status === "rejected" && "bg-destructive text-destructive-foreground"
              )}
            >
              {step.status === "completed" && <Check className="h-4 w-4" />}
              {step.status === "current" && <Clock className="h-4 w-4" />}
              {step.status === "rejected" && <X className="h-4 w-4" />}
              {step.status === "pending" && <span>{i + 1}</span>}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-12 w-1 border-x border-foreground",
                step.status === "completed" ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
          <div className="pt-1 pb-4">
            <p className={cn(
              "text-sm font-black uppercase tracking-[0.08em]",
              step.status === "pending" && "text-muted-foreground"
            )}>
              {step.label}
            </p>
            {step.remarks && (
              <p className="text-xs text-muted-foreground mt-1">{step.remarks}</p>
            )}
            {step.timestamp && (
              <p className="text-[11px] font-medium text-muted-foreground mt-1">{step.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
