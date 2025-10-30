import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

const RoleCtx = createContext({ role: null, loading: true, setRoleLocal: () => {} });

export function RoleProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track login/logout
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return off;
  }, []);

  // Live-Role aus users/{uid}
  useEffect(() => {
    if (!uid) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "users", uid),
      { includeMetadataChanges: true },
      (snap) => {
        const r = snap.data()?.role ?? "user";
        setRole(r);
        setLoading(false);
      },
      (err) => {
        console.error("[RoleContext] onSnapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  // Optional: manuelles Refresh (selten nötig)
  const refresh = async () => {
    if (!uid) return;
    const snap = await getDoc(doc(db, "users", uid));
    setRole(snap.data()?.role ?? "user");
  };

  // Sofort im UI setzen (optimistic)
  const setRoleLocal = (r) => setRole(r);

  return (
    <RoleCtx.Provider value={{ role, loading, refresh, setRoleLocal }}>
      {children}
    </RoleCtx.Provider>
  );
}

export const useRole = () => useContext(RoleCtx);
