
import { useState, useRef } from "react";
import { BadgeCheck, AlertCircle, Badge } from "lucide-react";
import { cn } from "@/lib/utils";

interface NhStudentIdProps {
  value: string;
  onChange: (raw: string) => void;
  required?: boolean;
  className?: string;
}

const RAW_LEN = 9;
const PATTERN = /^(\d{2})(\d{4})(\d{3})$/;

function fmt(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, RAW_LEN);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
}

function isValid(val: string): boolean {
  return PATTERN.test(val.replace(/\D/g, ""));
}

export function NhStudentId({ value, onChange, required, className }: NhStudentIdProps) {
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = fmt(value);
  const valid = isValid(displayValue);
  const digits = value.replace(/\D/g, "");
  const showErr = touched && digits.length > 0 && !valid;
  const showOk = touched && valid;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pos = e.target.selectionStart ?? 0;
    const raw = e.target.value;
    const newDigits = raw.replace(/\D/g, "").slice(0, RAW_LEN);
    const newFmt = fmt(newDigits);

    onChange(newDigits); // pass raw digits up to parent state

    // restore cursor after React re-render
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const shift = newFmt.length - raw.length;
      const newPos = Math.max(0, pos + shift);
      el.setSelectionRange(newPos, newPos);
    });
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const newDigits = pasted.replace(/\D/g, "").slice(0, RAW_LEN);
    onChange(newDigits);
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* left icon */}
        <Badge className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#75777f]" />

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder="24-2120-109"
          autoComplete="off"
          maxLength={11}
          required={required}
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={() => setTouched(true)}
          className={cn(
            // Input style
            "w-full rounded-2xl border-0 bg-[#f1f4f7] py-6 pl-12 pr-12",
            "text-sm font-semibold tracking-wider text-[#181c1e]",
            "placeholder:font-normal placeholder:tracking-normal placeholder:text-[#c4c6cf]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5bbc]/30",
            "transition-all",
            showOk && "ring-2 ring-[#299e5c]/30 bg-white",
            showErr && "ring-2 ring-[#ba1a1a]/30 bg-[#fff8f7]"
          )}
        />

        {/* right status icon */}
        {showOk && (
          <BadgeCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#299e5c]" />
        )}
        {showErr && (
          <AlertCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ba1a1a]" />
        )}
      </div>

      {/* hint line */}
      <p className={cn(
        "mt-1 px-1 text-[11px] font-medium",
        showOk ? "text-[#299e5c]" :
          showErr ? "text-[#ba1a1a]" :
            "text-[#75777f]"
      )}>
        {showOk ? "Valid student ID ✓" :
          showErr ? `Needs ${RAW_LEN} digits — you have ${digits.length}` :
            "Format: YY-XXXX-XXX  (e.g. 24-2120-109)"}
      </p>
    </div>
  );
}
