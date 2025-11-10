// src/components/PathTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PathTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Login/Redirect/Verify nicht merken
    if (!['/login','/auth','/auth/redirect','/verify-needed'].some(p => pathname.startsWith(p))) {
      try { localStorage.setItem('mh24:lastPath', pathname); } catch {}
    }
  }, [pathname]);
  return null;
}
