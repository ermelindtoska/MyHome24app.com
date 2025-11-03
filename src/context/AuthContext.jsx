// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { appCheckEnabled } from "../firebase"; // ⬅️ përdorim flamurin ekzistues

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  error: null,
  claims: null,
  role: "guest",
  isAdmin: false,
  isOwner: false,
  isAgent: false,
  emailVerified: false,
  refresh: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper: merr claims pa prishur login-in në dev kur App Check s’është gati
async function getTokenResultSafe(user) {
  try {
    // Rifresko token-in vetëm nëse App Check është realisht aktiv (prod/enable)
    const forceRefresh = Boolean(appCheckEnabled);
    return await user.getIdTokenResult(forceRefresh);
  } catch (e) {
    // Nëse ka 403 apo bllokim nga App Check, kthehu me claims bosh që UI të mos shembet
    console.warn("[Auth] getIdTokenResult failed (continuing with empty claims):", e?.message || e);
    return { claims: {} };
  }
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [role, setRole] = useState("guest");
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestUid = useRef(null);

  const loadAuthProfile = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setClaims(null);
      setRole("guest");
      setEmailVerified(false);
      return;
    }
    latestUid.current = user.uid;

    try {
      // ⚠️ Këtu s’po detyrojmë refresh në dev; shmang 403-at e App Check
      const [tokenResult, userSnap] = await Promise.all([
        getTokenResultSafe(user),
        getDoc(doc(db, "users", user.uid)),
      ]);

      if (latestUid.current !== user.uid) return; // user u ndërrua gjatë pritjes

      const customRole = tokenResult?.claims?.role;
      const fsRole = userSnap.exists() ? userSnap.data()?.role : undefined;
      const effectiveRole = customRole || fsRole || "user";

      setCurrentUser(user);
      setClaims(tokenResult?.claims || null);
      setRole(effectiveRole);
      setEmailVerified(Boolean(user.emailVerified));
      setError(null);
    } catch (e) {
      console.error("[Auth] loadAuthProfile error:", e);
      // Edhe nëse Firestore dështon, mbaj të paktën user-in aktiv që ProtectedRoute të mos godasë
      setCurrentUser(user);
      setClaims(null);
      setRole("user");
      setEmailVerified(Boolean(user.emailVerified));
      setError(e?.message || "Auth/Profil konnte nicht geladen werden.");
    }
  };

  // Reagim në login/logout
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      await loadAuthProfile(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Reagim në ndryshime token-i (p.sh. kur vendosen claims nga admin)
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        await loadAuthProfile(user);
      } else {
        setCurrentUser(null);
        setRole("guest");
        setClaims(null);
      }
    });
    return () => unsub();
  }, []);

  const refresh = async () => {
    const user = auth.currentUser;
    if (user) await loadAuthProfile(user);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setClaims(null);
      setRole("guest");
      setEmailVerified(false);
    } catch (e) {
      console.error("[Auth] logout error:", e);
      setError(e?.message || "Logout fehlgeschlagen.");
    }
  };

  const value = useMemo(() => {
    const isAdmin = role === "admin" || claims?.admin === true;
    const isOwner = role === "owner";
    const isAgent = role === "agent";
    return {
      currentUser,
      loading,
      error,
      claims,
      role,
      isAdmin,
      isOwner,
      isAgent,
      emailVerified,
      refresh,
      logout,
    };
  }, [currentUser, loading, error, claims, role, emailVerified]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
