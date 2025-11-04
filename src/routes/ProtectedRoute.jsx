// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Laden…</div>;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}
