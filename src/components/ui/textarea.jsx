// src/components/ui/textarea.jsx
import React from "react";

export const Textarea = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      rows = 4,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full rounded-2xl border border-gray-300 bg-white px-4 py-3
          text-sm text-gray-900 placeholder:text-gray-400
          outline-none transition
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          disabled:cursor-not-allowed disabled:opacity-60
          dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";