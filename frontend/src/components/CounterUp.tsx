import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type CounterUpProps = {
  value: number;
  durationMs?: number;
  format?: (value: number) => ReactNode;
};

function getPrefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

export function CounterUp({ value, durationMs = 800, format }: CounterUpProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [displayValue, setDisplayValue] = useState(() => (getPrefersReducedMotion() ? value : 0));
  const currentValueRef = useRef(displayValue);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotionChange() {
      setPrefersReducedMotion(motionQuery.matches);
    }

    handleMotionChange();
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || durationMs <= 0) {
      currentValueRef.current = value;
      setDisplayValue(value);
      return undefined;
    }

    const startValue = currentValueRef.current;
    const difference = value - startValue;

    if (difference === 0) {
      setDisplayValue(value);
      return undefined;
    }

    let animationFrame = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const nextValue = startValue + difference * easeOutCubic(progress);

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      currentValueRef.current = value;
      setDisplayValue(value);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [durationMs, prefersReducedMotion, value]);

  return <>{format ? format(displayValue) : Math.round(displayValue).toLocaleString("en-NG")}</>;
}
