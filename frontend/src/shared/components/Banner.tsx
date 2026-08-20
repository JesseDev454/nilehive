import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { IconButton } from "./IconButton";

export type BannerVariant = "info" | "warning" | "success" | "destructive";

export interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  onDismiss?: () => void;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function Banner({
  variant = "info",
  title,
  children,
  description,
  onDismiss,
  onClose,
  action,
  className = ""
}: BannerProps) {
  const configs: Record<
    BannerVariant,
    {
      container: string;
      icon: React.ElementType;
      iconColor: string;
    }
  > = {
    info: {
      container: "border-primary/20 bg-primary/5 text-foreground",
      icon: Info,
      iconColor: "text-primary"
    },
    warning: {
      container: "border-amber-500/20 bg-amber-500/5 text-foreground",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    success: {
      container: "border-emerald-500/20 bg-emerald-500/5 text-foreground",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    destructive: {
      container: "border-destructive/20 bg-destructive/5 text-foreground",
      icon: AlertCircle,
      iconColor: "text-destructive"
    }
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-180 ${config.container} ${className}`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} aria-hidden="true" />
      
      <div className="flex-1 space-y-1 pr-6">
        {title && (
          <h4 className="text-xs sm:text-sm font-bold text-foreground">
            {title}
          </h4>
        )}
        <div className="text-xs text-muted-foreground leading-relaxed">
          {description ?? children}
        </div>
        {action && <div className="pt-2">{action}</div>}
      </div>

      {(onDismiss || onClose) && (
        <IconButton
          aria-label="Dismiss banner"
          icon={<X className="h-4 w-4" />}
          size="sm"
          onClick={onDismiss || onClose}
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        />
      )}
    </div>
  );
}
