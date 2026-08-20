import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  startAdornment?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      startAdornment,
      className = "",
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-foreground select-none"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {(leftIcon || startAdornment) && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground">
              {leftIcon || startAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-xl border bg-background py-2.5 text-xs sm:text-sm text-foreground transition-all duration-180 placeholder:text-muted-foreground/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:bg-muted/40 ${
              leftIcon || startAdornment ? "pl-9" : "pl-3.5"
            } ${rightIcon || hasError ? "pr-9" : "pr-3.5"} ${
              hasError
                ? "border-destructive focus-visible:ring-destructive text-destructive"
                : "border-border hover:border-border/80 focus-visible:border-primary"
            } ${className}`}
            {...props}
          />

          {hasError ? (
            <div className="pointer-events-none absolute right-3 flex items-center justify-center text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3 flex items-center justify-center text-muted-foreground">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {hasError && (
          <p id={errorId} className="text-[11px] font-medium text-destructive">
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="text-[11px] text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
