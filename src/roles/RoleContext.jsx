// src/roles/RoleContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

const RoleCtx = createContext({
  role: null,
  loading: true,
  refresh: () => {},
  setRoleLocal: () => {},
});

export function RoleProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) Login / Logout beobachten
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("[RoleContext] user logged out");
        setUid(null);
        setRole(null);
        setLoading(false);
      } else {
        console.log("[RoleContext] user logged in:", user.email, user.uid);
        setUid(user.uid);
      }
    });
    return unsub;
  }, []);

  // 2) Rolle ermitteln:
  //    a) Custom Claim "admin"
  //    b) Firestore users/{uid}.role
  //    c) Fallback: Hardcoded E-Mail als Admin (toskaermelind1@gmail.com)
  useEffect(() => {
    if (!uid) return;

    let unsubFs;
    let cancelled = false;

    const setup = async () => {
      setLoading(true);

      const user = auth.currentUser;
      let isAdminClaim = false;
      let email = user?.email || "";

      // --- a) Custom Claim lesen ---
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          console.log("[RoleContext] token.claims:", tokenResult.claims);
          isAdminClaim = !!tokenResult.claims.admin;
        } catch (e) {
          console.warn("[RoleContext] getIdTokenResult error:", e);
        }
      }

      // --- b) Firestore-Listener ---
      unsubFs = onSnapshot(
        doc(db, "users", uid),
        (snap) => {
          if (cancelled) return;

          const fsRole = snap.data()?.role ?? "user";
          console.log("[RoleContext] role from Firestore:", fsRole);

          let effectiveRole = fsRole;

          //  Fallback: wenn Custom-Claim admin ODER spezielle E-Mail
          if (isAdminClaim || email === "toskaermelind1@gmail.com") {
            effectiveRole = "admin";
          }

          console.log(
            "[RoleContext] effectiveRole:",
            effectiveRole,
            "| email:",
            email
          );

          setRole(effectiveRole);
          setLoading(false);
        },
        (err) => {
          if (cancelled) return;
          console.error("[RoleContext] onSnapshot error:", err);

          let fallbackRole = "user";
          if (isAdminClaim || email === "toskaermelind1@gmail.com") {
            fallbackRole = "admin";
          }

          setRole(fallbackRole);
          setLoading(false);
        }
      );
    };

    setup();

    return () => {
      cancelled = true;
      if (unsubFs) unsubFs();
    };
  }, [uid]);

  // Optional manueller Refresh
  const refresh = async () => {
    if (!uid) return;
    try {
      const user = auth.currentUser;
      let isAdminClaim = false;
      const email = user?.email || "";

      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        isAdminClaim = !!tokenResult.claims.admin;
        console.log("[RoleContext.refresh] claims:", tokenResult.claims);
      }

      const snap = await getDoc(doc(db, "users", uid));
      const fsRole = snap.data()?.role ?? "user";

      let effectiveRole = fsRole;
      if (isAdminClaim || email === "toskaermelind1@gmail.com") {
        effectiveRole = "admin";
      }

      console.log("[RoleContext.refresh] effectiveRole:", effectiveRole);
      setRole(effectiveRole);
    } catch (e) {
      console.error("[RoleContext] refresh error:", e);
    }
  };

  const setRoleLocal = (r) => setRole(r);

  return (
    <RoleCtx.Provider value={{ role, loading, refresh, setRoleLocal }}>
      {children}
    </RoleCtx.Provider>
  );
}

export const useRole = () => useContext(RoleCtx);
