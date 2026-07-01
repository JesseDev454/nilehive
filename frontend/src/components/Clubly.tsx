import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ClublyPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="clb-hero">
      <div className="min-w-0">
        {eyebrow ? <p className="clb-eyebrow mb-3 text-primary">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-border/70 bg-card/75 p-3 shadow-soft-sm backdrop-blur">
          {actions}
        </div>
      ) : null}
    </section>
  );
}

export function ClublyMetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "default",
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
    green: "bg-success/10 text-card-foreground",
    gold: "bg-warning/10 text-card-foreground",
    red: "bg-destructive/10 text-card-foreground",
  }[tone];

  return (
    <div className={cn("clb-card clb-card-h overflow-hidden p-5", toneClass)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <div className="mt-3 text-3xl font-bold tracking-[-0.04em] md:text-4xl">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-accent text-accent-foreground shadow-soft-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <div className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</div> : null}
    </div>
  );
}

export function ClublyCommandPanel({
  eyebrow,
  title,
  description,
  stats,
  actions,
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
        <div>
          {eyebrow ? <p className="clb-eyebrow text-primary-foreground/70">{eyebrow}</p> : null}
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-[-0.04em] md:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-primary-foreground/78 md:text-base">{description}</p> : null}
        </div>
        {stats?.length ? (
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[18px] border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-primary-foreground/70">{stat.label}</p>
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
  tone = "default",
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
    green: "bg-success/10 text-card-foreground",
    gold: "bg-warning/10 text-card-foreground",
    danger: "bg-destructive/10 text-card-foreground",
  }[tone];

  return (
    <div className={cn("clb-card p-5", toneClass)}>
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-accent text-accent-foreground shadow-soft-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          {description ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div> : null}
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
  children,
}: {
  icon?: ElementType;
  title: string;
  message?: string;
  tone?: "default" | "danger" | "success";
  children?: ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-destructive/20 bg-destructive/10"
      : tone === "success"
        ? "border-success/20 bg-success/10"
        : "border-border/70 bg-card";

  return (
    <div className={cn("clb-card p-8 text-center", toneClass)}>
      {Icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{message}</p> : null}
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
  className,
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
    green: "bg-success/10 text-card-foreground",
    gold: "bg-warning/10 text-card-foreground",
  }[tone];

  return (
    <section className={cn("clb-card overflow-hidden", toneClass, className)}>
      {title || description || eyebrow || actions ? (
        <div className="flex flex-col gap-3 border-b border-border/70 p-5 md:flex-row md:items-start md:justify-between">
          <div>
            {eyebrow ? <p className="clb-eyebrow text-muted-foreground">{eyebrow}</p> : null}
            {title ? <h2 className="text-xl font-bold leading-tight tracking-tight">{title}</h2> : null}
            {description ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div> : null}
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
  children,
}: {
  icon?: ElementType;
  title: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="clb-empty">
      {Icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function ClublyErrorState({
  icon: Icon,
  title = "Unable to load this section",
  message,
  children,
}: {
  icon?: ElementType;
  title?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-destructive/20 bg-destructive/10 p-5">
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h3 className="font-bold text-destructive">{title}</h3>
          {message ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p> : null}
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
  title = "Loading Clubly",
  message = "Preparing the latest workspace data.",
  compact = false,
  delayedMessage,
  delayedMessageDelayMs = 8000,
}: {
  title?: string;
  message?: string;
  compact?: boolean;
  delayedMessage?: string;
  delayedMessageDelayMs?: number;
}) {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    if (!delayedMessage) {
      setShowDelayedMessage(false);
      return undefined;
    }

    setShowDelayedMessage(false);
    const timer = window.setTimeout(() => setShowDelayedMessage(true), delayedMessageDelayMs);
    return () => window.clearTimeout(timer);
  }, [delayedMessage, delayedMessageDelayMs]);

  return (
    <div className={cn("clb-card overflow-hidden bg-card/85", compact ? "p-5" : "p-8")}>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-accent">
        <div className="h-full w-1/3 animate-clubly-progress rounded-full bg-primary" />
      </div>
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <span className="h-5 w-5 animate-spin rounded-full border border-primary/25 border-t-primary" />
        </div>
        <div>
          <p className="clb-eyebrow text-primary">Please wait</p>
          <h2 className={cn("font-bold leading-tight tracking-tight", compact ? "text-xl" : "text-2xl md:text-3xl")}>{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p>
          {showDelayedMessage ? <p className="mt-3 max-w-xl text-sm font-medium text-warning">{delayedMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}
