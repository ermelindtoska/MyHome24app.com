// src/pages/RoleRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStartPathForRole } from '../utils/roles';

export default function RoleRedirect() {
  const { currentUser, role, emailVerified, loading } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(search);
    const next = params.get('next');

    // nicht eingeloggt → Startseite
    if (!currentUser) {
      navigate('/', { replace: true });
      return;
    }

    // optional: unbestätigte E-Mail auf eigene Seite schicken
    if (!emailVerified) {
      navigate('/verify-needed', { replace: true });
      return;
    }

    if (next && next.startsWith('/')) {
      navigate(next, { replace: true });
      return;
    }

    navigate(getStartPathForRole(role), { replace: true });
  }, [currentUser, role, emailVerified, loading, navigate, search]);

  return null; // kein UI, reine Weiterleitung
}
