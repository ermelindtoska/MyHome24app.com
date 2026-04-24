// src/roles/RequireRole.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const normalizeRole = (value) => {
  if (!value) return "user";
  return String(value).trim().toLowerCase();
};

const RequireRole = ({ allowedRoles = [], children }) => {
  const location = useLocation();

  const [user, authLoading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const normalizedAllowedRoles = useMemo(() => {
    return Array.isArray(allowedRoles)
      ? allowedRoles.map((r) => normalizeRole(r))
      : [];
  }, [allowedRoles]);

  useEffect(() => {
    let active = true;

    const fetchUserRole = async () => {
      setCheckingRole(true);

      if (!user?.uid) {
        if (active) {
          setRole(null);
          setCheckingRole(false);
        }
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!active) return;

        if (userSnap.exists()) {
          const data = userSnap.data() || {};
          const userRole = normalizeRole(data.role || "user");
          setRole(userRole);
        } else {
          setRole("user");
        }
      } catch (error) {
        console.error("[RequireRole] Error reading user role:", error);

        if (active) {
          setRole("user");
        }
      } finally {
        if (active) {
          setCheckingRole(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  if (authLoading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Zugriff wird geprüft...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/redirect?next=${next}`} replace />;
  }

  const userRole = normalizeRole(role);

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          requiredRoles: normalizedAllowedRoles,
          currentRole: userRole,
        }}
      />
    );
  }

  return children;
};

export default RequireRole;