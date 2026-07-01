import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const baseToastClass =
    "group toast group-[.toaster]:rounded-[22px] group-[.toaster]:border group-[.toaster]:border-border/70 group-[.toaster]:text-foreground group-[.toaster]:shadow-soft-lg";
  const successToastClass =
    "group-[.toaster]:bg-[#E3F3EE] group-[.toaster]:text-[#0D7A66] group-[.toast]:bg-[#E3F3EE] group-[.toast]:text-[#0D7A66]";
  const errorToastClass =
    "group-[.toaster]:bg-[#FBE9E7] group-[.toaster]:text-destructive group-[.toast]:bg-[#FBE9E7] group-[.toast]:text-destructive";
  const subtleTextClass = "group-[.toast]:text-current/85";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: baseToastClass,
          success: successToastClass,
          info: successToastClass,
          warning: successToastClass,
          loading: successToastClass,
          error: errorToastClass,
          title: "group-[.toast]:font-semibold",
          description: `group-[.toast]:font-medium ${subtleTextClass}`,
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:border group-[.toast]:border-current/15 group-[.toast]:bg-white/45 group-[.toast]:text-current",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:border group-[.toast]:border-current/15 group-[.toast]:bg-white/35 group-[.toast]:text-current",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
