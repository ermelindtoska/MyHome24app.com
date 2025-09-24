// src/roles/RoleContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

const RoleCtx = createContext({ role: null, loading: true });

export function RoleProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ndiq login/logout
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return off;
  }, []);

  // Dëgjo realtime dokumentin e user-it
  useEffect(() => {
    if (!uid) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        setRole(snap.data()?.role ?? "user");
        setLoading(false);
      },
      (err) => {
        console.error("[RoleContext] onSnapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  // Opsionale: refresh manual
  const refresh = async () => {
    if (!uid) return;
    const snap = await getDoc(doc(db, "users", uid));
    setRole(snap.data()?.role ?? "user");
  };

  // Lejo update optimist në UI
  const setRoleLocal = (r) => setRole(r);

  return (
    <RoleCtx.Provider value={{ role, loading, refresh, setRoleLocal }}>
      {children}
    </RoleCtx.Provider>
  );
}

export const useRole = () => useContext(RoleCtx);
