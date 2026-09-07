import { toast } from "sonner";
import { getUserFacingErrorMessage } from "@/lib/api";

export function actionSuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function actionError(title: string, error?: unknown, fallback = "Please try again.") {
  const description = getUserFacingErrorMessage(error, fallback);
  toast.error(title, { description });
}
