import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs text-left transition-all duration-180 ${
        hoverable ? "hover:border-primary/50 hover:shadow-xs cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1 pb-3 border-b border-border/70 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-sm sm:text-base font-bold text-foreground ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs text-muted-foreground leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`pt-3 text-xs sm:text-sm text-foreground ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`pt-3 mt-3 border-t border-border/70 flex items-center justify-between ${className}`}>{children}</div>;
}
