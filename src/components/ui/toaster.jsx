// src/components/ui/toaster.jsx
import React from "react";
import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      richColors
      closeButton
      expand={false}
      position="top-right"
      duration={3500}
      visibleToasts={4}
      toastOptions={{
        className:
          "rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg",
      }}
    />
  );
}