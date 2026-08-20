import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: "right" | "left" | "bottom";
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = "right"
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionStyles: Record<string, string> = {
    right: "inset-y-0 right-0 max-w-md w-full border-l animate-slide-in-right",
    left: "inset-y-0 left-0 max-w-md w-full border-r animate-slide-in-left",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full border-t rounded-t-3xl animate-slide-in-up"
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      aria-describedby={description ? "sheet-description" : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Sheet Container */}
      <div
        className={`fixed z-10 flex flex-col justify-between border-border bg-card p-6 shadow-2xl ${positionStyles[position]}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
          <div className="space-y-1 pr-6">
            <h2 id="sheet-title" className="text-base sm:text-lg font-bold text-foreground">
              {title}
            </h2>
            {description && (
              <p id="sheet-description" className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <IconButton
            aria-label="Close sheet"
            icon={<X className="h-4 w-4" />}
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Body */}
        <div className="flex-1 py-4 text-xs sm:text-sm text-foreground overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
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
