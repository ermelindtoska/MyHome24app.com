// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="p-4 text-center">Duke ngarkuar...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
