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
          const roleDoc = await getDoc(doc(db, 'roles', user.uid));
          if (roleDoc.exists()) {
            setRole(roleDoc.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Gabim gjatë leximit të rolit:", error);
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

  if (loading || checkingRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Duke kontrolluar qasjen...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
