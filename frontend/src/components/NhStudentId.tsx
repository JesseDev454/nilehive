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
        <IdCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#75777f]" />
        <input
          ref={inputRef}
          autoComplete="off"
          className={cn(
            "w-full rounded-2xl border-0 bg-[#f1f4f7] py-6 pl-12 pr-12 text-sm font-semibold tracking-wider text-[#181c1e]",
            "placeholder:font-normal placeholder:tracking-normal placeholder:text-[#c4c6cf]",
            "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5bbc]/30",
            showSuccess && "bg-white ring-2 ring-[#299e5c]/30",
            showError && "bg-[#fff8f7] ring-2 ring-[#ba1a1a]/30",
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
          <BadgeCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#299e5c]" />
        )}
        {showError && (
          <AlertCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ba1a1a]" />
        )}
      </div>
      <p
        className={cn(
          "mt-1 px-1 text-[11px] font-medium",
          showSuccess ? "text-[#299e5c]" : showError ? "text-[#ba1a1a]" : "text-[#75777f]"
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
