import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const baseToastClass =
    "group toast group-[.toaster]:rounded-[20px] group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:text-foreground group-[.toaster]:shadow-soft";
  const successToastClass =
    "group-[.toaster]:bg-success group-[.toaster]:text-success-foreground group-[.toast]:bg-success group-[.toast]:text-success-foreground";
  const errorToastClass =
    "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground";
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
            "group-[.toast]:border group-[.toast]:border-current/20 group-[.toast]:bg-white/15 group-[.toast]:text-current",
          cancelButton:
            "group-[.toast]:border group-[.toast]:border-current/20 group-[.toast]:bg-white/10 group-[.toast]:text-current",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
