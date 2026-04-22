import * as React from "react";
import { Dialog as HeadlessDialog } from "@headlessui/react";

export function Dialog({ open, onOpenChange, children }) {
  return (
    <HeadlessDialog
      open={open}
      onClose={onOpenChange}
      className="relative z-[1000]"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel
          className="
            w-full max-w-md overflow-hidden rounded-3xl
            border border-gray-200 dark:border-slate-800
            bg-white dark:bg-slate-950
            shadow-2xl
            transition-all
          "
        >
          {children}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
}

export function DialogTitle({ children, className = "" }) {
  return (
    <HeadlessDialog.Title
      className={`text-xl font-bold text-slate-900 dark:text-white ${className}`}
    >
      {children}
    </HeadlessDialog.Title>
  );
}

export function DialogContent({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-5 text-sm text-slate-700 dark:text-slate-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div
      className={`
        flex flex-col-reverse gap-3 border-t border-gray-200 dark:border-slate-800
        px-6 py-4
        sm:flex-row sm:justify-end
        ${className}
      `}
    >
      {children}
    </div>
  );
}