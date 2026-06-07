import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg";
type BrandLogoVariant = "framed" | "plain";

const frameSizes: Record<BrandLogoSize, string> = {
  sm: "h-14 w-[14.5rem] px-2.5 py-2",
  md: "h-16 w-[17rem] px-3 py-2.5",
  lg: "h-20 w-[20.5rem] px-3.5 py-3"
};

const plainSizes: Record<BrandLogoSize, string> = {
  sm: "h-10 w-[13rem]",
  md: "h-12 w-[15.75rem]",
  lg: "h-16 w-[19.75rem]"
};

const compactSizes: Record<BrandLogoSize, string> = {
  sm: "h-12 w-12 p-1.5",
  md: "h-14 w-14 p-2",
  lg: "h-16 w-16 p-2.5"
};

const markSizes: Record<BrandLogoSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12"
};

const textSizes: Record<BrandLogoSize, string> = {
  sm: "h-[1.65rem] w-auto",
  md: "h-[2.2rem] w-auto",
  lg: "h-[3rem] w-auto"
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  compact?: boolean;
  variant?: BrandLogoVariant;
  className?: string;
  imageClassName?: string;
}

export function BrandLogo({
  size = "md",
  compact = false,
  variant = "framed",
  className,
  imageClassName
}: BrandLogoProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-[18px] border-3 border-foreground bg-white shadow-neo-sm",
          compactSizes[size],
          className
        )}
      >
        <img
          src="/ntlogo45.png"
          alt="Nile University mark"
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        variant === "framed"
          ? "rounded-[18px] border-3 border-foreground bg-white shadow-neo-sm"
          : "border-0 bg-transparent shadow-none",
        variant === "framed" ? frameSizes[size] : plainSizes[size],
        className
      )}
    >
      <div className="flex items-center justify-center gap-px">
        <img
          src="/ntlogo45.png"
          alt="Nile University mark"
          className={cn("shrink-0 object-contain", markSizes[size], imageClassName)}
        />
        <img
          src="/NUText.png"
          alt="Nile University of Nigeria"
          className={cn("w-auto shrink-0 object-contain", textSizes[size])}
        />
      </div>
    </div>
  );
}
