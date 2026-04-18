import { toast } from "sonner";

export function showErrorMessage(message: string) {
  toast.error(message);
}
