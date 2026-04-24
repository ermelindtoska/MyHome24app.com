// src/roles/RoleContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const ADMIN_EMAILS = ["toskaermelind1@gmail.com"];

const RoleCtx = createContext({
  uid: null,
  user: null,
  role: "user",
  loading: true,
  isAdmin: false,
  refresh: async () => {},
  setRoleLocal: () => {},
});

const normalizeRole = (value) => {
  if (!value) return "user";
  return String(value).trim().toLowerCase();
};

const getEffectiveRole = ({ firestoreRole, isAdminClaim, email }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (isAdminClaim || ADMIN_EMAILS.includes(cleanEmail)) {
    return "admin";
  }

  return normalizeRole(firestoreRole || "user");
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  const readAdminClaim = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return false;

    try {
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      return Boolean(tokenResult?.claims?.admin);
    } catch (error) {
      console.warn("[RoleContext] Could not read admin claim:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setUid(null);
        setRole("user");
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setUid(firebaseUser.uid);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!uid || !user) return undefined;

    let cancelled = false;
    let unsubscribeUserDoc = null;

    const setupRoleListener = async () => {
      setLoading(true);

      const isAdminClaim = await readAdminClaim(user);
      const email = user.email || "";

      if (cancelled) return;

      unsubscribeUserDoc = onSnapshot(
        doc(db, "users", uid),
        (snapshot) => {
          if (cancelled) return;

          const data = snapshot.exists() ? snapshot.data() || {} : {};
          const firestoreRole = data.role || "user";

          const effectiveRole = getEffectiveRole({
            firestoreRole,
            isAdminClaim,
            email,
          });

          setRole(effectiveRole);
          setLoading(false);
        },
        (error) => {
          if (cancelled) return;

          console.error("[RoleContext] Firestore role listener error:", error);

          const effectiveRole = getEffectiveRole({
            firestoreRole: "user",
            isAdminClaim,
            email,
          });

          setRole(effectiveRole);
          setLoading(false);
        }
      );
    };

    setupRoleListener();

    return () => {
      cancelled = true;
      if (typeof unsubscribeUserDoc === "function") {
        unsubscribeUserDoc();
      }
    };
  }, [uid, user, readAdminClaim]);

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser?.uid) {
      setRole("user");
      return "user";
    }

    try {
      setLoading(true);

      const isAdminClaim = await readAdminClaim(currentUser);
      const email = currentUser.email || "";

      const snapshot = await getDoc(doc(db, "users", currentUser.uid));
      const firestoreRole = snapshot.exists()
        ? snapshot.data()?.role || "user"
        : "user";

      const effectiveRole = getEffectiveRole({
        firestoreRole,
        isAdminClaim,
        email,
      });

      setUser(currentUser);
      setUid(currentUser.uid);
      setRole(effectiveRole);

      return effectiveRole;
    } catch (error) {
      console.error("[RoleContext] refresh error:", error);
      setRole("user");
      return "user";
    } finally {
      setLoading(false);
    }
  }, [readAdminClaim]);

  const setRoleLocal = useCallback((nextRole) => {
    setRole(normalizeRole(nextRole));
  }, []);

  const value = useMemo(
    () => ({
      uid,
      user,
      role,
      loading,
      isAdmin: role === "admin",
      refresh,
      setRoleLocal,
    }),
    [uid, user, role, loading, refresh, setRoleLocal]
  );

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);