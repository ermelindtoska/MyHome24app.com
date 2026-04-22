// src/components/PathTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const EXCLUDED_PATHS = [
  "/login",
  "/auth",
  "/auth/redirect",
  "/verify-needed",
];

const STORAGE_KEY = "mh24:pathHistory";
const MAX_HISTORY = 10;

export default function PathTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isExcluded = EXCLUDED_PATHS.some((p) =>
      pathname.startsWith(p)
    );

    if (isExcluded) return;

    try {
      const existing =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      // 🔁 mos shto duplicate direkt njëra pas tjetrës
      if (existing[0]?.path === pathname) return;

      const newEntry = {
        path: pathname,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...existing].slice(0, MAX_HISTORY);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("[PathTracker] localStorage error:", err);
    }
  }, [pathname]);

  return null;
}