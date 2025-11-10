// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allow = ['user','owner','agent','admin'] }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // oder Spinner

  // nicht eingeloggt → zum RoleRedirect, der kümmert sich um Ziel
  if (!currentUser) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/redirect?next=${next}`} replace />;
  }

  // rolle prüfen
  const r = (role || 'user').toLowerCase();
  if (!allow.includes(r)) {
    // keine Berechtigung → schick auf Start
    return <Navigate to="/" replace />;
  }

  return children;
}
