// src/roles/withRole.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

const normalizeRole = (value) => {
  if (!value) return "user";
  return String(value).trim().toLowerCase();
};

const withRole = (Component, allowedRoles = []) => {
  return function RoleProtectedComponent(props) {
    const { role, loading } = useRole();
    const location = useLocation();

    const normalizedAllowed = allowedRoles.map((r) =>
      normalizeRole(r)
    );
    const userRole = normalizeRole(role);

    // ✅ Loading state profesional
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    // ❌ No access → redirect (jo thjesht text)
    if (
      normalizedAllowed.length > 0 &&
      !normalizedAllowed.includes(userRole)
    ) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            from: location.pathname,
            requiredRoles: normalizedAllowed,
            currentRole: userRole,
          }}
        />
      );
    }

    // ✅ OK
    return <Component {...props} />;
  };
};

export default withRole;