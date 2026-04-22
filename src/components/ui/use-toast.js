// src/components/ui/use-toast.js
import { toast } from "sonner";

export function useToast() {
  return {
    toast: ({ title, description, variant, ...props }) => {
      const message = description || title || "";

      if (variant === "destructive") {
        return toast.error(title || message, {
          description: description && description !== title ? description : undefined,
          ...props,
        });
      }

      return toast(title || message, {
        description: description && description !== title ? description : undefined,
        ...props,
      });
    },

    success: (message, props = {}) => toast.success(message, props),
    error: (message, props = {}) => toast.error(message, props),
    info: (message, props = {}) => toast(message, props),
  };
}