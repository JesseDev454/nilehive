import React, { createContext, useCallback, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

interface DialogContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export interface DialogProps {
  // Direct props pattern
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";

  // Radix/Shadcn style pattern
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  open,
  onOpenChange
}: DialogProps) {
  const activeOpen = open !== undefined ? open : !!isOpen;
  const activeClose = useCallback(() => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  }, [onClose, onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeOpen) {
        activeClose();
      }
    };
    if (activeOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeClose, activeOpen]);

  if (!activeOpen) return null;

  // If using direct props pattern with title
  if (title) {
    const widthStyles: Record<string, string> = {
      sm: "max-w-sm",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      "2xl": "max-w-6xl"
    };

    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div
          onClick={activeClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        />
        <div
          className={`relative z-10 w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl animate-scale-in text-left ${widthStyles[maxWidth]}`}
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
            <div className="space-y-1 pr-6">
              <h2 id="dialog-title" className="text-base sm:text-lg font-bold text-foreground">
                {title}
              </h2>
              {description && (
                <p id="dialog-description" className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <IconButton
              aria-label="Close dialog"
              icon={<X className="h-4 w-4" />}
              size="sm"
              onClick={activeClose}
              className="text-muted-foreground hover:text-foreground"
            />
          </div>
          <div className="py-4 text-xs sm:text-sm text-foreground max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border/70">
              {footer}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // Compound component pattern
  return (
    <DialogContext.Provider value={{ isOpen: activeOpen, onClose: activeClose }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
  className = "",
  maxWidth = "md"
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  const ctx = useContext(DialogContext);
  if (!ctx || !ctx.isOpen) return null;

  const widthStyles: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl"
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={ctx.onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />
      <div
        className={`relative z-10 w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl animate-scale-in text-left ${widthStyles[maxWidth]} ${className}`}
      >
        <div className="absolute right-4 top-4">
          <IconButton
            aria-label="Close dialog"
            icon={<X className="h-4 w-4" />}
            size="sm"
            onClick={ctx.onClose}
            className="text-muted-foreground hover:text-foreground"
          />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 pb-4 border-b border-border/70 pr-8 text-left ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-base sm:text-lg font-bold tracking-tight text-foreground ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-muted-foreground leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border/70 ${className}`}>
      {children}
    </div>
  );
}
