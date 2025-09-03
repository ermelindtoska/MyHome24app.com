import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          console.warn("Email not verified. Signing out...");
          await signOut(auth);
          setRole(null);
          setLoading(false);
          return;
        }

        try {
          // ✅ Read role from 'users' collection
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const fetchedRole = userSnap.data().role || null;
            console.log("✅ User role fetched from Firestore:", fetchedRole);
            setRole(fetchedRole);
          } else {
            console.warn("⚠️ User document does not exist in Firestore.");
            setRole(null);
          }
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
