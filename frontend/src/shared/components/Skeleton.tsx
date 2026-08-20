import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-xl"
  };

  const inlineStyles: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-muted/70 ${variantStyles[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-12" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="rectangular" width={80} height={28} />
      </div>
    </div>
  );
}
