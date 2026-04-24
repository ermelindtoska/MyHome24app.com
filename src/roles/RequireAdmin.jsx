// src/roles/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

export default function RequireAdmin({ children }) {
  const { role, loading, isAdmin } = useRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Lade Berechtigungen…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && role !== "admin") {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          requiredRoles: ["admin"],
          currentRole: role || "user",
        }}
      />
    );
  }

  return children;
}