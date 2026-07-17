import type { ReactNode } from "react";

type StitchPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
};

export function StitchPageHeader({ title, description, actions, eyebrow }: StitchPageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-primary md:text-[48px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
