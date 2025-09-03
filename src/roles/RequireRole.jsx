// src/roles/RequireRole.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const RequireRole = ({ allowedRoles, children }) => {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          // ✅ Lexojmë rolin nga 'users' dhe jo më nga 'roles'
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            console.log("✅ Fetched role from Firestore:", userRole);
            setRole(userRole);
          } else {
            console.warn("⚠️ No user document found for:", user.uid);
            setRole(null);
          }
        } catch (error) {
          console.error("❌ Error reading role:", error);
          setRole(null);
        } finally {
          setCheckingRole(false);
        }
      } else {
        setCheckingRole(false);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    console.log("🧾 Auth loading:", loading);
    console.log("👤 User:", user);
    console.log("🔑 Allowed roles for this route:", allowedRoles);
    console.log("👮‍♂️ User's role from Firestore:", role);
  }, [loading, user, role, allowedRoles]);

  if (loading || checkingRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Checking access...</p>
      </div>
    );
  }

  if (!user) {
    console.warn("🚫 User not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    console.warn(`⛔ Access denied for role "${role}". Redirecting to /unauthorized.`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
