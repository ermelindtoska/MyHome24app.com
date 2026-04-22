import React from "react";

export const Button = ({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  type = "button",
}) => {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    outline:
      "border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
};