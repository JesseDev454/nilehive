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
    <div className="flex flex-col gap-4 border-b-2 border-foreground pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="nh-page-header">
        {eyebrow ? <p className="nh-eyebrow">{eyebrow}</p> : null}
        <h1 className="nh-title mt-2">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
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
    <div className={cn("nh-card p-5", toneClass)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="nh-panel-title opacity-75">{title}</p>
          <div className="mt-3 text-3xl font-black md:text-4xl">{value}</div>
        </div>
        {Icon ? <Icon className="h-8 w-8 shrink-0 opacity-80" /> : null}
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
          <h1 className="mt-2 text-4xl font-black uppercase leading-none md:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm text-primary-foreground/75 md:text-base">{description}</p> : null}
        </div>
        {stats?.length ? (
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="border-2 border-primary-foreground/40 bg-primary-foreground/10 p-4">
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-foreground/70">{stat.label}</p>
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
          <div className="border-2 border-current bg-background/20 p-3">
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
      ? "border-destructive"
      : tone === "success"
        ? "border-secondary"
        : "border-foreground";

  return (
    <div className={cn("nh-card p-8 text-center", toneClass)}>
      {Icon ? <Icon className="mx-auto mb-4 h-12 w-12" /> : null}
      <h2 className="text-2xl font-black uppercase">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{message}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function NeoLoadingState({
  title = "Loading Club Services",
  message = "Preparing the latest workspace data.",
  compact = false
}: {
  title?: string;
  message?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("nh-card overflow-hidden bg-background", compact ? "p-5" : "p-8")}>
      <div className="mb-5 h-3 border-2 border-foreground bg-primary" />
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex gap-2">
          <span className="h-12 w-5 animate-pulse border-2 border-foreground bg-accent shadow-[3px_3px_0_#181c1e]" />
          <span className="h-12 w-5 animate-pulse border-2 border-foreground bg-secondary shadow-[3px_3px_0_#181c1e] [animation-delay:140ms]" />
          <span className="h-12 w-5 animate-pulse border-2 border-foreground bg-primary shadow-[3px_3px_0_#181c1e] [animation-delay:280ms]" />
        </div>
        <div>
          <p className="nh-eyebrow">Please wait</p>
          <h2 className={cn("font-black uppercase leading-tight", compact ? "text-xl" : "text-2xl md:text-3xl")}>
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
