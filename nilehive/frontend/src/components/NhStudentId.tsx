import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent } from "react";
import { AlertCircle, BadgeCheck, IdCard } from "lucide-react";
import {
  isValidStudentId,
  normalizeStudentId,
  STUDENT_ID_LENGTH,
  STUDENT_ID_PLACEHOLDER
} from "@/lib/studentId";
import { cn } from "@/lib/utils";

interface NhStudentIdProps {
  value: string;
  onChange: (raw: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function NhStudentId({ value, onChange, id, required, disabled, className }: NhStudentIdProps) {
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = normalizeStudentId(value);
  const digits = displayValue;
  const isValid = isValidStudentId(digits);
  const showError = touched && digits.length > 0 && !isValid;
  const showSuccess = touched && isValid;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const position = event.target.selectionStart ?? 0;
    const rawValue = event.target.value;
    const nextDigits = normalizeStudentId(rawValue);

    onChange(nextDigits);

    requestAnimationFrame(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      const shift = nextDigits.length - rawValue.length;
      const nextPosition = Math.max(0, position + shift);
      input.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    onChange(normalizeStudentId(event.clipboardData.getData("text")));
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <IdCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          autoComplete="off"
          className={cn(
            "w-full border-2 border-foreground bg-card py-6 pl-12 pr-12 text-sm font-semibold tracking-wider text-foreground shadow-[3px_3px_0_hsl(var(--foreground))]",
            "placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/55",
            "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            showSuccess && "bg-white ring-2 ring-success/30",
            showError && "bg-destructive/5 ring-2 ring-destructive/30",
            disabled && "cursor-not-allowed opacity-70"
          )}
          disabled={disabled}
          id={id}
          inputMode="numeric"
          maxLength={STUDENT_ID_LENGTH}
          onBlur={() => setTouched(true)}
          onChange={handleChange}
          onPaste={handlePaste}
          pattern="[0-9]{9}"
          placeholder={STUDENT_ID_PLACEHOLDER}
          required={required}
          type="text"
          value={displayValue}
        />
        {showSuccess && (
          <BadgeCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-success" />
        )}
        {showError && (
          <AlertCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-destructive" />
        )}
      </div>
      <p
        className={cn(
          "mt-1 px-1 text-[11px] font-medium",
          showSuccess ? "text-success" : showError ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {showSuccess
          ? "Valid University ID"
          : showError
            ? `Needs ${STUDENT_ID_LENGTH} digits; you have ${digits.length}`
            : `Enter exactly ${STUDENT_ID_LENGTH} digits, for example ${STUDENT_ID_PLACEHOLDER}.`}
      </p>
    </div>
  );
}
