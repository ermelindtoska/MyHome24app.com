import * as React from 'react';
import { Dialog as HeadlessDialog } from '@headlessui/react';

export function Dialog({ open, onOpenChange, children }) {
  return (
    <HeadlessDialog open={open} onClose={onOpenChange} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <HeadlessDialog.Panel className="w-full max-w-md rounded bg-white dark:bg-gray-800 p-6 shadow-xl">
          {children}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
}

export function DialogTitle({ children }) {
  return <h2 className="text-lg font-semibold mb-4">{children}</h2>;
}

export function DialogContent({ children }) {
  return <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
}
