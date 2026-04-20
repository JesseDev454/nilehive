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

