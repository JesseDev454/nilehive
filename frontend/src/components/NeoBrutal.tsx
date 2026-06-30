import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NeoPageHeader({
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
    <section className="relative overflow-hidden rounded-[28px] border border-primary/15 bg-primary p-6 text-primary-foreground shadow-soft-lg md:p-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 left-1/2 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-4 inline-flex rounded-full border border-primary-foreground/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/78 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="rounded-[22px] border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Quick actions</p>
            <div className="mt-3 flex flex-wrap gap-3">{actions}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function NeoMetricCard({
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
    green: "bg-secondary text-secondary-foreground",
    gold: "bg-accent text-accent-foreground",
    red: "bg-destructive text-destructive-foreground"
  }[tone];

  return (
    <div className={cn("nh-card relative overflow-hidden p-5", toneClass)}>
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/35" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="nh-panel-title opacity-75">{title}</p>
          <div className="mt-3 text-3xl font-black md:text-4xl">{value}</div>
        </div>
        {Icon ? (
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-background/40 shadow-soft-sm">
            <Icon className="h-6 w-6 opacity-90" />
          </div>
        ) : null}
      </div>
      {detail ? <div className="mt-3 text-sm opacity-80">{detail}</div> : null}
    </div>
  );
}

export function NeoCommandPanel({
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
    <section className="nh-command-panel">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? <p className="nh-eyebrow text-primary-foreground/70">{eyebrow}</p> : null}
          <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm text-primary-foreground/75 md:text-base">{description}</p> : null}
        </div>
        {stats?.length ? (
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
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

export function NeoActionCard({
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
    green: "bg-secondary text-secondary-foreground",
    gold: "bg-accent text-accent-foreground",
    danger: "bg-destructive text-destructive-foreground"
  }[tone];

  return (
    <div className={cn("nh-card p-5", toneClass)}>
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="rounded-[16px] bg-background/40 p-3 shadow-soft-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="nh-panel-title">{title}</h3>
          {description ? <div className="mt-2 text-sm opacity-80">{description}</div> : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function NeoStateCard({
  icon: Icon,
  title,
  message,
  tone = "default",
  children
}: {
  icon?: ElementType;
  title: string;
  message?: string;
  tone?: "default" | "danger" | "success";
  children?: ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-destructive/25 bg-destructive/10"
      : tone === "success"
        ? "border-secondary/25 bg-secondary/10"
        : "border-border";

  return (
    <div className={cn("nh-card p-8 text-center", toneClass)}>
      {Icon ? <Icon className="mx-auto mb-4 h-12 w-12" /> : null}
      <h2 className="text-2xl font-bold">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function NeoPanel({
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
    green: "bg-secondary text-secondary-foreground",
    gold: "bg-accent text-accent-foreground"
  }[tone];

  return (
    <section className={cn("nh-card overflow-hidden", toneClass, className)}>
      {(title || description || eyebrow || actions) ? (
        <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-start md:justify-between">
          <div>
            {eyebrow ? <p className="nh-eyebrow opacity-75">{eyebrow}</p> : null}
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

export function NeoEmptyState({
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
    <div className="nh-empty">
      {Icon ? <Icon className="mx-auto mb-4 h-10 w-10" /> : null}
      <h3 className="text-xl font-bold">{title}</h3>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function NeoErrorState({
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
    <div className="nh-card border-destructive/20 bg-destructive/10 p-5">
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

export function NeoListItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("nh-list-card", className)}>{children}</div>;
}

export function NeoLoadingState({
  title = "Loading Club Services",
  message = "Preparing the latest workspace data.",
  compact = false,
  delayedMessage,
  delayedMessageDelayMs = 8000
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

    const timer = window.setTimeout(() => {
      setShowDelayedMessage(true);
    }, delayedMessageDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayedMessage, delayedMessageDelayMs]);

  return (
    <div className={cn("nh-card overflow-hidden bg-card/80", compact ? "p-5" : "p-8")}>
      <div className="mb-5 h-2 rounded-full bg-primary/20" />
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex gap-2">
          <span className="h-12 w-5 animate-pulse rounded-full bg-accent shadow-soft-sm" />
          <span className="h-12 w-5 animate-pulse rounded-full bg-secondary/25 shadow-soft-sm [animation-delay:140ms]" />
          <span className="h-12 w-5 animate-pulse rounded-full bg-primary/75 shadow-soft-sm [animation-delay:280ms]" />
        </div>
        <div>
          <p className="nh-eyebrow">Please wait</p>
          <h2 className={cn("font-bold leading-tight", compact ? "text-xl" : "text-2xl md:text-3xl")}>
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
          {showDelayedMessage ? (
            <p className="mt-3 max-w-xl text-sm font-medium text-warning">{delayedMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
