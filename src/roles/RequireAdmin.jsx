// src/roles/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

export default function RequireAdmin({ children }) {
  const { role, loading } = useRole();
  const location = useLocation();

  console.log("[RequireAdmin] role:", role, "loading:", loading);

  // Während RoleContext lädt → einfache Loading-Ansicht
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Lade Berechtigungen…
      </div>
    );
  }

  // Wenn Rolle NICHT admin → auf /unauthorized
  if (role !== "admin") {
    console.log(
      "[RequireAdmin] access denied for role",
      role,
      "→ redirect /unauthorized"
    );
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location }}
        replace
      />
    );
  }

  // Alles gut → Seite anzeigen
  return children;
}
