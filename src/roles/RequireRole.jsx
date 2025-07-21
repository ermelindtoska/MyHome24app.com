import React from 'react';
import { useRole } from '../roles/RoleContext';
import { Navigate } from 'react-router-dom';

const RequireRole = ({ allowedRoles, children }) => {
  const { userRole, loading } = useRole();

  if (loading) return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Loading...</div>;

  // Kontroll nëse userRole nuk është ende i ngarkuar
  if (!userRole) return <Navigate to="/" replace />;

  // Kontroll i saktë me includes()
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;
