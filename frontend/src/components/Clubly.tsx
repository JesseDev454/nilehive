import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClublySectionHeader({
  title,
  description,
  action,
  className
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">{title}</h2>
        {description ? <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ClublyMetaChip({
  icon: Icon,
  label,
  value,
  className
}: {
  icon?: ElementType;
  label?: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm",
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
      {label ? <span className="text-muted-foreground">{label}</span> : null}
      <span className="min-w-0 truncate">{value}</span>
    </span>
  );
}

export function ClublyStepIndicator({
  steps,
  currentStep
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((stepLabel, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <div key={stepLabel} className="flex items-center gap-2">
            {index > 0 ? <span className="h-px w-6 bg-border" /> : null}
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
                isActive || isComplete
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
              {stepLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ClublyProgressHero({
  eyebrow,
  title,
  value,
  progress,
  detail,
  stats,
  action
}: {
  eyebrow?: string;
  title: string;
  value: ReactNode;
  progress: number;
  detail?: ReactNode;
  stats?: Array<{ label: string; value: ReactNode }>;
  action?: ReactNode;
}) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <section className="clb-card overflow-hidden bg-primary p-6 text-primary-foreground">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="clb-eyebrow text-primary-foreground/70">{eyebrow}</p> : null}
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-primary-foreground md:text-4xl">{title}</h2>
          <div className="mt-4 text-4xl font-bold leading-none md:text-5xl">{value}</div>
          {detail ? <div className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/75">{detail}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
        <div className="h-full rounded-full bg-primary-foreground transition-all duration-500" style={{ width: `${safeProgress}%` }} />
      </div>
      {stats?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.map((stat) => (
            <span key={stat.label} className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold">
              {stat.value} <span className="text-primary-foreground/65">{stat.label}</span>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ClublyPageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-primary md:text-[48px]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

export function ClublyMetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "default"
}: {
  title: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ElementType;
  tone?: "default" | "navy" | "green" | "gold" | "red";
}) {
  const toneClass = {
    default: "bg-card text-card-foreground",
    navy: "bg-primary text-primary-foreground",
    green: "bg-success text-success-foreground",
    gold: "bg-warning text-warning-foreground",
    red: "bg-destructive text-destructive-foreground"
  }[tone];

  return (
    <div className={cn("clb-card relative overflow-hidden p-5", toneClass)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="clb-panel-title opacity-75">{title}</p>
          <div className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-background/45 shadow-soft-sm">
            <Icon className="h-6 w-6 opacity-90" />
          </div>
        ) : null}
      </div>
      {detail ? <div className="mt-3 text-sm opacity-80">{detail}</div> : null}
    </div>
  );
}

export function ClublyCommandPanel({
  eyebrow,
  title,
  description,
  stats,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
}) {
  return (
    <section className="clb-command-panel">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="clb-eyebrow text-primary-foreground/75">{eyebrow}</p> : null}
          <h1 className="mt-2 break-words text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm text-primary-foreground/80 md:text-base">{description}</p> : null}
        </div>
        {stats?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[18px] border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function ClublyActionCard({
  icon: Icon,
  title,
  description,
  children,
  tone = "default"
}: {
  icon?: ElementType;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "navy" | "green" | "gold" | "danger";
}) {
  const toneClass = {
    default: "bg-card text-card-foreground",
    navy: "bg-primary text-primary-foreground",
    green: "bg-success text-success-foreground",
    gold: "bg-warning text-warning-foreground",
    danger: "bg-destructive text-destructive-foreground"
  }[tone];

  return (
    <div className={cn("clb-card p-5", toneClass)}>
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="rounded-[16px] bg-background/40 p-3 shadow-soft-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="clb-panel-title">{title}</h3>
          {description ? <div className="mt-2 text-sm opacity-80">{description}</div> : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function ClublyStateCard({
  icon: Icon,
  title,
  message,
  tone = "default",
  children
}: {
  icon?: ElementType;
  title: string;
  message?: string;
  tone?: "default" | "danger" | "success" | "warning";
  children?: ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-destructive/25 bg-destructive/10"
      : tone === "success"
        ? "border-success/25 bg-success/10"
        : tone === "warning"
          ? "border-warning/25 bg-warning/10"
        : "border-border";

  return (
    <div className={cn("clb-empty", toneClass)}>
      {Icon ? <Icon className="mx-auto mb-4 h-12 w-12" /> : null}
      <h2 className="text-2xl font-bold">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function ClublyPanel({
  title,
  description,
  eyebrow,
  actions,
  children,
  tone = "default",
  className
}: {
  title?: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "navy" | "green" | "gold";
  className?: string;
}) {
  const toneClass = {
    default: "bg-card text-card-foreground",
    navy: "bg-primary text-primary-foreground",
    green: "bg-success text-success-foreground",
    gold: "bg-warning text-warning-foreground"
  }[tone];

  return (
    <section className={cn("clb-card overflow-hidden", toneClass, className)}>
      {(title || description || eyebrow || actions) ? (
        <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-start md:justify-between">
          <div>
            {eyebrow ? <p className="clb-eyebrow opacity-75">{eyebrow}</p> : null}
            {title ? <h2 className="text-xl font-bold leading-tight">{title}</h2> : null}
            {description ? <div className="mt-2 text-sm opacity-75">{description}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children ? <div className="p-5">{children}</div> : null}
    </section>
  );
}

export function ClublyEmptyState({
  icon: Icon,
  title,
  message,
  children
}: {
  icon?: ElementType;
  title: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="clb-empty">
      {Icon ? <Icon className="mx-auto mb-4 h-10 w-10" /> : null}
      <h3 className="text-xl font-bold">{title}</h3>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function ClublyErrorState({
  icon: Icon,
  title = "Unable to load this section",
  message,
  children
}: {
  icon?: ElementType;
  title?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="clb-card border-destructive/20 bg-destructive/10 p-5">
      <div className="flex items-start gap-4">
        {Icon ? <Icon className="mt-1 h-6 w-6 shrink-0 text-destructive" /> : null}
        <div>
          <h3 className="font-semibold text-destructive">{title}</h3>
          {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function ClublyListItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("clb-list-card", className)}>{children}</div>;
}

export function ClublyLoadingState({
  title = "Loading OneClub",
  message = "Preparing the latest workspace data.",
  compact = false,
  delayedMessage,
  delayedMessageDelayMs = 8000,
  progress
}: {
  title?: string;
  message?: string;
  compact?: boolean;
  delayedMessage?: string;
  delayedMessageDelayMs?: number;
  progress?: number;
}) {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  const [estimatedProgress, setEstimatedProgress] = useState(8);

  useEffect(() => {
    if (!delayedMessage) {
      setShowDelayedMessage(false);
      return undefined;
    }

    setShowDelayedMessage(false);
    const timer = window.setTimeout(() => setShowDelayedMessage(true), delayedMessageDelayMs);
    return () => window.clearTimeout(timer);
  }, [delayedMessage, delayedMessageDelayMs]);

  useEffect(() => {
    if (typeof progress === "number") {
      return undefined;
    }

    setEstimatedProgress(8);
    const milestones = [
      { delay: 120, value: 18 },
      { delay: 450, value: 32 },
      { delay: 900, value: 46 },
      { delay: 1600, value: 61 },
      { delay: 2600, value: 74 },
      { delay: 4200, value: 84 },
      { delay: 6200, value: 94 },
      { delay: 7600, value: 100 }
    ];
    const timers = milestones.map((milestone) =>
      window.setTimeout(() => setEstimatedProgress((current) => Math.max(current, milestone.value)), milestone.delay)
    );
    const interval = window.setInterval(() => {
      setEstimatedProgress((current) => {
        if (current >= 100) {
          return current;
        }

        const remaining = 100 - current;
        return Math.min(100, current + Math.max(1, Math.round(remaining * 0.16)));
      });
    }, 1400);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(interval);
    };
  }, [progress]);

  const safeProgress = Math.max(0, Math.min(100, progress ?? estimatedProgress));

  return (
    <div className={cn("clb-card overflow-hidden bg-card/90", compact ? "p-5" : "p-8")}>
      <div
        className="mb-5 h-2 overflow-hidden rounded-full bg-primary/15"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safeProgress)}
      >
        {typeof progress === "number" ? (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        ) : (
          <div className="h-full w-1/2 rounded-full bg-primary animate-clubly-progress" />
        )}
      </div>
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-accent text-accent-foreground">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        </div>
        <div>
          <p className="clb-eyebrow">Please wait</p>
          <h2 className={cn("font-bold leading-tight", compact ? "text-xl" : "text-2xl md:text-3xl")}>{title}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
          {showDelayedMessage ? <p className="mt-3 max-w-xl text-sm font-medium text-warning">{delayedMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function ClublyWorkspaceLoadingScreen({
  title = "Opening your OneClub workspace",
  message = "Preparing your campus workspace."
}: {
  title?: string;
  message?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#001529] px-6 text-white">
      <section className="w-full max-w-sm text-center" aria-live="polite" aria-busy="true">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[3px] border-[#8d7a38] bg-[#f0f4ff] shadow-[0_0_0_2px_rgba(255,255,255,0.1)]">
          <Users className="h-12 w-12 text-[#001529]" aria-hidden="true" />
        </div>
        <h1 className="mt-14 text-4xl font-semibold tracking-[-0.02em] text-[#fed65b]">OneClub</h1>
        <p className="mt-4 text-xl text-[#b7ccff]">{title}</p>
        <p className="mt-2 text-sm text-[#b7ccff]/80">{message}</p>
        <div className="mt-10 h-2 overflow-hidden rounded-full bg-[#315486]" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={45}>
          <div className="h-full w-1/3 rounded-full bg-[#fed65b] animate-clubly-progress" />
        </div>
      </section>
    </main>
  );
}
