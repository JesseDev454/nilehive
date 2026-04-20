import { toast } from "sonner";

export function actionSuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function actionError(title: string, error?: unknown, fallback = "Please try again.") {
  const description = error instanceof Error ? error.message : fallback;
  toast.error(title, { description });
}
