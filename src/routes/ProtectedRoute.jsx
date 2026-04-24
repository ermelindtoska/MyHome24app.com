// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  allow = ["user", "owner", "agent", "admin"],
}) => {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  // ✅ Loading state (profesional)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // ❌ Not logged in → redirect with next param
  if (!currentUser) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/redirect?next=${next}`} replace />;
  }

  // ❌ Role check
  const userRole = (role || "user").toLowerCase();

  if (!allow.includes(userRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;